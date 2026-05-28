import { motion } from 'framer-motion';
import VirtualAssistantChat from '@/components/VirtualAssistantChat';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { LandingHeader } from './LandingHeader';
import { ServiciosSection } from './ServiciosSection';
import { ConversionSection } from './ConversionSection';
import { LandingFooter } from './LandingFooter';

type Props = {
  onEnter: () => void;
  onRegister: () => void;
};

export function LandingPage({ onEnter, onRegister }: Props) {
  return (
    <div className="overflow-hidden text-[#003D5B]" style={{ background: 'var(--bg-cream)' }}>
      <LandingHeader onEnter={onEnter} />

      <section
        className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ paddingTop: '5rem', paddingBottom: '4rem' }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -left-40 top-[5%] h-[560px] w-[560px] rounded-full blur-3xl"
            style={{ background: 'rgba(242,215,213,0.45)' }}
          />
          <div
            className="absolute -right-32 top-[18%] h-[440px] w-[440px] rounded-full blur-3xl"
            style={{ background: 'rgba(191,201,162,0.32)' }}
          />
          <div
            className="absolute bottom-[8%] left-[25%] h-[380px] w-[380px] rounded-full blur-3xl"
            style={{ background: 'rgba(242,215,213,0.28)' }}
          />
          <div
            className="absolute left-[55%] top-[55%] h-[260px] w-[260px] rounded-full blur-3xl"
            style={{ background: 'rgba(253,230,200,0.22)' }}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: 0.18 }}>
          <svg className="absolute left-[2%] top-[20%]" width="160" height="260" viewBox="0 0 160 260" fill="none">
            <path
              d="M80 250 Q70 180 60 140 Q40 90 10 60"
              stroke="#BFC9A2"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M60 140 Q30 130 10 110" stroke="#BFC9A2" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M70 175 Q45 165 28 148" stroke="#BFC9A2" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <ellipse cx="10" cy="60" rx="14" ry="22" transform="rotate(-30 10 60)" fill="#BFC9A2" />
            <ellipse cx="10" cy="110" rx="12" ry="18" transform="rotate(-45 10 110)" fill="#BFC9A2" />
            <ellipse cx="28" cy="148" rx="10" ry="16" transform="rotate(-20 28 148)" fill="#BFC9A2" />
          </svg>
          <svg
            className="absolute right-[2%] top-[20%]"
            width="160"
            height="260"
            viewBox="0 0 160 260"
            fill="none"
            style={{ transform: 'scaleX(-1)' }}
          >
            <path
              d="M80 250 Q70 180 60 140 Q40 90 10 60"
              stroke="#F2D7D5"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M60 140 Q30 130 10 110" stroke="#F2D7D5" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M70 175 Q45 165 28 148" stroke="#F2D7D5" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <ellipse cx="10" cy="60" rx="14" ry="22" transform="rotate(-30 10 60)" fill="#F2D7D5" />
            <ellipse cx="10" cy="110" rx="12" ry="18" transform="rotate(-45 10 110)" fill="#F2D7D5" />
            <ellipse cx="28" cy="148" rx="10" ry="16" transform="rotate(-20 28 148)" fill="#F2D7D5" />
          </svg>
          <svg
            className="absolute left-1/2 top-[12%] -translate-x-1/2"
            width="80"
            height="40"
            viewBox="0 0 80 40"
            fill="none"
          >
            <ellipse cx="20" cy="20" rx="16" ry="8" transform="rotate(-20 20 20)" fill="#F2D7D5" />
            <ellipse cx="60" cy="20" rx="14" ry="7" transform="rotate(20 60 20)" fill="#BFC9A2" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: '2.8rem' }}
        >
          <div
            style={{
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              padding: '14px',
              background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #fdf8f5 50%, #f5e6da 100%)',
              boxShadow:
                '0 0 60px rgba(255,255,255,0.8), 0 0 100px rgba(252,228,212,0.5), 0 0 180px rgba(242,215,213,0.25)',
              filter: 'contrast(1.1) brightness(1.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src="/logo-amore-v2.png"
              alt="AMORE Centro Di Bellezza"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                border: 'none',
                boxShadow: 'none',
                background: 'transparent',
              }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8 flex items-center justify-center gap-3"
        >
          <div className="h-px w-20" style={{ background: 'var(--accent-rose)' }} />
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent-rose)' }} />
          <div className="h-px w-20" style={{ background: 'var(--accent-rose)' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl"
        >
          <h1
            className="text-serif-premium font-light leading-tight sm:text-6xl lg:text-7xl"
            style={{ color: 'var(--primary-navy)', fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', letterSpacing: '0.04em' }}
          >
            Tu bienestar,
            <br />
            <em
              className="font-normal not-italic"
              style={{ color: 'rgba(0,61,91,0.60)', letterSpacing: '0.06em' }}
            >
              nuestro arte.
            </em>
          </h1>
          <p
            className="mx-auto mt-6 max-w-lg text-base leading-8 sm:text-lg"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.02em' }}
          >
            Cada tratamiento en Amore está diseñado para acompañarte con calma, profesionalismo y resultados visibles.
            Tu piel, en las mejores manos.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <motion.button
            onClick={onEnter}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-full px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.26em] text-white transition-all"
            style={{ background: 'var(--primary-navy)', boxShadow: '0 10px 30px rgba(0,61,91,0.18)' }}
          >
            Ver mi progreso
          </motion.button>
          <motion.button
            onClick={onRegister}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-full px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.26em] transition-all"
            style={{
              background: 'var(--accent-rose)',
              color: 'var(--primary-navy)',
              boxShadow: '0 10px 30px rgba(242,215,213,0.50)',
            }}
          >
            Crear mi perfil
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <span
            className="text-[9px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: 'var(--text-muted)' }}
          >
            Descubrí más
          </span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="h-4 w-px rounded-full"
            style={{ background: 'var(--accent-rose)' }}
          />
        </motion.div>
      </section>

      <ServiciosSection />

      <ConversionSection onRegister={onRegister} />
      <LandingFooter />
      <VirtualAssistantChat whatsappHref={buildWhatsAppHref} />
      <WhatsAppFloatingButton />
    </div>
  );
}
