-- Sondeo automático de precios de insumos.
-- Extiende insumo_proveedores con metadatos del sondeo + tabla de logs por intento.
-- La Edge Function `sondear-precios` consume estas columnas/tabla.

-- ─── Columnas extra en insumo_proveedores ───────────────────────────────────
alter table public.insumo_proveedores
  add column if not exists ml_item_id text,
  add column if not exists ultimo_sondeo_at timestamptz,
  add column if not exists ultimo_sondeo_ok boolean,
  add column if not exists ultimo_sondeo_error text,
  add column if not exists umbral_alerta_pct numeric(5, 2) not null default 10.0,
  add column if not exists sondeo_activo boolean not null default true;

comment on column public.insumo_proveedores.ml_item_id is
  'ID de item de Mercado Libre (ej. MLA1234567890). Si está presente, el sondeador usa la API de ML en vez de scraping.';
comment on column public.insumo_proveedores.umbral_alerta_pct is
  'Porcentaje mínimo de variación para alertar en la UI (default 10%).';
comment on column public.insumo_proveedores.sondeo_activo is
  'Si está apagado, este proveedor no se sondea automáticamente.';

-- ─── Helper: extraer ML item id de una URL ──────────────────────────────────
-- Acepta variantes: https://articulo.mercadolibre.com.ar/MLA-123456789-...,
--                   https://www.mercadolibre.com.ar/...-/p/MLA12345678,
--                   https://produto.mercadolivre.com.br/MLB-987654321-...
create or replace function public.extract_ml_item_id(url text)
returns text
language sql
immutable
as $$
  select case
    when url is null or url = '' then null
    else (
      select (regexp_match(url, 'ML[ABMUCVO]-?([0-9]{6,15})', 'i'))[1]
    )
  end;
$$;

-- Trigger para auto-poblar ml_item_id al insertar/actualizar URL
create or replace function public.fill_ml_item_id()
returns trigger
language plpgsql
as $$
begin
  if new.url is not null and new.url <> '' and new.ml_item_id is null then
    declare
      v_num text := public.extract_ml_item_id(new.url);
      v_prefix text;
    begin
      if v_num is not null then
        v_prefix := (regexp_match(new.url, '(ML[ABMUCVO])-?[0-9]', 'i'))[1];
        if v_prefix is not null then
          new.ml_item_id := upper(v_prefix) || v_num;
        end if;
      end if;
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists insumo_proveedores_fill_ml on public.insumo_proveedores;
create trigger insumo_proveedores_fill_ml
  before insert or update of url on public.insumo_proveedores
  for each row
  execute function public.fill_ml_item_id();

-- Backfill de ml_item_id en filas existentes
update public.insumo_proveedores ip
set ml_item_id = upper((regexp_match(ip.url, '(ML[ABMUCVO])-?[0-9]', 'i'))[1])
                 || (regexp_match(ip.url, 'ML[ABMUCVO]-?([0-9]{6,15})', 'i'))[1]
where ip.url is not null
  and ip.url <> ''
  and ip.ml_item_id is null
  and (regexp_match(ip.url, 'ML[ABMUCVO]-?([0-9]{6,15})', 'i'))[1] is not null;

-- ─── Tabla de logs de sondeo ────────────────────────────────────────────────
create table if not exists public.insumo_proveedor_sondeo_log (
  id uuid primary key default gen_random_uuid(),
  proveedor_id uuid not null references public.insumo_proveedores (id) on delete cascade,
  sondeado_at timestamptz not null default now(),
  source text not null check (source in ('ml_api', 'scraper', 'manual')),
  status text not null check (status in ('ok', 'error', 'no_change')),
  precio_anterior numeric(12, 4),
  precio_detectado numeric(12, 4),
  variacion_pct numeric(10, 2) generated always as (
    case
      when precio_anterior is null or precio_anterior = 0 then null
      else round(((precio_detectado - precio_anterior) / precio_anterior) * 100, 2)
    end
  ) stored,
  error_msg text,
  http_status int,
  duration_ms int
);

create index if not exists sondeo_log_proveedor_idx
  on public.insumo_proveedor_sondeo_log (proveedor_id, sondeado_at desc);
create index if not exists sondeo_log_fecha_idx
  on public.insumo_proveedor_sondeo_log (sondeado_at desc);

comment on table public.insumo_proveedor_sondeo_log is
  'Bitácora de cada intento de sondeo automático/manual de precios (poblada por la Edge Function sondear-precios).';

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table public.insumo_proveedor_sondeo_log enable row level security;

drop policy if exists "sondeo_log_admin_read" on public.insumo_proveedor_sondeo_log;
create policy "sondeo_log_admin_read"
  on public.insumo_proveedor_sondeo_log for select to authenticated
  using (public.is_portal_admin());

-- la Edge Function corre con service_role y bypasea RLS para insertar.
grant select on public.insumo_proveedor_sondeo_log to authenticated;

-- Refresh PostgREST schema cache
notify pgrst, 'reload schema';
