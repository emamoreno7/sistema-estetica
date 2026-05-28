-- ─────────────────────────────────────────────────────────────────────────
-- 016 — Admin puede crear turnos en nombre de cualquier cliente.
--       Distingue turnos creados por admin vs solicitados por cliente.
--       Permite nota interna del admin.
--
-- Requiere is_portal_admin() (migración 003).
-- ─────────────────────────────────────────────────────────────────────────

-- Nuevas columnas en citas
alter table public.citas
  add column if not exists creado_por_admin boolean not null default false,
  add column if not exists nota_admin text;

comment on column public.citas.creado_por_admin is
  'true si el turno fue cargado por un admin (no es una solicitud de cliente).';
comment on column public.citas.nota_admin is
  'Nota interna opcional escrita por recepción/admin al crear o gestionar el turno.';

-- Política INSERT para admins: pueden crear turnos a nombre de cualquier
-- cliente. Se agrega EN PARALELO a citas_insert_own (cliente sigue
-- pudiendo crear solo SUS turnos como antes).
drop policy if exists "citas_admin_insert" on public.citas;
create policy "citas_admin_insert"
  on public.citas
  for insert
  to authenticated
  with check (public.is_portal_admin());

-- (Las políticas citas_admin_select/update/delete de la 006 siguen vigentes.)

-- Confirmar que el índice único anti-superposición sigue vigente
-- (creado en 005). No tocamos nada acá.

-- Función helper opcional: contar solicitudes pendientes de hoy en adelante.
-- Útil para mostrar badge en el admin sin traer todas las filas.
create or replace function public.citas_solicitudes_pendientes_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.citas c
  where c.estado = 'pendiente'
    and c.creado_por_admin = false
    and c.fecha >= current_date;
$$;

revoke all on function public.citas_solicitudes_pendientes_count() from public;
grant execute on function public.citas_solicitudes_pendientes_count() to authenticated;

comment on function public.citas_solicitudes_pendientes_count() is
  'Cuenta turnos pendientes solicitados por clientes (no por admin), de hoy en adelante.';
