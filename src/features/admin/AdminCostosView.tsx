import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import {
  calcularFilasCostos,
  resumenMensual,
  totalCostosFijosMensual,
  type EstadoMensual,
  type ResumenMensual,
} from '@/lib/costosCalculo';
import { formatPrecioArs } from '@/lib/serviciosDb';
import type { CostoOperativoRow, InsumoRow } from './adminCostosApi';
import {
  aplicarPrecioSugerido,
  deleteCostoOperativo,
  deleteInsumo,
  fetchCostosDashboard,
  setServicioInsumo,
  updateServicioCostosFields,
  upsertCostoOperativo,
  upsertInsumo,
} from './adminCostosApi';
import { AdminShell } from './AdminShell';

type AdminOutletCtx = { onSignOut: () => void };

function parseInputNum(raw: string): number | null {
  const n = Number.parseFloat(raw.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function roundMoneyClient(n: number): number {
  return Math.round(n * 100) / 100;
}

export default function AdminCostosView() {
  const { onSignOut } = useOutletContext<AdminOutletCtx>();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [servicios, setServicios] = useState<Awaited<ReturnType<typeof fetchCostosDashboard>>['servicios']>([]);
  const [insumos, setInsumos] = useState<InsumoRow[]>([]);
  const [costosFijos, setCostosFijos] = useState<CostoOperativoRow[]>([]);
  const [links, setLinks] = useState<Awaited<ReturnType<typeof fetchCostosDashboard>>['links']>([]);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFijos, setShowFijos] = useState(true);
  const [showInsumos, setShowInsumos] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const data = await fetchCostosDashboard();
    if (data.error) setErr(data.error);
    else {
      setServicios(data.servicios);
      setInsumos(data.insumos);
      setCostosFijos(data.costosFijos);
      setLinks(data.links);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filas = useMemo(
    () => calcularFilasCostos(servicios, links),
    [servicios, links]
  );

  const totalFijo = useMemo(() => totalCostosFijosMensual(costosFijos), [costosFijos]);
  const resumen = useMemo(() => resumenMensual(filas, totalFijo), [filas, totalFijo]);
  const bajoMargen = filas.filter((f) => f.bajo_margen && f.activo).length;

  async function onAplicarPrecio(id: string, precio: number) {
    setActionErr(null);
    setBusy(true);
    const { error } = await aplicarPrecioSugerido(id, precio);
    if (error) setActionErr(error);
    else await load();
    setBusy(false);
  }

  async function onAplicarTodosBajoMargen() {
    const targets = filas.filter((f) => f.bajo_margen && f.activo);
    if (targets.length === 0) return;
    if (!window.confirm(`¿Actualizar el precio de ${targets.length} servicio(s) al valor sugerido?`)) return;
    setBusy(true);
    setActionErr(null);
    for (const t of targets) {
      const { error } = await aplicarPrecioSugerido(t.id, t.precio_sugerido);
      if (error) {
        setActionErr(error);
        break;
      }
    }
    await load();
    setBusy(false);
  }

  async function onSaveServicioFields(
    id: string,
    fields: { margen?: number; manoObra?: number; cantidadMes?: number }
  ) {
    setActionErr(null);
    setBusy(true);
    const { error } = await updateServicioCostosFields(id, {
      margen_objetivo: fields.margen,
      costo_mano_obra: fields.manoObra,
      cantidad_estimada_mensual: fields.cantidadMes,
    });
    if (error) setActionErr(error);
    else await load();
    setBusy(false);
  }

  return (
    <AdminShell
      onSignOut={onSignOut}
      title="Costos y precios"
      subtitle="Definí insumos, gastos fijos y mano de obra. El sistema calcula el costo total y sugiere precios según tu margen objetivo."
      actions={
        <div className="flex flex-wrap gap-2">
          {bajoMargen > 0 ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              disabled={busy}
              onClick={() => void onAplicarTodosBajoMargen()}
              className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Aplicar sugeridos ({bajoMargen})
            </motion.button>
          ) : null}
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
            Si es la primera vez, ejecutá <code className="text-[11px]">supabase/migrations/008_costos_operativos.sql</code>{' '}
            en el SQL Editor de Supabase.
          </p>
        </div>
      ) : null}

      {actionErr ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>{actionErr}</p>
          {actionErr.toLowerCase().includes('cantidad_estimada_mensual') ? (
            <p className="mt-2 text-xs text-red-700/90">
              Falta ejecutar{' '}
              <code className="text-[11px]">supabase/migrations/013_cantidad_estimada_mensual.sql</code> en el SQL
              Editor de Supabase. Después hacé hard refresh (Cmd+Shift+R).
            </p>
          ) : null}
          {actionErr.toLowerCase().includes('schema cache') ? (
            <p className="mt-2 text-xs text-red-700/90">
              Schema cache de PostgREST desactualizado. Corré en SQL Editor:
              <code className="ml-1 text-[11px]">notify pgrst, &apos;reload schema&apos;;</code>
            </p>
          ) : null}
        </div>
      ) : null}

      <ResumenMensualPanel resumen={resumen} />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Kpi label="Gastos fijos / mes" value={formatPrecioArs(totalFijo)} />
        <Kpi label="Insumos activos" value={String(insumos.filter((i) => i.activo).length)} />
        <Kpi
          label="Servicios bajo margen"
          value={String(bajoMargen)}
          warn={bajoMargen > 0}
        />
      </div>

      <SectionToggle
        open={showFijos}
        onToggle={() => setShowFijos((v) => !v)}
        title="Costos operativos fijos (mensuales)"
        subtitle="Alquiler, servicios, internet, etc. Se prorratean por duración de cada servicio."
      />
      {showFijos ? (
        <CostosFijosTable
          rows={costosFijos}
          disabled={busy || loading}
          onReload={() => void load()}
          onError={setActionErr}
        />
      ) : null}

      <SectionToggle
        open={showInsumos}
        onToggle={() => setShowInsumos((v) => !v)}
        title="Catálogo de insumos"
        subtitle="Productos consumibles. Actualizá el costo unitario y impacta todos los servicios que lo usan."
        className="mt-8"
      />
      {showInsumos ? (
        <InsumosTable
          rows={insumos}
          disabled={busy || loading}
          onReload={() => void load()}
          onError={setActionErr}
        />
      ) : null}

      <div className="mt-10 mb-4 flex items-center gap-3">
        <Calculator className="h-4 w-4 text-[var(--primary-navy)]/55" />
        <h2 className="text-serif-premium text-lg font-bold text-[var(--primary-navy)]">
          Matriz de costos por servicio
        </h2>
      </div>
      <p className="mb-6 text-xs text-[var(--text-muted)]">
        Costo directo = insumos + mano de obra. Precio sugerido = costo directo ÷ (1 − margen objetivo %).
        Los fijos <strong>no se suman al precio individual</strong>: se cubren con la contribución mensual del panel de arriba.
        Los precios de la web no cambian solos: usá &quot;Aplicar&quot;.
      </p>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-20 text-[var(--primary-navy)]/55">
          <Loader2 className="h-6 w-6 animate-spin" />
          Cargando matriz…
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-3xl border border-[var(--accent-rose)]/55 bg-[var(--bg-cream)]/95 shadow-xl"
          style={{ boxShadow: '0 24px 64px rgba(0,61,91,0.08)' }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-[1040px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--accent-rose)]/40 bg-gradient-to-r from-[#fffefd] to-[var(--bg-cream)]">
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary-navy)]/55">
                    Servicio
                  </th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary-navy)]/55">
                    Sesiones/mes
                  </th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary-navy)]/55">
                    Insumos
                  </th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary-navy)]/55">
                    M. obra
                  </th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary-navy)]/55">
                    Costo directo
                  </th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary-navy)]/55">
                    Precio actual
                  </th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary-navy)]/55">
                    Margen %
                  </th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary-navy)]/55">
                    Margen obj.
                  </th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary-navy)]/55">
                    Precio sugerido
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--accent-rose)]/35">
                {filas.map((f) => (
                  <ServicioCostoRowBlock
                    key={f.id}
                    fila={f}
                    insumos={insumos}
                    links={links.filter((l) => l.servicio_id === f.id)}
                    expanded={expandedId === f.id}
                    onToggle={() => setExpandedId((id) => (id === f.id ? null : f.id))}
                    disabled={busy}
                    onSaveFields={(fields) => void onSaveServicioFields(f.id, fields)}
                    onApply={(precio) => void onAplicarPrecio(f.id, precio)}
                    onLinkChange={async (insumoId, qty) => {
                      setActionErr(null);
                      const { error } = await setServicioInsumo(f.id, insumoId, qty);
                      if (error) setActionErr(error);
                      else await load();
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

const ESTADO_STYLES: Record<EstadoMensual, { bar: string; pill: string; chip: string; titulo: string; sub: string; Icon: typeof CheckCircle2 }> = {
  rojo: {
    bar: 'from-red-500 to-red-700',
    pill: 'bg-red-100 text-red-900',
    chip: 'border-red-300 bg-red-50',
    titulo: 'No cubrís los costos del mes',
    sub: 'Con la cantidad esperada de sesiones, la contribución no alcanza para pagar los fijos. Aumentá sesiones, subí precios o reducí costos.',
    Icon: XCircle,
  },
  amarillo: {
    bar: 'from-amber-400 to-amber-600',
    pill: 'bg-amber-100 text-amber-900',
    chip: 'border-amber-300 bg-amber-50',
    titulo: 'Justo cubrís costos — margen flaco',
    sub: 'Llegás a pagar los fijos pero queda poco de ganancia. Subir un poco las cantidades o márgenes te lleva a verde.',
    Icon: AlertTriangle,
  },
  verde: {
    bar: 'from-emerald-500 to-emerald-700',
    pill: 'bg-emerald-100 text-emerald-900',
    chip: 'border-emerald-300 bg-emerald-50',
    titulo: '¡Cubrís costos y generás ganancia!',
    sub: 'Tu contribución mensual está por encima de los fijos. Buen equilibrio entre precios y cantidad de sesiones.',
    Icon: CheckCircle2,
  },
};

function ResumenMensualPanel({ resumen }: { resumen: ResumenMensual }) {
  const s = ESTADO_STYLES[resumen.estado];
  const cobertura = resumen.cobertura_pct === null ? '—' : `${Math.min(999, Math.max(0, resumen.cobertura_pct)).toFixed(0)}%`;
  const barPctRaw = resumen.costos_fijos_total > 0
    ? (resumen.contribucion_total / resumen.costos_fijos_total) * 100
    : (resumen.contribucion_total > 0 ? 100 : 0);
  const barPct = Math.min(150, Math.max(0, barPctRaw));
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 rounded-3xl border ${s.chip} p-5 shadow-sm`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${s.pill}`}>
          <s.Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--primary-navy)]/45">
            Punto de equilibrio mensual
          </p>
          <h3 className="text-serif-premium mt-0.5 text-xl font-bold text-[var(--primary-navy)]">{s.titulo}</h3>
          <p className="mt-1 max-w-2xl text-xs text-[var(--text-muted)]">{s.sub}</p>

          <div className="mt-4 grid gap-3 text-xs sm:grid-cols-4">
            <ResumenChip label="Ingresos totales" value={formatPrecioArs(resumen.ingreso_total)} />
            <ResumenChip label="Costos variables" value={formatPrecioArs(resumen.costo_variable_total)} />
            <ResumenChip label="Contribución" value={formatPrecioArs(resumen.contribucion_total)} highlight />
            <ResumenChip
              label="Ganancia neta"
              value={formatPrecioArs(resumen.ganancia_neta)}
              tone={resumen.estado}
            />
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-[var(--primary-navy)]/55">
              <span>Cobertura de costos fijos</span>
              <span className="font-semibold tabular-nums text-[var(--primary-navy)]">{cobertura}</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/70">
              {/* línea 100% (break-even) */}
              <div
                className="absolute inset-y-0 z-10 w-px bg-[var(--primary-navy)]/40"
                style={{ left: '66.66%' }}
                title="Punto de equilibrio (100%)"
              />
              <motion.div
                layout
                className={`h-full bg-gradient-to-r ${s.bar}`}
                style={{ width: `${(barPct / 150) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${(barPct / 150) * 100}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[9px] text-[var(--text-muted)]">
              <span>0%</span>
              <span>100% (break-even)</span>
              <span>150%+</span>
            </div>
          </div>

          <p className="mt-3 text-[10px] text-[var(--text-muted)]">
            Fijos del mes: <strong className="text-[var(--primary-navy)]">{formatPrecioArs(resumen.costos_fijos_total)}</strong>{' '}
            · {resumen.sesiones_estimadas_total} sesiones en total.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ResumenChip({
  label,
  value,
  highlight,
  tone,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: EstadoMensual;
}) {
  const toneClass = tone
    ? tone === 'rojo'
      ? 'text-red-800'
      : tone === 'amarillo'
        ? 'text-amber-800'
        : 'text-emerald-800'
    : highlight
      ? 'text-[var(--primary-navy)]'
      : 'text-[var(--primary-navy)]/85';
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--primary-navy)]/45">{label}</p>
      <p className={`mt-0.5 font-bold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  );
}

function Kpi({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div
      className={`rounded-3xl border px-5 py-4 shadow-sm ${
        warn ? 'border-amber-300/80 bg-amber-50/90' : 'border-[var(--accent-rose)]/55 bg-[var(--bg-cream)]/95'
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--primary-navy)]/45">{label}</p>
      <p className={`text-serif-premium mt-1 text-2xl font-bold ${warn ? 'text-amber-950' : 'text-[var(--primary-navy)]'}`}>
        {value}
      </p>
    </div>
  );
}

function SectionToggle({
  open,
  onToggle,
  title,
  subtitle,
  className = '',
}: {
  open: boolean;
  onToggle: () => void;
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-start justify-between gap-3 rounded-2xl border border-[var(--primary-navy)]/10 bg-white/85 px-5 py-4 text-left ${className}`}
    >
      <div>
        <h3 className="text-serif-premium text-base font-bold text-[var(--primary-navy)]">{title}</h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p>
      </div>
      <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-[var(--primary-navy)]/55 transition ${open ? 'rotate-180' : ''}`} />
    </button>
  );
}

function CostosFijosTable({
  rows,
  disabled,
  onReload,
  onError,
}: {
  rows: CostoOperativoRow[];
  disabled: boolean;
  onReload: () => void;
  onError: (msg: string) => void;
}) {
  const [draft, setDraft] = useState({ concepto: '', monto: '', notas: '' });

  async function save(row: Partial<CostoOperativoRow> & { concepto: string }) {
    const { error } = await upsertCostoOperativo(row);
    if (error) onError(error);
    else onReload();
  }

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--accent-rose)]/50 bg-white/90">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b bg-[var(--bg-cream)] text-[10px] uppercase tracking-wide text-[var(--primary-navy)]/55">
            <th className="px-4 py-2 text-left">Concepto</th>
            <th className="px-4 py-2 text-right">$/mes</th>
            <th className="px-4 py-2 text-center">Activo</th>
            <th className="px-4 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <CostoFijoEditableRow key={r.id} row={r} disabled={disabled} onSave={save} onDelete={async () => {
              if (!window.confirm(`¿Eliminar "${r.concepto}"?`)) return;
              const { error } = await deleteCostoOperativo(r.id);
              if (error) onError(error);
              else onReload();
            }} />
          ))}
          <tr className="bg-[var(--bg-cream)]/80">
            <td className="px-4 py-2">
              <input
                value={draft.concepto}
                onChange={(e) => setDraft((d) => ({ ...d, concepto: e.target.value }))}
                placeholder="Ej. Alquiler local"
                className="w-full rounded-lg border border-[var(--primary-navy)]/10 px-2 py-1.5 text-sm"
              />
            </td>
            <td className="px-4 py-2">
              <input
                value={draft.monto}
                onChange={(e) => setDraft((d) => ({ ...d, monto: e.target.value }))}
                placeholder="0"
                className="w-full rounded-lg border border-[var(--primary-navy)]/10 px-2 py-1.5 text-right text-sm"
              />
            </td>
            <td />
            <td className="px-4 py-2 text-right">
              <button
                type="button"
                disabled={disabled || !draft.concepto.trim()}
                onClick={() => {
                  const m = parseInputNum(draft.monto) ?? 0;
                  void save({ concepto: draft.concepto, monto_mensual: m, activo: true, notas: draft.notas }).then(
                    () => setDraft({ concepto: '', monto: '', notas: '' })
                  );
                }}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-navy)] px-3 py-1.5 text-[10px] font-semibold uppercase text-white disabled:opacity-50"
              >
                <Plus className="h-3 w-3" /> Agregar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function CostoFijoEditableRow({
  row,
  disabled,
  onSave,
  onDelete,
}: {
  row: CostoOperativoRow;
  disabled: boolean;
  onSave: (r: Partial<CostoOperativoRow> & { concepto: string }) => Promise<void>;
  onDelete: () => void;
}) {
  const [concepto, setConcepto] = useState(row.concepto);
  const [monto, setMonto] = useState(String(row.monto_mensual));
  const [activo, setActivo] = useState(row.activo);

  return (
    <tr>
      <td className="px-4 py-2">
        <input
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
          className="w-full rounded-lg border border-[var(--primary-navy)]/10 px-2 py-1.5 text-sm"
        />
      </td>
      <td className="px-4 py-2">
        <input
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="w-full rounded-lg border border-[var(--primary-navy)]/10 px-2 py-1.5 text-right text-sm"
        />
      </td>
      <td className="px-4 py-2 text-center">
        <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
      </td>
      <td className="px-4 py-2 text-right">
        <div className="flex justify-end gap-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const m = parseInputNum(monto) ?? 0;
              void onSave({ id: row.id, concepto, monto_mensual: m, activo, notas: row.notas });
            }}
            className="rounded-full border px-2 py-1 text-[10px] font-semibold text-[var(--primary-navy)]"
          >
            <Save className="inline h-3 w-3" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="rounded-full border border-red-200 px-2 py-1 text-[10px] text-red-700"
          >
            <Trash2 className="inline h-3 w-3" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function InsumosTable({
  rows,
  disabled,
  onReload,
  onError,
}: {
  rows: InsumoRow[];
  disabled: boolean;
  onReload: () => void;
  onError: (msg: string) => void;
}) {
  const [draft, setDraft] = useState({ nombre: '', unidad: 'unidad', costo: '' });

  async function save(row: Partial<InsumoRow> & { nombre: string }) {
    const { error } = await upsertInsumo(row);
    if (error) onError(error);
    else onReload();
  }

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--accent-rose)]/50 bg-white/90">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b bg-[var(--bg-cream)] text-[10px] uppercase tracking-wide text-[var(--primary-navy)]/55">
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Unidad</th>
            <th className="px-4 py-2 text-right">Costo unit.</th>
            <th className="px-4 py-2 text-center">Activo</th>
            <th className="px-4 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <InsumoEditableRow
              key={r.id}
              row={r}
              disabled={disabled}
              onSave={save}
              onDelete={async () => {
                if (!window.confirm(`¿Eliminar insumo "${r.nombre}"?`)) return;
                const { error } = await deleteInsumo(r.id);
                if (error) onError(error);
                else onReload();
              }}
            />
          ))}
          <tr className="bg-[var(--bg-cream)]/80">
            <td className="px-4 py-2">
              <input
                value={draft.nombre}
                onChange={(e) => setDraft((d) => ({ ...d, nombre: e.target.value }))}
                placeholder="Ej. Crema radiofrecuencia"
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
              />
            </td>
            <td className="px-4 py-2">
              <input
                value={draft.unidad}
                onChange={(e) => setDraft((d) => ({ ...d, unidad: e.target.value }))}
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
              />
            </td>
            <td className="px-4 py-2">
              <input
                value={draft.costo}
                onChange={(e) => setDraft((d) => ({ ...d, costo: e.target.value }))}
                className="w-full rounded-lg border px-2 py-1.5 text-right text-sm"
              />
            </td>
            <td />
            <td className="px-4 py-2 text-right">
              <button
                type="button"
                disabled={disabled || !draft.nombre.trim()}
                onClick={() => {
                  const c = parseInputNum(draft.costo) ?? 0;
                  void save({
                    nombre: draft.nombre,
                    unidad: draft.unidad,
                    costo_por_unidad: c,
                    activo: true,
                  }).then(() => setDraft({ nombre: '', unidad: 'unidad', costo: '' }));
                }}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-navy)] px-3 py-1.5 text-[10px] font-semibold uppercase text-white"
              >
                <Plus className="h-3 w-3" /> Agregar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function InsumoEditableRow({
  row,
  disabled,
  onSave,
  onDelete,
}: {
  row: InsumoRow;
  disabled: boolean;
  onSave: (r: Partial<InsumoRow> & { nombre: string }) => Promise<void>;
  onDelete: () => void;
}) {
  const [nombre, setNombre] = useState(row.nombre);
  const [unidad, setUnidad] = useState(row.unidad);
  const [costo, setCosto] = useState(String(row.costo_por_unidad));
  const [activo, setActivo] = useState(row.activo);

  return (
    <tr>
      <td className="px-4 py-2">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full rounded-lg border px-2 py-1.5 text-sm" />
      </td>
      <td className="px-4 py-2">
        <input value={unidad} onChange={(e) => setUnidad(e.target.value)} className="w-full rounded-lg border px-2 py-1.5 text-sm" />
      </td>
      <td className="px-4 py-2">
        <input value={costo} onChange={(e) => setCosto(e.target.value)} className="w-full rounded-lg border px-2 py-1.5 text-right text-sm" />
      </td>
      <td className="px-4 py-2 text-center">
        <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
      </td>
      <td className="px-4 py-2 text-right">
        <div className="flex justify-end gap-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const c = parseInputNum(costo) ?? 0;
              void onSave({ id: row.id, nombre, unidad, costo_por_unidad: c, activo, proveedor: row.proveedor, notas: row.notas });
            }}
            className="rounded-full border px-2 py-1 text-[10px]"
          >
            <Save className="inline h-3 w-3" />
          </button>
          <button type="button" disabled={disabled} onClick={onDelete} className="rounded-full border border-red-200 px-2 py-1 text-[10px] text-red-700">
            <Trash2 className="inline h-3 w-3" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ServicioCostoRowBlock({
  fila,
  insumos,
  links,
  expanded,
  onToggle,
  disabled,
  onSaveFields,
  onApply,
  onLinkChange,
}: {
  fila: ReturnType<typeof calcularFilasCostos>[number];
  insumos: InsumoRow[];
  links: { insumo_id: string; cantidad: number }[];
  expanded: boolean;
  onToggle: () => void;
  disabled: boolean;
  onSaveFields: (fields: { margen?: number; manoObra?: number; cantidadMes?: number }) => void;
  onApply: (precio: number) => void;
  onLinkChange: (insumoId: string, qty: number) => Promise<void>;
}) {
  const [margenEdit, setMargenEdit] = useState(String(fila.margen_objetivo));
  const [manoEdit, setManoEdit] = useState(String(fila.costo_mano_obra));
  const [cantidadMesEdit, setCantidadMesEdit] = useState(String(fila.cantidad_estimada_mensual));
  const [cantidadSavedFlash, setCantidadSavedFlash] = useState(false);

  // Sincronizar inputs cuando la fila cambia desde el padre (post-save reload).
  useEffect(() => {
    setMargenEdit(String(fila.margen_objetivo));
  }, [fila.margen_objetivo]);
  useEffect(() => {
    setManoEdit(String(fila.costo_mano_obra));
  }, [fila.costo_mano_obra]);
  useEffect(() => {
    setCantidadMesEdit(String(fila.cantidad_estimada_mensual));
  }, [fila.cantidad_estimada_mensual]);

  const cantidadDirty =
    (parseInputNum(cantidadMesEdit) ?? -1) !== fila.cantidad_estimada_mensual;

  function commitCantidadMes() {
    const n = parseInputNum(cantidadMesEdit);
    if (n === null || n < 0) return;
    const rounded = Math.round(n);
    if (rounded === fila.cantidad_estimada_mensual) return;
    onSaveFields({ cantidadMes: rounded });
    setCantidadSavedFlash(true);
    window.setTimeout(() => setCantidadSavedFlash(false), 1200);
  }

  function bumpCantidad(delta: number) {
    const baseTipeada = parseInputNum(cantidadMesEdit);
    const base = baseTipeada !== null ? Math.round(baseTipeada) : fila.cantidad_estimada_mensual;
    const next = Math.max(0, base + delta);
    setCantidadMesEdit(String(next));
    if (next !== fila.cantidad_estimada_mensual) {
      onSaveFields({ cantidadMes: next });
      setCantidadSavedFlash(true);
      window.setTimeout(() => setCantidadSavedFlash(false), 1200);
    }
  }

  // Precio sugerido editable: lo inicializamos con el auto-calculado y permitimos override manual.
  const [precioSugeridoEdit, setPrecioSugeridoEdit] = useState(String(fila.precio_sugerido));
  const [precioSavedFlash, setPrecioSavedFlash] = useState(false);
  useEffect(() => {
    setPrecioSugeridoEdit(String(fila.precio_sugerido));
  }, [fila.precio_sugerido]);

  function applyPrecio() {
    const n = parseInputNum(precioSugeridoEdit);
    if (n === null || n <= 0) return;
    const rounded = roundMoneyClient(n);
    if (Math.abs(rounded - fila.precio) < 0.5) return;
    onApply(rounded);
    setPrecioSavedFlash(true);
    window.setTimeout(() => setPrecioSavedFlash(false), 1200);
  }

  // Warning rojo cuando hay sesiones esperadas pero el precio actual es 0 — la fila no contribuye al panel.
  const sesionesSinPrecio = fila.cantidad_estimada_mensual > 0 && fila.precio === 0;

  const margenColor =
    fila.margen_actual_pct === null
      ? 'text-[var(--text-muted)]'
      : fila.bajo_margen
        ? 'text-amber-800 font-semibold'
        : 'text-emerald-800';

  function saveMargenMano() {
    const m = parseInputNum(manoEdit);
    const mg = parseInputNum(margenEdit);
    if (m !== null && mg !== null) onSaveFields({ margen: mg, manoObra: m });
  }

  const precioSugeridoEditNum = parseInputNum(precioSugeridoEdit) ?? fila.precio_sugerido;
  const precioInputDirty = Math.abs(precioSugeridoEditNum - fila.precio) > 0.5;

  return (
    <>
      <tr
        className={`transition hover:bg-[#FFFDFB] ${!fila.activo ? 'opacity-50' : ''} ${
          sesionesSinPrecio ? 'bg-red-50/40' : ''
        }`}
      >
        <td className="px-4 py-3">
          <button type="button" onClick={onToggle} className="flex items-center gap-2 text-left font-semibold text-[var(--primary-navy)]">
            <ChevronDown className={`h-3.5 w-3.5 transition ${expanded ? 'rotate-180' : ''}`} />
            <span className="flex flex-col">
              <span className="flex items-center gap-1.5">
                {fila.nombre}
                {sesionesSinPrecio ? (
                  <AlertCircle
                    className="h-3.5 w-3.5 text-red-600"
                    aria-label="Tiene sesiones cargadas pero precio $0 — no suma al panel"
                  />
                ) : null}
              </span>
              <span className="text-[10px] font-normal text-[var(--text-muted)]">{fila.categoria_label}</span>
            </span>
          </button>
          {sesionesSinPrecio ? (
            <p className="mt-1 text-[10px] text-red-700">
              Tiene sesiones pero precio $0 → no aporta al resumen mensual.
            </p>
          ) : null}
        </td>

        <td className="px-3 py-3 text-center">
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => bumpCantidad(-1)}
              disabled={disabled}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--primary-navy)]/15 text-[var(--primary-navy)] hover:bg-[var(--primary-navy)]/5 disabled:opacity-40"
              title="Restar 1 sesión"
            >
              <Minus className="h-3 w-3" />
            </button>
            <div className="relative">
              <input
                type="number"
                min={0}
                value={cantidadMesEdit}
                onChange={(e) => setCantidadMesEdit(e.target.value)}
                onBlur={commitCantidadMes}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitCantidadMes();
                    (e.target as HTMLInputElement).blur();
                  }
                  if (e.key === 'Escape') {
                    setCantidadMesEdit(String(fila.cantidad_estimada_mensual));
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className={`w-14 rounded border px-1 py-1 text-center text-xs tabular-nums transition ${
                  cantidadSavedFlash
                    ? 'border-emerald-500 bg-emerald-50'
                    : cantidadDirty
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-[var(--primary-navy)]/15'
                }`}
                title="Sesiones esperadas / mes — Enter, blur o botones para guardar"
              />
              {cantidadSavedFlash ? (
                <CheckCircle2 className="absolute -right-4 top-1.5 h-3.5 w-3.5 text-emerald-600" />
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => bumpCantidad(1)}
              disabled={disabled}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--primary-navy)]/15 text-[var(--primary-navy)] hover:bg-[var(--primary-navy)]/5 disabled:opacity-40"
              title="Sumar 1 sesión"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </td>

        <td className="px-3 py-3 text-right tabular-nums text-[var(--text-muted)]">{formatPrecioArs(fila.costo_insumos)}</td>
        <td className="px-3 py-3 text-right">
          <input
            value={manoEdit}
            onChange={(e) => setManoEdit(e.target.value)}
            onBlur={saveMargenMano}
            className="w-20 rounded border border-[var(--primary-navy)]/10 px-1.5 py-1 text-right text-xs"
            title="Mano de obra por sesión"
          />
        </td>
        <td className="px-3 py-3 text-right font-semibold tabular-nums text-[var(--primary-navy)]">
          {formatPrecioArs(fila.costo_directo)}
        </td>
        <td className="px-3 py-3 text-right tabular-nums">{formatPrecioArs(fila.precio)}</td>
        <td className={`px-3 py-3 text-right tabular-nums ${margenColor}`}>
          {fila.margen_actual_pct === null ? (
            <span className="inline-flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> —
            </span>
          ) : (
            `${fila.margen_actual_pct.toFixed(1)}%`
          )}
        </td>
        <td className="px-3 py-3 text-center">
          <input
            value={margenEdit}
            onChange={(e) => setMargenEdit(e.target.value)}
            onBlur={saveMargenMano}
            className="w-14 rounded border border-[var(--primary-navy)]/10 px-1 py-1 text-center text-xs"
            title="Margen objetivo %"
          />
        </td>
        <td className="px-3 py-3 text-right">
          <div className="relative inline-flex items-center justify-end gap-1">
            <span className="text-[10px] text-[var(--text-muted)]">$</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={precioSugeridoEdit}
              disabled={disabled}
              onChange={(e) => setPrecioSugeridoEdit(e.target.value)}
              onBlur={applyPrecio}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyPrecio();
                  (e.target as HTMLInputElement).blur();
                }
                if (e.key === 'Escape') {
                  setPrecioSugeridoEdit(String(fila.precio_sugerido));
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className={`w-24 rounded border px-2 py-1 text-right text-xs tabular-nums font-semibold transition ${
                precioSavedFlash
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : precioInputDirty
                    ? 'border-amber-400 bg-amber-50 text-amber-900'
                    : 'border-[var(--primary-navy)]/10 text-[var(--primary-navy)]'
              }`}
              title="Tipeá un precio y apretá Enter o salí del campo para aplicarlo como nuevo precio del servicio. Esc para cancelar."
            />
            {precioSavedFlash ? (
              <CheckCircle2 className="absolute -right-5 h-3.5 w-3.5 text-emerald-600" />
            ) : null}
          </div>
        </td>
      </tr>
      {expanded ? (
        <tr className="bg-[var(--bg-cream)]/90">
          <td colSpan={9} className="px-6 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--primary-navy)]/55">
              Insumos por sesión
            </p>
            <div className="flex flex-wrap gap-3">
              {insumos
                .filter((i) => i.activo)
                .map((ins) => {
                  const link = links.find((l) => l.insumo_id === ins.id);
                  const qty = link?.cantidad ?? 0;
                  return (
                    <label
                      key={ins.id}
                      className="flex items-center gap-2 rounded-xl border border-[var(--accent-rose)]/60 bg-white px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-[var(--primary-navy)]">{ins.nombre}</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={qty || ''}
                        placeholder="0"
                        onChange={(e) => {
                          const v = parseInputNum(e.target.value) ?? 0;
                          void onLinkChange(ins.id, v);
                        }}
                        className="w-16 rounded border px-1 py-0.5 text-right"
                      />
                      <span className="text-[var(--text-muted)]">{ins.unidad}</span>
                    </label>
                  );
                })}
              {insumos.filter((i) => i.activo).length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">Agregá insumos en la sección de arriba.</p>
              ) : null}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
