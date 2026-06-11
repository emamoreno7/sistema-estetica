import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ClipboardList,
  Loader2,
  Plus,
  ShieldCheck,
  Stethoscope,
  Trash2,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { es as esLocale } from 'date-fns/locale';
import {
  ANAMNESIS_PREGUNTAS,
  agregarFichaSesion,
  eliminarFichaSesion,
  fetchFichaClinica,
  guardarFichaClinica,
  listFichaSesiones,
  type AnamnesisKey,
  type FichaClinica,
  type FichaSesion,
} from '@/lib/fichaClinica';
import {
  consentimientoEstaFirmado,
  fetchConsentimientoCliente,
  guardarConsentimientoCliente,
  type ConsentimientoRow,
} from '@/lib/consentimiento';

type Props = {
  clienteId: string;
  clienteNombre: string;
  /** true = vista admin (puede gestionar sesiones y registrar consentimiento walk-in). */
  isAdmin?: boolean;
  onClose: () => void;
};

const EMPTY_FICHA = (clienteId: string): FichaClinica => ({
  cliente_id: clienteId,
  toma_liquido: null,
  toma_anticonceptivos: null,
  periodos_regulares: null,
  fuma: null,
  menopausia: null,
  actividad_fisica: null,
  intervenciones_quirurgicas: null,
  hijos: null,
  medicamentos: null,
  alergias: null,
  observaciones: null,
  tratamiento_comprende: null,
  updated_at: null,
  updated_por_admin: false,
});

