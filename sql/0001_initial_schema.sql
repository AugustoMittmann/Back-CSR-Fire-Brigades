-- ============================================================================
-- Conexão Brigada — schema inicial (Supabase / Postgres)
--
-- Convenções:
--   • UUIDs em toda PK (gen_random_uuid)
--   • created_at + updated_at em toda tabela "principal"; trigger sincroniza
--   • Endereço: colunas planas (não JSON) → suporta filtro/index nativo
--   • Dinheiro: numeric(12,2) — nunca float
--   • Imagens: image_url apontando para Supabase Storage
--
-- Decisões tomadas com o usuário:
--   1. Posts/notícias/campanhas em tabelas SEPARADAS (campaigns, news, articles)
--   2. participant_brigades mantida separada de brigades (com FK opcional para
--      "promover" um participante a brigada com página completa)
--   3. items = catálogo de doações; activities = atividades que brigadas
--      desempenham. Ambos N:N com brigades, com value override em items_brigade
--   4. profiles linkado a auth.users (Supabase Auth) com is_validated +
--      validated_by para a tela de admin
--   5. campaign_results = linhas (label/value/position), não colunas fixas
--   6. events granular (1 linha por clique) + view agregada
-- ============================================================================

create extension if not exists pgcrypto;  -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- Trigger genérico de updated_at
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 1. profiles — usuários e validação de admins
-- ============================================================================
-- Toda conta nova em auth.users entra como role='user' / is_validated=false.
-- Admin (role='admin' ou 'super_admin') aprova via tela admin → preenche
-- validated_by + validated_at.
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  display_name text,
  role         text not null default 'user'
                 check (role in ('user', 'admin', 'super_admin')),
  is_validated boolean not null default false,
  validated_by uuid references profiles(id),
  validated_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create index profiles_role_idx          on profiles(role);
create index profiles_is_validated_idx  on profiles(is_validated);

