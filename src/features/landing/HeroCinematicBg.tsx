/**
 * Fondo cinemático "estilo Apple keynote" para el hero del home.
 *
 * Capas (de abajo hacia arriba):
 *   1. Aurora mesh gradient en CSS conic + radial con animación continua.
 *   2. Spotlight de luz cálida que sigue el cursor (Apple-style).
 *   3. Capas con mix-blend-mode para profundidad y "drama".
 *   4. Líneas decorativas SVG con dash animado.
 *   5. Partículas con trayectorias diversas (no todas iguales).
 *   6. Película de grano sutil arriba de todo.
 *
 * Si existe /hero-loop.mp4 en /public lo renderiza encima de las capas con
 * blend overlay para mezclar mejor (más cinemático que dejarlo en bruto).
 * Si no, el fallback animado por sí solo ya tiene fuerza visual.
 *
 * Respeta prefers-reduced-motion: si está activo, queda todo estático.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { asset } from '@/lib/asset';

type Props = {
  videoSrc?: string;
  posterSrc?: string;
};

export function HeroCinematicBg({
  videoSrc = asset('hero-loop.mp4'),
  posterSrc = asset('hero-poster.jpg'),
}: Props) {
  const [videoOk, setVideoOk] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reduce = useReducedMotion();

  // Cursor tracking para el spotlight (con spring suave estilo Apple)
  const cursorX = useMotionValue(50);
  const cursorY = useMotionValue(30);
  const smoothX = useSpring(cursorX, { stiffness: 50, damping: 25 });
  const smoothY = useSpring(cursorY, { stiffness: 50, damping: 25 });

  useEffect(() => {
    if (reduce) return;
    const handle = (e: MouseEvent) => {
      cursorX.set((e.clientX / window.innerWidth) * 100);
      cursorY.set((e.clientY / window.innerHeight) * 100);
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, [cursorX, cursorY, reduce]);

  useEffect(() => {
    if (reduce) return;
    const v = videoRef.current;
    if (!v) return;
    const onCanPlay = () => setVideoOk(true);
    const onError = () => setVideoOk(false);
    v.addEventListener('canplaythrough', onCanPlay);
    v.addEventListener('error', onError);
    v.load();
    return () => {
      v.removeEventListener('canplaythrough', onCanPlay);
      v.removeEventListener('error', onError);
    };
  }, [reduce]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* ─── Capa 0: base cream con leve degradado ─── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #FDF8F5 0%, #F8ECE3 40%, #FDF8F5 100%)',
        }}
      />

      {/* ─── Capa 1: Aurora mesh — 4 radial gradients en movimiento ─── */}
      <Aurora reduceMotion={!!reduce} />

      {/* ─── Capa 2: Spotlight que sigue el cursor ─── */}
      {!reduce ? <SpotlightCursor smoothX={smoothX} smoothY={smoothY} /> : null}

      {/* ─── Capa 3: Halos con blur grandes — el "dream look" ─── */}
      <Halos reduceMotion={!!reduce} />

      {/* ─── Capa 4: Líneas decorativas SVG ─── */}
      <DecorativeLines reduceMotion={!!reduce} />

      {/* ─── Capa 5: Partículas variadas ─── */}
      <Particles reduceMotion={!!reduce} />

      {/* ─── Capa 6: Video opcional (encima de fallback, debajo del grano) ─── */}
      {!reduce ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${
            videoOk ? 'opacity-60' : 'opacity-0'
          }`}
          style={{ mixBlendMode: 'soft-light' }}
        />
      ) : null}

      {/* ─── Capa 7: Grano de película sutil ─── */}
      <FilmGrain />

      {/* ─── Capa 8: Veladura inferior para legibilidad del botón "Descubrí más" ─── */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-32"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(253,248,245,0.5) 100%)',
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Aurora mesh — 4 radials enormes que se mueven en bucles desfasados
// ─────────────────────────────────────────────────────────────────────────────

function Aurora({ reduceMotion }: { reduceMotion: boolean }) {
  const blobs = [
    {
      color: 'rgba(242,180,200,0.55)', // rose pop
      anim: { x: ['-10%', '30%', '-15%', '-10%'], y: ['-15%', '20%', '40%', '-15%'] },
      duration: 24,
      blendMode: 'multiply' as const,
      size: 900,
    },
    {
      color: 'rgba(191,201,162,0.55)', // sage
      anim: { x: ['100%', '60%', '110%', '100%'], y: ['10%', '50%', '20%', '10%'] },
      duration: 28,
      blendMode: 'multiply' as const,
      size: 850,
    },
    {
      color: 'rgba(255,210,150,0.50)', // warm peach
      anim: { x: ['40%', '70%', '20%', '40%'], y: ['80%', '40%', '90%', '80%'] },
      duration: 32,
      blendMode: 'screen' as const,
      size: 800,
    },
    {
      color: 'rgba(0,61,91,0.30)', // navy deep
      anim: { x: ['-20%', '20%', '-5%', '-20%'], y: ['60%', '90%', '50%', '60%'] },
      duration: 36,
      blendMode: 'multiply' as const,
      size: 950,
    },
  ];

  return (
    <div className="absolute inset-0">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className="absolute rounded-full blur-3xl"
          style={{
            width: b.size,
            height: b.size,
            left: 0,
            top: 0,
            background: `radial-gradient(circle, ${b.color}, transparent 70%)`,
            mixBlendMode: b.blendMode,
          }}
          animate={reduceMotion ? undefined : b.anim}
          transition={{ duration: b.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Spotlight cursor — círculo de luz cálida que sigue al puntero con delay
// ─────────────────────────────────────────────────────────────────────────────

function SpotlightCursor({
  smoothX,
  smoothY,
}: {
  smoothX: ReturnType<typeof useSpring>;
  smoothY: ReturnType<typeof useSpring>;
}) {
  // Usamos CSS variables vía motion para que el browser repinte el gradient
  // sin necesidad de re-render React.
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0"
      style={
        {
          background:
            'radial-gradient(circle 500px at calc(var(--sx) * 1%) calc(var(--sy) * 1%), rgba(255,235,205,0.45), transparent 65%)',
          mixBlendMode: 'soft-light',
          '--sx': smoothX,
          '--sy': smoothY,
        } as React.CSSProperties
      }
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Halos — capas con blur enorme para "dream look"
// ─────────────────────────────────────────────────────────────────────────────

function Halos({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="absolute inset-0">
      <motion.div
        className="absolute left-[10%] top-[8%] h-[420px] w-[420px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.85), transparent 65%)',
          filter: 'blur(50px)',
        }}
        animate={reduceMotion ? undefined : { scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[8%] top-[60%] h-[480px] w-[480px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,240,220,0.7), transparent 65%)',
          filter: 'blur(60px)',
        }}
        animate={reduceMotion ? undefined : { scale: [1, 1.18, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Líneas decorativas — paths con dash animado
// ─────────────────────────────────────────────────────────────────────────────

function DecorativeLines({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lineGrad1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#003D5B" stopOpacity="0" />
          <stop offset="50%" stopColor="#003D5B" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#003D5B" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#BFC9A2" stopOpacity="0" />
          <stop offset="50%" stopColor="#BFC9A2" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#BFC9A2" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M-50 380 Q300 250 720 320 T1500 280"
        stroke="url(#lineGrad1)"
        strokeWidth="1.5"
        fill="none"
        initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
        animate={reduceMotion ? undefined : { pathLength: [0, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.path
        d="M-50 540 Q300 660 720 540 T1500 620"
        stroke="url(#lineGrad2)"
        strokeWidth="1.2"
        fill="none"
        initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
        animate={reduceMotion ? undefined : { pathLength: [0, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      <motion.path
        d="M-50 750 Q300 680 720 740 T1500 720"
        stroke="url(#lineGrad1)"
        strokeWidth="1"
        fill="none"
        initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
        animate={reduceMotion ? undefined : { pathLength: [0, 1], opacity: [0, 0.7, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Partículas con trayectorias variadas
// ─────────────────────────────────────────────────────────────────────────────

function Particles({ reduceMotion }: { reduceMotion: boolean }) {
  if (reduceMotion) return null;
  const particles = Array.from({ length: 22 }).map((_, i) => {
    const seed = i * 73;
    const x = (seed * 13) % 100;
    const y = (seed * 17) % 100;
    const size = 1.5 + ((seed * 7) % 5);
    const driftX = ((seed * 11) % 60) - 30;
    const driftY = -30 - ((seed * 5) % 50);
    const duration = 9 + (seed % 12);
    const delay = (seed % 50) / 10;
    const color =
      i % 3 === 0
        ? 'rgba(255,235,200,0.95)'
        : i % 3 === 1
          ? 'rgba(255,255,255,0.8)'
          : 'rgba(242,215,213,0.85)';
    return { id: i, x, y, size, driftX, driftY, duration, delay, color };
  });

  return (
    <div className="absolute inset-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
          }}
          animate={{
            x: [0, p.driftX, 0],
            y: [0, p.driftY, 0],
            opacity: [0, 0.9, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Film grain — SVG con noise turbulence para textura sutil
// ─────────────────────────────────────────────────────────────────────────────

function FilmGrain() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      style={{ mixBlendMode: 'overlay', opacity: 0.22, pointerEvents: 'none' }}
    >
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}
