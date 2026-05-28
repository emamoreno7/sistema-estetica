/**
 * Ilustraciones SVG line-art para cada servicio del catálogo.
 *
 * Paleta:
 *   navy   #003D5B  → trazos principales
 *   sage   #BFC9A2  → acentos
 *   rose   #F2D7D5  → fondos y decoraciones
 *   cream  #FDF8F5  → base
 *
 * Cada ilustración usa el mismo viewBox 0 0 300 400 (aspect 3/4) y un fondo
 * con gradiente sutil. Mantenemos consistencia visual variando el motivo.
 */

import type { JSX } from 'react';
import { motion } from 'framer-motion';

export type IllustrationKey =
  | 'bodyUp'
  | 'radiofrecuencia'
  | 'crio'
  | 'lipolaser'
  | 'electrodos'
  | 'masajeRelajante'
  | 'masajeDescontracturante'
  | 'masajeLinfatico'
  | 'presoterapia'
  | 'piedrasCalientes'
  | 'liftingPestanas'
  | 'laminadoPestanas'
  | 'perfiladoCejas'
  | 'depilacionDefinitiva'
  | 'eliminacionTatuajes';

const NAVY = '#003D5B';
const SAGE = '#BFC9A2';
const ROSE = '#F2D7D5';
const ROSE_SOFT = '#FCE4D4';

type Props = {
  variant: IllustrationKey;
  className?: string;
};

function GradientBg({ id, from, to }: { id: string; from: string; to: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={from} />
        <stop offset="100%" stopColor={to} />
      </linearGradient>
    </defs>
  );
}

function FrameBg({ gradId }: { gradId: string }) {
  return <rect width="300" height="400" fill={`url(#${gradId})`} />;
}

export function ServiceIllustration({ variant, className }: Props) {
  const Inner = ILLUSTRATIONS[variant] ?? ILLUSTRATIONS.bodyUp;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: '100%', height: '100%' }}
    >
      <svg
        viewBox="0 0 300 400"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <Inner />
      </svg>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cada ilustración es un componente sin props que retorna sólo el contenido
// del <svg>. La envoltura la pone <ServiceIllustration>.
// ─────────────────────────────────────────────────────────────────────────────

