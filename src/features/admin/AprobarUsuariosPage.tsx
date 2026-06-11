import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Undo2,
  UserCheck,
} from 'lucide-react';
import { getPortalAdminEmails, getPortalAdminUserIds } from '@/config/admin';
import type { PerfilClienteRow } from '@/lib/perfilCliente';
import { AdminShell } from './AdminShell';
import {
  desaprobarCliente,
  eliminarPerfilCliente,
  listPerfilesClientesAdminExt,
} from './adminApi';
import ActivateClientModal from './ActivateClientModal';

type AdminOutletCtx = { onSignOut: () => void };

const REFRESH_INTERVAL_MS = 20_000;

function formatFechaAlta(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Pantalla dedicada de aprobación de altas (`perfiles_clientes.status === 'pending'`).
 * - Polling cada 20s, pausado cuando la pestaña no está visible (ahorra cuota Supabase).
 * - Sección plegable de aprobados con acción “Volver a pendiente” reversible.
 * - Banner contador grande + métricas rápidas.
 */
export default function AprobarUsuariosPage() {
  const { onSignOut } = useOutletContext<AdminOutletCtx>();

  const [rows, setRows] = useState<PerfilClienteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [actionErr, setActionErr] = useState<string | null>(null);
  const [activateTarget, setActivateTarget] = useState<PerfilClienteRow | null>(null);
  const [showApproved, setShowApproved] = useState(false);

  const isFirstLoad = useRef(true);

  const load = useCallback(async () => {
    if (isFirstLoad.current) setLoading(true);
    else setRefreshing(true);
    setListError(null);

    const { rows: r, error } = await listPerfilesClientesAdminExt();
    if (error) setListError(error);
    else setRows(r);

    setLoading(false);
    setRefreshing(false);
    isFirstLoad.current = false;
  }, []);

  // Polling con pausa cuando la pestaña no está visible.
  useEffect(() => {
    void load();
    let timer: ReturnType<typeof setInterval> | null = null;

    function start() {
      if (timer !== null) return;
      timer = setInterval(() => void load(), REFRESH_INTERVAL_MS);
    }
    function stop() {
      if (timer === null) return;
      clearInterval(timer);
      timer = null;
    }

    if (document.visibilityState === 'visible') start();

    function onVisibility() {
      if (document.visibilityState === 'visible') {
        void load();
        start();
      } else {
        stop();
      }
    }

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
    };
  }, [load]);

  const pendientes = useMemo(() => rows.filter((r) => r.status === 'pending'), [rows]);
  const aprobados = useMemo(() => rows.filter((r) => r.status === 'active'), [rows]);
  const bloqueados = useMemo(() => rows.filter((r) => r.status === 'blocked'), [rows]);

  const filteredPendientes = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return pendientes;
    return pendientes.filter((p) =>
      [p.full_name, p.phone].some((f) => f.toLowerCase().includes(needle))
    );
  }, [pendientes, q]);

  async function onReject(p: PerfilClienteRow) {
    setActionErr(null);
    if (
      !window.confirm(
        `¿Rechazar la solicitud de ${p.full_name}? Se eliminará la ficha del portal. El usuario seguirá existiendo en Supabase Auth y podrá volver a registrarse.`
      )
    )
      return;
    const { error } = await eliminarPerfilCliente(p.id);
    if (error) {
      setActionErr(error);
      return;
    }
    await load();
  }

  async function onUnapprove(p: PerfilClienteRow) {
    setActionErr(null);
    if (
      !window.confirm(
        `¿Volver a “pendiente” a ${p.full_name}? Pierde el acceso al portal hasta que vuelvas a activarlo.`
      )
    )
      return;
    const { error } = await desaprobarCliente(p.id);
    if (error) {
      setActionErr(error);
      return;
    }
    await load();
  }

  const admins = getPortalAdminEmails();
  const adminIds = getPortalAdminUserIds();

  return (
    <AdminShell
      onSignOut={onSignOut}
      title="Aprobar usuarios"
      subtitle="Revisá las solicitudes de alta pendientes y activá el acceso al portal o rechazá la ficha."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/clientes"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--primary-navy)]/12 bg-white/90 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--primary-navy)]"
          >
            Ver todos los clientes <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-sage)]/50 bg-white/90 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--primary-navy)]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing || loading ? 'animate-spin' : ''}`} />
            Actualizar
          </motion.button>
        </div>
      }
    >
      {admins.length === 0 && adminIds.length === 0 ? (
        <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-950">
          Configurá <code className="text-xs">VITE_ADMIN_EMAILS</code> en <code>.env</code>; debe coincidir con
          <code className="text-xs"> is_portal_admin()</code> (migración 003).
        </p>
      ) : null}

      {actionErr ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {actionErr}
        </div>
      ) : null}

      {/* Banner contador grande */}
      <motion.div
        layout
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 flex items-start gap-3 rounded-3xl border px-5 py-4 ${
          pendientes.length > 0
            ? 'border-amber-300/80 bg-amber-50/95'
            : 'border-[var(--accent-sage)]/55 bg-[#F4F7E8]/85'
        }`}
      >
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
            pendientes.length > 0 ? 'bg-amber-200/70 text-amber-900' : 'bg-[var(--accent-sage)]/45 text-[var(--primary-navy)]'
          }`}
        >
          {pendientes.length > 0 ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <p
            className={`text-serif-premium text-lg font-bold ${
              pendientes.length > 0 ? 'text-amber-950' : 'text-[var(--primary-navy)]'
            }`}
          >
            {pendientes.length > 0
              ? `Tenés ${pendientes.length} solicitud${pendientes.length === 1 ? '' : 'es'} pendiente${pendientes.length === 1 ? '' : 's'} de aprobación`
              : 'No hay solicitudes pendientes'}
          </p>
          <p
            className={`mt-1 text-xs ${
              pendientes.length > 0 ? 'text-amber-900/80' : 'text-[var(--primary-navy)]/65'
            }`}
          >
            Actualización automática cada {REFRESH_INTERVAL_MS / 1000}s mientras la pestaña esté abierta.
          </p>
        </div>
      </motion.div>

      {/* Métricas */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <MetricCard label="Pendientes" value={pendientes.length} tone="amber" />
        <MetricCard label="Aprobados" value={aprobados.length} tone="sage" />
        <MetricCard label="Bloqueados" value={bloqueados.length} tone="neutral" />
        <MetricCard label="Total fichas" value={rows.length} tone="neutral" />
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <label className="relative flex items-center">
          <Search className="pointer-events-none absolute left-5 h-5 w-5 text-[var(--primary-navy)]/35" />
          <input
            type="search"
            placeholder="Buscar pendiente por nombre o teléfono…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-3xl border border-[var(--primary-navy)]/10 bg-white/90 py-4 pl-14 pr-6 text-sm text-[var(--primary-navy)] shadow-sm outline-none transition focus:border-[var(--accent-rose)] focus:ring-2 focus:ring-[var(--accent-rose)]/60"
            style={{ boxShadow: '0 8px 32px rgba(0,61,91,0.06)' }}
          />
        </label>
      </div>

      {/* Pendientes */}
      <div
        className="overflow-hidden rounded-3xl border border-[var(--accent-rose)]/55 bg-[var(--bg-cream)]/95 shadow-xl backdrop-blur-sm"
        style={{ boxShadow: '0 24px 64px rgba(0,61,91,0.08)' }}
      >
        <div className="border-b border-[var(--accent-rose)]/50 px-6 py-5">
          <div className="flex items-center gap-3">
            <UserCheck className="h-4 w-4 text-[var(--primary-navy)]/55" />
            <h2 className="text-serif-premium text-lg font-bold text-[var(--primary-navy)]">
              Solicitudes de alta
            </h2>
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Tabla Supabase · <strong>perfiles_clientes</strong> · estado <em>pending</em>
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-[var(--primary-navy)]/55">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando solicitudes…</span>
          </div>
        ) : listError ? (
          <div className="px-6 py-16 text-center text-sm text-red-700">{listError}</div>
        ) : filteredPendientes.length === 0 ? (
          <EmptyState searching={q.trim().length > 0} />
        ) : (
          <ul className="divide-y divide-[var(--accent-rose)]/35">
            {filteredPendientes.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--primary-navy)]">{p.full_name}</p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    {p.phone || 'Sin teléfono'} · Registrado {formatFechaAlta((p as Record<string, unknown>).created_at as string)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => void onReject(p)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-200/80 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-800"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Rechazar
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivateTarget(p)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--accent-sage)] to-[var(--primary-navy)] px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md"
                  >
                    <UserCheck className="h-3.5 w-3.5" /> Aprobar
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {/* Aprobados (plegable) */}
      <div
        className="mt-8 overflow-hidden rounded-3xl border border-[var(--primary-navy)]/10 bg-white/85"
        style={{ boxShadow: '0 12px 32px rgba(0,61,91,0.05)' }}
      >
        <button
          type="button"
          onClick={() => setShowApproved((v) => !v)}
          aria-expanded={showApproved}
          className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-[var(--primary-navy)]/55" />
            <h3 className="text-serif-premium text-base font-bold text-[var(--primary-navy)]">
              Usuarios ya aprobados
            </h3>
            <span className="rounded-full bg-[var(--accent-sage)]/35 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--primary-navy)]">
              {aprobados.length}
            </span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-[var(--primary-navy)]/55 transition-transform ${showApproved ? 'rotate-180' : ''}`}
          />
        </button>

        {showApproved ? (
          aprobados.length === 0 ? (
            <p className="border-t border-[var(--primary-navy)]/10 px-6 py-8 text-center text-sm text-[var(--text-muted)]">
              Aún no aprobaste a ningún cliente.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--primary-navy)]/10 border-t border-[var(--primary-navy)]/10">
              {aprobados.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-2 px-6 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--primary-navy)]">{p.full_name}</p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      {p.phone || 'Sin teléfono'} · Alta {formatFechaAlta((p as Record<string, unknown>).created_at as string)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void onUnapprove(p)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary-navy)]/15 bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--primary-navy)] transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900"
                  >
                    <Undo2 className="h-3.5 w-3.5" /> Volver a pendiente
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </div>

      <ActivateClientModal
        open={activateTarget !== null}
        cliente={activateTarget}
        onClose={() => setActivateTarget(null)}
        onActivated={() => void load()}
      />
    </AdminShell>
  );
}

