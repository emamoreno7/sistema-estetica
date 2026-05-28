-- Auditoría semanal de precios de insumos: bitácora manual + links de proveedores.
-- Sin scrapers ni jobs externos: el admin verifica/edita y la app deja registro.

-- ─── Columna verificado_at en insumos ────────────────────────────────────────
alter table public.insumos
  add column if not exists verificado_at timestamptz;

comment on column public.insumos.verificado_at is
  'Última vez que el admin confirmó que el costo_por_unidad sigue vigente (aunque no haya cambiado).';

-- ─── Tabla de links a proveedores ────────────────────────────────────────────
create table if not exists public.insumo_proveedores (
  id uuid primary key default gen_random_uuid(),
  insumo_id uuid not null references public.insumos (id) on delete cascade,
  proveedor text not null,
  url text not null default '',
  precio_listado numeric(12, 4) not null default 0,
  fecha_verificacion date,
  notas text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists insumo_proveedores_insumo_idx on public.insumo_proveedores (insumo_id);

comment on table public.insumo_proveedores is
  'Links a webs de proveedores por insumo (Mercado Libre, distribuidores, etc.) con precio listado opcional';

-- ─── Tabla de historial de precios ───────────────────────────────────────────
create table if not exists public.insumo_precio_historial (
  id uuid primary key default gen_random_uuid(),
  insumo_id uuid not null references public.insumos (id) on delete cascade,
  costo_anterior numeric(12, 4) not null,
  costo_nuevo numeric(12, 4) not null,
  variacion_pct numeric(10, 2) generated always as (
    case
      when costo_anterior = 0 then null
      else round(((costo_nuevo - costo_anterior) / costo_anterior) * 100, 2)
    end
  ) stored,
  changed_at timestamptz not null default now(),
  changed_by uuid
);

create index if not exists insumo_precio_historial_insumo_idx
  on public.insumo_precio_historial (insumo_id, changed_at desc);

comment on table public.insumo_precio_historial is
  'Histórico autom. de cambios de costo_por_unidad en insumos (poblado por trigger).';

-- ─── Trigger: cada UPDATE de costo_por_unidad inserta una fila histórica ─────
create or replace function public.log_insumo_precio_cambio()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.costo_por_unidad is distinct from old.costo_por_unidad then
    insert into public.insumo_precio_historial (insumo_id, costo_anterior, costo_nuevo, changed_by)
    values (new.id, old.costo_por_unidad, new.costo_por_unidad, auth.uid());
    -- al cambiar precio se considera "verificado" automáticamente
    new.verificado_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists insumos_log_precio_cambio on public.insumos;
create trigger insumos_log_precio_cambio
  before update of costo_por_unidad on public.insumos
  for each row
  execute function public.log_insumo_precio_cambio();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.insumo_proveedores enable row level security;
alter table public.insumo_precio_historial enable row level security;

drop policy if exists "insumo_proveedores_admin_all" on public.insumo_proveedores;
create policy "insumo_proveedores_admin_all"
  on public.insumo_proveedores for all to authenticated
  using (public.is_portal_admin())
  with check (public.is_portal_admin());

drop policy if exists "insumo_precio_historial_admin_read" on public.insumo_precio_historial;
create policy "insumo_precio_historial_admin_read"
  on public.insumo_precio_historial for select to authenticated
  using (public.is_portal_admin());

-- el historial sólo se escribe vía trigger SECURITY DEFINER; no se da INSERT directo al rol.

grant select, insert, update, delete on public.insumo_proveedores to authenticated;
grant select on public.insumo_precio_historial to authenticated;
