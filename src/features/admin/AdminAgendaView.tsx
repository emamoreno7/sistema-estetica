import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageCircle,
  MoreVertical,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { addDays, format, subDays } from 'date-fns';
import { es as esLocale } from 'date-fns/locale';
import type { CitaEstado } from '@/lib/citasApi';
import { WHATSAPP_ADMIN_PHONE } from '@/lib/whatsapp';
import { getPortalAdminEmails, getPortalAdminUserIds } from '@/config/admin';
import { AdminShell } from './AdminShell';
import {
  actualizarEstadoCitaAdmin,
  eliminarCitaAdmin,
  fetchCitasPorFechaAdmin,
  type CitaAdminListRow,
} from './adminCitasApi';

type AdminOutletCtx = { onSignOut: () => void };

function horaCorta(horaSql: string): string {
  const m = horaSql.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return horaSql.slice(0, 5);
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}

function waClienteHref(row: CitaAdminListRow): string {
  const digits = row.phone.replace(/\D/g, '');
  const hc = horaCorta(row.hora);
  const text = `Hola ${row.full_name}, te escribimos desde Amore por tu turno: ${row.servicio} (${format(
    new Date(row.fecha + 'T12:00:00'),
    'd MMM',
    { locale: esLocale }
  )} a las ${hc}).`;
  if (digits.length >= 8) {
    const n = digits.startsWith('54') ? digits : `54${digits.replace(/^0+/, '')}`;
    return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/${WHATSAPP_ADMIN_PHONE}?text=${encodeURIComponent(
    `${text}\n(El cliente figura sin teléfono válido en la ficha — contactar por recepción.)`
  )}`;
}

function EstadoEtiqueta({ estado }: { estado: CitaEstado }) {
  const map: Record<CitaEstado, { label: string; className: string }> = {
    confirmado: {
      label: '🟢 Confirmado',
      className: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
    },
    realizado: {
      label: '🔵 Realizado',
      className: 'bg-sky-50 text-sky-900 border-sky-200/80',
    },
    cancelado: {
      label: '🔴 Cancelado',
      className: 'bg-red-50 text-red-900 border-red-200/70',
    },
    pendiente: {
      label: '🟡 Pendiente',
      className: 'bg-amber-50 text-amber-950 border-amber-200/80',
    },
  };
  const x = map[estado];
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide ${x.className}`}>
      {x.label}
    </span>
  );
}

