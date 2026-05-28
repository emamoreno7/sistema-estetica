import { motion } from 'framer-motion';
import { Calendar, Camera, Heart, Sparkles } from 'lucide-react';

export function ConversionSection({ onRegister }: { onRegister: () => void }) {
  const pillars = [
    { icon: Sparkles, title: 'Seguimiento personalizado', desc: 'Cada sesión queda registrada y visible en tu panel.' },
    { icon: Camera, title: 'Antes & Después', desc: 'Compará tu evolución con fotos de alta calidad.' },
    { icon: Calendar, title: 'Agenda inteligente', desc: 'Tus próximas citas en un solo lugar, siempre al día.' },
    { icon: Heart, title: 'Acompañamiento real', desc: 'Tu profesional te guía en cada etapa del proceso.' },
  ];

  return (
    <section
      className="relative overflow-hidden px-6 py-24 sm:px-10 lg:py-32"
      style={{ background: 'var(--accent-rose)' }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-24 top-0 h-64 w-64 rounded-full blur-3xl"
          style={{ background: 'rgba(253,248,245,0.55)' }}
        />
        <div
          className="absolute -right-20 bottom-0 h-56 w-56 rounded-full blur-3xl"
          style={{ background: 'rgba(191,201,162,0.35)' }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.38em]"
            style={{ color: 'var(--primary-navy)', opacity: 0.6 }}
          >
            Tu Espacio Personal
          </p>
          <h2
            className="text-serif-premium text-3xl font-light leading-snug sm:text-5xl"
            style={{ color: 'var(--primary-navy)' }}
          >
            Tu progreso,
            <br />
            documentado.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-8" style={{ color: 'rgba(0,61,91,0.72)' }}>
            Accedé a tu panel personalizado, seguí la evolución de tus tratamientos y recibí recomendaciones exclusivas
            de nuestros especialistas.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex flex-col items-center gap-3 rounded-3xl p-6 text-center"
              style={{
                background: 'rgba(253,248,245,0.72)',
                boxShadow: '0 10px 30px rgba(0,61,91,0.06)',
                border: '1px solid rgba(253,248,245,0.9)',
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: 'var(--primary-navy)' }}
              >
                <p.icon className="h-5 w-5 text-white" />
              </div>
              <h3
                className="text-serif-premium text-base font-medium"
                style={{ color: 'var(--primary-navy)' }}
              >
                {p.title}
              </h3>
              <p className="text-xs leading-5" style={{ color: 'rgba(0,61,91,0.65)' }}>
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <motion.button
            onClick={onRegister}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-full px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.26em] text-white transition-all"
            style={{ background: 'var(--primary-navy)', boxShadow: '0 16px 40px rgba(0,61,91,0.22)' }}
          >
            Crear mi Perfil de Belleza
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
