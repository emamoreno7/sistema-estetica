-- Arreglo: errores "Could not find the 'updated_at' column ... in the schema cache".
--
-- Causa: el front mandaba `updated_at` en cada UPDATE pero PostgREST tenía
-- el cache desactualizado tras ALTER TABLE recientes. Solución correcta:
-- 1) Que `updated_at` sea responsabilidad de la base (trigger), no del cliente.
-- 2) Refrescar el cache de PostgREST ahora.
-- 3) Asegurar que la columna exista en todas las tablas relevantes.

-- ─── Asegurar columnas updated_at en las tablas relevantes ───────────────────
alter table public.servicios          add column if not exists updated_at timestamptz not null default now();
alter table public.insumos            add column if not exists updated_at timestamptz not null default now();
alter table public.costos_operativos  add column if not exists updated_at timestamptz not null default now();
alter table public.insumo_proveedores add column if not exists updated_at timestamptz not null default now();
alter table public.perfiles_clientes  add column if not exists updated_at timestamptz not null default now();

-- ─── Función trigger genérica para tocar updated_at en cada UPDATE ───────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ─── Adjuntar triggers (idempotente) ─────────────────────────────────────────
do $$
declare
  t text;
begin
  foreach t in array array[
    'servicios',
    'insumos',
    'costos_operativos',
    'insumo_proveedores',
    'perfiles_clientes'
  ]
  loop
    execute format('drop trigger if exists %I_touch_updated_at on public.%I', t, t);
    execute format(
      'create trigger %I_touch_updated_at
         before update on public.%I
         for each row execute function public.touch_updated_at()',
      t, t
    );
  end loop;
end $$;

-- ─── Forzar a PostgREST a refrescar su schema cache ──────────────────────────
notify pgrst, 'reload schema';
