-- ============================================================================
-- Migração 0004: rehabilitar RLS + revogar GRANTs padrão de anon/authenticated
--
-- Contexto de segurança (audit 2026-08):
-- A migração 0003 desabilitou RLS em todas as tabelas assumindo que o backend
-- (service_role) é a ÚNICA porta de entrada. Porém a chave `anon` do Supabase
-- é embarcada no bundle do frontend (upload de imagens via Storage) e essa
-- MESMA chave autentica contra o PostgREST/Auth do projeto. Com RLS desligada
-- e os GRANTs padrão do Supabase (que concedem ALL em public.* para anon e
-- authenticated), qualquer pessoa que extraia a chave do bundle poderia ler e
-- escrever diretamente nas tabelas, contornando toda a autorização do Express.
--
-- Esta migração fecha esse buraco por dois mecanismos independentes (defesa em
-- profundidade):
--   1. REVOKE de todos os privilégios de anon/authenticated no schema public
--      (+ default privileges para objetos futuros).
--   2. RLS habilitada e deny-by-default (sem policies) em todas as tabelas.
--
-- O `service_role` usado pelo backend tem BYPASSRLS e não é afetado pelos
-- REVOKEs acima, então a API continua funcionando exatamente como antes.
--
-- IMPORTANTE: o bucket de imagens vive no schema `storage`, não em `public`,
-- portanto o upload público NÃO é afetado. Restrinja as policies do bucket
-- separadamente (INSERT anon apenas nos prefixos esperados).
--
-- Quando/se o frontend público passar a LER dados direto do Supabase, criar
-- policies de SELECT explícitas (ex.: leitura pública de brigades/campaigns/
-- news/articles/faqs) em uma migração dedicada — nunca reconceder ALL a anon.
-- ============================================================================

-- 1) Revogar privilégios diretos das roles expostas ao navegador -------------
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

-- Objetos criados no futuro não devem herdar acesso para anon/authenticated.
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;

-- 2) Rehabilitar RLS (deny-by-default) em todas as tabelas -------------------
--    Sem policies, anon/authenticated não enxergam nada; service_role bypassa.
alter table public.profiles              enable row level security;
alter table public.brigades              enable row level security;
alter table public.participant_brigades  enable row level security;
alter table public.items                 enable row level security;
alter table public.items_brigade         enable row level security;
alter table public.activities            enable row level security;
alter table public.activities_brigade    enable row level security;
alter table public.campaigns             enable row level security;
alter table public.campaign_results      enable row level security;
alter table public.campaign_brigade      enable row level security;
alter table public.news                  enable row level security;
alter table public.news_brigade          enable row level security;
alter table public.articles              enable row level security;
alter table public.article_brigade       enable row level security;
alter table public.faqs                  enable row level security;
alter table public.contacts              enable row level security;
alter table public.events                enable row level security;

-- Também força RLS para o dono da tabela, fechando qualquer brecha caso o
-- backend deixe de usar service_role no futuro. (service_role continua com
-- BYPASSRLS.)
alter table public.profiles              force row level security;
alter table public.brigades              force row level security;
alter table public.participant_brigades  force row level security;
alter table public.items                 force row level security;
alter table public.items_brigade         force row level security;
alter table public.activities            force row level security;
alter table public.activities_brigade    force row level security;
alter table public.campaigns             force row level security;
alter table public.campaign_results      force row level security;
alter table public.campaign_brigade      force row level security;
alter table public.news                  force row level security;
alter table public.news_brigade          force row level security;
alter table public.articles              force row level security;
alter table public.article_brigade       force row level security;
alter table public.faqs                  force row level security;
alter table public.contacts              force row level security;
alter table public.events                force row level security;
