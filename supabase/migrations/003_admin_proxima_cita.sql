-- ═══════════════════════════════════════════════════════════════════
-- Próxima cita (timestamptz) + acceso admin al listado/edición de perfiles
--
-- IMPORTANTE: editá el array de correos en is_portal_admin() para que
-- coincida con VITE_ADMIN_EMAILS del front (.env separado por comas).
-- ═══════════════════════════════════════════════════════════════════

alter table public.perfiles_clientes
  add column if not exists proxima_cita_at timestamptz;

comment on column public.perfiles_clientes.proxima_cita_at is
  'Próxima visita agendada desde el panel /admin';

-- Lista de mails admin (usa minúsculas). Debe coincidir con VITE_ADMIN_EMAILS del front (.env).
-- Añadir nuevos admins agregando otra línea con coma antes de '::text'.
create or replace function public.is_portal_admin()
returns boolean
language sql
stable
as $$
  select lower(trim(coalesce(auth.jwt() ->> 'email', ''))) = any (
    array[
      'emamoreno@icloud.com'::text,
      'ailencarro29@gmail.com'::text
    ]
  );
$$;

revoke all on function public.is_portal_admin() from public;
grant execute on function public.is_portal_admin() to authenticated;

drop policy if exists "portal_admin_manage_perfiles" on public.perfiles_clientes;

create policy "portal_admin_manage_perfiles"
  on public.perfiles_clientes
  for all
  to authenticated
  using (public.is_portal_admin())
  with check (public.is_portal_admin());
