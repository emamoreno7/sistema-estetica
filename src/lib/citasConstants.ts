/** Servicios reservables en el portal según briefing (etiquetas canónicas). */
export const CITAS_SERVICIOS_RESERVABLES = [
  'Crio-lipólisis',
  'Radiofrecuencia',
  'Himu',
  'Depilación Definitiva',
  'Limpieza Facial Profunda',
  'Presoterapia',
] as const;

export type ServicioReservable = (typeof CITAS_SERVICIOS_RESERVABLES)[number];

/** Paso en minutos entre franjas (evita overlaps de 60m). */
export const CITA_INTERVALO_MIN = 60;

/** Horario recepción (Argentina / negocio). */
export const CITA_HORA_INICIO = 9; // 09:00
export const CITA_HORA_FIN = 20; // hasta 19:59 (último turno opcionalmente 19:00 con intervalos 60m)

/** Cross-sell predefinido: servicio reservado → complemento recomendado. */
export type CrossSellReco = {
  complemento: string;
  motivoProfesional: string;
};

const key = (s: string) => s.trim().toLowerCase();

const CROSS_SELL_MAP = new Map<string, CrossSellReco>([
  [
    key('Crio-lipólisis'),
    {
      complemento: 'Himu (Electrodos)',
      motivoProfesional: 'Potencia la tonificación tras reducir grasa.',
    },
  ],
  [
    key('Radiofrecuencia'),
    {
      complemento: 'Limpieza Facial Profunda',
      motivoProfesional: 'Prepara la piel para una mejor absorción y brillo.',
    },
  ],
  [
    key('Himu'),
    {
      complemento: 'Drenaje Linfático',
      motivoProfesional: 'Ayuda a eliminar toxinas liberadas por el trabajo muscular.',
    },
  ],
  [
    key('Depilación Definitiva'),
    {
      complemento: 'Nutrición / hidratación dermal focal',
      motivoProfesional: 'Ayuda al confort tras sesiones láser/IPL cuando lo indiquen tus profesionales.',
    },
  ],
  [
    key('Limpieza Facial Profunda'),
    {
      complemento: 'Hidratación con activos revitalizantes',
      motivoProfesional: 'Sellar la limpieza con nutrición deja la piel más luminosa entre sesiones.',
    },
  ],
  [
    key('Presoterapia'),
    {
      complemento: 'Drenaje Linfático',
      motivoProfesional: 'Potencia los resultados reductores combinando succión dirigida con drenaje suave.',
    },
  ],
]);

/** Opcional cuando el servicio no está en tabla fija — “reductivo” típico. */
const REDUCTOR_DEFAULT_CROSS: CrossSellReco = {
  complemento: 'Himu / Presoterapia',
  motivoProfesional: 'Complementamos la reducción con tonificación/drenaje según valoración profesional.',
};

export function obtenerCrossSellPorServicio(servicio: string): CrossSellReco | null {
  const direct = CROSS_SELL_MAP.get(key(servicio));
  if (direct) return direct;
  const t = servicio.toLowerCase();
  if (/crio|lip[oó]lis|lipol/i.test(t)) return CROSS_SELL_MAP.get(key('Crio-lipólisis')) ?? null;
  if (/presot|vacum|vacuum|lipom/i.test(t)) return REDUCTOR_DEFAULT_CROSS;
  return null;
}

/** Hasta sugerencias complementarias únicas para el Dashboard según tratamiento y/o próxima cita. */
export function obtenerSugerenciasBienestar(
  focoPrincipal: string | null | undefined,
  focoSecundario?: string | null
): CrossSellReco[] {
  const out: CrossSellReco[] = [];
  const seen = new Set<string>();

  function pushReco(r: CrossSellReco | null): void {
    if (!r || out.length >= 3) return;
    const id = r.complemento.trim().toLowerCase();
    if (seen.has(id)) return;
    seen.add(id);
    out.push(r);
  }

  if (focoPrincipal?.trim()) pushReco(obtenerCrossSellPorServicio(focoPrincipal));
  const sec = focoSecundario?.trim();
  const pri = focoPrincipal?.trim() ?? '';
  if (sec && sec.toLowerCase() !== pri.toLowerCase()) {
    pushReco(obtenerCrossSellPorServicio(sec));
  }

  for (const hint of ['Presoterapia', 'Crio-lipólisis', 'Radiofrecuencia']) {
    pushReco(obtenerCrossSellPorServicio(hint));
    if (out.length >= 3) break;
  }

  return out;
}