-- ============================================================================
-- 2. brigades — brigadas com página completa
-- ============================================================================
create table brigades (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique,
  name          text not null,
  description   text,
  presentation  text,
  email         text,
  phone_number  text,
  instagram     text,
  pix           text,
  acting_area   text,
  volunteers    integer not null default 0,
  foundation    date,
  address       text,
  state         text,                -- UF (2 letras)
  city          text,
  latitude      numeric(10,7),
  longitude     numeric(10,7),
  image_url     text,
  external_code text,                -- ID legado/oficial, se houver
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger brigades_updated_at before update on brigades
  for each row execute function set_updated_at();
create index brigades_state_idx       on brigades(state);
create index brigades_city_idx        on brigades(city);
create index brigades_name_search_idx on brigades using gin (to_tsvector('portuguese', name));

-- ============================================================================
-- 3. participant_brigades — cadastro mínimo, sem página
-- ============================================================================
-- Brigadas que aparecem em conteúdo (campanhas/notícias/artigos) sem terem
-- página própria. Quando ganharem cadastro completo, brigade_id linka.
create table participant_brigades (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  image_url  text,
  brigade_id uuid references brigades(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger participant_brigades_updated_at before update on participant_brigades
  for each row execute function set_updated_at();
create index participant_brigades_brigade_idx on participant_brigades(brigade_id);

-- ============================================================================
-- 4. items / items_brigade — catálogo de doações + override regional
-- ============================================================================
create table items (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  default_value numeric(12,2),     -- valor médio sugerido (R$)
  unit          text,              -- 'unidade', 'kg', 'L'…
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger items_updated_at before update on items
  for each row execute function set_updated_at();

create table items_brigade (
  brigade_id       uuid not null references brigades(id) on delete cascade,
  item_id          uuid not null references items(id)    on delete cascade,
  value            numeric(12,2),    -- override regional; null = usa items.default_value
  quantity_needed  integer,          -- quantos a brigada precisa (opcional)
  primary key (brigade_id, item_id)
);
create index items_brigade_brigade_idx on items_brigade(brigade_id);
create index items_brigade_item_idx    on items_brigade(item_id);

-- ============================================================================
-- 5. activities / activities_brigade — atividades exercidas pelas brigadas
-- ============================================================================
create table activities (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,    -- 'Combate a incêndios', 'Resgate animal'…
  description text,
  icon        text,                    -- chave de ícone (ex: 'fire', 'paw')
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger activities_updated_at before update on activities
  for each row execute function set_updated_at();

create table activities_brigade (
  brigade_id  uuid not null references brigades(id)   on delete cascade,
  activity_id uuid not null references activities(id) on delete cascade,
  primary key (brigade_id, activity_id)
);
create index activities_brigade_brigade_idx  on activities_brigade(brigade_id);
create index activities_brigade_activity_idx on activities_brigade(activity_id);

-- ============================================================================
-- 6. campaigns — campanhas (sem category enum; news/articles são separados)
-- ============================================================================
create table campaigns (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique,
  title         text not null,
  description   text,
  body          text,
  pix           text,
  image_url     text,
  start_date    timestamptz,
  end_date      timestamptz,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger campaigns_updated_at before update on campaigns
  for each row execute function set_updated_at();
create index campaigns_published_idx on campaigns(published_at desc nulls last);

-- Resultados da campanha (linhas extensíveis, não colunas fixas result_1/2)
create table campaign_results (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  label       text not null,               -- "Pessoas atendidas", "Doações"
  value       text not null,               -- "1.200" ou "R$ 50.000" (formato livre)
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);
create index campaign_results_campaign_idx on campaign_results(campaign_id, position);

-- Brigadas participantes da campanha
create table campaign_brigade (
  campaign_id    uuid not null references campaigns(id)            on delete cascade,
  participant_id uuid not null references participant_brigades(id) on delete cascade,
  primary key (campaign_id, participant_id)
);
create index campaign_brigade_campaign_idx on campaign_brigade(campaign_id);

-- ============================================================================
-- 7. news — notícias
-- ============================================================================
create table news (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique,
  title         text not null,
  subtitle      text,
  summary       text,
  body          text,
  author        text,
  source_url    text,
  image_url     text,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger news_updated_at before update on news
  for each row execute function set_updated_at();
create index news_published_idx on news(published_at desc nulls last);

create table news_brigade (
  news_id        uuid not null references news(id)                 on delete cascade,
  participant_id uuid not null references participant_brigades(id) on delete cascade,
  primary key (news_id, participant_id)
);

-- ============================================================================
-- 8. articles — artigos e boas práticas
-- ============================================================================
create table articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique,
  title         text not null,
  subtitle      text,
  summary       text,
  body          text,
  author        text,
  category      text not null default 'Artigo'
                  check (category in ('Artigo', 'Boas Práticas')),
  image_url     text,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger articles_updated_at before update on articles
  for each row execute function set_updated_at();
create index articles_published_idx on articles(published_at desc nulls last);
create index articles_category_idx  on articles(category);

create table article_brigade (
  article_id     uuid not null references articles(id)             on delete cascade,
  participant_id uuid not null references participant_brigades(id) on delete cascade,
  primary key (article_id, participant_id)
);

-- ============================================================================
-- 9. faqs — Help
-- ============================================================================
create table faqs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger faqs_updated_at before update on faqs
  for each row execute function set_updated_at();
create index faqs_position_idx on faqs(position);

-- ============================================================================
-- 10. contacts — formulário de contato
-- ============================================================================
create table contacts (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           text not null,
  phone           text,
  state           text,
  city            text,
  contact_reason  text not null,
  brigade_id      uuid references brigades(id) on delete set null,
  message         text not null,
  terms_accepted  boolean not null,
  created_at      timestamptz not null default now()
);
create index contacts_created_idx on contacts(created_at desc);
create index contacts_brigade_idx on contacts(brigade_id);

-- ============================================================================
-- 11. events — tracking granular de cliques
-- ============================================================================
-- Cada evento = 1 linha. Agregação em event_counts (view) ou via cron depois.
create table events (
  id           uuid primary key default gen_random_uuid(),
  event_type   text not null,    -- 'campaign_view', 'profile_view', 'form_submit'…
  target_type  text,              -- 'brigade' | 'campaign' | 'news' | 'article' | null
  target_id    uuid,
  session_id   uuid,              -- sessão anonimizada
  occurred_at  timestamptz not null default now(),
  metadata     jsonb,             -- referrer, user-agent, cidade IP, etc.
  created_at   timestamptz not null default now()
);
create index events_type_time_idx on events(event_type, occurred_at desc);
create index events_target_idx    on events(target_type, target_id);
create index events_occurred_idx  on events(occurred_at desc);

-- View agregada para dashboard. Trocar por matview se volume crescer muito.
create or replace view event_counts as
  select event_type, target_type, target_id, count(*) as quantity
  from events
  group by event_type, target_type, target_id;

-- ============================================================================
-- TODO: Row Level Security
-- ============================================================================
-- Próximo passo (não incluído aqui para revisar separadamente):
--   • alter table … enable row level security;
--   • policies de leitura pública para brigades/campaigns/news/articles/faqs
--   • policies de escrita só para profiles.role in ('admin','super_admin')
--     and is_validated = true
--   • policies de insert para contacts/events sem auth (anon)
