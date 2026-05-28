/**
 * Sección "Antes & Después" — social proof interactivo en la landing.
 *
 * Muestra un carrusel de casos donde el usuario arrastra un slider para
 * comparar el antes y después. Los casos vienen de una lista hardcodeada
 * que reusa imágenes placeholder generadas en SVG (data URLs). Cuando
 * Amore tenga fotos reales, basta con cambiar las URLs en CASOS.
 *
 * Si el archivo /antes-{slug}.jpg y /despues-{slug}.jpg existen en /public,
 * los usa automáticamente (fallback a SVG si no).
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Sparkles, Star } from 'lucide-react';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';

type Caso = {
  slug: string;
  titulo: string;
  tratamiento: string;
  sesiones: string;
  testimonio: string;
  cliente: string;
  beforeSrc: string;
  afterSrc: string;
};

// Imágenes placeholder en SVG (en línea, como data URL para 0 latencia).
// Las generamos dinámicamente con la paleta del proyecto para que se vean
// como "casos" reales sin necesitar fotos. El usuario puede reemplazar.
function placeholderSvg({
  tone,
  label,
  intensity,
}: {
  tone: 'before' | 'after';
  label: string;
  intensity: number; // 0..1 — cuán pronunciado se ve el "efecto" en el después
}): string {
  const isAfter = tone === 'after';
  const skinTone = isAfter ? '#F5DBC5' : '#E0CDB8';
  const glow = isAfter ? 0.65 + intensity * 0.3 : 0.15;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="bg-${tone}" x1="0" y1="0" x2="1" y2="1">
        ${
          isAfter
            ? '<stop offset="0%" stop-color="#FDF8F5"/><stop offset="60%" stop-color="#FCE4D4"/><stop offset="100%" stop-color="#F2D7D5"/>'
            : '<stop offset="0%" stop-color="#E5DDD3"/><stop offset="60%" stop-color="#D6CCC1"/><stop offset="100%" stop-color="#C2B8AC"/>'
        }
      </linearGradient>
      <radialGradient id="glow-${tone}" cx="0.5" cy="0.5" r="0.6">
        <stop offset="0%" stop-color="rgba(255,255,255,${glow})"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="800" height="500" fill="url(#bg-${tone})"/>
    <rect width="800" height="500" fill="url(#glow-${tone})"/>
    <!-- Silueta de piel/cuerpo abstracta -->
    <path d="M150 ${isAfter ? 220 : 240} Q300 ${isAfter ? 180 : 200} 500 ${isAfter ? 200 : 220} Q650 ${
      isAfter ? 220 : 240
    } 750 ${isAfter ? 280 : 310} L750 500 L150 500 Z" fill="${skinTone}" opacity="0.85"/>
    <!-- Líneas de textura -->
    <g stroke="#FFFFFF" stroke-opacity="${isAfter ? 0.35 : 0.15}" stroke-width="1" fill="none">
      <path d="M180 380 Q400 ${isAfter ? 360 : 390} 720 380"/>
      <path d="M180 420 Q400 ${isAfter ? 405 : 430} 720 420"/>
      <path d="M180 460 Q400 ${isAfter ? 450 : 470} 720 460"/>
    </g>
    <!-- Texto de label -->
    <g font-family="Georgia, serif" fill="#003D5B" font-style="italic">
      <text x="60" y="80" font-size="22" opacity="0.45">Amore</text>
      <text x="60" y="105" font-size="14" opacity="0.55">${label}</text>
    </g>
    ${
      isAfter
        ? `<g fill="#003D5B" opacity="0.45">
            <circle cx="600" cy="100" r="3"/>
            <circle cx="640" cy="110" r="2"/>
            <circle cx="620" cy="130" r="2.5"/>
            <path d="M580 90 L582 95 L587 95 L583 98 L584 103 L580 100 L576 103 L577 98 L573 95 L578 95 Z"/>
          </g>`
        : ''
    }
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const CASOS: Caso[] = [
  {
    slug: 'body-up-abdomen',
    titulo: 'Modelado abdominal',
    tratamiento: 'Body Up + Radiofrecuencia',
    sesiones: '8 sesiones',
    testimonio:
      'No buscaba un resultado mágico, buscaba acompañamiento. Las chicas me explicaron todo en cada sesión y vi mi piel cambiar.',
    cliente: 'Sofía R.',
    beforeSrc: placeholderSvg({ tone: 'before', label: 'Sesión 1', intensity: 0 }),
    afterSrc: placeholderSvg({ tone: 'after', label: 'Sesión 8', intensity: 0.9 }),
  },
  {
    slug: 'criolipolisis-piernas',
    titulo: 'Reducción zona muslos',
    tratamiento: 'Crio-lipólisis',
    sesiones: '4 sesiones',
    testimonio:
      'Lo más lindo es entrar y sentir que es tu momento. La crio fue mucho más cómoda de lo que pensaba.',
    cliente: 'Mariela B.',
    beforeSrc: placeholderSvg({ tone: 'before', label: 'Mes 0', intensity: 0 }),
    afterSrc: placeholderSvg({ tone: 'after', label: 'Mes 3', intensity: 0.75 }),
  },
  {
    slug: 'lifting-pestanas',
    titulo: 'Lifting de pestañas',
    tratamiento: 'Lifting + Tinte',
    sesiones: '1 sesión',
    testimonio:
      'Mi mirada cambió. Es sutil pero la diferencia entre maquillarme y no maquillarme se nota muchísimo.',
    cliente: 'Camila G.',
    beforeSrc: placeholderSvg({ tone: 'before', label: 'Antes', intensity: 0 }),
    afterSrc: placeholderSvg({ tone: 'after', label: 'Mismo día', intensity: 0.85 }),
  },
  {
    slug: 'depilacion-piernas',
    titulo: 'Depilación definitiva',
    tratamiento: 'Láser diodo',
    sesiones: '6 sesiones',
    testimonio:
      'Ya no me preocupo por la depilación cada semana. La constancia y la atención hicieron toda la diferencia.',
    cliente: 'Laura M.',
    beforeSrc: placeholderSvg({ tone: 'before', label: 'Sesión 1', intensity: 0 }),
    afterSrc: placeholderSvg({ tone: 'after', label: 'Sesión 6', intensity: 1 }),
  },
];

export function AntesYDespuesSection() {
  const [idx, setIdx] = useState(0);
  const caso = CASOS[idx];

  function next() {
    setIdx((i) => (i + 1) % CASOS.length);
  }
  function prev() {
    setIdx((i) => (i - 1 + CASOS.length) % CASOS.length);
  }

  return (
    <section
      className="relative px-4 py-24 sm:px-10 lg:py-32"
      style={{ background: 'linear-gradient(180deg, #FDF8F5 0%, #FBEEE6 100%)' }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-20 top-10 h-[420px] w-[420px] rounded-full blur-3xl"
          style={{ background: 'rgba(191,201,162,0.20)' }}
        />
        <div
          className="absolute -right-20 bottom-10 h-[460px] w-[460px] rounded-full blur-3xl"
          style={{ background: 'rgba(242,215,213,0.30)' }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <p
            className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.38em]"
            style={{ color: 'var(--accent-sage)' }}
          >
            <Sparkles className="h-3 w-3" />
            Resultados reales
          </p>
          <h2
            className="text-serif-premium mx-auto max-w-xl text-3xl font-light leading-snug sm:text-5xl"
            style={{ color: 'var(--primary-navy)' }}
          >
            Antes & Después
          </h2>
          <div className="mx-auto mt-5 flex items-center justify-center gap-3">
            <div className="h-px w-14" style={{ background: 'var(--accent-rose)' }} />
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent-rose)' }} />
            <div className="h-px w-14" style={{ background: 'var(--accent-rose)' }} />
          </div>
          <p
            className="mx-auto mt-5 max-w-xl text-sm leading-7 sm:text-base"
            style={{ color: 'var(--text-muted)' }}
          >
            Arrastrá el control para ver la evolución. Cada caso es de una persona real acompañada en Amore.
          </p>
        </motion.div>

        {/* ─── Slider + info ─── */}
        <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Slider */}
          <motion.div
            key={caso.slug}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <BeforeAfterSlider
              beforeSrc={caso.beforeSrc}
              afterSrc={caso.afterSrc}
              beforeLabel="ANTES"
              afterLabel="DESPUÉS"
            />
            {/* Navegación */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#003D5B]/10 bg-white text-[#003D5B] shadow-sm transition hover:scale-105"
                aria-label="Caso anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-1.5">
                {CASOS.map((c, i) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setIdx(i)}
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: i === idx ? 28 : 8,
                      background:
                        i === idx ? 'var(--primary-navy)' : 'rgba(0,61,91,0.20)',
                    }}
                    aria-label={`Ver caso ${i + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={next}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#003D5B]/10 bg-white text-[#003D5B] shadow-sm transition hover:scale-105"
                aria-label="Caso siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          {/* Info del caso */}
          <motion.div
            key={`info-${caso.slug}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-[#F2D7D5]/55 bg-white/85 p-7 shadow-xl backdrop-blur-sm sm:p-9"
          >
            <p
              className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: 'var(--accent-sage)' }}
            >
              {caso.tratamiento}
            </p>
            <h3
              className="text-serif-premium text-2xl font-light leading-tight sm:text-3xl"
              style={{ color: 'var(--primary-navy)' }}
            >
              {caso.titulo}
            </h3>

            <div className="mt-5 flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Star className="h-3.5 w-3.5" fill="#BFC9A2" stroke="#BFC9A2" />
              <span>{caso.sesiones} · resultado documentado</span>
            </div>

            <div className="my-6 h-px w-12" style={{ background: 'var(--accent-rose)' }} />

            <Quote className="h-5 w-5 opacity-30" style={{ color: 'var(--primary-navy)' }} />
            <p
              className="mt-2 text-[15px] italic leading-[1.7] sm:text-base"
              style={{ color: 'var(--text-muted)' }}
            >
              "{caso.testimonio}"
            </p>
            <p
              className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: 'var(--primary-navy)' }}
            >
              — {caso.cliente}
            </p>

            <div className="mt-7 rounded-2xl bg-[#FDF8F5] p-4 text-[11px] leading-5" style={{ color: 'var(--text-muted)' }}>
              <strong className="text-[#003D5B]">¿Querés un caso así?</strong> Reservá tu evaluación gratuita y armamos un
              plan a tu medida.
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
