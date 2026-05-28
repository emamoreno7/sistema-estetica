import { buildWhatsAppHref } from '@/lib/whatsapp';

export function LandingFooter() {
  return (
    <footer
      className="px-6 py-16 sm:px-10"
      style={{ background: 'var(--bg-cream)', borderTop: '1px solid rgba(242,215,213,0.6)' }}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
        <img
          src="/logo-amore-v2.png"
          alt="AMORE Centro Di Bellezza"
          style={{
            height: '72px',
            width: 'auto',
            display: 'block',
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            filter: 'drop-shadow(0 6px 14px rgba(0,61,91,0.10))',
          }}
        />

        <div className="h-px w-12 bg-[#003D5B]/15" />

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7A746E]">Ubicación</p>
            <p className="mt-2 text-sm leading-6 text-[#7A746E]">
              Rivadavia
              <br />
              Mendoza, Argentina
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7A746E]">Redes</p>
            <a
              href="https://instagram.com/amore.mendoza"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm leading-6 text-[#7A746E] underline underline-offset-4 decoration-[#8A8178]/20 transition-colors hover:text-[#003D5B] hover:decoration-[#4A443F]/40"
            >
              @amore.mendoza
            </a>
            <a
              href={buildWhatsAppHref('consulta general')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-medium leading-6 text-[#003D5B] underline underline-offset-4 decoration-[#25D366]/40 transition-colors hover:text-[#25D366]"
            >
              WhatsApp
            </a>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7A746E]">Horarios</p>
            <p className="mt-2 text-sm leading-6 text-[#7A746E]">
              Lunes a Sábado
              <br />
              Atención Personalizada
            </p>
          </div>
        </div>

        <div className="h-px w-12 bg-[#003D5B]/15" />

        <p className="text-[9px] uppercase tracking-[0.35em] text-[#A9A09A]">
          &copy; {new Date().getFullYear()} Amore Centro Di Bellezza
        </p>
      </div>
    </footer>
  );
}
