/**
 * Fondo cinemático para el hero del home.
 *
 * Si existe /hero-loop.mp4 en /public, lo renderiza como video en autoplay
 * loop mute (compatible con todos los browsers modernos). Si el video falla
 * o tarda en cargar, se muestra el fallback animado en SVG/CSS: orbes de
 * gradiente flotando con parallax + partículas en órbita + capas de blur
 * que simulan profundidad.
 *
 * El fallback es lo bastante bonito como para que el sitio se vea bien
 * sin video; el video sólo es un "premium upgrade" opcional.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type Props = {
  /** Path al video. Por defecto /hero-loop.mp4 (poné el archivo en /public). */
  videoSrc?: string;
  /** Path al póster del video. Por defecto /hero-poster.jpg. */
  posterSrc?: string;
};

export function HeroCinematicBg({
  videoSrc = '/hero-loop.mp4',
  posterSrc = '/hero-poster.jpg',
}: Props) {
  const [videoOk, setVideoOk] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    // Si el browser tiene "prefers-reduced-motion", no intentamos cargar el video.
    if (reduce) return;
    const v = videoRef.current;
    if (!v) return;

    const onCanPlay = () => setVideoOk(true);
    const onError = () => setVideoOk(false);
    v.addEventListener('canplaythrough', onCanPlay);
    v.addEventListener('error', onError);
    // Disparar la carga
    v.load();
    return () => {
      v.removeEventListener('canplaythrough', onCanPlay);
      v.removeEventListener('error', onError);
    };
  }, [reduce]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Capa 1 — Video (sólo se muestra si carga OK). */}
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
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            videoOk ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ filter: 'saturate(0.8) brightness(1.02)' }}
        />
      ) : null}

      {/* Capa 2 — Veladura cinematográfica encima del video para tinte cálido. */}
      {videoOk ? (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(253,248,245,0.65) 0%, rgba(253,248,245,0.35) 40%, rgba(253,248,245,0.55) 75%, rgba(253,248,245,0.9) 100%)',
          }}
        />
      ) : null}

      {/* Capa 3 — Fallback SIEMPRE renderizado debajo, con menor opacidad si hay video. */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ opacity: videoOk ? 0.35 : 1 }}
      >
        <CinematicFallback reduceMotion={!!reduce} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback: orbes de gradiente + partículas + curvas orgánicas en movimiento
// ─────────────────────────────────────────────────────────────────────────────

function CinematicFallback({ reduceMotion }: { reduceMotion: boolean }) {
  // Partículas estáticas distribuidas: en runtime se animan con framer
  const particles = Array.from({ length: 14 }).map((_, i) => ({
    id: i,
    x: 5 + ((i * 37) % 90),
    y: 8 + ((i * 53) % 84),
    size: 2 + ((i * 7) % 5),
    delay: (i * 0.4) % 3,
    duration: 6 + (i % 5),
  }));

  return (
    <div className="absolute inset-0">
      {/* Orbes de gradiente (profundidad) */}
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { x: [0, 30, -10, 0], y: [0, -25, 15, 0], scale: [1, 1.08, 0.96, 1] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-40 top-[5%] h-[640px] w-[640px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(242,215,213,0.55), rgba(242,215,213,0))' }}
      />
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { x: [0, -35, 15, 0], y: [0, 25, -10, 0], scale: [1, 1.05, 0.98, 1] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-36 top-[14%] h-[520px] w-[520px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(191,201,162,0.42), rgba(191,201,162,0))' }}
      />
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { x: [0, 20, -25, 0], y: [0, -15, 10, 0], scale: [1, 1.06, 0.97, 1] }
        }
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[6%] left-[20%] h-[460px] w-[460px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(253,230,200,0.40), rgba(253,230,200,0))' }}
      />
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { x: [0, -25, 18, 0], y: [0, 22, -16, 0] }
        }
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-[55%] top-[55%] h-[320px] w-[320px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(0,61,91,0.18), rgba(0,61,91,0))' }}
      />

      {/* Curvas orgánicas en SVG con dash en movimiento — efecto "tejido" */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="curveGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#BFC9A2" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#F2D7D5" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0 400 Q360 280 720 360 T1440 320"
          stroke="url(#curveGradient)"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={reduceMotion ? undefined : { pathLength: [0, 1, 1, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M0 540 Q360 620 720 520 T1440 580"
          stroke="url(#curveGradient)"
          strokeWidth="1.2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={reduceMotion ? undefined : { pathLength: [0, 1, 1, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.path
          d="M0 720 Q360 660 720 720 T1440 700"
          stroke="url(#curveGradient)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={reduceMotion ? undefined : { pathLength: [0, 1, 1, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
      </svg>

      {/* Partículas flotando */}
      {!reduceMotion
        ? particles.map((p) => (
            <motion.div
              key={p.id}
              animate={{
                y: [0, -14, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: p.delay,
              }}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: 'radial-gradient(circle, rgba(255,255,255,0.85), rgba(255,255,255,0))',
              }}
            />
          ))
        : null}
    </div>
  );
}
