-- Estados extendidos + políticas RLS para gestión admin de turnos (vista /admin/agenda).
-- Requiere public.is_portal_admin() (migración 003) con el mismo correo que VITE_ADMIN_EMAILS.

alter table public.citas drop constraint if exists citas_estado_check;

alter table public.citas
  add constraint citas_estado_check
  check (estado in ('confirmado', 'pendiente', 'realizado', 'cancelado'));

comment on column public.citas.estado is
  'confirmado / pendiente: vigentes en agenda; realizado / cancelado: cierre de turno (liberan slot en índice único).';

-- Índice único existente sigue limitado a confirmado+pendiente (005) → realizado/cancelado no bloquean hora.

drop policy if exists "citas_admin_select" on public.citas;
create policy "citas_admin_select"
  on public.citas
  for select
  to authenticated
  using (public.is_portal_admin());

drop policy if exists "citas_admin_update" on public.citas;
create policy "citas_admin_update"
  on public.citas
  for update
  to authenticated
  using (public.is_portal_admin())
  with check (public.is_portal_admin());

drop policy if exists "citas_admin_delete" on public.citas;
create policy "citas_admin_delete"
  on public.citas
  for delete
  to authenticated
  using (public.is_portal_admin());
