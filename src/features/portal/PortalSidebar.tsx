import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, LogOut, Settings } from 'lucide-react';
import { BrandWordmark } from '@/components/branding/BrandWordmark';
import { portalNavItems } from './navItems';
import type { PortalView } from './types';
import { brand } from '../../config/brand';

type Props = {
  view: PortalView;
  onNav: (v: PortalView) => void;
  onLogout?: () => void;
  isAdmin?: boolean;
};

/** Sidebar flotante del portal (desktop) + bottom bar (mobile). */
export function PortalSidebar({ view, onNav, onLogout, isAdmin }: Props) {
  const navigate = useNavigate();

  return (
    <>
      <motion.aside
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 lg:flex"
      >
        <div className="glass-nav animate-nav-breathe flex flex-col items-center gap-1 rounded-[28px] px-2.5 py-5">
          <div className="group relative mb-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg"
              style={{ background: 'var(--primary-navy)', boxShadow: '0 8px 24px rgba(0,61,91,0.30)' }}
            >
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <div
              className="pointer-events-none absolute left-full ml-3 scale-90 rounded-2xl px-5 py-3 opacity-0 shadow-2xl backdrop-blur-xl transition-all group-hover:scale-100 group-hover:opacity-100"
              style={{ background: 'rgba(253,248,245,0.96)', border: '1px solid var(--accent-rose)' }}
            >
              <BrandWordmark variant="compact" />
              <div
                className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45"
                style={{
                  background: 'rgba(253,248,245,0.96)',
                  borderBottom: '1px solid var(--accent-rose)',
                  borderLeft: '1px solid var(--accent-rose)',
                }}
              />
            </div>
          </div>

          <div className="mb-2 h-px w-8 bg-gradient-to-r from-transparent via-[#F2D7D5] to-transparent" />

          {portalNavItems.map((item) => {
            const active = view === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onNav(item.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="group relative flex h-12 w-12 items-center justify-center rounded-2xl"
              >
                {active ? (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl shadow-lg"
                    style={{ background: 'var(--primary-navy)', boxShadow: '0 6px 20px rgba(0,61,91,0.30)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                  />
                ) : (
                  <div
                    className="absolute inset-0 rounded-2xl border border-transparent transition-colors"
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(242,215,213,0.35)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  />
                )}
                <item.icon
                  className={`relative z-10 h-[18px] w-[18px] ${active ? 'text-white drop-shadow-sm' : 'text-[#7A746E]'}`}
                />
                <div
                  className="pointer-events-none absolute left-full ml-3 scale-90 rounded-lg px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl backdrop-blur-sm transition-all group-hover:scale-100 group-hover:opacity-100"
                  style={{ background: 'var(--primary-navy)' }}
                >
                  {item.label}
                  <div
                    className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45"
                    style={{ background: 'var(--primary-navy)' }}
                  />
                </div>
              </motion.button>
            );
          })}

          <div className="my-2 h-px w-8 bg-gradient-to-r from-transparent via-[#F2D7D5] to-transparent" />

          <motion.button
            type="button"
            onClick={() => onLogout?.()}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-[#7A746E] transition-colors hover:bg-red-50/60 hover:text-red-400"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </motion.button>

          {isAdmin ? (
            <>
              <div className="my-2 h-px w-8 bg-gradient-to-r from-transparent via-[#F2D7D5] to-transparent" />
              <motion.button
                type="button"
                onClick={() => navigate('/admin')}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="flex w-12 shrink-0 flex-col items-center gap-1 rounded-2xl px-1 py-2.5 text-white shadow-lg outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-red-600"
                style={{
                 background: 'linear-gradient(165deg, #E53935 0%, #B71C1C 45%, #C62828 100%)',
                  boxShadow: '0 10px 28px rgba(198,40,40,0.45)',
                }}
                title={brand.backofficeName}
              >
                <Settings className="h-[18px] w-[18px] shrink-0 opacity-95" aria-hidden />
                <span className="max-w-[3.35rem] text-center text-[7px] font-bold uppercase leading-tight tracking-[0.06em]">
                  GESTIÓN {brand.shortName.toUpperCase()}
                </span>
              </motion.button>
            </>
          ) : null}
        </div>
      </motion.aside>

      <motion.nav
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col px-3 pb-3 pt-2 lg:hidden"
      >
        <div className="glass-bottom flex items-center justify-around rouned-2xl px-1 py-2.5">
          {portalNavItems.map((item) => {
            const active = view === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onNav(item.id)}
                whileTap={{ scale: 0.82 }}
                className="relative flex flex-col items-center gap-0.5 px-2 py-1"
              >
                {active ? (
                  <motion.div
                    layoutId="mobile-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-champagne-50 to-transparent shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  />
                ) : null}
                <item.icon className={`relative z-10 h-5 w-5 ${active ? 'text-champagne' : 'text-[#7A746E]'}`} />
                <span className={`relative z-10 text-[8px] font-semibold ${active ? 'text-sand-dark' : 'text-[#7A746E]'}`}>
                  {item.shortLabel}
                </span>
              </motion.button>
            );
          })}
        </div>
        {isAdmin ? (
          <motion.button
            type="button"
            onClick={() => navigate('/admin')}
            whileTap={{ scale: 0.98 }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-red-600"
            style={{
              background: 'linear-gradient(96deg, #E53935 0%, #C62828 55%, #B71C1C 100%)',
              boxShadow: '0 12px 32px rgba(198,40,40,0.42)',
            }}
          >
            <Settings className="h-4 w-4 shrink-0" aria-hidden />
            GESTIÓN {brand.shortName.toUpperCase()}
          </motion.button>
        ) : null}
      </motion.nav>
    </>
  );
}
