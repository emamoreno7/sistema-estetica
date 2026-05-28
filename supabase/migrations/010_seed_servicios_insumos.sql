-- Pre-vinculación de insumos a servicios para una estética típica.
-- Idempotente: ON CONFLICT DO NOTHING en (servicio_id, insumo_id).
-- Las cantidades son estimaciones por sesión — ajustables desde /admin/costos.
--
-- Si en el panel de Servicios o de Insumos cambiaron nombres, los pares que no
-- hagan match simplemente se omiten (no rompe la ejecución).

insert into public.servicios_insumos (servicio_id, insumo_id, cantidad)
select svc.id, ins.id, v.cantidad
from (values
  -- ─── Body Up (modelado corporal) ─────────────────────────────────────
  ('Body Up', 'Crema reductora corporal', 50),
  ('Body Up', 'Sábana descartable', 1),
  ('Body Up', 'Guantes de látex / nitrilo', 1),
  ('Body Up', 'Toalla descartable', 1),
  ('Body Up', 'Alcohol 70%', 10),

  -- ─── Radiofrecuencia ────────────────────────────────────────────────
  ('Radiofrecuencia', 'Gel conductor neutro', 30),
  ('Radiofrecuencia', 'Crema reafirmante', 30),
  ('Radiofrecuencia', 'Sábana descartable', 1),
  ('Radiofrecuencia', 'Guantes de látex / nitrilo', 1),
  ('Radiofrecuencia', 'Alcohol 70%', 5),

  -- ─── Crio-lipólisis ─────────────────────────────────────────────────
  ('Crio-lipólisis', 'Gel criolipólisis', 30),
  ('Crio-lipólisis', 'Membrana criolipólisis', 1),
  ('Crio-lipólisis', 'Film transparente', 1),
  ('Crio-lipólisis', 'Sábana descartable', 1),
  ('Crio-lipólisis', 'Guantes de látex / nitrilo', 1),

  -- ─── Lipo-láser ─────────────────────────────────────────────────────
  ('Lipo-láser', 'Gel conductor neutro', 20),
  ('Lipo-láser', 'Crema reductora corporal', 20),
  ('Lipo-láser', 'Lentes protectoras descartables', 1),
  ('Lipo-láser', 'Sábana descartable', 1),
  ('Lipo-láser', 'Guantes de látex / nitrilo', 1),

  -- ─── Electrodos (electroestimulación) ───────────────────────────────
  ('Electrodos', 'Electrodos adhesivos', 4),
  ('Electrodos', 'Gel conductor neutro', 20),
  ('Electrodos', 'Sábana descartable', 1),
  ('Electrodos', 'Guantes de látex / nitrilo', 1),

  -- ─── Masajes relajantes ─────────────────────────────────────────────
  ('Masajes relajantes', 'Aceite de masaje neutro', 30),
  ('Masajes relajantes', 'Aceite esencial relajante', 5),
  ('Masajes relajantes', 'Sábana descartable', 1),
  ('Masajes relajantes', 'Toalla descartable', 1),

  -- ─── Masajes descontracturantes ─────────────────────────────────────
  ('Masajes descontracturantes', 'Aceite de masaje neutro', 40),
  ('Masajes descontracturantes', 'Sábana descartable', 1),
  ('Masajes descontracturantes', 'Toalla descartable', 1),

  -- ─── Masaje linfático ───────────────────────────────────────────────
  ('Masaje linfático', 'Crema drenante', 30),
  ('Masaje linfático', 'Aceite de masaje neutro', 15),
  ('Masaje linfático', 'Sábana descartable', 1),
  ('Masaje linfático', 'Guantes de látex / nitrilo', 1),

  -- ─── Presoterapia ───────────────────────────────────────────────────
  ('Presoterapia', 'Sábana descartable', 1),
  ('Presoterapia', 'Cubre calzado', 1),
  ('Presoterapia', 'Alcohol 70%', 5),

  -- ─── Piedras calientes ──────────────────────────────────────────────
  ('Piedras calientes', 'Aceite de masaje neutro', 30),
  ('Piedras calientes', 'Sábana descartable', 1),
  ('Piedras calientes', 'Toalla descartable', 2),

  -- ─── Lifting de pestañas ────────────────────────────────────────────
  ('Lifting de pestañas', 'Loción 1 lifting (rizadora)', 2),
  ('Lifting de pestañas', 'Loción 2 fijadora', 2),
  ('Lifting de pestañas', 'Loción 3 nutritiva', 2),
  ('Lifting de pestañas', 'Pegamento lifting', 1),
  ('Lifting de pestañas', 'Almohadilla silicona lifting', 1),
  ('Lifting de pestañas', 'Algodón hidrófilo', 5),
  ('Lifting de pestañas', 'Hisopos', 4),
  ('Lifting de pestañas', 'Guantes de látex / nitrilo', 1),

  -- ─── Laminado de pestañas (mismo protocolo lifting) ────────────────
  ('Laminado de pestañas', 'Loción 1 lifting (rizadora)', 2),
  ('Laminado de pestañas', 'Loción 2 fijadora', 2),
  ('Laminado de pestañas', 'Loción 3 nutritiva', 2),
  ('Laminado de pestañas', 'Pegamento lifting', 1),
  ('Laminado de pestañas', 'Almohadilla silicona lifting', 1),
  ('Laminado de pestañas', 'Algodón hidrófilo', 5),
  ('Laminado de pestañas', 'Hisopos', 4),
  ('Laminado de pestañas', 'Guantes de látex / nitrilo', 1),

  -- ─── Perfilado de cejas ─────────────────────────────────────────────
  ('Perfilado de cejas', 'Tinta cejas', 2),
  ('Perfilado de cejas', 'Algodón hidrófilo', 3),
  ('Perfilado de cejas', 'Hisopos', 3),
  ('Perfilado de cejas', 'Alcohol 70%', 5),

  -- ─── Depilación definitiva ──────────────────────────────────────────
  ('Depilación definitiva', 'Gel conductor neutro', 30),
  ('Depilación definitiva', 'Crema poslaser / regeneradora', 20),
  ('Depilación definitiva', 'Lentes protectoras descartables', 1),
  ('Depilación definitiva', 'Sábana descartable', 1),
  ('Depilación definitiva', 'Guantes de látex / nitrilo', 1),
  ('Depilación definitiva', 'Alcohol 70%', 10),

  -- ─── Eliminación de tatuajes ────────────────────────────────────────
  ('Eliminación de tatuajes', 'Anestésico tópico', 5),
  ('Eliminación de tatuajes', 'Crema poslaser / regeneradora', 10),
  ('Eliminación de tatuajes', 'Lentes protectoras descartables', 1),
  ('Eliminación de tatuajes', 'Gasas estériles', 5),
  ('Eliminación de tatuajes', 'Guantes de látex / nitrilo', 1),
  ('Eliminación de tatuajes', 'Alcohol 70%', 10)

) as v(servicio_nombre, insumo_nombre, cantidad)
join public.servicios svc on svc.nombre = v.servicio_nombre
join public.insumos ins   on ins.nombre = v.insumo_nombre
on conflict (servicio_id, insumo_id) do nothing;
