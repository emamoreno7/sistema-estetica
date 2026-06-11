import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock4,
  ExternalLink,
  Globe,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import { formatPrecioArs } from '@/lib/serviciosDb';
import { AdminShell } from './AdminShell';
import {
  deleteProveedorInsumo,
  extractMlItemId,
  listAuditoriaInsumos,
  listHistorialInsumo,
  listProveedoresInsumo,
  marcarTodosVerificadosBajoUmbral,
  marcarVerificadoInsumo,
  triggerSondeoPrecios,
  upsertProveedorInsumo,
  type AuditoriaInsumoRow,
  type HistorialCambioRow,
  type ProveedorInsumoRow,
  type SondeoSummary,
} from './adminAuditoriaApi';
import { upsertInsumo } from './adminCostosApi';

type AdminOutletCtx = { onSignOut: () => void };

type FiltroAntig = 'todos' | 'mas7' | 'mas30' | 'nunca';

function parseInputNum(raw: string): number | null {
  const n = Number.parseFloat(raw.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function fmtDias(dias: number): string {
  if (!Number.isFinite(dias)) return 'Nunca verificado';
  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Ayer';
  return `Hace ${dias} día${dias === 1 ? '' : 's'}`;
}

function fmtFecha(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminAuditoriaPreciosView() {
  const { onSignOut } = useOutletContext<AdminOutletCtx>();

  const [rows, setRows] = useState<AuditoriaInsumoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroAntig>('todos');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sondeando, setSondeando] = useState(false);
  const [sondeoResumen, setSondeoResumen] = useState<SondeoSummary | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { rows: r, error } = await listAuditoriaInsumos();
    if (error) setErr(error);
    else setRows(r);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    let mas7 = 0;
    let mas30 = 0;
    let nunca = 0;
    for (const r of rows) {
      if (!r.activo) continue;
      if (!Number.isFinite(r.dias_sin_verificar)) nunca++;
      if (r.dias_sin_verificar >= 30) mas30++;
      else if (r.dias_sin_verificar >= 7) mas7++;
    }
    return {
      total: rows.filter((r) => r.activo).length,
      mas7,
      mas30,
      nunca,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    return rows
      .filter((r) => r.activo)
      .filter((r) => {
        if (filtro === 'todos') return true;
        if (filtro === 'nunca') return !Number.isFinite(r.dias_sin_verificar);
        if (filtro === 'mas7') return r.dias_sin_verificar >= 7;
        if (filtro === 'mas30') return r.dias_sin_verificar >= 30;
        return true;
      })
      .sort((a, b) => {
        const da = Number.isFinite(a.dias_sin_verificar) ? a.dias_sin_verificar : 999999;
        const db = Number.isFinite(b.dias_sin_verificar) ? b.dias_sin_verificar : 999999;
        return db - da;
      });
  }, [rows, filtro]);

  async function onVerificar(insumoId: string) {
    setBusy(true);
    setActionErr(null);
    const { error } = await marcarVerificadoInsumo(insumoId);
    if (error) setActionErr(error);
    else await load();
    setBusy(false);
  }

  async function onSondear() {
    if (sondeando) return;
    setSondeando(true);
    setActionErr(null);
    setSondeoResumen(null);
    const { summary, error } = await triggerSondeoPrecios({ dryRun: false });
    if (error) setActionErr(error);
    else if (summary) {
      setSondeoResumen(summary);
      await load();
    }
    setSondeando(false);
  }

  async function onMarcarTodos() {
    const ids = filtered.map((r) => r.id);
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `¿Marcar ${ids.length} insumo(s) como verificado(s) hoy? Esto NO cambia los precios, sólo registra que los revisaste.`
      )
    )
      return;
    setBusy(true);
    setActionErr(null);
    const { error } = await marcarTodosVerificadosBajoUmbral(ids);
    if (error) setActionErr(error);
    else await load();
    setBusy(false);
  }

  return (
    <AdminShell
      onSignOut={onSignOut}
      title="Auditoría de precios"
      subtitle="Revisión semanal de costos de insumos. Confirmá que los precios siguen vigentes o actualizalos según tu proveedor."
      actions={
        <div className="flex flex-wrap gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            disabled={sondeando || busy}
            onClick={() => void onSondear()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--primary-navy)] to-[#0a5a82] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow disabled:opacity-50"
            title="Consulta la API de Mercado Libre y los proveedores con URL para detectar variaciones"
          >
            {sondeando ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            {sondeando ? 'Sondeando…' : 'Sondear precios ahora'}
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            disabled={busy || filtered.length === 0}
            onClick={() => void onMarcarTodos()}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow disabled:opacity-50"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Marcar todos verificados ({filtered.length})
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-sage)]/50 bg-white/90 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--primary-navy)]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </motion.button>
        </div>
      }
    >
      {err ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {err}
          <p className="mt-2 text-xs text-red-700/90">
            Ejecutá <code className="text-[11px]">supabase/migrations/011_auditoria_precios_insumos.sql</code> en
            Supabase si todavía no lo hiciste.
          </p>
        </div>
      ) : null}

      {actionErr ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {actionErr}
          {actionErr.toLowerCase().includes('function') ||
          actionErr.toLowerCase().includes('not found') ||
          actionErr.toLowerCase().includes('failed to send') ? (
            <p className="mt-2 text-xs text-red-700/90">
              ¿Deployaste la Edge Function?{' '}
              <code className="text-[11px]">supabase functions deploy sondear-precios --no-verify-jwt</code>
            </p>
          ) : null}
        </div>
      ) : null}

      {sondeoResumen ? <SondeoResumenPanel resumen={sondeoResumen} onClose={() => setSondeoResumen(null)} /> : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <KpiCard label="Activos" value={counts.total} tone="neutral" />
        <KpiCard label="+7 días sin verificar" value={counts.mas7} tone={counts.mas7 > 0 ? 'amber' : 'neutral'} />
        <KpiCard label="+30 días sin verificar" value={counts.mas30} tone={counts.mas30 > 0 ? 'red' : 'neutral'} />
        <KpiCard label="Nunca verificados" value={counts.nunca} tone={counts.nunca > 0 ? 'red' : 'neutral'} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { id: 'todos' as const, label: 'Todos' },
          { id: 'mas7' as const, label: '+ 7 días' },
          { id: 'mas30' as const, label: '+ 30 días' },
          { id: 'nunca' as const, label: 'Nunca verificados' },
        ].map((tab) => {
          const active = filtro === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFiltro(tab.id)}
              className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                active
                  ? 'bg-[var(--primary-navy)] text-white shadow'
                  : 'border border-[var(--primary-navy)]/12 bg-white/85 text-[var(--primary-navy)]/75'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className="overflow-hidden rounded-3xl border border-[var(--accent-rose)]/55 bg-[var(--bg-cream)]/95 shadow-xl"
        style={{ boxShadow: '0 24px 64px rgba(0,61,91,0.08)' }}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-[var(--primary-navy)]/55">
            <Loader2 className="h-6 w-6 animate-spin" />
            Cargando insumos…
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-[var(--text-muted)]">
            No hay insumos en este criterio.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--accent-rose)]/35">
            {filtered.map((r) => (
              <InsumoAuditRow
                key={r.id}
                row={r}
                expanded={expanded === r.id}
                onToggle={() => setExpanded((e) => (e === r.id ? null : r.id))}
                onVerificar={() => void onVerificar(r.id)}
                onPrecioCambio={async (nuevo) => {
                  setActionErr(null);
                  setBusy(true);
                  const { error } = await upsertInsumo({
                    id: r.id,
                    nombre: r.nombre,
                    unidad: r.unidad,
                    costo_por_unidad: nuevo,
                    activo: r.activo,
                  });
                  if (error) setActionErr(error);
                  else await load();
                  setBusy(false);
                }}
                onErr={setActionErr}
                disabled={busy}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <p className="rounded-2xl border border-[var(--primary-navy)]/8 bg-white/70 px-4 py-3 text-xs text-[var(--text-muted)]">
          <strong>Sondeo automático:</strong> el botón <em>&quot;Sondear precios ahora&quot;</em> consulta cada
          proveedor que tenga URL. Links de <strong>Mercado Libre</strong> usan su API pública (muy estable). Links
          de otros sitios usan scraping genérico (mejor esfuerzo — algunos sitios pueden bloquearlo).
        </p>
        <p className="rounded-2xl border border-[var(--primary-navy)]/8 bg-white/70 px-4 py-3 text-xs text-[var(--text-muted)]">
          <strong>Tip:</strong> el sistema registra automáticamente el historial cada vez que cambia un costo.
          Si confirmás manualmente que el precio sigue igual, usá &quot;Verificar&quot;: queda registrado sin
          alterar el costo.
        </p>
      </div>
    </AdminShell>
  );
}

function SondeoResumenPanel({ resumen, onClose }: { resumen: SondeoSummary; onClose: () => void }) {
  const totalCambios = resumen.cambios_significativos.length;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-3xl border border-[var(--primary-navy)]/15 bg-gradient-to-br from-white to-[var(--bg-cream)] p-5 shadow-lg"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--primary-navy)]/55">
            Último sondeo
          </p>
          <h3 className="text-serif-premium text-xl font-bold text-[var(--primary-navy)]">
            {resumen.total === 0
              ? 'No había proveedores activos para sondear'
              : `${resumen.total} proveedor${resumen.total === 1 ? '' : 'es'} consultado${resumen.total === 1 ? '' : 's'}`}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-[var(--primary-navy)]/12 px-2.5 py-1 text-[10px] font-semibold uppercase text-[var(--primary-navy)]/70"
        >
          Cerrar
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-4">
        <ResumenChip label="Actualizados" value={resumen.ok} tone="emerald" />
        <ResumenChip label="Sin cambios" value={resumen.sin_cambios} tone="neutral" />
        <ResumenChip label="Errores" value={resumen.errores} tone={resumen.errores > 0 ? 'amber' : 'neutral'} />
        <ResumenChip
          label="Variaciones significativas"
          value={totalCambios}
          tone={totalCambios > 0 ? 'red' : 'neutral'}
        />
      </div>

      {totalCambios > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-red-800">
            Insumos con variación &gt; umbral
          </p>
          <ul className="space-y-1.5">
            {resumen.cambios_significativos.slice(0, 8).map((c) => {
              const subio = (c.variacion_pct ?? 0) > 0;
              return (
                <li
                  key={c.proveedor_id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-semibold text-[var(--primary-navy)]">{c.insumo_nombre || c.insumo_id.slice(0, 8)}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {c.source === 'ml_api' ? 'Mercado Libre API' : 'Scraper genérico'} ·{' '}
                      {formatPrecioArs(c.precio_anterior ?? 0)} → {formatPrecioArs(c.precio_detectado ?? 0)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${
                      subio ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    {subio ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {(c.variacion_pct ?? 0).toFixed(1)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {resumen.errores > 0 ? (
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer font-semibold text-amber-800">
            Ver detalle de errores ({resumen.errores})
          </summary>
          <ul className="mt-2 space-y-1">
            {resumen.detalle
              .filter((d) => d.status === 'error')
              .slice(0, 10)
              .map((d) => (
                <li key={d.proveedor_id} className="text-[var(--text-muted)]">
                  <strong className="text-[var(--primary-navy)]">{d.insumo_nombre || d.proveedor_id.slice(0, 8)}</strong>:{' '}
                  {d.error_msg ?? '—'}
                </li>
              ))}
          </ul>
        </details>
      ) : null}
    </motion.div>
  );
}

function ResumenChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'emerald' | 'red' | 'amber' | 'neutral';
}) {
  const styles = {
    emerald: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    red: 'border-red-300 bg-red-50 text-red-900',
    amber: 'border-amber-300 bg-amber-50 text-amber-900',
    neutral: 'border-[var(--primary-navy)]/10 bg-white text-[var(--primary-navy)]',
  }[tone];
  return (
    <div className={`rounded-2xl border px-3 py-2 ${styles}`}>
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'amber' | 'red' | 'neutral';
}) {
  const styles = {
    amber: 'border-amber-300/80 bg-amber-50/90 text-amber-950',
    red: 'border-red-300/80 bg-red-50/90 text-red-950',
    neutral: 'border-[var(--accent-rose)]/55 bg-[var(--bg-cream)]/95 text-[var(--primary-navy)]',
  } as const;
  return (
    <div className={`rounded-3xl border px-5 py-4 shadow-sm ${styles[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-60">{label}</p>
      <p className="text-serif-premium mt-1 text-3xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function InsumoAuditRow({
  row,
  expanded,
  onToggle,
  onVerificar,
  onPrecioCambio,
  onErr,
  disabled,
}: {
  row: AuditoriaInsumoRow;
  expanded: boolean;
  onToggle: () => void;
  onVerificar: () => void;
  onPrecioCambio: (nuevo: number) => Promise<void>;
  onErr: (msg: string) => void;
  disabled: boolean;
}) {
  const [proveedores, setProveedores] = useState<ProveedorInsumoRow[]>([]);
  const [historial, setHistorial] = useState<HistorialCambioRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [precioEdit, setPrecioEdit] = useState(String(row.costo_por_unidad));

  useEffect(() => {
    if (!expanded || loaded) return;
    void (async () => {
      const [p, h] = await Promise.all([
        listProveedoresInsumo(row.id),
        listHistorialInsumo(row.id),
      ]);
      if (p.error) onErr(p.error);
      else setProveedores(p.rows);
      if (h.error) onErr(h.error);
      else setHistorial(h.rows);
      setLoaded(true);
    })();
  }, [expanded, loaded, row.id, onErr]);

  useEffect(() => {
    setPrecioEdit(String(row.costo_por_unidad));
  }, [row.costo_por_unidad]);

  const dias = row.dias_sin_verificar;
  const estado: 'ok' | 'warn' | 'critical' =
    !Number.isFinite(dias) || dias >= 30 ? 'critical' : dias >= 7 ? 'warn' : 'ok';

  const pillColor =
    estado === 'critical'
      ? 'bg-red-100 text-red-900'
      : estado === 'warn'
        ? 'bg-amber-100 text-amber-900'
        : 'bg-emerald-100 text-emerald-900';

  async function reloadDetalle() {
    setLoaded(false);
    const [p, h] = await Promise.all([
      listProveedoresInsumo(row.id),
      listHistorialInsumo(row.id),
    ]);
    if (p.error) onErr(p.error);
    else setProveedores(p.rows);
    if (h.error) onErr(h.error);
    else setHistorial(h.rows);
    setLoaded(true);
  }

  return (
    <li className="px-6 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onToggle} className="flex items-center gap-3 text-left">
          <ChevronDown className={`h-4 w-4 text-[var(--primary-navy)]/55 transition ${expanded ? 'rotate-180' : ''}`} />
          <div>
            <p className="text-sm font-semibold text-[var(--primary-navy)]">{row.nombre}</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              {formatPrecioArs(row.costo_por_unidad)} / {row.unidad} ·{' '}
              {row.proveedores_count} proveedor{row.proveedores_count === 1 ? '' : 'es'} ·{' '}
              Actualizado {fmtFecha(row.updated_at)}
            </p>
          </div>
        </button>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${pillColor}`}>
            <Clock4 className="h-3 w-3" /> {fmtDias(dias)}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={onVerificar}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-[10px] font-semibold uppercase text-white shadow disabled:opacity-50"
          >
            <CheckCircle2 className="h-3 w-3" /> Verificar
          </button>
        </div>
      </div>

      {expanded ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 rounded-2xl border border-[var(--accent-rose)]/55 bg-white/85 p-4"
        >
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <label className="text-xs text-[var(--primary-navy)]">
              <span className="block font-semibold uppercase tracking-wide text-[10px]">
                Costo / {row.unidad}
              </span>
              <input
                value={precioEdit}
                onChange={(e) => setPrecioEdit(e.target.value)}
                className="mt-1 w-32 rounded-lg border border-[var(--primary-navy)]/12 px-2 py-1.5 text-right tabular-nums"
              />
            </label>
            <button
              type="button"
              disabled={disabled}
              onClick={async () => {
                const n = parseInputNum(precioEdit);
                if (n === null || n < 0) {
                  onErr('Precio inválido.');
                  return;
                }
                await onPrecioCambio(n);
                await reloadDetalle();
              }}
              className="rounded-full bg-[var(--primary-navy)] px-4 py-2 text-[10px] font-semibold uppercase text-white shadow"
            >
              Guardar nuevo precio
            </button>
          </div>

          {!loaded ? (
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Loader2 className="h-3 w-3 animate-spin" /> Cargando proveedores e historial…
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <ProveedoresPanel
                insumoId={row.id}
                rows={proveedores}
                onChange={() => void reloadDetalle()}
                onErr={onErr}
              />
              <HistorialPanel rows={historial} unidad={row.unidad} />
            </div>
          )}
        </motion.div>
      ) : null}
    </li>
  );
}

function ProveedoresPanel({
  insumoId,
  rows,
  onChange,
  onErr,
}: {
  insumoId: string;
  rows: ProveedorInsumoRow[];
  onChange: () => void;
  onErr: (msg: string) => void;
}) {
  const [draft, setDraft] = useState({ proveedor: '', url: '', precio: '' });

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--primary-navy)]/55">
        Proveedores de referencia
      </p>
      <ul className="space-y-2">
        {rows.length === 0 ? (
          <li className="text-xs text-[var(--text-muted)]">
            Aún no cargaste proveedores. Sumá un link para tener referencia semanal.
          </li>
        ) : null}
        {rows.map((p) => (
          <ProveedorRow
            key={p.id}
            row={p}
            onChange={onChange}
            onErr={onErr}
          />
        ))}
      </ul>

      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input
          value={draft.proveedor}
          onChange={(e) => setDraft((d) => ({ ...d, proveedor: e.target.value }))}
          placeholder="Proveedor (ej. Belstetic)"
          className="rounded-lg border border-[var(--primary-navy)]/12 px-2 py-1.5 text-xs"
        />
        <input
          value={draft.url}
          onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
          placeholder="URL (https://...)"
          className="rounded-lg border border-[var(--primary-navy)]/12 px-2 py-1.5 text-xs"
        />
        <input
          value={draft.precio}
          onChange={(e) => setDraft((d) => ({ ...d, precio: e.target.value }))}
          placeholder="$"
          className="rounded-lg border border-[var(--primary-navy)]/12 px-2 py-1.5 text-right text-xs"
        />
        <button
          type="button"
          disabled={!draft.proveedor.trim()}
          onClick={async () => {
            const precio = parseInputNum(draft.precio) ?? 0;
            const { error } = await upsertProveedorInsumo({
              insumo_id: insumoId,
              proveedor: draft.proveedor,
              url: draft.url,
              precio_listado: precio,
            });
            if (error) onErr(error);
            else {
              setDraft({ proveedor: '', url: '', precio: '' });
              onChange();
            }
          }}
          className="col-span-2 inline-flex items-center justify-center gap-1 rounded-full bg-[var(--primary-navy)] px-3 py-1.5 text-[10px] font-semibold uppercase text-white sm:col-span-1 disabled:opacity-50"
        >
          <Plus className="h-3 w-3" /> Agregar
        </button>
      </div>
    </div>
  );
}

function ProveedorRow({
  row,
  onChange,
  onErr,
}: {
  row: ProveedorInsumoRow;
  onChange: () => void;
  onErr: (msg: string) => void;
}) {
  const [proveedor, setProveedor] = useState(row.proveedor);
  const [url, setUrl] = useState(row.url);
  const [precio, setPrecio] = useState(String(row.precio_listado));
  const [sondeandoUno, setSondeandoUno] = useState(false);

  const mlIdDetectado = row.ml_item_id ?? extractMlItemId(url);

  async function save() {
    const p = parseInputNum(precio) ?? 0;
    const { error } = await upsertProveedorInsumo({
      id: row.id,
      insumo_id: row.insumo_id,
      proveedor,
      url,
      precio_listado: p,
      fecha_verificacion: new Date().toISOString().slice(0, 10),
    });
    if (error) onErr(error);
    else onChange();
  }

  async function sondearEste() {
    setSondeandoUno(true);
    const { summary, error } = await triggerSondeoPrecios({ proveedorIds: [row.id] });
    if (error) onErr(error);
    else if (summary) {
      const item = summary.detalle[0];
      if (item?.status === 'error') onErr(`${item.source}: ${item.error_msg ?? '—'}`);
      onChange();
    }
    setSondeandoUno(false);
  }

  const sondeoBadge = row.ultimo_sondeo_at ? (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ${
        row.ultimo_sondeo_ok === false
          ? 'bg-red-100 text-red-900'
          : 'bg-emerald-100 text-emerald-900'
      }`}
      title={
        row.ultimo_sondeo_ok === false
          ? `Último sondeo falló: ${row.ultimo_sondeo_error ?? ''}`
          : 'Último sondeo OK'
      }
    >
      {row.ultimo_sondeo_ok === false ? (
        <XCircle className="h-2.5 w-2.5" />
      ) : (
        <CheckCircle2 className="h-2.5 w-2.5" />
      )}
      Sondeo {fmtFecha(row.ultimo_sondeo_at)}
    </span>
  ) : null;

  return (
    <li className="rounded-xl border border-[var(--primary-navy)]/8 bg-white px-3 py-2 text-xs">
      <div className="flex items-start gap-2">
        <div className="grid flex-1 gap-1.5">
          <div className="flex items-center gap-2">
            <input
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              className="flex-1 rounded border border-[var(--primary-navy)]/12 px-2 py-1"
            />
            {mlIdDetectado ? (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-[9px] font-semibold text-yellow-900"
                title="Detectado link de Mercado Libre — se sondea con su API pública (mucho más confiable)"
              >
                ML API · {mlIdDetectado}
              </span>
            ) : url ? (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-navy)]/8 px-2 py-0.5 text-[9px] font-semibold text-[var(--primary-navy)]"
                title="Se intentará scraping genérico del HTML"
              >
                <Globe className="h-2.5 w-2.5" /> Scraper
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL"
              className="flex-1 rounded border border-[var(--primary-navy)]/12 px-2 py-1"
            />
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 rounded-full border border-[var(--primary-navy)]/12 px-2 py-1 text-[10px] text-[var(--primary-navy)]"
              >
                Abrir <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="$ listado"
              className="w-32 rounded border border-[var(--primary-navy)]/12 px-2 py-1 text-right tabular-nums"
            />
            <span className="text-[10px] text-[var(--text-muted)]">
              Verificado: {fmtFecha(row.fecha_verificacion)}
            </span>
            {sondeoBadge}
            {row.ultimo_sondeo_ok === false && row.ultimo_sondeo_error ? (
              <span className="text-[9px] text-red-700">· {row.ultimo_sondeo_error}</span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            disabled={!url || sondeandoUno}
            onClick={() => void sondearEste()}
            className="rounded-full border border-[var(--primary-navy)]/12 bg-white p-1.5 text-[var(--primary-navy)] disabled:opacity-40"
            title="Sondear este proveedor ahora"
          >
            {sondeandoUno ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
          </button>
          <button
            type="button"
            onClick={() => void save()}
            className="rounded-full border border-[var(--primary-navy)]/12 bg-white p-1.5 text-[var(--primary-navy)]"
            title="Guardar"
          >
            <Save className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!window.confirm(`¿Eliminar el link de "${row.proveedor}"?`)) return;
              const { error } = await deleteProveedorInsumo(row.id);
              if (error) onErr(error);
              else onChange();
            }}
            className="rounded-full border border-red-200 bg-red-50 p-1.5 text-red-700"
            title="Eliminar"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </li>
  );
}

function HistorialPanel({ rows, unidad }: { rows: HistorialCambioRow[]; unidad: string }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--primary-navy)]/55">
        Historial de cambios
      </p>
      {rows.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">Aún no hay cambios registrados para este insumo.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((h) => {
            const subio = h.variacion_pct !== null && h.variacion_pct > 0;
            const bajo = h.variacion_pct !== null && h.variacion_pct < 0;
            return (
              <li
                key={h.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--primary-navy)]/8 bg-white px-3 py-2 text-xs"
              >
                <div>
                  <p className="font-semibold text-[var(--primary-navy)]">
                    {formatPrecioArs(h.costo_anterior)} → {formatPrecioArs(h.costo_nuevo)}
                    <span className="ml-1 text-[10px] text-[var(--text-muted)]">/ {unidad}</span>
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">{fmtFecha(h.changed_at)}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${
                    subio
                      ? 'bg-red-100 text-red-900'
                      : bajo
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {subio ? <TrendingUp className="h-3 w-3" /> : null}
                  {bajo ? <TrendingDown className="h-3 w-3" /> : null}
                  {!subio && !bajo ? <AlertTriangle className="h-3 w-3" /> : null}
                  {h.variacion_pct === null ? '—' : `${h.variacion_pct.toFixed(1)}%`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
