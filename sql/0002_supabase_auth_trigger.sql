-- ============================================================================
-- Migração 0002: integração com Supabase Auth
--
-- Roda DEPOIS de 0001_initial_schema.sql. Adiciona:
--   1) Trigger handle_new_user — cada novo auth.users gera uma profile com
--      role='user', is_validated=false. Sem isso o INSERT em auth.users falha
--      pois a sua app espera uma profile correspondente.
--   2) Função is_admin(uid) — helper estável para usar em RLS policies futuras.
-- ============================================================================

-- 1) Trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, is_validated)
  values (new.id, new.email, 'user', false)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop primeiro caso já exista (idempotente)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) Helper para policies RLS
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid
      and is_validated = true
      and role in ('admin', 'super_admin')
  );
$$;
