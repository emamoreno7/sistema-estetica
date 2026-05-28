-- Citas cliente: día + hora con anti-superposición global entre turnos vigentes.

create table if not exists public.citas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references auth.users (id) on delete cascade,
  servicio text not null,
  fecha date not null,
  hora time not null,
  estado text not null default 'pendiente' check (estado in ('confirmado', 'pendiente')),
  created_at timestamptz not null default now()
);

-- Un mismo horario solo puede ocuparse una vez para turnos pendientes/confirmados
create unique index if not exists citas_fecha_hora_slots_vigentes
  on public.citas (fecha, hora)
  where (estado in ('confirmado', 'pendiente'));

create index if not exists citas_cliente_idx on public.citas (cliente_id);
create index if not exists citas_fecha_idx on public.citas (fecha);

alter table public.citas enable row level security;

drop policy if exists "citas_insert_own" on public.citas;
create policy "citas_insert_own"
  on public.citas
  for insert
  to authenticated
  with check (auth.uid() = cliente_id);

drop policy if exists "citas_select_own" on public.citas;
create policy "citas_select_own"
  on public.citas
  for select
  to authenticated
  using (auth.uid() = cliente_id);

-- Horas ocupadas para un día (función SECURITY DEFINER; solo ejecutable por usuarios autenticados).
create or replace function public.citas_horas_ocupadas(p_fecha date)
returns setof time
language sql
stable
security definer
set search_path = public
as $$
  select c.hora
  from public.citas c
  where c.fecha = p_fecha
    and c.estado in ('confirmado', 'pendiente');
$$;

revoke all on function public.citas_horas_ocupadas(date) from public;
grant execute on function public.citas_horas_ocupadas(date) to authenticated;

comment on table public.citas is 'Turnos solicitados/agendados en el portal cliente';
comment on function public.citas_horas_ocupadas(date) is 'Lista de horas ya reservadas (anti-superposición) sin revelar cliente_id ni servicio';
