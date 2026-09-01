-- 0005_drop_legacy_pascalcase_tables.sql
--
-- Remove a família de tabelas LEGADA em PascalCase, que não é mais usada.
--
-- Contexto: o banco tinha DUAS famílias de tabelas em paralelo:
--   * PascalCase (legada) — Activities, Brigades, Campaign, Post, Help, ...
--   * snake_case minúscula (atual) — activities, brigades, campaigns, ...
--
-- Todo o código (back/src/**) e o schema oficial (0001_initial_schema.sql)
-- usam EXCLUSIVAMENTE a família minúscula. As tabelas PascalCase não são
-- referenciadas em lugar nenhum do código-fonte e contêm dados antigos/menores.
--
-- Contagem no momento da análise (2026-09-01):
--   Activities(4) Activities_brigades(5) Brigades(3) Campaign(2)
--   Campaign_brigade(4) Items(4) Items_brigade(4) Participant_brigades(3)
--   Results_campaign(3) Events(0) Post(1) Post_brigade(3) Help(1)
--
-- Backup dos dados legados: back/sql/_legacy_backup_2026-09-01/*.json
--
-- Identificadores PascalCase precisam de aspas duplas no Postgres.
-- CASCADE remove FKs/junções dependentes entre as próprias tabelas legadas.

BEGIN;

-- Junções primeiro (por clareza; CASCADE cobriria de qualquer forma)
DROP TABLE IF EXISTS "Activities_brigades"  CASCADE;
DROP TABLE IF EXISTS "Items_brigade"        CASCADE;
DROP TABLE IF EXISTS "Campaign_brigade"     CASCADE;
DROP TABLE IF EXISTS "Post_brigade"         CASCADE;
DROP TABLE IF EXISTS "Results_campaign"     CASCADE;
DROP TABLE IF EXISTS "Participant_brigades" CASCADE;

-- Entidades
DROP TABLE IF EXISTS "Activities" CASCADE;
DROP TABLE IF EXISTS "Items"      CASCADE;
DROP TABLE IF EXISTS "Campaign"   CASCADE;
DROP TABLE IF EXISTS "Post"       CASCADE;
DROP TABLE IF EXISTS "Brigades"   CASCADE;
DROP TABLE IF EXISTS "Events"     CASCADE;
DROP TABLE IF EXISTS "Help"       CASCADE;

COMMIT;
