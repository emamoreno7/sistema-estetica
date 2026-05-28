-- ─────────────────────────────────────────────────────────────────────────
-- 017 — Soporte para clientes "walk-in" cargados por recepción/admin.
--
-- Hasta 016 el flujo era: el cliente se registra en el portal → trigger
-- crea su fila en perfiles_clientes con id = auth.users.id. Por eso había
-- una FK rígida perfiles_clientes.id → auth.users.id (y la misma FK en
-- citas.cliente_id). Eso impedía que el admin diera de alta un cliente
-- que NUNCA pasó por el portal.
--
-- Esta migración relaja ambas FK y agrega `is_walkin` para distinguir.
-- ─────────────────────────────────────────────────────────────────────────

-- 1) Drop dinámico de FK en perfiles_clientes.id → auth.users.id
do $$
declare r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.perfiles_clientes'::regclass
      and contype = 'f'
      and (select count(*) from pg_attribute a
           where a.attrelid = conrelid
             and a.attnum = any(conkey)
             and a.attname = 'id') > 0
  loop
    execute format('alter table public.perfiles_clientes drop constraint %I', r.conname);
  end loop;
end$$;

-- 2) Drop dinámico de FK en citas.cliente_id → auth.users.id
do $$
declare r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.citas'::regclass
      and contype = 'f'
      and (select count(*) from pg_attribute a
           where a.attrelid = conrelid
             and a.attnum = any(conkey)
             and a.attname = 'cliente_id') > 0
  loop
    execute format('alter table public.citas drop constraint %I', r.conname);
  end loop;
end$$;

-- 3) Asegurar default uuid para nuevos clientes walk-in
alter table public.perfiles_clientes
  alter column id set default gen_random_uuid();

-- 4) Flag is_walkin para distinguir clientes creados por recepción
alter table public.perfiles_clientes
  add column if not exists is_walkin boolean not null default false;

comment on column public.perfiles_clientes.is_walkin is
  'true si el cliente fue cargado por recepción/admin sin registro propio en el portal.';

-- 5) Backfill: marcar como walk-in aquellos perfiles cuyo id NO existe en auth.users.
update public.perfiles_clientes p
   set is_walkin = true
 where p.is_walkin = false
   and not exists (select 1 from auth.users u where u.id = p.id);

-- 6) Email opcional (algunos perfiles legacy no lo tienen)
alter table public.perfiles_clientes
  add column if not exists email text;

-- ── Notas:
-- - El trigger `on_auth_user_created_perfil_cliente` (migración 004) sigue
--   creando perfiles cuando alguien se registra por el portal. Esos
--   perfiles tendrán is_walkin = false por defecto. ✔
-- - Las RLS existentes:
--     · perfiles_select/insert/update_own (cliente sobre su propio perfil)
--     · portal_admin_manage_perfiles (FOR ALL, admin)
--   ya permiten al admin insertar y leer cualquier perfil. ✔
-- - citas.cliente_id queda como uuid simple (sin FK). La RLS
--   citas_insert_own sigue exigiendo auth.uid() = cliente_id para el
--   flujo del cliente; el admin usa citas_admin_insert (migración 016)
--   que no exige correspondencia con auth.uid().
