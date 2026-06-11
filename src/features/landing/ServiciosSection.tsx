import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useServiciosCatalogo } from '@/hooks/useServiciosCatalogo';
import { BADGE_STYLE, serviciosCatalogo } from '@/data/serviciosCatalogo';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { brand } from '../../config/brand';
import { ServiceIllustration, type IllustrationKey } from './ServiceIllustration';

const NAME_TO_ILLUSTRATION: Record<string, IllustrationKey> = {
  'Body Up': 'bodyUp',
  Radiofrecuencia: 'radiofrecuencia',
  'Crio-lipólisis': 'crio',
  'Lipo-láser': 'lipolaser',
  Electrodos: 'electrodos',
  'Masajes relajantes': 'masajeRelajante',
  'Masajes descontracturantes': 'masajeDescontracturante',
  'Masaje linfático': 'masajeLinfatico',
  Presoterapia: 'presoterapia',
  'Piedras calientes': 'piedrasCalientes',
  'Lifting de pestañas': 'liftingPestanas',
  'Laminado de pestañas': 'laminadoPestanas',
  'Perfilado de cejas': 'perfiladoCejas',
  'Depilación definitiva': 'depilacionDefinitiva',
  'Eliminación de tatuajes': 'eliminacionTatuajes',
};

function resolveIllustration(srv: { illustration?: IllustrationKey; name: string }): IllustrationKey {
  return srv.illustration ?? NAME_TO_ILLUSTRATION[srv.name] ?? 'bodyUp';
}

export function ServiciosSection() {
  const { categorias, loading, error, fromDb } = useServiciosCatalogo();
  const [activeTab, setActiveTab] = useState(serviciosCatalogo[0].id);

  useEffect(() => {
    if (categorias.length > 0 && !categorias.some((c) => c.id === activeTab)) {
      setActiveTab(categorias[0].id);
    }
  }, [categorias, activeTab]);

  const categoria = categorias.find((c) => c.id === activeTab) ?? categorias[0];

  if (!categoria) {
    return null;
  }

  return (
    <section className="relative px-4 py-24 sm:px-10 lg:py-32" style={{ background: 'var(--bg-cream)' }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full blur-3xl"
          style={{ background: 'rgba(191,201,162,0.18)' }}
        />
        <div
          className="absolute -left-32 bottom-20 h-[400px] w-[400px] rounded-full blur-3xl"
          style={{ background: 'rgba(242,215,213,0.22)' }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.38em]"
            style={{ color: 'var(--accent-sage)' }}
          >
            Catálogo Completo
          </p>
          <h2
            className="text-serif-premium mx-auto max-w-xl text-3xl font-light leading-snug sm:text-5xl"
            style={{ color: 'var(--primary-navy)' }}
          >
            Nuestros Servicios
          </h2>
          <div className="mx-auto mt-5 flex items-center justify-center gap-3">
            <div className="h-px w-14" style={{ background: 'var(--accent-rose)' }} />
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent-rose)' }} />
            <div className="h-px w-14" style={{ background: 'var(--accent-rose)' }} />
          </div>
          {loading ? (
            <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              Sincronizando catálogo…
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 text-xs text-amber-800/90">
              No se pudo cargar el catálogo desde el servidor. Mostramos la versión local.
            </p>
          ) : null}
          {fromDb && !loading && !error ? (
            <p
              className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'var(--accent-sage)' }}
            >
              Catálogo actualizado desde {brand.shortName}
            </p>
          ) : null}
        </motion.div>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className="rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-300"
              style={
                activeTab === cat.id
                  ? {
                      background: 'var(--primary-navy)',
                      color: '#fff',
                      boxShadow: '0 6px 20px rgba(0,61,91,0.18)',
                    }
                  : {
                      background: 'rgba(0,61,91,0.06)',
                      color: 'var(--primary-navy)',
                    }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {categoria.services.map((srv, i) => (
            <motion.article
              key={`${categoria.id}-${srv.name}-${i}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -5 }}
              className="group flex flex-col overflow-hidden"
              style={{
                background: '#fff',
                borderRadius: '1.5rem',
                boxShadow: '0 4px 24px rgba(0,61,91,0.07)',
                border: '1px solid rgba(242,215,213,0.5)',
              }}
            >
              <div
                className="relative aspect-[3/4] max-h-[320px] min-h-[220px] overflow-hidden transition-transform duration-700 group-hover:scale-[1.02] sm:max-h-[380px]"
                style={{ background: 'var(--bg-cream)' }}
              >
                <ServiceIllustration variant={resolveIllustration(srv)} className="absolute inset-0" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                  {srv.badges.map((b) => (
                    <span
                      key={b}
                      className="rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm"
                      style={{
                        background: BADGE_STYLE[b]?.bg ?? 'rgba(255,255,255,0.78)',
                        color: BADGE_STYLE[b]?.color ?? 'var(--primary-navy)',
                      }}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h3
                  className="text-serif-premium text-xl font-light leading-snug tracking-wide sm:text-[1.35rem]"
                  style={{ color: 'var(--primary-navy)' }}
                >
                  {srv.name}
                </h3>
                <div className="my-4 h-px w-10" style={{ background: 'var(--accent-rose)' }} />
                <p
                  className="flex-1 text-[15px] leading-[1.75] sm:text-base"
                  style={{ color: 'var(--text-muted)', letterSpacing: '0.015em' }}
                >
                  {srv.desc}
                </p>
                <a
                  href={buildWhatsAppHref(srv.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2 rounded-full px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition-all hover:opacity-90"
                  style={{ background: 'var(--accent-rose)', color: 'var(--primary-navy)' }}
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Consultar por WhatsApp
                </a>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14 text-center"
        >
          <p className="mb-5 text-sm" style={{ color: 'var(--text-muted)' }}>
            ¿No encontrás lo que buscás? Escribinos y te asesoramos.
          </p>
          <a
            href={buildWhatsAppHref('consulta general')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-all hover:opacity-90"
            style={{ background: '#25D366', boxShadow: '0 10px 30px rgba(37,211,102,0.25)' }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Ver todos los servicios por WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
