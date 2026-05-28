-- Para el modelo correcto de pricing (margen de contribución):
-- cada servicio tiene una estimación de sesiones/mes que alimenta la simulación
-- del punto de equilibrio en /admin/costos.

alter table public.servicios
  add column if not exists cantidad_estimada_mensual integer not null default 0;

comment on column public.servicios.cantidad_estimada_mensual is
  'Sesiones mensuales esperadas (o realmente hechas) de este servicio. Sirve para simular si la contribución marginal cubre los costos fijos.';

-- Refrescar PostgREST tras agregar la columna.
notify pgrst, 'reload schema';
