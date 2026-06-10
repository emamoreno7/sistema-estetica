import { motion } from 'framer-motion';

const buttonClassName = [
  'rounded-full',
  'px-5',
  'py-2.5',
  'text-[10px]',
  'font-semibold',
  'uppercase',
  'tracking-[0.22em]',
  'text-white',
  'transition-all',
].join(' ');

export function LandingHeader({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-6 py-4 sm:px-10"
    >
      <img
        src="/logo-generic.svg"
        alt="Tu Estética"
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          objectFit: 'cover',
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
          display: 'block',
        }}
      />

      <motion.button
        onClick={onEnter}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
        className={buttonClassName}
        style={{
          background: 'var(--primary-navy)',
          boxShadow: '0 8px 24px rgba(0,61,91,0.18)',
        }}
      >
        Mi Cuenta
      </motion.button>
    </motion.header>
  );
}