export default function AdminAgendaView() {
  const { onSignOut } = useOutletContext<AdminOutletCtx>();
  const [dia, setDia] = useState(() => new Date());
  const fechaYmd = format(dia, 'yyyy-MM-dd');
  const [rows, setRows] = useState<CitaAdminListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [accionMsg, setAccionMsg] = useState<string | null>(null);
  const [menuRow, setMenuRow] = useState<CitaAdminListRow | null>(null);
  const [saving, setSaving] = useState(false);

  const admins = getPortalAdminEmails();
  const adminIds = getPortalAdminUserIds();

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { rows: r, error } = await fetchCitasPorFechaAdmin(fechaYmd);
    if (error) setErr(error);
    else setRows(r);
    setLoading(false);
  }, [fechaYmd]);

  useEffect(() => {
    void load();
  }, [load]);

  const tituloDia = useMemo(
    () => format(dia, "EEEE d 'de' MMMM yyyy", { locale: esLocale }),
    [dia]
  );

  async function aplicarEstado(estado: CitaEstado) {
    if (!menuRow) return;
    setAccionMsg(null);
    setSaving(true);
    const { error } = await actualizarEstadoCitaAdmin(menuRow.id, estado);
    setSaving(false);
    if (error) {
      setAccionMsg(error);
      return;
    }
    setMenuRow(null);
    await load();
  }

  async function borrarTurno() {
    if (!menuRow) return;
    if (
      !window.confirm(
        `¿Eliminar el turno de ${menuRow.full_name} (${horaCorta(menuRow.hora)})? Esta acción no se puede deshacer.`
      )
    )
      return;
    setAccionMsg(null);
    setSaving(true);
    const { error } = await eliminarCitaAdmin(menuRow.id);
    setSaving(false);
    if (error) {
      setAccionMsg(error);
      return;
    }
    setMenuRow(null);
    await load();
  }

  return (
    <AdminShell
      onSignOut={onSignOut}
      title="Agenda"
      subtitle={tituloDia}
      actions={
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-full border border-[#BFC9A2]/50 bg-white/90 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#003D5B]"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </motion.button>
      }
    >
      {admins.length === 0 && adminIds.length === 0 ? (
        <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-950">
          Configurá <code className="text-xs">VITE_ADMIN_EMAILS</code> o{' '}
          <code className="text-xs">VITE_ADMIN_USER_IDS</code> y la función SQL{' '}
          <code className="text-xs">is_portal_admin()</code>.
        </p>
      ) : null}

      <div
        className="mb-6 flex items-center justify-between gap-3 rounded-3xl border border-[#F2D7D5]/65 bg-[#FDF8F5]/95 px-4 py-3 shadow-lg backdrop-blur-sm sm:px-5"
        style={{ boxShadow: '0 16px 48px rgba(0,61,91,0.08)' }}
      >
        <button
          type="button"
          aria-label="Día anterior"
          className="rounded-2xl border border-[#003D5B]/10 bg-white/90 p-3 text-[#003D5B] transition hover:bg-[#F2D7D5]/30"
          onClick={() => setDia((d) => subDays(d, 1))}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 text-center">
          <Calendar className="h-4 w-4 shrink-0 text-[#B8956E]" aria-hidden />
          <input
            type="date"
            value={fechaYmd}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) return;
              const [y, m, d] = v.split('-').map(Number);
              setDia(new Date(y, m - 1, d));
            }}
            className="max-w-[11rem] rounded-xl border border-[#003D5B]/12 bg-white/95 px-3 py-2 text-center text-sm font-medium text-[#003D5B] outline-none focus:ring-2 focus:ring-[#F2D7D5]/70"
          />
        </div>
        <button
          type="button"
          aria-label="Día siguiente"
          className="rounded-2xl border border-[#003D5B]/10 bg-white/90 p-3 text-[#003D5B] transition hover:bg-[#F2D7D5]/30"
          onClick={() => setDia((d) => addDays(d, 1))}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setDia(new Date())}
        className="mb-6 w-full rounded-2xl border border-dashed border-[#003D5B]/18 bg-white/50 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#003D5B]/55 transition hover:border-[#BFC9A2]/60 hover:bg-white/80"
      >
        Ir a hoy
      </button>

      {accionMsg ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {accionMsg}
        </div>
      ) : null}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-[#003D5B]/55">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">Cargando turnos…</span>
        </div>
      ) : err ? (
        <div className="rounded-3xl border border-red-100 bg-red-50/90 px-5 py-10 text-center text-sm text-red-800">
          {err}
        </div>
      ) : rows.length === 0 ? (
        <div
          className="rounded-3xl border border-[#F2D7D5]/60 bg-[#FDF8F5]/95 px-6 py-16 text-center shadow-md"
          style={{ boxShadow: '0 20px 56px rgba(0,61,91,0.06)' }}
        >
          <p className="text-serif-premium text-lg text-[#003D5B]/75">
            No hay turnos cargados para este día.
          </p>
          <p className="mt-2 text-sm text-[#7A746E]">
            Cuando las clientes reserven desde el portal, aparecerán aquí.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <motion.li key={row.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <button
                type="button"
                onClick={() => {
                  setAccionMsg(null);
                  setMenuRow(row);
                }}
                className="flex w-full flex-col gap-3 rounded-3xl border border-[#F2D7D5]/65 bg-[#FDF8F5]/98 p-4 text-left shadow-md transition hover:border-[#BFC9A2]/45 hover:shadow-lg active:scale-[0.99] sm:flex-row sm:items-center sm:gap-4 sm:p-5"
                style={{ boxShadow: '0 14px 40px rgba(0,61,91,0.07)' }}
              >
                <div className="flex shrink-0 items-baseline gap-3 sm:w-24 sm:flex-col sm:gap-0">
                  <span className="text-serif-premium text-2xl font-semibold tabular-nums text-[#003D5B]">
                    {horaCorta(row.hora)}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7A746E]">hs</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-[#003D5B]">{row.full_name}</p>
                    <EstadoEtiqueta estado={row.estado} />
                  </div>
                  <p className="mt-1 text-sm text-[#7A746E]">{row.servicio}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:flex-col">
                  <a
                    href={waClienteHref(row)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-xs font-semibold text-white shadow-md sm:flex-initial"
                    style={{ boxShadow: '0 8px 24px rgba(37,211,102,0.28)' }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <span className="hidden rounded-xl border border-[#003D5B]/10 bg-white/80 p-2 text-[#003D5B]/40 sm:inline-flex">
                    <MoreVertical className="h-5 w-5" aria-hidden />
                  </span>
                </div>
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {menuRow ? (
          <>
            <motion.button
              type="button"
              aria-label="Cerrar menú"
              className="fixed inset-0 z-[100] bg-[#003D5B]/35 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saving && setMenuRow(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="agenda-accion-titulo"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-[110] max-h-[85vh] overflow-y-auto rounded-t-[1.75rem] border border-[#F2D7D5]/80 px-5 pb-10 pt-6 shadow-2xl sm:left-1/2 sm:max-w-md sm:-translate-x-1/2"
              style={{
                background: 'linear-gradient(180deg, #fffefb 0%, #FDF8F5 100%)',
                boxShadow: '0 -20px 64px rgba(0,61,91,0.18)',
              }}
            >
              <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-[#003D5B]/15" aria-hidden />
              <h2 id="agenda-accion-titulo" className="text-serif-premium text-lg font-bold text-[#003D5B]">
                Turno {horaCorta(menuRow.hora)} · {menuRow.full_name}
              </h2>
              <p className="mt-1 text-sm text-[#7A746E]">{menuRow.servicio}</p>

              <p className="mb-3 mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#003D5B]/45">
                Cambiar estado
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ['confirmado', '🟢 Confirmado'],
                    ['pendiente', '🟡 Pendiente'],
                    ['realizado', '🔵 Realizado'],
                    ['cancelado', '🔴 Cancelado'],
                  ] as const
                ).map(([estado, label]) => (
                  <button
                    key={estado}
                    type="button"
                    disabled={saving || menuRow.estado === estado}
                    onClick={() => void aplicarEstado(estado)}
                    className="rounded-2xl border border-[#F2D7D5]/70 bg-white/90 px-3 py-3 text-left text-[13px] font-semibold text-[#003D5B] transition hover:bg-[#F2D7D5]/25 disabled:opacity-45"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => void borrarTurno()}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-4 text-sm font-semibold text-red-800 transition hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar turno
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => setMenuRow(null)}
                className="mt-3 w-full rounded-2xl py-3 text-center text-sm font-medium text-[#003D5B]/55"
              >
                Cerrar
              </button>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </AdminShell>
  );
}
