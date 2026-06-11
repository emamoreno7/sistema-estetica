import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Camera, ChevronLeft, ChevronRight, Eye, TrendingUp } from 'lucide-react';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import { usePortalCliente } from '@/context/PortalClienteContext';
import { PortalTreatmentEmptyPlaceholder } from '../components/PortalTreatmentEmptyPlaceholder';

export function EvolucionView() {
  const { activeTreatment, sessions, beforeAfterPairs } = usePortalCliente();
  const [currentPair, setCurrentPair] = useState(0);

  if (!activeTreatment || beforeAfterPairs.length === 0) {
    return (
      <div className="space-y-6">
        <PortalTreatmentEmptyPlaceholder
          title="Todavía no hay fotos comparativas"
          paragraph="En esta sección vas a comparar ante y después cuando registremos tu primera sesión. Es una forma muy clara de ver tu avance."
        />
      </div>
    );
  }

  const pair = beforeAfterPairs[currentPair];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Camera, value: '5', label: 'Fotos de Progreso' },
          { icon: TrendingUp, value: '80%', label: 'Reducción de Vello' },
          { icon: Award, value: '5', label: 'Sesiones Registradas' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass flex items-center gap-4 rounded-2xl p-5"
          >
            <div className="rounded-xl bg-champagne-50 p-3">
              <s.icon className="h-5 w-5 text-champagne" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--primary-navy)]">{s.value}</p>
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-strong overflow-hidden rounded-2xl p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="rounded-lg bg-[var(--primary-navy)] p-1.5">
                <Eye className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-serif-premium text-lg font-bold text-[var(--primary-navy)]">
                Comparación Antes & Después
              </h3>
            </div>
            <p className="text-sm text-[var(--text-muted)]">Desliza el controlador para comparar tu progreso</p>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPair((p) => (p === 0 ? beforeAfterPairs.length - 1 : p - 1))}
            className="rounded-full border border-[var(--accent-rose)]/70 bg-[var(--bg-cream)]/90 p-2 text-[var(--text-muted)] transition-all hover:border-[var(--accent-sage)] hover:text-[var(--primary-navy)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            {beforeAfterPairs.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPair(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentPair
                    ? 'w-8 bg-gradient-to-r from-[var(--accent-sage)] to-[var(--primary-navy)]'
                    : 'w-2 bg-gray-200 hover:bg-gray-300'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentPair((p) => (p === beforeAfterPairs.length - 1 ? 0 : p + 1))}
            className="rounded-full border border-[var(--accent-rose)]/70 bg-[var(--bg-cream)]/90 p-2 text-[var(--text-muted)] transition-all hover:border-[var(--accent-sage)] hover:text-[var(--primary-navy)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={pair.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <BeforeAfterSlider beforeSrc={pair.before} afterSrc={pair.after} />
            <div className="mt-3 flex items-center justify-between rounded-xl bg-[var(--accent-rose)]/20 px-5 py-3">
              <p className="text-sm font-bold text-[var(--primary-navy)]">{pair.title}</p>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary-navy)]">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent-sage)] animate-pulse" />
                {pair.improvement}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-1">
          {beforeAfterPairs.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPair(idx)}
              className={`group relative shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                idx === currentPair ? 'border-[var(--primary-navy)] shadow-soft' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <div className="flex h-14 w-20">
                <img src={p.before} alt="Antes" className="h-full w-1/2 object-cover" />
                <img src={p.after} alt="Después" className="h-full w-1/2 object-cover" />
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-strong rounded-2xl p-6"
      >
        <h3 className="text-serif-premium mb-4 text-lg font-bold text-[var(--primary-navy)]">Galería de Sesiones</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {sessions
            .filter((s) => s.foto)
            .map((s, i) => (
              <motion.div
                key={s.nro}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="group relative overflow-hidden rounded-xl"
              >
                <img
                  src={s.foto}
                  alt={`Sesión ${s.nro}`}
                  className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-2 left-2 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                  Sesión {s.nro}
                </span>
              </motion.div>
            ))}
        </div>
      </motion.div>
    </div>
  );
}
