-- Cron semanal opcional para sondear precios automáticamente todos los lunes 09:00.
-- Requiere las extensiones pg_cron y pg_net (Supabase Dashboard → Database → Extensions).
--
-- IMPORTANTE: antes de correr esta migración, reemplazá los placeholders:
--   ___SUPABASE_URL___       → https://<project-ref>.supabase.co
--   ___SERVICE_ROLE_KEY___   → tu service_role key (Project Settings → API)
--
-- O dejala comentada y corré manualmente las dos sentencias del final desde el SQL editor.

-- ─── Habilitar extensiones ──────────────────────────────────────────────────
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- ─── Función wrapper que dispara la Edge Function ──────────────────────────
create or replace function public.disparar_sondeo_precios_cron()
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_url text := current_setting('app.supabase_url', true);
  v_key text := current_setting('app.service_role_key', true);
begin
  if v_url is null or v_key is null then
    raise notice 'app.supabase_url o app.service_role_key no están configuradas. Configurá GUCs o reemplazá inline.';
    return;
  end if;

  perform extensions.http_post(
    url := v_url || '/functions/v1/sondear-precios',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body := jsonb_build_object('dry_run', false)::text
  );
end;
$$;

comment on function public.disparar_sondeo_precios_cron is
  'Llamada vía pg_cron una vez por semana para sondear precios. Lee URL/KEY de GUCs app.*';

-- ─── Crear el job (todos los lunes 09:00 UTC = 06:00 -3) ───────────────────
-- Eliminar job previo si existe (por seguridad)
do $$
declare
  v_jobid bigint;
begin
  select jobid into v_jobid from cron.job where jobname = 'sondear_precios_semanal';
  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;
end;
$$;

select cron.schedule(
  'sondear_precios_semanal',
  '0 12 * * 1',  -- lunes 12:00 UTC = 09:00 AR
  $$ select public.disparar_sondeo_precios_cron(); $$
);

-- ─── INSTRUCCIONES FINALES ──────────────────────────────────────────────────
-- 1) Configurar las GUCs (una sola vez):
--    alter database postgres set app.supabase_url = 'https://<project-ref>.supabase.co';
--    alter database postgres set app.service_role_key = '<service_role_key>';
--    -- después de eso reconectar (Supabase lo hace solo al refrescar)
--
-- 2) Verificar:
--    select * from cron.job where jobname = 'sondear_precios_semanal';
--    select * from cron.job_run_details order by start_time desc limit 5;
--
-- 3) Disparar manualmente para probar:
--    select public.disparar_sondeo_precios_cron();
--
-- 4) Para apagar el cron:
--    select cron.unschedule((select jobid from cron.job where jobname = 'sondear_precios_semanal'));

notify pgrst, 'reload schema';