function TriState({
  value,
  onChange,
  disabled,
}: {
  value: boolean | null;
  onChange: (v: boolean | null) => void;
  disabled?: boolean;
}) {
  const opt = (v: boolean | null, label: string) => {
    const active = value === v;
    return (
      <button
        key={label}
        type="button"
        disabled={disabled}
        onClick={() => onChange(active && v !== null ? null : v)}
        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${
          active
            ? v === true
              ? 'bg-emerald-600 text-white'
              : v === false
                ? 'bg-red-500 text-white'
                : 'bg-[var(--primary-navy)] text-white'
            : 'border border-[var(--primary-navy)]/15 bg-white text-[var(--primary-navy)]/70'
        }`}
      >
        {label}
      </button>
    );
  };
  return (
    <div className="flex gap-1.5">
      {opt(true, 'Sí')}
      {opt(false, 'No')}
    </div>
  );
}

const fieldCls =
  'mt-1 w-full rounded-xl border border-[var(--accent-rose)]/75 bg-white px-3 py-2 text-sm text-[var(--primary-navy)] outline-none';
const labelCls = 'text-[10px] font-semibold uppercase tracking-wider text-[var(--primary-navy)]/55';

export function FichaClinicaModal({ clienteId, clienteNombre, isAdmin = false, onClose }: Props) {
  const [ficha, setFicha] = useState<FichaClinica>(() => EMPTY_FICHA(clienteId));
  const [sesiones, setSesiones] = useState<FichaSesion[]>([]);
  const [consent, setConsent] = useState<ConsentimientoRow | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [noMigrado, setNoMigrado] = useState(false);

  // Nueva sesión (admin)
  const [nsFecha, setNsFecha] = useState('');
  const [nsTrat, setNsTrat] = useState('');
  const [nsOper, setNsOper] = useState('');
  const [addingSesion, setAddingSesion] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const [fRes, sRes, cRes] = await Promise.all([
      fetchFichaClinica(clienteId),
      listFichaSesiones(clienteId),
      fetchConsentimientoCliente(clienteId),
    ]);
    if (fRes.error === 'NO_MIGRADO' || sRes.error === 'NO_MIGRADO') setNoMigrado(true);
    setFicha(fRes.ficha ?? EMPTY_FICHA(clienteId));
    setSesiones(sRes.sesiones);
    setConsent(cRes.consentimiento);
    setLoading(false);
  }, [clienteId]);

  useEffect(() => {
    void load();
  }, [load]);

  const consentFirmado = useMemo(() => consentimientoEstaFirmado(consent), [consent]);

  function setF<K extends keyof FichaClinica>(key: K, value: FichaClinica[K]) {
    setFicha((f) => ({ ...f, [key]: value }));
    setSavedOk(false);
  }

  async function guardar() {
    setSaving(true);
    setErr(null);
    const { ficha: saved, error } = await guardarFichaClinica(
      clienteId,
      {
        toma_liquido: ficha.toma_liquido,
        toma_anticonceptivos: ficha.toma_anticonceptivos,
        periodos_regulares: ficha.periodos_regulares,
        fuma: ficha.fuma,
        menopausia: ficha.menopausia,
        actividad_fisica: ficha.actividad_fisica,
        intervenciones_quirurgicas: ficha.intervenciones_quirurgicas,
        hijos: ficha.hijos,
        medicamentos: ficha.medicamentos,
        alergias: ficha.alergias,
        observaciones: ficha.observaciones,
        tratamiento_comprende: ficha.tratamiento_comprende,
      },
      { porAdmin: isAdmin }
    );
    setSaving(false);
    if (error || !saved) {
      setErr(error ?? 'No se pudo guardar la ficha.');
      return;
    }
    setFicha(saved);
    setSavedOk(true);
  }

  async function addSesion() {
    if (!nsTrat.trim() && !nsFecha) return;
    setAddingSesion(true);
    setErr(null);
    const nro = (sesiones.reduce((max, s) => Math.max(max, s.nro ?? 0), 0) || 0) + 1;
    const { sesion, error } = await agregarFichaSesion({
      clienteId,
      nro,
      fecha: nsFecha || null,
      tratamiento: nsTrat.trim() || null,
      operador: nsOper.trim() || null,
    });
    setAddingSesion(false);
    if (error || !sesion) {
      setErr(error ?? 'No se pudo agregar la sesión.');
      return;
    }
    setSesiones((prev) => [...prev, sesion]);
    setNsFecha('');
    setNsTrat('');
    setNsOper('');
  }

  async function delSesion(id: string) {
    if (!window.confirm('¿Eliminar esta sesión del historial?')) return;
    const { error } = await eliminarFichaSesion(id);
    if (error) {
      setErr(error);
      return;
    }
    setSesiones((prev) => prev.filter((s) => s.id !== id));
  }

  /** Admin registra consentimiento firmado en papel (walk-in / presencial). */
  async function registrarConsentimientoPapel() {
    if (
      !window.confirm(
        `Vas a registrar que ${clienteNombre} firmó el consentimiento informado (en papel/presencial). ¿Confirmás?`
      )
    )
      return;
    setSaving(true);
    setErr(null);
    const { consentimiento, error } = await guardarConsentimientoCliente({
      clienteId,
      nombreFirma: clienteNombre,
      declaraSalud: true,
      aceptaTratamiento: true,
      aceptaDatos: true,
      firmadoPorAdmin: true,
    });
    setSaving(false);
    if (error || !consentimiento) {
      setErr(error ?? 'No se pudo registrar el consentimiento.');
      return;
    }
    setConsent(consentimiento);
  }

  if (typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0,61,91,0.45)' }}
        onClick={() => !saving && onClose()}
      />
      <motion.div
        className="pointer-events-auto relative z-[9999] flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl shadow-2xl"
        style={{
          border: '1px solid rgba(242,215,213,0.75)',
          background: 'var(--bg-cream, var(--bg-cream))',
          boxShadow: '0 32px 64px rgba(0,61,91,0.2)',
        }}
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[var(--accent-rose)]/60 bg-gradient-to-r from-[#fffefd] to-[var(--bg-cream)] px-5 py-4 sm:px-7">
          <div className="rounded-xl bg-[var(--primary-navy)] p-2">
            <ClipboardList className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-serif-premium text-lg font-bold text-[var(--primary-navy)]">Ficha clínica</h2>
            <p className="truncate text-xs text-[var(--text-muted)]">{clienteNombre}</p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-[var(--primary-navy)]/45 hover:bg-[var(--accent-rose)]/45"
            onClick={() => !saving && onClose()}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-[var(--primary-navy)]/55">
              <Loader2 className="h-6 w-6 animate-spin" /> Cargando ficha…
            </div>
          ) : (
            <div className="space-y-6">
              {noMigrado ? (
                <p className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  El módulo de ficha clínica aún no está habilitado en el servidor. Aplicá la migración 019 en Supabase.
                </p>
              ) : null}

              {/* Consentimiento */}
              <section className="rounded-2xl border border-[var(--accent-rose)]/70 bg-white/70 p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[var(--primary-navy)]" />
                  <h3 className="text-sm font-bold text-[var(--primary-navy)]">Consentimiento informado</h3>
                  {consentFirmado ? (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--accent-sage)]/35 px-2.5 py-0.5 text-[10px] font-semibold text-[var(--primary-navy)]">
                      <CheckCircle2 className="h-3 w-3" /> Firmado
                    </span>
                  ) : (
                    <span className="ml-auto rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-900">
                      Pendiente
                    </span>
                  )}
                </div>
                {consentFirmado && consent ? (
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    Firmado por <strong>{consent.nombre_firma}</strong>
                    {consent.firmado_at
                      ? ` · ${format(new Date(consent.firmado_at), "d MMM yyyy", { locale: esLocale })}`
                      : ''}
                    {consent.firmado_por_admin ? ' · registrado por recepción' : ''}
                  </p>
                ) : isAdmin ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void registrarConsentimientoPapel()}
                    className="mt-3 rounded-full bg-[var(--primary-navy)] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-white disabled:opacity-50"
                  >
                    Registrar consentimiento (firmado en papel)
                  </button>
                ) : (
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    Aún sin firmar. Podés hacerlo desde tu perfil.
                  </p>
                )}
              </section>

              {/* Anamnesis */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-[var(--primary-navy)]" />
                  <h3 className="text-sm font-bold text-[var(--primary-navy)]">Cuestionario de salud</h3>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {ANAMNESIS_PREGUNTAS.map((q) => (
                    <div
                      key={q.key}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--accent-rose)]/60 bg-white/70 px-3 py-2.5"
                    >
                      <span className="text-[13px] text-[var(--primary-navy)]">{q.label}</span>
                      <TriState
                        value={ficha[q.key as AnamnesisKey]}
                        onChange={(v) => setF(q.key as AnamnesisKey, v)}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Antecedentes */}
              <section className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className={labelCls}>Intervenciones quirúrgicas</span>
                  <input
                    className={fieldCls}
                    value={ficha.intervenciones_quirurgicas ?? ''}
                    onChange={(e) => setF('intervenciones_quirurgicas', e.target.value || null)}
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Hijos</span>
                  <input
                    className={fieldCls}
                    value={ficha.hijos ?? ''}
                    onChange={(e) => setF('hijos', e.target.value || null)}
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Medicamentos</span>
                  <input
                    className={fieldCls}
                    value={ficha.medicamentos ?? ''}
                    onChange={(e) => setF('medicamentos', e.target.value || null)}
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Alergias</span>
                  <input
                    className={fieldCls}
                    value={ficha.alergias ?? ''}
                    onChange={(e) => setF('alergias', e.target.value || null)}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className={labelCls}>Observaciones</span>
                  <textarea
                    rows={2}
                    className={`${fieldCls} resize-none`}
                    value={ficha.observaciones ?? ''}
                    onChange={(e) => setF('observaciones', e.target.value || null)}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className={labelCls}>Su tratamiento comprende</span>
                  <textarea
                    rows={3}
                    className={`${fieldCls} resize-none`}
                    placeholder="Plan de tratamiento acordado con el cliente…"
                    value={ficha.tratamiento_comprende ?? ''}
                    onChange={(e) => setF('tratamiento_comprende', e.target.value || null)}
                  />
                </label>
              </section>

              {/* Historial de sesiones */}
              <section>
                <h3 className="mb-3 text-sm font-bold text-[var(--primary-navy)]">Historial de sesiones</h3>
                <div className="overflow-hidden rounded-2xl border border-[var(--accent-rose)]/60">
                  <table className="min-w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[var(--bg-cream)] text-[var(--primary-navy)]/55">
                        <th className="px-3 py-2 font-semibold">Nº</th>
                        <th className="px-3 py-2 font-semibold">Fecha</th>
                        <th className="px-3 py-2 font-semibold">Tratamiento</th>
                        <th className="px-3 py-2 font-semibold">Operador</th>
                        {isAdmin ? <th className="px-3 py-2" /> : null}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--accent-rose)]/40">
                      {sesiones.map((s) => (
                        <tr key={s.id} className="bg-white/70">
                          <td className="px-3 py-2 tabular-nums text-[var(--primary-navy)]">{s.nro ?? '—'}</td>
                          <td className="px-3 py-2 text-[var(--text-muted)]">
                            {s.fecha
                              ? format(new Date(s.fecha + 'T12:00:00'), 'd MMM yyyy', { locale: esLocale })
                              : '—'}
                          </td>
                          <td className="px-3 py-2 text-[var(--primary-navy)]">{s.tratamiento ?? '—'}</td>
                          <td className="px-3 py-2 text-[var(--text-muted)]">{s.operador ?? '—'}</td>
                          {isAdmin ? (
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => void delSesion(s.id)}
                                className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                                aria-label="Eliminar sesión"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          ) : null}
                        </tr>
                      ))}
                      {sesiones.length === 0 ? (
                        <tr>
                          <td colSpan={isAdmin ? 5 : 4} className="px-3 py-5 text-center text-[var(--text-muted)]">
                            Sin sesiones registradas todavía.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>

                {isAdmin ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-[auto_1fr_1fr_auto]">
                    <input
                      type="date"
                      value={nsFecha}
                      onChange={(e) => setNsFecha(e.target.value)}
                      className="rounded-xl border border-[var(--accent-rose)]/75 bg-white px-3 py-2 text-sm text-[var(--primary-navy)] outline-none"
                    />
                    <input
                      type="text"
                      value={nsTrat}
                      onChange={(e) => setNsTrat(e.target.value)}
                      placeholder="Tratamiento"
                      className="rounded-xl border border-[var(--accent-rose)]/75 bg-white px-3 py-2 text-sm text-[var(--primary-navy)] outline-none"
                    />
                    <input
                      type="text"
                      value={nsOper}
                      onChange={(e) => setNsOper(e.target.value)}
                      placeholder="Operador"
                      className="rounded-xl border border-[var(--accent-rose)]/75 bg-white px-3 py-2 text-sm text-[var(--primary-navy)] outline-none"
                    />
                    <button
                      type="button"
                      disabled={addingSesion}
                      onClick={() => void addSesion()}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent-sage)] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--primary-navy)] disabled:opacity-50"
                    >
                      {addingSesion ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      Agregar
                    </button>
                  </div>
                ) : null}
              </section>

              {err ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{err}</p>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading ? (
          <div className="flex items-center gap-3 border-t border-[var(--accent-rose)]/60 bg-white/60 px-5 py-3 sm:px-7">
            {savedOk ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A6741]">
                <CheckCircle2 className="h-4 w-4" /> Ficha guardada
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => !saving && onClose()}
              className="ml-auto rounded-full border border-[var(--primary-navy)]/15 bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--primary-navy)]"
            >
              Cerrar
            </button>
            <button
              type="button"
              disabled={saving || noMigrado}
              onClick={() => void guardar()}
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg, var(--accent-sage) 0%, var(--primary-navy) 100%)' }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Guardar ficha
            </button>
          </div>
        ) : null}
      </motion.div>
    </motion.div>,
    document.body
  );
}
