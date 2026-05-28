import { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es as esLocale } from 'date-fns/locale';
import {
  AlertCircle,
  CalendarCheck,
  CalendarDays,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { getPortalAdminEmails, getPortalAdminUserIds } from '@/config/admin';
import { AdminShell } from './AdminShell';
import {
  fetchAdminKpis,
  fetchProximosTurnosAdmin,
  fetchUltimasAltasAdmin,
  type AdminKpis,
  type ProximoTurnoRow,
  type UltimaAltaRow,
} from './adminKpisApi';

type AdminOutletCtx = { onSignOut: () => void };

type KpiCardSpec = {
  key: string;
  label: string;
  value: string;
  hint?: string;
  icon: typeof Users;
  accent: string;
  to?: string;
};

function statusPillClass(s: UltimaAltaRow['status']): string {
  const base = 'rounded-full px-2.5 py-0.5 text-[10px] font-semibold';
  if (s === 'active') return `${base} bg-[#BFC9A2]/35 text-[#003D5B]`;
  if (s === 'pending') return `${base} bg-amber-100/85 text-amber-900`;
  return `${base} bg-[#F2D7D5]/65 text-[#003D5B]`;
}

function estadoPillClass(e: ProximoTurnoRow['estado']): string {
  const base = 'rounded-full px-2.5 py-0.5 text-[10px] font-semibold';
  if (e === 'confirmado') return `${base} bg-emerald-50 text-emerald-900`;
  if (e === 'realizado') return `${base} bg-sky-50 text-sky-900`;
  if (e === 'cancelado') return `${base} bg-red-50 text-red-900`;
  return `${base} bg-amber-50 text-amber-950`;
}

function horaCorta(h: string): string {
  const m = h.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return h.slice(0, 5);
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}

function fechaCorta(ymd: string): string {
  const [y, mo, d] = ymd.split('-').map(Number);
  const dt = new Date(y, (mo ?? 1) - 1, d ?? 1, 12, 0, 0);
  return format(dt, "d MMM", { locale: esLocale });
}

export default function AdminOverview() {
  const { onSignOut } = useOutletContext<AdminOutletCtx>();
  const [kpis, setKpis] = useState<AdminKpis | null>(null);
  const [ultimas, setUltimas] = useState<UltimaAltaRow[]>([]);
  const [proximos, setProximos] = useState<ProximoTurnoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [k, alts, prox] = await Promise.all([
      fetchAdminKpis(),
      fetchUltimasAltasAdmin(5),
      fetchProximosTurnosAdmin(6),
    ]);
    if (k.error) setError(k.error);
    setKpis(k.kpis);
    if (!k.error && alts.error) setError(alts.error);
    setUltimas(alts.rows);
    if (!k.error && !alts.error && prox.error) setError(prox.error);
    setProximos(prox.rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const adminsEmails = getPortalAdminEmails();
  const adminsIds = getPortalAdminUserIds();
  const adminsMisconfigured = adminsEmails.length === 0 && adminsIds.length === 0;

  const cards: KpiCardSpec[] = kpis
    ? [
        {
          key: 'pend',
          label: 'Clientes pendientes',
          value: String(kpis.clientesPendientes),
          hint: `${kpis.clientesTotal} fichas totales`,
          icon: UserPlus,
          accent: '#E5B85A',
          to: '/admin/clientes?status=pending',
        },
        {
          key: 'act',
          label: 'Clientes activos',
          value: String(kpis.clientesActivos),
          hint: `${kpis.clientesBloqueados} bloqueados`,
          icon: Users,
          accent: 'var(--accent-sage)',
          to: '/admin/clientes?status=active',
        },
        {
          key: 'citas-hoy',
          label: 'Turnos hoy',
          value: String(kpis.citasHoy),
          hint: `${kpis.citasHoyConfirmadas} confirmados · ${kpis.citasHoyPendientes} pendientes`,
          icon: CalendarCheck,
          accent: 'var(--primary-navy)',
          to: '/admin/agenda',
        },
        {
          key: 'citas-7',
          label: 'Próx. 7 días',
          value: String(kpis.citas7Dias),
          hint: 'incluye hoy',
          icon: CalendarDays,
          accent: 'var(--accent-rose)',
          to: '/admin/agenda',
        },
        {
          key: 'serv',
          label: 'Servicios activos',
          value: `${kpis.serviciosActivos}/${kpis.serviciosTotal}`,
          hint: 'visibles en el portal',
          icon: Sparkles,
          accent: '#B8956E',
          to: '/admin/servicios',
        },
        {
          key: 'tot',
          label: 'Fichas portal',
          value: String(kpis.clientesTotal),
          hint: 'altas registradas',
          icon: TrendingUp,
          accent: 'var(--accent-sage)',
        },
      ]
    : [];

  return (
    <AdminShell
      onSignOut={onSignOut}
      title="Resumen"
      subtitle="Panorama operativo en tiempo real: clientes, agenda y catálogo."
      actions={
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-full border border-[#BFC9A2]/50 bg-white/90 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#003D5B]"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </motion.button>
      }
    >
      {adminsMisconfigured ? (
        <p className="mb-6 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-950">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Configurá <code className="text-xs">VITE_ADMIN_EMAILS</code> (y opcional{' '}
            <code className="text-xs">VITE_ADMIN_USER_IDS</code>) en <code>.env</code>. Tu correo debe coincidir con
            <code className="text-xs"> is_portal_admin()</code> (migración 003).
          </span>
        </p>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}

      {/* KPIs */}
      {loading && !kpis ? (
        <div className="flex items-center justify-center gap-3 py-20 text-[#003D5B]/55">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando indicadores…</span>
        </div>
      ) : kpis ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {cards.map((c, i) => {
            const Inner = (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
                className="relative h-full overflow-hidden rounded-3xl border bg-[#FDF8F5]/95 p-5 transition-shadow hover:shadow-lg"
                style={{
                  borderColor: 'rgba(242,215,213,0.55)',
                  boxShadow: '0 12px 32px rgba(0,61,91,0.06)',
                }}
              >
                <div
                  className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-25"
                  style={{ background: c.accent }}
                  aria-hidden
                />
                <div className="relative">
                  <div
                    className="mb-3 inline-flex rounded-2xl p-2"
                    style={{ background: `color-mix(in srgb, ${c.accent} 18%, transparent)` }}
                  >
                    <c.icon className="h-4 w-4" style={{ color: c.accent }} />
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#003D5B]/55">{c.label}</p>
                  <p className="text-serif-premium mt-1 text-3xl font-bold text-[#003D5B]">{c.value}</p>
                  {c.hint ? <p className="mt-1 text-xs text-[#7A746E]">{c.hint}</p> : null}
                </div>
              </motion.div>
            );
            return c.to ? (
              <Link key={c.key} to={c.to} className="block">
                {Inner}
              </Link>
            ) : (
              <div key={c.key}>{Inner}</div>
            );
          })}
        </div>
      ) : null}

      {/* Bloques inferiores */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Pendientes / últimas altas */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border bg-[#FDF8F5]/95 shadow-md"
          style={{ borderColor: 'rgba(242,215,213,0.55)', boxShadow: '0 16px 48px rgba(0,61,91,0.06)' }}
        >
          <header className="flex items-center justify-between border-b border-[#F2D7D5]/45 px-5 py-4">
            <div>
              <h2 className="text-serif-premium text-base font-bold text-[#003D5B]">Últimas altas</h2>
              <p className="text-[11px] text-[#7A746E]">Últimas fichas registradas en el portal</p>
            </div>
            <Link
              to="/admin/clientes"
              className="rounded-full border border-[#003D5B]/12 bg-white/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#003D5B]"
            >
              Ver todos
            </Link>
          </header>
          <ul className="divide-y divide-[#F2D7D5]/40">
            {ultimas.length === 0 && !loading ? (
              <li className="px-5 py-8 text-center text-sm text-[#7A746E]">
                Sin altas recientes que mostrar.
              </li>
            ) : (
              ultimas.map((r) => (
                <li key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-sage))' }}
                    aria-hidden
                  >
                    {r.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#003D5B]">{r.full_name}</p>
                    <p className="truncate text-xs text-[#7A746E]">{r.phone || '— sin teléfono —'}</p>
                  </div>
                  <span className={statusPillClass(r.status)}>
                    {r.status === 'active' ? 'Activo' : r.status === 'pending' ? 'Pendiente' : 'Bloqueado'}
                  </span>
                </li>
              ))
            )}
          </ul>
        </motion.section>

        {/* Próximos turnos */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border bg-[#FDF8F5]/95 shadow-md"
          style={{ borderColor: 'rgba(242,215,213,0.55)', boxShadow: '0 16px 48px rgba(0,61,91,0.06)' }}
        >
          <header className="flex items-center justify-between border-b border-[#F2D7D5]/45 px-5 py-4">
            <div>
              <h2 className="text-serif-premium text-base font-bold text-[#003D5B]">Próximos turnos</h2>
              <p className="text-[11px] text-[#7A746E]">Desde hoy en adelante</p>
            </div>
            <Link
              to="/admin/agenda"
              className="rounded-full border border-[#003D5B]/12 bg-white/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#003D5B]"
            >
              Ver agenda
            </Link>
          </header>
          <ul className="divide-y divide-[#F2D7D5]/40">
            {proximos.length === 0 && !loading ? (
              <li className="px-5 py-8 text-center text-sm text-[#7A746E]">
                No hay turnos próximos cargados.
              </li>
            ) : (
              proximos.map((c) => (
                <li key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-[68px] shrink-0 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#003D5B]/55">
                      {fechaCorta(c.fecha)}
                    </p>
                    <p className="text-serif-premium text-xl font-bold tabular-nums text-[#003D5B]">
                      {horaCorta(c.hora)}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#003D5B]">{c.full_name}</p>
                    <p className="truncate text-xs text-[#7A746E]">{c.servicio}</p>
                  </div>
                  <span className={estadoPillClass(c.estado)}>
                    {c.estado === 'confirmado'
                      ? 'Confirmado'
                      : c.estado === 'realizado'
                      ? 'Realizado'
                      : c.estado === 'cancelado'
                      ? 'Cancelado'
                      : 'Pendiente'}
                  </span>
                </li>
              ))
            )}
          </ul>
        </motion.section>
      </div>
    </AdminShell>
  );
}
