import { motion } from 'framer-motion';

type Props = {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  delay?: number;
};

/** Anillo de progreso minimalista (gradiente champagne→navy→rose). */
export function ChampagneRing({ value, size = 100, strokeWidth = 6, label, delay = 0.3 }: Props) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth - 2}
          className="stroke-champagne-light"
        />
        <defs>
          <linearGradient id={`champagne-ring-${size}-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-sage)" />
            <stop offset="50%" stopColor="var(--primary-navy)" />
            <stop offset="100%" stopColor="var(--accent-rose)" />
          </linearGradient>
          <filter id={`ring-glow-${size}`}>
            <feGaussianBlur stdDeviation="2" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke={`url(#champagne-ring-${size}-${value})`}
          style={{ strokeDasharray: c }}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94], delay }}
          filter={`url(#ring-glow-${size})`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-serif-premium text-xl font-bold"
          style={{ color: 'var(--primary-navy)' }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.5, duration: 0.4, type: 'spring' }}
        >
          {value}%
        </motion.span>
        {label ? (
          <motion.span
            className="text-[9px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.7 }}
          >
            {label}
          </motion.span>
        ) : null}
      </div>
    </div>
  );
}
