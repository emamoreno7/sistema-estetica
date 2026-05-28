-- Seed inicial para una estética: catálogo típico de costos fijos e insumos.
-- Idempotente: si el concepto/nombre ya existe, no inserta de nuevo.
-- Todos los montos quedan en 0 — el admin los completa desde /admin/costos.

-- ─── Costos fijos típicos de una estética ────────────────────────────────────
insert into public.costos_operativos (concepto, monto_mensual, activo, notas)
select v.concepto, 0, true, v.notas
from (values
  ('Alquiler local',          'Gasto fijo mensual del local comercial'),
  ('Electricidad (luz)',      'Servicio eléctrico — alto consumo por equipos de estética'),
  ('Gas',                     'Servicio de gas para climatización y agua caliente'),
  ('Agua',                    'Servicio de agua corriente'),
  ('Internet / WiFi',         'Conexión a internet del local'),
  ('ABL / impuestos municipales', 'Tasas e impuestos municipales del local'),
  ('Servicio de limpieza',    'Personal o servicio de limpieza tercerizado'),
  ('Honorarios contador',     'Gestión contable / liquidación mensual'),
  ('Marketing / redes sociales', 'Pauta digital, community manager, gráfica'),
  ('Mantenimiento equipos',   'Calibración y service preventivo de aparatos')
) as v(concepto, notas)
where not exists (
  select 1 from public.costos_operativos co where co.concepto = v.concepto
);

-- ─── Insumos típicos de una estética ─────────────────────────────────────────
insert into public.insumos (nombre, unidad, costo_por_unidad, proveedor, notas, activo)
select v.nombre, v.unidad, 0, '', v.notas, true
from (values
  -- Descartables generales
  ('Guantes de látex / nitrilo', 'par',     'Higiene básica en cada sesión'),
  ('Gasas estériles',            'unidad',  'Curaciones, limpieza facial, post tratamientos'),
  ('Algodón hidrófilo',          'gramo',   'Aplicación de lociones, limpieza'),
  ('Sábana descartable',         'unidad',  'Camilla — una por cliente'),
  ('Cubre calzado',              'par',     'Higiene del espacio clínico'),
  ('Cofia / gorro descartable',  'unidad',  'Estética facial y masajes'),
  ('Lentes protectoras descartables', 'par', 'Tratamientos láser, lipo-láser, depilación'),
  ('Toalla descartable',         'unidad',  'Secado post-tratamiento'),
  ('Hisopos',                    'unidad',  'Aplicación precisa de productos'),
  ('Film transparente',          'metro',   'Envoltorios reductores, criolipólisis'),

  -- Geles técnicos para equipos
  ('Gel conductor neutro',       'ml',      'Radiofrecuencia, electrodos, ultrasonido'),
  ('Gel criolipólisis',          'ml',      'Conducción térmica para frío localizado'),
  ('Membrana criolipólisis',     'unidad',  'Protección de piel durante el frío'),
  ('Electrodos adhesivos',       'par',     'Electroestimulación corporal y facial'),

  -- Aceites y cremas corporales
  ('Aceite de masaje neutro',    'ml',      'Masajes relajantes y descontracturantes'),
  ('Aceite esencial relajante',  'ml',      'Aromaterapia complementaria'),
  ('Crema reductora corporal',   'ml',      'Body Up, lipo-láser, post crio'),
  ('Crema reafirmante',          'ml',      'Radiofrecuencia, post tratamiento corporal'),
  ('Crema drenante',             'ml',      'Drenaje linfático, presoterapia'),
  ('Crema poslaser / regeneradora', 'ml',   'Calmante post depilación definitiva, eliminación tatuajes'),
  ('Anestésico tópico',          'ml',      'Eliminación de tatuajes, depilación zonas sensibles'),

  -- Lifting / laminado de pestañas y cejas
  ('Loción 1 lifting (rizadora)', 'ml',     'Primer paso lifting/laminado de pestañas'),
  ('Loción 2 fijadora',          'ml',      'Segundo paso lifting/laminado'),
  ('Loción 3 nutritiva',         'ml',      'Acabado nutritivo lifting/laminado'),
  ('Pegamento lifting',          'ml',      'Fijación de pestañas a almohadilla'),
  ('Almohadilla silicona lifting', 'par',   'Soporte de pestañas durante lifting'),
  ('Tinta cejas',                'ml',      'Perfilado y coloración de cejas'),

  -- Higiene y desinfección
  ('Alcohol 70%',                'ml',      'Desinfección de piel previa a tratamientos'),
  ('Desinfectante de superficies', 'ml',    'Limpieza de camilla y equipos entre clientes')
) as v(nombre, unidad, notas)
where not exists (
  select 1 from public.insumos i where i.nombre = v.nombre
);

-- Nota: el catálogo es genérico para estéticas. Editá / desactivá / agregá
-- desde /admin/costos según los productos reales de Amore.
