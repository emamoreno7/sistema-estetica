import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import VirtualAssistantChat from '@/components/VirtualAssistantChat';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';
import { buildWhatsAppHref } from '@/lib/whatsapp';

export default function AccessDeniedPage() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center"
      style={{ background: 'var(--bg-cream, var(--bg-cream))' }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-32 top-[10%] h-72 w-72 rounded-full blur-3xl opacity-60"
          style={{ background: 'rgba(242,215,213,0.5)' }}
        />
        <div
          className="absolute -right-24 bottom-[15%] h-64 w-64 rounded-full blur-3xl opacity-50"
          style={{ background: 'rgba(191,201,162,0.35)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-lg"
      >
        <p
          className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: 'rgba(0,61,91,0.45)' }}
        >
          Acceso al portal
        </p>
        <h1
          className="text-serif-premium text-2xl font-light leading-snug sm:text-3xl"
          style={{ color: 'var(--primary-navy)', letterSpacing: '0.02em' }}
        >
          Para acceder a tu progreso debes pertenecer a la comunidad AMORE.
        </h1>
        <p className="mt-6 text-base" style={{ color: 'var(--text-muted, #5c6a72)' }}>
          ¿Aún no eres cliente?
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/unete"
              className="inline-block rounded-full px-10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white shadow-lg transition-shadow"
              style={{
                background: 'var(--primary-navy, var(--primary-navy))',
                boxShadow: '0 12px 32px rgba(0,61,91,0.2)',
              }}
            >
              ÚNETE AQUÍ
            </Link>
          </motion.div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
          <Link
            to="/ingreso"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary-navy)]/75 underline underline-offset-4"
          >
            Ya soy cliente — iniciar sesión
          </Link>
          <span className="hidden text-[var(--primary-navy)]/25 sm:inline">·</span>
          <Link
            to="/"
            className="text-[11px] font-semibold uppercase tracking-[0.2em] underline underline-offset-4"
            style={{ color: 'var(--primary-navy)' }}
          >
            Volver al inicio
          </Link>
        </div>
      </motion.div>

      <VirtualAssistantChat whatsappHref={buildWhatsAppHref} />
      <WhatsAppFloatingButton />
    </div>
  );
}
