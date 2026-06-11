import type { IllustrationKey } from '@/features/landing/ServiceIllustration';
import { assets } from '@/config/assets';

export const DEFAULT_SERVICE_IMAGE = assets.servicePlaceholder;

export type ServicioItem = {
  name: string;
  desc: string;
  badges: string[];
  image: string;
  illustration?: IllustrationKey;
};

export type ServicioCategoria = {
  id: string;
  label: string;
  services: ServicioItem[];
};

export const serviciosCatalogo: ServicioCategoria[] = [
  {
    id: 'corporal',
    label: 'Remodelacion Corporal',
    services: [
      {
        name: 'Body Up',
        desc: 'Modelado corporal con protocolo profesional.',
        badges: ['Tonificador', 'Reductor'],
        image: DEFAULT_SERVICE_IMAGE,
        illustration: 'bodyUp',
      },
      {
        name: 'Radiofrecuencia',
        desc: 'Firmeza y luminosidad: estimulacion del colageno para una piel mas compacta.',
        badges: ['Reafirmante'],
        image: DEFAULT_SERVICE_IMAGE,
        illustration: 'radiofrecuencia',
      },
      {
        name: 'Crio-lipolisis',
        desc: 'Enfriamiento controlado sobre zonas localizadas.',
        badges: ['Reductor'],
        image: DEFAULT_SERVICE_IMAGE,
        illustration: 'crio',
      },
      {
        name: 'Lipo-laser',
        desc: 'Tecnologia laser para acompanar tu silueta con contornos mas definidos.',
        badges: ['Reductor'],
        image: DEFAULT_SERVICE_IMAGE,
        illustration: 'lipolaser',
      },
      {
        name: 'Electrodos',
        desc: 'Activacion muscular profunda para tonificar y drenar.',
        badges: ['Tonificador', 'Drenante'],
        image: DEFAULT_SERVICE_IMAGE,
        illustration: 'electrodos',
      },
    ],
  },
  {
    id: 'bienestar',
    label: 'Bienestar',
    services: [
      {
        name: 'Masajes relajantes',
        desc: 'Ritual de descanso con movimientos lentos y aceites seleccionados.',
        badges: ['Relajante'],
        image: DEFAULT_SERVICE_IMAGE,
        illustration: 'masajeRelajante',
      },
      {
        name: 'Masaje linfatico',
        desc: 'Drenaje suave y ritmico que favorece la circulacion.',
        badges: ['Drenante'],
        image: DEFAULT_SERVICE_IMAGE,
        illustration: 'masajeLinfatico',
      },
      {
        name: 'Presoterapia',
        desc: 'Compresion secuencial envolvente para activar la circulacion.',
        badges: ['Drenante', 'Reafirmante'],
        image: DEFAULT_SERVICE_IMAGE,
        illustration: 'presoterapia',
      },
      {
        name: 'Piedras calientes',
        desc: 'Calor volcanico sobre la piel que relaja la fibra muscular.',
        badges: ['Relajante'],
        image: DEFAULT_SERVICE_IMAGE,
        illustration: 'piedrasCalientes',
      },
    ],
  },
  {
    id: 'facial',
    label: 'Facial y Mirada',
    services: [
      {
        name: 'Hollywood Peel',
        desc: 'Peeling de carbon con laser para una piel luminosa y unificada.',
        badges: ['Facial'],
        image: DEFAULT_SERVICE_IMAGE,
      },
      {
        name: 'Lifting de pestanas',
        desc: 'Curva y elevacion natural: una mirada despierta y femenina.',
        badges: ['Lashista'],
        image: DEFAULT_SERVICE_IMAGE,
        illustration: 'liftingPestanas',
      },
      {
        name: 'Laminado de cejas',
        desc: 'Cejas peinadas, fijadas y con forma definida durante semanas.',
        badges: ['Lashista'],
        image: DEFAULT_SERVICE_IMAGE,
      },
      {
        name: 'Perfilado de cejas',
        desc: 'Diseno a medida que equilibra simetria y expresion.',
        badges: ['Lashista'],
        image: DEFAULT_SERVICE_IMAGE,
        illustration: 'perfiladoCejas',
      },
    ],
  },
  {
    id: 'manos',
    label: 'Manos y Unas',
    services: [
      {
        name: 'Belleza de manos',
        desc: 'Cuidado completo de manos: prolijidad, cuticulas, hidratacion y esmaltado.',
        badges: ['Manicura'],
        image: DEFAULT_SERVICE_IMAGE,
      },
      {
        name: 'Nails (unas)',
        desc: 'Servicio de unas: esculpidas, semipermanente o kapping.',
        badges: ['Unas'],
        image: DEFAULT_SERVICE_IMAGE,
      },
    ],
  },
  {
    id: 'especialidades',
    label: 'Especialidades',
    services: [
      {
        name: 'Depilacion definitiva',
        desc: 'Piel lisa y cuidada en el tiempo, con tecnologia y seguimiento profesional.',
        badges: ['Definitivo'],
        image: DEFAULT_SERVICE_IMAGE,
        illustration: 'depilacionDefinitiva',
      },
      {
        name: 'Eliminacion de tatuajes',
        desc: 'Protocolo laser con enfoque en seguridad y resultados progresivos.',
        badges: ['Especialidad'],
        image: DEFAULT_SERVICE_IMAGE,
        illustration: 'eliminacionTatuajes',
      },
    ],
  },
];

export const BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  Reductor:     { bg: 'rgba(191,201,162,0.3)',  color: '#4A6741' },
  Tonificador:  { bg: 'rgba(0,61,91,0.10)',     color: 'var(--primary-navy)' },
  Reafirmante:  { bg: 'rgba(0,61,91,0.10)',     color: 'var(--primary-navy)' },
  Drenante:     { bg: 'rgba(191,201,162,0.3)',  color: '#4A6741' },
  Terapeutico:  { bg: 'rgba(0,61,91,0.10)',     color: 'var(--primary-navy)' },
  Relajante:    { bg: 'rgba(242,215,213,0.55)', color: '#8B4A5A' },
  Lashista:     { bg: 'rgba(242,215,213,0.55)', color: '#8B4A5A' },
  Facial:       { bg: 'rgba(242,215,213,0.55)', color: '#8B4A5A' },
  Manicura:     { bg: 'rgba(245,230,218,0.6)',  color: '#7A5A3A' },
  Unas:         { bg: 'rgba(245,230,218,0.6)',  color: '#7A5A3A' },
  Definitivo:   { bg: 'rgba(0,61,91,0.10)',     color: 'var(--primary-navy)' },
  Especialidad: { bg: 'rgba(245,230,218,0.6)',  color: '#7A5A3A' },
};

export function getAllServiceNames(): string[] {
  return serviciosCatalogo.flatMap((c) => c.services.map((s) => s.name));
}
