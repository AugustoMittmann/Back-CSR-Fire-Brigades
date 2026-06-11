-- ============================================================================
-- Migração 0003: desabilitar RLS em todas as tabelas
--
-- Por que: o Supabase Dashboard habilita RLS por padrão em tabelas criadas
-- via UI/SQL Editor. Sem policies definidas, isso bloqueia TUDO — inclusive
-- service_role, dependendo da forma como Postgres aplica owner vs RLS.
--
-- Hoje o backend é a ÚNICA forma de leitura/escrita (service_role bypassa
-- RLS de fato, mas sem policies + RLS=true alguns drivers retornam vazio
-- silenciosamente). Como o front nunca fala direto com o Supabase, RLS é
-- redundante: a autorização vive no backend (requireAuth + requireAdmin).
--
-- Quando o frontend público começar a ler dados direto do Supabase (sem
-- passar pelo backend), aí sim reabilitamos RLS e criamos policies.
-- ============================================================================

alter table public.profiles              disable row level security;
alter table public.brigades              disable row level security;
alter table public.participant_brigades  disable row level security;
alter table public.items                 disable row level security;
alter table public.items_brigade         disable row level security;
alter table public.activities            disable row level security;
alter table public.activities_brigade    disable row level security;
alter table public.campaigns             disable row level security;
alter table public.campaign_results      disable row level security;
alter table public.campaign_brigade      disable row level security;
alter table public.news                  disable row level security;
alter table public.news_brigade          disable row level security;
alter table public.articles              disable row level security;
alter table public.article_brigade       disable row level security;
alter table public.faqs                  disable row level security;
alter table public.contacts              disable row level security;
alter table public.events                disable row level security;