type MetricTone = 'amber' | 'sage' | 'neutral';

function MetricCard({ label, value, tone }: { label: string; value: number; tone: MetricTone }) {
  const styles: Record<MetricTone, { border: string; bg: string }> = {
    amber: { border: 'border-amber-200/80', bg: 'bg-amber-50/85' },
    sage: { border: 'border-[var(--accent-sage)]/55', bg: 'bg-[#F4F7E8]/70' },
    neutral: { border: 'border-[var(--primary-navy)]/10', bg: 'bg-white/80' },
  };
  const s = styles[tone];
  return (
    <div className={`rounded-3xl border ${s.border} ${s.bg} px-5 py-4 shadow-sm`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--primary-navy)]/45">
        {label}
      </p>
      <p className="text-serif-premium mt-1 text-3xl font-bold tabular-nums text-[var(--primary-navy)]">
        {value}
      </p>
    </div>
  );
}

function EmptyState({ searching }: { searching: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="rounded-2xl bg-gradient-to-br from-[var(--accent-sage)]/35 to-[var(--accent-rose)]/35 p-3">
        <CheckCircle2 className="h-7 w-7 text-[var(--primary-navy)]" />
      </div>
      <p className="text-serif-premium text-lg font-bold text-[var(--primary-navy)]">
        {searching ? 'Sin coincidencias' : 'Todo al día'}
      </p>
      <p className="max-w-md text-sm text-[var(--text-muted)]">
        {searching
          ? 'Ningún pendiente coincide con la búsqueda actual.'
          : 'No hay solicitudes esperando aprobación. Las altas nuevas aparecerán acá automáticamente.'}
      </p>
    </div>
  );
}
