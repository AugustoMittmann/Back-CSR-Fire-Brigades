-- ============================================================================
-- Bootstrap do primeiro admin
--
-- Como o backend exige um admin existente para criar novos usuários (chicken-
-- and-egg), o primeiro super_admin precisa ser criado manualmente:
--
-- 1) Supabase Dashboard → Authentication → Users → Add user → Create new user
--    Use email + senha. Marca "Auto Confirm User".
-- 2) Espera 1-2 segundos (o trigger handle_new_user cria a row em profiles).
-- 3) Roda este SQL no SQL Editor, trocando o email pelo que você usou.
-- 4) Daqui em diante, novos admins/usuários são criados via
--    POST /api/profiles (autenticado como esse super_admin).
-- ============================================================================

update profiles
set role = 'super_admin',
    is_validated = true,
    validated_at = now()
where email = 'TROQUE_AQUI@exemplo.com';

-- Confere o resultado
select id, email, role, is_validated, validated_at
from profiles
where role in ('admin', 'super_admin');
