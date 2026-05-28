-- Costos operativos, insumos y vínculo con servicios.
-- Los precios en `servicios.precio` se actualizan sólo cuando el admin confirma (front).

-- ─── Columnas de pricing en servicios ─────────────────────────────────────────
alter table public.servicios
  add column if not exists margen_objetivo numeric(5, 2) not null default 60,
  add column if not exists costo_mano_obra numeric(12, 2) not null default 0;

comment on column public.servicios.margen_objetivo is
  'Margen bruto objetivo (%) sobre precio de venta: precio_sugerido = costo_total / (1 - margen/100)';
comment on column public.servicios.costo_mano_obra is
  'Costo de mano de obra / comisión estimada por sesión de este servicio (ARS)';

-- ─── Insumos / productos consumibles ─────────────────────────────────────────
create table if not exists public.insumos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  unidad text not null default 'unidad',
  costo_por_unidad numeric(12, 4) not null default 0,
  proveedor text not null default '',
  notas text not null default '',
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists insumos_activo_idx on public.insumos (activo);

comment on table public.insumos is 'Insumos y productos; costo unitario alimenta el costo directo de cada servicio';

-- ─── Costos fijos del negocio (mensuales) ────────────────────────────────────
create table if not exists public.costos_operativos (
  id uuid primary key default gen_random_uuid(),
  concepto text not null,
  monto_mensual numeric(12, 2) not null default 0,
  activo boolean not null default true,
  notas text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists costos_operativos_activo_idx on public.costos_operativos (activo);

comment on table public.costos_operativos is
  'Gastos fijos mensuales (alquiler, servicios, etc.) prorrateados por duración de cada servicio';

-- ─── Relación servicio ↔ insumo (cantidad por sesión) ────────────────────────
create table if not exists public.servicios_insumos (
  servicio_id uuid not null references public.servicios (id) on delete cascade,
  insumo_id uuid not null references public.insumos (id) on delete cascade,
  cantidad numeric(12, 4) not null default 1,
  primary key (servicio_id, insumo_id)
);

create index if not exists servicios_insumos_insumo_idx on public.servicios_insumos (insumo_id);

comment on table public.servicios_insumos is 'Cantidad de cada insumo consumida por una sesión del servicio';

-- ─── RLS (mismo criterio admin que servicios / perfiles) ─────────────────────
alter table public.insumos enable row level security;
alter table public.costos_operativos enable row level security;
alter table public.servicios_insumos enable row level security;

drop policy if exists "insumos_admin_all" on public.insumos;
create policy "insumos_admin_all"
  on public.insumos for all to authenticated
  using (public.is_portal_admin())
  with check (public.is_portal_admin());

drop policy if exists "costos_operativos_admin_all" on public.costos_operativos;
create policy "costos_operativos_admin_all"
  on public.costos_operativos for all to authenticated
  using (public.is_portal_admin())
  with check (public.is_portal_admin());

drop policy if exists "servicios_insumos_admin_all" on public.servicios_insumos;
create policy "servicios_insumos_admin_all"
  on public.servicios_insumos for all to authenticated
  using (public.is_portal_admin())
  with check (public.is_portal_admin());

grant select, insert, update, delete on public.insumos to authenticated;
grant select, insert, update, delete on public.costos_operativos to authenticated;
grant select, insert, update, delete on public.servicios_insumos to authenticated;