const ILLUSTRATIONS: Record<IllustrationKey, () => JSX.Element> = {
  // 1. Body Up — silueta femenina estilizada con aura energética
  bodyUp: () => (
    <>
      <GradientBg id="bgBodyUp" from={ROSE_SOFT} to="#FDF8F5" />
      <FrameBg gradId="bgBodyUp" />
      {/* Aura de ondas concéntricas */}
      <g stroke={SAGE} strokeWidth="0.6" fill="none" opacity="0.55">
        <ellipse cx="150" cy="220" rx="110" ry="135" />
        <ellipse cx="150" cy="220" rx="92" ry="115" />
        <ellipse cx="150" cy="220" rx="72" ry="92" />
      </g>
      {/* Silueta */}
      <path
        d="M150 90 c-12 0 -20 9 -20 22 c0 11 7 19 18 22 l-2 16 c-6 2 -16 6 -22 14 c-7 9 -12 24 -14 44 c-2 22 -1 40 4 70 l-6 1 c-2 22 -2 50 4 70 l8 1 l4 -38 l5 -3 c0 12 -1 30 -2 42 l9 1 l6 -56 l2 0 l6 56 l9 -1 c-1 -12 -2 -30 -2 -42 l5 3 l4 38 l8 -1 c6 -20 6 -48 4 -70 l-6 -1 c5 -30 6 -48 4 -70 c-2 -20 -7 -35 -14 -44 c-6 -8 -16 -12 -22 -14 l-2 -16 c11 -3 18 -11 18 -22 c0 -13 -8 -22 -20 -22 z"
        fill="none"
        stroke={NAVY}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Pequeños puntos decorativos */}
      <g fill={SAGE} opacity="0.6">
        <circle cx="70" cy="120" r="2" />
        <circle cx="230" cy="155" r="2.5" />
        <circle cx="55" cy="280" r="1.8" />
        <circle cx="248" cy="320" r="2" />
      </g>
    </>
  ),

  // 2. Radiofrecuencia — cabezal radial con ondas concéntricas
  radiofrecuencia: () => (
    <>
      <GradientBg id="bgRf" from="#FDF8F5" to={ROSE_SOFT} />
      <FrameBg gradId="bgRf" />
      {/* Ondas radiales */}
      <g stroke={NAVY} fill="none" strokeLinecap="round">
        <path d="M60 200 Q80 180 105 175" strokeWidth="1.2" opacity="0.35" />
        <path d="M50 200 Q75 165 110 160" strokeWidth="1.2" opacity="0.45" />
        <path d="M40 200 Q70 150 115 145" strokeWidth="1.2" opacity="0.6" />
        <path d="M30 200 Q65 135 120 130" strokeWidth="1.2" opacity="0.75" />
        <path d="M60 200 Q80 220 105 225" strokeWidth="1.2" opacity="0.35" />
        <path d="M50 200 Q75 235 110 240" strokeWidth="1.2" opacity="0.45" />
        <path d="M40 200 Q70 250 115 255" strokeWidth="1.2" opacity="0.6" />
        <path d="M30 200 Q65 265 120 270" strokeWidth="1.2" opacity="0.75" />
      </g>
      {/* Cabezal handpiece */}
      <g transform="translate(130 160)">
        <rect x="0" y="0" width="36" height="80" rx="18" fill={NAVY} />
        <rect x="6" y="6" width="24" height="40" rx="10" fill={ROSE} />
        <circle cx="18" cy="65" r="4" fill={SAGE} />
      </g>
      {/* Perfil de cara abstracto */}
      <path
        d="M195 100 Q230 105 245 140 Q255 175 245 215 Q235 255 215 275 Q205 280 198 285 Q195 290 192 295 Q190 305 195 315 L210 320"
        fill="none"
        stroke={NAVY}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Acentos */}
      <circle cx="218" cy="170" r="3" fill={NAVY} />
      <path d="M212 195 Q220 198 226 195" stroke={NAVY} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </>
  ),

  // 3. Crio-lipólisis — cristales/copos de nieve sobre forma orgánica
  crio: () => (
    <>
      <GradientBg id="bgCrio" from="#EAF1F3" to="#FDF8F5" />
      <FrameBg gradId="bgCrio" />
      {/* Forma orgánica (zona tratada) */}
      <path
        d="M90 180 Q70 220 90 270 Q130 310 170 305 Q220 295 230 250 Q240 200 215 175 Q180 145 150 150 Q115 155 90 180 Z"
        fill={ROSE_SOFT}
        stroke={NAVY}
        strokeWidth="1.5"
        opacity="0.85"
      />
      {/* Copos de nieve estilizados */}
      <g stroke={NAVY} strokeWidth="1.2" strokeLinecap="round">
        <Snowflake cx={120} cy={130} size={24} />
        <Snowflake cx={195} cy={115} size={32} />
        <Snowflake cx={250} cy={170} size={20} />
        <Snowflake cx={70} cy={120} size={18} />
        <Snowflake cx={155} cy={235} size={28} />
        <Snowflake cx={210} cy={280} size={22} />
      </g>
    </>
  ),

  // 4. Lipo-láser — rayos cruzados con diana
  lipolaser: () => (
    <>
      <GradientBg id="bgLipo" from="#FDF8F5" to={ROSE} />
      <FrameBg gradId="bgLipo" />
      {/* Líneas de láser */}
      <g stroke="#D9534F" strokeWidth="1.5" opacity="0.85" strokeLinecap="round">
        <line x1="30" y1="70" x2="150" y2="200" />
        <line x1="270" y1="80" x2="150" y2="200" />
        <line x1="40" y1="180" x2="150" y2="200" />
        <line x1="260" y1="200" x2="150" y2="200" />
        <line x1="60" y1="320" x2="150" y2="200" />
        <line x1="240" y1="330" x2="150" y2="200" />
      </g>
      {/* Brillos en origen */}
      <g fill="#D9534F" opacity="0.9">
        <circle cx="30" cy="70" r="3" />
        <circle cx="270" cy="80" r="3" />
        <circle cx="40" cy="180" r="2.5" />
        <circle cx="260" cy="200" r="2.5" />
        <circle cx="60" cy="320" r="3" />
        <circle cx="240" cy="330" r="3" />
      </g>
      {/* Diana central */}
      <g stroke={NAVY} fill="none" strokeWidth="1.5">
        <circle cx="150" cy="200" r="50" />
        <circle cx="150" cy="200" r="35" />
        <circle cx="150" cy="200" r="20" opacity="0.6" />
      </g>
      <circle cx="150" cy="200" r="6" fill={NAVY} />
      {/* Reticulado decorativo */}
      <g stroke={SAGE} strokeWidth="0.8" opacity="0.5">
        <line x1="150" y1="135" x2="150" y2="155" />
        <line x1="150" y1="245" x2="150" y2="265" />
        <line x1="85" y1="200" x2="105" y2="200" />
        <line x1="195" y1="200" x2="215" y2="200" />
      </g>
    </>
  ),

  // 5. Electrodos — pulsos eléctricos curvos
  electrodos: () => (
    <>
      <GradientBg id="bgEle" from={ROSE_SOFT} to="#FDF8F5" />
      <FrameBg gradId="bgEle" />
      {/* Pulsos sinusoidales */}
      <g stroke={NAVY} fill="none" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20 130 Q60 90 100 130 T180 130 T260 130 L280 130" />
        <path d="M20 200 Q70 240 120 200 T220 200 L280 200" />
        <path d="M20 270 Q50 230 80 270 T140 270 T200 270 T260 270 L280 270" />
      </g>
      {/* Electrodos (pads) */}
      <g>
        <rect x="60" y="100" width="40" height="30" rx="6" fill={NAVY} opacity="0.85" />
        <rect x="180" y="170" width="40" height="30" rx="6" fill={NAVY} opacity="0.85" />
        <rect x="100" y="240" width="40" height="30" rx="6" fill={NAVY} opacity="0.85" />
      </g>
      {/* Cables */}
      <g stroke={SAGE} strokeWidth="1.5" fill="none" opacity="0.7" strokeLinecap="round">
        <path d="M80 130 Q90 350 200 360" />
        <path d="M200 200 Q180 350 200 360" />
        <path d="M120 270 Q150 320 200 360" />
      </g>
      {/* Conector */}
      <rect x="190" y="355" width="30" height="20" rx="4" fill={NAVY} />
    </>
  ),

  // 6. Masaje relajante — manos abiertas con flor de loto
  masajeRelajante: () => (
    <>
      <GradientBg id="bgMr" from={ROSE} to="#FDF8F5" />
      <FrameBg gradId="bgMr" />
      {/* Flor de loto estilizada */}
      <g transform="translate(150 230)">
        <g stroke={NAVY} fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 0 Q-40 -30 -60 -10 Q-40 25 0 25 Q40 25 60 -10 Q40 -30 0 0 Z" />
          <path d="M0 -10 Q-30 -55 -45 -40 Q-30 -10 0 -10" />
          <path d="M0 -10 Q30 -55 45 -40 Q30 -10 0 -10" />
          <path d="M0 -15 Q-15 -70 0 -75 Q15 -70 0 -15" />
          <ellipse cx="0" cy="0" rx="8" ry="5" fill={SAGE} stroke="none" opacity="0.75" />
        </g>
      </g>
      {/* Manos */}
      <g stroke={NAVY} fill="none" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        {/* Mano izquierda */}
        <path d="M55 110 L75 90 L95 100 L105 130 L100 150 L80 155 L55 145 Z" />
        <path d="M75 90 L78 70" />
        <path d="M85 92 L92 70" />
        <path d="M97 102 L107 82" />
        {/* Mano derecha */}
        <path d="M245 110 L225 90 L205 100 L195 130 L200 150 L220 155 L245 145 Z" />
        <path d="M225 90 L222 70" />
        <path d="M215 92 L208 70" />
        <path d="M203 102 L193 82" />
      </g>
      {/* Líneas de calma */}
      <g stroke={SAGE} strokeWidth="0.8" fill="none" opacity="0.7" strokeLinecap="round">
        <path d="M40 350 Q70 340 100 350" />
        <path d="M120 360 Q150 350 180 360" />
        <path d="M200 350 Q230 340 260 350" />
      </g>
    </>
  ),

  // 7. Masaje descontracturante — espalda en perfil con manos
  masajeDescontracturante: () => (
    <>
      <GradientBg id="bgMd" from="#FDF8F5" to={ROSE_SOFT} />
      <FrameBg gradId="bgMd" />
      {/* Silueta espalda en perfil */}
      <path
        d="M210 80 C 200 75 185 75 175 82 C 165 90 158 102 158 118 L158 135 C 160 145 165 152 170 158 C 165 170 158 180 158 195 L158 280 C 155 295 152 310 152 325 C 152 340 155 360 162 380 L222 380 C 220 360 215 340 210 320 L210 245 C 215 235 218 220 218 205 L218 165 C 218 150 215 138 210 130 L210 110 C 212 100 215 92 215 88 Z"
        fill={ROSE}
        stroke={NAVY}
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.85"
      />
      {/* Columna estilizada */}
      <path
        d="M195 145 L195 290"
        stroke={NAVY}
        strokeWidth="1.2"
        strokeDasharray="3 4"
        fill="none"
        opacity="0.85"
      />
      {/* Líneas de tensión (puntos de presión) */}
      <g fill={NAVY}>
        <circle cx="195" cy="175" r="2.5" />
        <circle cx="195" cy="210" r="2.5" />
        <circle cx="195" cy="245" r="2.5" />
      </g>
      {/* Manos aplicando presión */}
      <g stroke={NAVY} fill="none" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        <path d="M100 175 L130 165 L155 180 L155 210 L125 218 L98 205 Z" fill="#FFFFFF" />
        <path d="M105 165 L105 145" />
        <path d="M115 162 L115 142" />
        <path d="M125 160 L125 140" />
        <path d="M138 165 L142 148" />
      </g>
      {/* Ondas relajantes */}
      <g stroke={SAGE} strokeWidth="0.8" fill="none" opacity="0.6" strokeLinecap="round">
        <path d="M50 110 Q70 100 90 110" />
        <path d="M40 130 Q70 120 100 130" />
      </g>
    </>
  ),

  // 8. Masaje linfático — red de canales con burbujas drenando
  masajeLinfatico: () => (
    <>
      <GradientBg id="bgMl" from="#EAF1F3" to={ROSE_SOFT} />
      <FrameBg gradId="bgMl" />
      {/* Red linfática (canales) */}
      <g stroke={NAVY} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.85">
        <path d="M70 80 Q90 130 110 180 Q130 240 150 290 Q170 340 150 380" />
        <path d="M230 80 Q210 130 190 180 Q170 240 150 290" />
        <path d="M150 290 Q90 320 70 380" />
        <path d="M150 290 Q210 320 230 380" />
        <path d="M110 180 L190 180" strokeDasharray="2 3" />
        <path d="M90 130 L210 130" strokeDasharray="2 3" />
      </g>
      {/* Nodos linfáticos */}
      <g fill={NAVY}>
        <circle cx="70" cy="80" r="4" />
        <circle cx="230" cy="80" r="4" />
        <circle cx="110" cy="180" r="3.5" />
        <circle cx="190" cy="180" r="3.5" />
        <circle cx="150" cy="290" r="5" />
        <circle cx="70" cy="380" r="3.5" />
        <circle cx="230" cy="380" r="3.5" />
      </g>
      {/* Burbujas / gotas flotando */}
      <g fill={SAGE} opacity="0.6">
        <circle cx="100" cy="100" r="5" />
        <circle cx="115" cy="115" r="3" />
        <circle cx="200" cy="120" r="4" />
        <circle cx="135" cy="220" r="4" />
        <circle cx="175" cy="240" r="5" />
        <circle cx="120" cy="320" r="4" />
        <circle cx="185" cy="335" r="3.5" />
      </g>
    </>
  ),

  // 9. Presoterapia — silueta de piernas con bandas
  presoterapia: () => (
    <>
      <GradientBg id="bgPreso" from={ROSE_SOFT} to="#FDF8F5" />
      <FrameBg gradId="bgPreso" />
      {/* Piernas */}
      <g stroke={NAVY} strokeWidth="1.5" strokeLinejoin="round" fill={ROSE} opacity="0.9">
        <path d="M115 70 Q110 110 112 160 Q108 220 105 290 Q104 340 110 380 L135 380 Q140 340 138 290 Q140 220 142 160 Q140 110 138 70 Z" />
        <path d="M162 70 Q160 110 158 160 Q160 220 158 290 Q160 340 165 380 L190 380 Q195 340 192 290 Q195 220 192 160 Q190 110 185 70 Z" />
      </g>
      {/* Bandas de compresión */}
      <g fill={SAGE} opacity="0.85" stroke={NAVY} strokeWidth="1">
        <rect x="100" y="120" width="105" height="14" rx="3" />
        <rect x="100" y="180" width="105" height="14" rx="3" />
        <rect x="100" y="240" width="105" height="14" rx="3" />
        <rect x="100" y="300" width="105" height="14" rx="3" />
        <rect x="100" y="350" width="105" height="14" rx="3" />
      </g>
      {/* Indicadores de presión (flechas hacia adentro) */}
      <g stroke={NAVY} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7">
        <path d="M50 127 L82 127 M75 122 L82 127 L75 132" />
        <path d="M250 127 L218 127 M225 122 L218 127 L225 132" />
        <path d="M50 247 L82 247 M75 242 L82 247 L75 252" />
        <path d="M250 247 L218 247 M225 242 L218 247 L225 252" />
      </g>
    </>
  ),

  // 10. Piedras calientes — pila de piedras con vapor
  piedrasCalientes: () => (
    <>
      <GradientBg id="bgPc" from="#FDF8F5" to={ROSE_SOFT} />
      <FrameBg gradId="bgPc" />
      {/* Vapor */}
      <g stroke={NAVY} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.55">
        <path d="M120 70 Q130 55 125 40 Q115 25 125 10" />
        <path d="M150 80 Q160 65 155 50 Q145 35 155 20" />
        <path d="M180 70 Q190 55 185 40 Q175 25 185 10" />
      </g>
      {/* Piedras (apiladas) */}
      <g stroke={NAVY} strokeWidth="1.5">
        <ellipse cx="150" cy="320" rx="80" ry="20" fill="#3F4A52" />
        <ellipse cx="148" cy="280" rx="68" ry="18" fill="#5C6B73" />
        <ellipse cx="152" cy="245" rx="58" ry="16" fill="#7A8A92" />
        <ellipse cx="148" cy="215" rx="48" ry="14" fill="#9CA9B1" />
        <ellipse cx="150" cy="190" rx="38" ry="12" fill="#B5C0C6" />
        <ellipse cx="150" cy="170" rx="28" ry="10" fill="#CFD7DB" />
      </g>
      {/* Calor (puntos rojizos) */}
      <g fill="#D9534F" opacity="0.45">
        <circle cx="120" cy="320" r="2" />
        <circle cx="180" cy="320" r="2" />
        <circle cx="115" cy="280" r="1.5" />
        <circle cx="185" cy="280" r="1.5" />
        <circle cx="118" cy="245" r="1.5" />
        <circle cx="182" cy="245" r="1.5" />
      </g>
    </>
  ),

  // 11. Lifting de pestañas — ojo cerrado con pestañas elevadas
  liftingPestanas: () => (
    <>
      <GradientBg id="bgLp" from={ROSE} to="#FDF8F5" />
      <FrameBg gradId="bgLp" />
      {/* Ceja superior decorativa */}
      <path
        d="M70 160 Q150 130 230 160"
        fill="none"
        stroke={NAVY}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Ojo cerrado (línea curva) */}
      <path
        d="M60 230 Q150 245 240 230"
        fill="none"
        stroke={NAVY}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Pestañas elevadas / curvadas hacia arriba */}
      <g stroke={NAVY} strokeWidth="1.4" strokeLinecap="round" fill="none">
        <path d="M75 232 Q73 215 68 195" />
        <path d="M90 234 Q90 215 85 192" />
        <path d="M105 235 Q108 215 105 190" />
        <path d="M120 236 Q125 215 125 188" />
        <path d="M135 237 Q142 215 145 188" />
        <path d="M150 237 Q158 215 162 190" />
        <path d="M165 237 Q175 215 180 192" />
        <path d="M180 236 Q192 215 198 195" />
        <path d="M195 235 Q208 215 215 200" />
        <path d="M210 234 Q222 215 230 205" />
        <path d="M225 232 Q235 220 240 215" />
      </g>
      {/* Arco indicando elevación */}
      <path
        d="M50 285 Q150 270 250 285"
        fill="none"
        stroke={SAGE}
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      {/* Flechas de lift */}
      <g stroke={SAGE} strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M150 320 L150 290 M143 297 L150 290 L157 297" />
      </g>
    </>
  ),

  // 12. Laminado de pestañas — ojo abierto con pestañas brillantes
  laminadoPestanas: () => (
    <>
      <GradientBg id="bgLam" from="#FDF8F5" to={ROSE} />
      <FrameBg gradId="bgLam" />
      {/* Ceja */}
      <path
        d="M75 165 Q150 135 225 165"
        fill="none"
        stroke={NAVY}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Forma del ojo (almendra) */}
      <path
        d="M60 230 Q150 195 240 230 Q150 270 60 230 Z"
        fill="#FFFFFF"
        stroke={NAVY}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Iris */}
      <circle cx="150" cy="232" r="20" fill={NAVY} />
      <circle cx="150" cy="232" r="10" fill="#000" />
      <circle cx="156" cy="226" r="3" fill="#FFFFFF" />
      {/* Pestañas (más densas, ordenadas) */}
      <g stroke={NAVY} strokeWidth="1.5" strokeLinecap="round">
        <line x1="70" y1="220" x2="63" y2="205" />
        <line x1="85" y1="212" x2="79" y2="195" />
        <line x1="100" y1="207" x2="96" y2="188" />
        <line x1="115" y1="203" x2="113" y2="183" />
        <line x1="130" y1="201" x2="129" y2="180" />
        <line x1="145" y1="200" x2="145" y2="178" />
        <line x1="160" y1="200" x2="161" y2="178" />
        <line x1="175" y1="201" x2="177" y2="180" />
        <line x1="190" y1="203" x2="193" y2="183" />
        <line x1="205" y1="207" x2="210" y2="188" />
        <line x1="220" y1="212" x2="227" y2="195" />
        <line x1="232" y1="220" x2="240" y2="205" />
      </g>
      {/* Destellos */}
      <g fill={SAGE} opacity="0.85">
        <circle cx="50" cy="200" r="2" />
        <circle cx="250" cy="200" r="2" />
        <path d="M150 290 L153 297 L160 298 L155 303 L156 311 L150 307 L144 311 L145 303 L140 298 L147 297 Z" />
      </g>
    </>
  ),

  // 13. Perfilado de cejas — arco de ceja con pincel
  perfiladoCejas: () => (
    <>
      <GradientBg id="bgPerf" from={ROSE_SOFT} to="#FDF8F5" />
      <FrameBg gradId="bgPerf" />
      {/* Ceja principal grande */}
      <path
        d="M60 220 Q90 180 140 175 Q190 180 230 200 Q250 215 245 230 Q240 245 220 245 Q175 235 130 240 Q90 245 65 250 Q50 245 60 220 Z"
        fill={NAVY}
        stroke={NAVY}
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.92"
      />
      {/* Pelos individuales */}
      <g stroke={NAVY} strokeWidth="1.1" strokeLinecap="round">
        <line x1="80" y1="195" x2="85" y2="178" />
        <line x1="100" y1="187" x2="105" y2="170" />
        <line x1="125" y1="180" x2="128" y2="162" />
        <line x1="150" y1="180" x2="155" y2="162" />
        <line x1="175" y1="185" x2="180" y2="167" />
        <line x1="200" y1="195" x2="208" y2="180" />
        <line x1="218" y1="205" x2="228" y2="195" />
      </g>
      {/* Pincel diagonal */}
      <g transform="translate(155 270) rotate(25)">
        <rect x="0" y="0" width="80" height="6" rx="2" fill={NAVY} />
        <rect x="78" y="-3" width="20" height="12" rx="2" fill="#B5A89C" />
        <path d="M97 -6 L130 -10 L130 14 L97 10 Z" fill="#7A6A5A" />
        <path d="M115 -8 L130 -10 L130 14 L115 12 Z" fill="#3F352A" />
      </g>
      {/* Líneas de medida (eye-level) */}
      <g stroke={SAGE} strokeWidth="0.8" fill="none" strokeDasharray="3 3" opacity="0.7">
        <line x1="50" y1="320" x2="250" y2="320" />
        <line x1="150" y1="290" x2="150" y2="350" />
      </g>
    </>
  ),

  // 14. Depilación definitiva — handpiece con haz láser sobre piel
  depilacionDefinitiva: () => (
    <>
      <GradientBg id="bgDep" from="#FDF8F5" to={ROSE} />
      <FrameBg gradId="bgDep" />
      {/* Piel (curva inferior) */}
      <path
        d="M0 320 Q150 290 300 320 L300 400 L0 400 Z"
        fill={ROSE}
        opacity="0.7"
      />
      <path d="M0 320 Q150 290 300 320" fill="none" stroke={NAVY} strokeWidth="1.5" />
      {/* Vellos antes (lado izq) */}
      <g stroke={NAVY} strokeWidth="1.4" strokeLinecap="round" opacity="0.85">
        <path d="M30 315 Q33 295 30 285" />
        <path d="M55 312 Q58 290 52 278" />
        <path d="M80 310 Q83 285 78 275" />
        <path d="M105 308 Q108 285 104 270" />
      </g>
      {/* Vellos eliminados (lado der) — invisibles, solo cicatriz suave */}
      {/* Handpiece láser apuntando */}
      <g transform="translate(150 80)">
        <rect x="-22" y="0" width="44" height="100" rx="10" fill={NAVY} />
        <rect x="-12" y="10" width="24" height="60" rx="4" fill="#1A4D6D" />
        <rect x="-22" y="80" width="44" height="20" rx="4" fill="#001E33" />
        {/* Botón */}
        <circle cx="0" cy="40" r="4" fill="#D9534F" />
        {/* Haz láser */}
        <path d="M-15 100 L-22 220 L22 220 L15 100 Z" fill="#D9534F" opacity="0.45" />
        <path d="M0 100 L0 220" stroke="#D9534F" strokeWidth="1.5" opacity="0.8" />
      </g>
      {/* Brillo en zona tratada */}
      <g fill="#FFFFFF" opacity="0.6">
        <circle cx="180" cy="315" r="3" />
        <circle cx="220" cy="310" r="2.5" />
        <circle cx="245" cy="313" r="2" />
      </g>
    </>
  ),

  // 15. Eliminación de tatuajes — tatuaje difuminándose con láser
  eliminacionTatuajes: () => (
    <>
      <GradientBg id="bgTat" from={ROSE_SOFT} to="#FDF8F5" />
      <FrameBg gradId="bgTat" />
      {/* Antebrazo silueta */}
      <path
        d="M40 180 Q60 160 100 160 L240 160 Q270 162 270 200 L270 270 Q270 305 240 308 L100 308 Q60 305 40 270 Z"
        fill="#F5DBC5"
        stroke={NAVY}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Tatuaje (lado izq — todavía visible) */}
      <g fill={NAVY} opacity="0.78">
        {/* Estrella simple */}
        <path d="M90 220 L94 232 L106 232 L96 240 L100 252 L90 244 L80 252 L84 240 L74 232 L86 232 Z" />
        {/* Ondas */}
        <path d="M120 225 Q130 215 140 225 T160 225" fill="none" stroke={NAVY} strokeWidth="2" />
        {/* Punto */}
        <circle cx="135" cy="255" r="4" />
        <circle cx="155" cy="265" r="3" />
      </g>
      {/* Tatuaje en proceso (centro — difuminado) */}
      <g fill={NAVY} opacity="0.32">
        <circle cx="180" cy="225" r="4" />
        <circle cx="195" cy="245" r="3" />
        <circle cx="210" cy="240" r="2" />
      </g>
      {/* Lado derecho — limpio (sin tatuaje) */}
      {/* Punto donde el láser está actuando */}
      <g transform="translate(190 235)">
        <circle r="20" fill="#FFFFFF" opacity="0.6" />
        <circle r="10" fill="#FFFFFF" />
      </g>
      {/* Handpiece láser */}
      <g transform="translate(190 95)">
        <rect x="-18" y="0" width="36" height="80" rx="8" fill={NAVY} />
        <rect x="-10" y="6" width="20" height="36" rx="3" fill="#1A4D6D" />
        <circle cx="0" cy="55" r="3" fill="#D9534F" />
        {/* Haz láser */}
        <path d="M-10 80 L-3 140 L3 140 L10 80 Z" fill="#D9534F" opacity="0.5" />
        <line x1="0" y1="80" x2="0" y2="140" stroke="#D9534F" strokeWidth="1.5" />
      </g>
    </>
  ),
};

// Helper: copo de nieve estilizado
function Snowflake({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const half = size / 2;
  const quarter = size / 4;
  return (
    <g transform={`translate(${cx} ${cy})`} fill="none">
      <line x1={-half} y1="0" x2={half} y2="0" />
      <line x1="0" y1={-half} x2="0" y2={half} />
      <line x1={-half * 0.7} y1={-half * 0.7} x2={half * 0.7} y2={half * 0.7} />
      <line x1={-half * 0.7} y1={half * 0.7} x2={half * 0.7} y2={-half * 0.7} />
      {/* Puntas */}
      <path d={`M${half} 0 L${half - quarter} ${-quarter / 2} M${half} 0 L${half - quarter} ${quarter / 2}`} />
      <path d={`M${-half} 0 L${-half + quarter} ${-quarter / 2} M${-half} 0 L${-half + quarter} ${quarter / 2}`} />
      <path d={`M0 ${half} L${-quarter / 2} ${half - quarter} M0 ${half} L${quarter / 2} ${half - quarter}`} />
      <path d={`M0 ${-half} L${-quarter / 2} ${-half + quarter} M0 ${-half} L${quarter / 2} ${-half + quarter}`} />
    </g>
  );
}
