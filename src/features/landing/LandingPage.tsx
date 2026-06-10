import { motion } from 'framer-motion';
import VirtualAssistantChat from '@/components/VirtualAssistantChat';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { brand } from '../../config/brand';
import { LandingHeader } from './LandingHeader';
import { ServiciosSection } from './ServiciosSection';
import { ConversionSection } from './ConversionSection';
import { LandingFooter } from './LandingFooter';
import { HeroCinematicBg } from './HeroCinematicBg';
import { AntesYDespuesSection } from './AntesYDespuesSection';

type Props = {
  onEnter: () => void;
  onRegister: () => void;
};

const rootClassName = 'overflow-hidden text-[#003D5B]';

const heroSectionClassName =
  'relative flex min-h-screen flex-col items-center justify-center px-6 text-center';

const heroLogoWrapClassName = 'relative z-10 mb-7 sm:mb-10';

const dividerClassName =
  'relative z-10 mb-6 flex items-center justify-center gap-3';

const contentWrapClassName = 'relative z-10 mx-auto max-w-2xl';

const primaryButtonClassName = [
  'rounded-full',
  'px-7',
  'py-3',
  'text-[11px]',
  'font-semibold',
  'uppercase',
  'tracking-[0.26em]',
  'text-white',
  'transition-all',
  'sm:px-8',
  'sm:py-3.5',
].join(' ');

const secondaryButtonClassName = [
  'rounded-full',
  'px-7',
  'py-3',
  'text-[11px]',
  'font-semibold',
  'uppercase',
  'tracking-[0.26em]',
  'transition-all',
  'sm:px-8',
  'sm:py-3.5',
].join(' ');

const ctaWrapClassName =
  'relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4';

const bottomHintClassName =
  'absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2';

export function LandingPage({ onEnter, onRegister }: Props) {
  return (
    <div
      className={rootClassName}
      style={{ background: 'var(--bg-cream)' }}
    >
      <LandingHeader onEnter={onEnter} />

      <section
        className={heroSectionClassName}
        style={{
          paddingTop: '6rem',
          paddingBottom: '5rem',
          isolation: 'isolate',
        }}
      >
        <HeroCinematicBg />

        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className={heroLogoWrapClassName}
        >
          <div
            className="hero-logo-ring"
            style={{
              borderRadius: '50%',
              padding: '12px',
              background:
                'radial-gradient(circle at 30% 30%, #ffffff 0%, #fdf8f5 55%, #f5e6da 100%)',
              boxShadow:
                '0 0 35px rgba(255,255,255,0.55), 0 0 70px rgba(252,228,212,0.30), 0 0 120px rgba(242,215,213,0.18)',
              filter: 'contrast(1.08) brightness(1.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src="/logo-generic.svg"
              alt={brand.businessName}
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
          className={dividerClassName}
        >
          <div
            className="h-px w-16 sm:w-20"
            style={{ background: 'var(--accent-rose)' }}
          />
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--accent-rose)' }}
          />
          <div
            className="h-px w-16 sm:w-20"
            style={{ background: 'var(--accent-rose)' }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={contentWrapClassName}
        >
          <h1
            className="text-serif-premium font-light leading-tight"
            style={{
              color: 'var(--primary-navy)',
              fontSize: 'clamp(2rem, 5.4vw, 4rem)',
              letterSpacing: '0.03em',
            }}
          >
            Tu bienestar,
            <br />
            <em
              className="font-normal not-italic"
              style={{
                color: 'rgba(0,61,91,0.60)',
                letterSpacing: '0.05em',
              }}
            >
              nuestro arte.
            </em>
          </h1>

          <p
            className="mx-auto mt-5 max-w-lg text-sm leading-7 sm:text-base sm:leading-8"
            style={{
              color: 'var(--text-muted)',
              letterSpacing: '0.02em',
            }}
          >
            Cada tratamiento en {brand.shortName} está diseñado para
            acompañarte con calma, profesionalismo y resultados visibles.
            Tu piel, en las mejores manos.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className={ctaWrapClassName}
        >
          <motion.button
            onClick={onEnter}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={primaryButtonClassName}
            style={{
              background: 'var(--primary-navy)',
              boxShadow: '0 10px 30px rgba(0,61,91,0.18)',
            }}
          >
            Ver mi progreso
          </motion.button>

          <motion.button
            onClick={onRegister}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={secondaryButtonClassName}
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
          className={bottomHintClassName}
        >
          <span
            className="text-[9px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: 'var(--text-muted)' }}
          >
            Descubrí más
          </span>

          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="h-4 w-px rounded-full"
            style={{ background: 'var(--accent-rose)' }}
          />
        </motion.div>
      </section>

      <ServiciosSection />
      <AntesYDespuesSection />
      <ConversionSection onRegister={onRegister} />
      <LandingFooter />
      <VirtualAssistantChat whatsappHref={buildWhatsAppHref} />
      <WhatsAppFloatingButton />
    </div>
  );
}
