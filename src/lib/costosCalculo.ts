/**
 * Modelo de margen de contribución para el panel /admin/costos.
 *
 *   precio = costo_directo / (1 - margen_objetivo / 100)
 *   contribucion_sesion = precio - costo_directo
 *   contribucion_mes = sum(contribucion_sesion_X * cantidad_X)
 *   ganancia_neta_mes = contribucion_mes - costos_fijos_mes
 *
 * Los costos fijos NO se prorratean en el precio de cada servicio: se cubren
 * con la suma de contribuciones marginales de todas las sesiones del mes.
 */

export type ServicioCostoInput = {
  id: string;
  nombre: string;
  categoria_label: string;
  precio: number;
  duracion_minutos: number;
  margen_objetivo: number;
  costo_mano_obra: number;
  cantidad_estimada_mensual: number;
  activo: boolean;
};

export type ServicioInsumoLink = {
  servicio_id: string;
  insumo_id: string;
  cantidad: number;
  costo_por_unidad: number;
};

export type ServicioCostoCalculado = ServicioCostoInput & {
  costo_insumos: number;
  /** Costo variable por sesión: insumos + mano de obra. NO incluye fijos. */
  costo_directo: number;
  /** Contribución marginal por sesión (precio - costo_directo). */
  contribucion_sesion: number;
  /** Contribución marginal total mensual estimada para este servicio. */
  contribucion_mes: number;
  margen_actual_pct: number | null;
  precio_sugerido: number;
  bajo_margen: boolean;
};

export type EstadoMensual = 'rojo' | 'amarillo' | 'verde';

export type ResumenMensual = {
  ingreso_total: number;
  costo_variable_total: number;
  contribucion_total: number;
  costos_fijos_total: number;
  ganancia_neta: number;
  /** ganancia_neta / costos_fijos. Si fijos = 0 y hay ingresos → ∞ tratado como verde. */
  cobertura_pct: number | null;
  estado: EstadoMensual;
  /** Cuántas sesiones “base” (la suma) hay simuladas. */
  sesiones_estimadas_total: number;
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function totalCostosFijosMensual(costos: { monto_mensual: number; activo: boolean }[]): number {
  return costos.filter((c) => c.activo).reduce((s, c) => s + Math.max(0, c.monto_mensual), 0);
}

export function costoInsumosServicio(servicioId: string, links: ServicioInsumoLink[]): number {
  return links
    .filter((l) => l.servicio_id === servicioId)
    .reduce((s, l) => s + l.cantidad * l.costo_por_unidad, 0);
}

export function margenSobrePrecio(precio: number, costoDirecto: number): number | null {
  if (precio <= 0) return null;
  return roundMoney(((precio - costoDirecto) / precio) * 100);
}

export function precioPorMargenObjetivo(costoDirecto: number, margenObjetivoPct: number): number {
  const m = Math.min(99.99, Math.max(0, margenObjetivoPct));
  const divisor = 1 - m / 100;
  if (divisor <= 0) return costoDirecto;
  return roundMoney(costoDirecto / divisor);
}

export function calcularFilasCostos(
  servicios: ServicioCostoInput[],
  links: ServicioInsumoLink[]
): ServicioCostoCalculado[] {
  return servicios.map((s) => {
    const costo_insumos = roundMoney(costoInsumosServicio(s.id, links));
    const costo_directo = roundMoney(costo_insumos + Math.max(0, s.costo_mano_obra));
    const margen_actual_pct = margenSobrePrecio(s.precio, costo_directo);
    const precio_sugerido = precioPorMargenObjetivo(costo_directo, s.margen_objetivo);
    // contribucion_sesion puede ser negativa si el precio cargado está por debajo
    // del costo directo (señal explícita de que estamos perdiendo plata).
    const contribucion_sesion = roundMoney(s.precio - costo_directo);
    const contribucion_mes = roundMoney(contribucion_sesion * Math.max(0, s.cantidad_estimada_mensual));
    const bajo_margen = margen_actual_pct !== null && margen_actual_pct < s.margen_objetivo - 0.5;

    return {
      ...s,
      costo_insumos,
      costo_directo,
      contribucion_sesion,
      contribucion_mes,
      margen_actual_pct,
      precio_sugerido,
      bajo_margen,
    };
  });
}

/** Umbral relativo para pasar de amarillo a verde: 10% sobre costos fijos. */
const UMBRAL_VERDE_PCT = 0.1;

export function resumenMensual(
  filas: ServicioCostoCalculado[],
  costosFijosTotal: number
): ResumenMensual {
  let ingreso_total = 0;
  let costo_variable_total = 0;
  let sesiones_estimadas_total = 0;

  for (const f of filas) {
    if (!f.activo) continue;
    const q = Math.max(0, f.cantidad_estimada_mensual);
    if (q === 0) continue;
    ingreso_total += f.precio * q;
    costo_variable_total += f.costo_directo * q;
    sesiones_estimadas_total += q;
  }

  ingreso_total = roundMoney(ingreso_total);
  costo_variable_total = roundMoney(costo_variable_total);
  const contribucion_total = roundMoney(ingreso_total - costo_variable_total);
  const ganancia_neta = roundMoney(contribucion_total - costosFijosTotal);

  let cobertura_pct: number | null;
  if (costosFijosTotal <= 0) cobertura_pct = ganancia_neta > 0 ? 999 : null;
  else cobertura_pct = roundMoney((contribucion_total / costosFijosTotal) * 100);

  let estado: EstadoMensual;
  if (ganancia_neta < 0) estado = 'rojo';
  else if (ganancia_neta < UMBRAL_VERDE_PCT * Math.max(1, costosFijosTotal)) estado = 'amarillo';
  else estado = 'verde';

  return {
    ingreso_total,
    costo_variable_total,
    contribucion_total,
    costos_fijos_total: roundMoney(costosFijosTotal),
    ganancia_neta,
    cobertura_pct,
    estado,
    sesiones_estimadas_total,
  };
}
