import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, FileSignature, Loader2, ShieldCheck, X } from 'lucide-react';
import {
  CONSENTIMIENTO_CLAUSULAS,
  guardarConsentimientoCliente,
  type ConsentimientoRow,
} from '@/lib/consentimiento';

type Props = {
  clienteId: string;
  nombreSugerido?: string;
  onClose: () => void;
  onFirmado: (c: ConsentimientoRow) => void;
};

/**
 * Modal de consentimiento informado. El cliente acepta las cláusulas
 * obligatorias y firma con su nombre. Sin las 3 aceptaciones no puede guardar.
 */
export function ConsentimientoModal({ clienteId, nombreSugerido, onClose, onFirmado }: Props) {
  const [nombre, setNombre] = useState(nombreSugerido?.trim() ?? '');
  const [dni, setDni] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [contra, setContra] = useState('');
  const [checks, setChecks] = useState<Record<string, boolean>>({
    declara_salud: false,
    acepta_tratamiento: false,
    acepta_datos: false,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const todasAceptadas =
    checks.declara_salud && checks.acepta_tratamiento && checks.acepta_datos;
  const dniOk = dni.trim().length >= 6;
  const fechaNacOk = fechaNac.trim().length > 0;
  const puedeGuardar =
    todasAceptadas && nombre.trim().length >= 3 && dniOk && fechaNacOk && !saving;

  async function firmar() {
    if (!puedeGuardar) return;
    setSaving(true);
    setErr(null);
    const { consentimiento, error } = await guardarConsentimientoCliente({
      clienteId,
      nombreFirma: nombre,
      dni,
      fechaNacimiento: fechaNac,
      contraindicaciones: contra,
      declaraSalud: checks.declara_salud,
      aceptaTratamiento: checks.acepta_tratamiento,
      aceptaDatos: checks.acepta_datos,
    });
    setSaving(false);
    if (error || !consentimiento) {
      setErr(error ?? 'No se pudo guardar el consentimiento.');
      return;
    }
    onFirmado(consentimiento);
  }

  if (typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
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
        className="pointer-events-auto relative z-[10000] flex max-h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl shadow-2xl"
        style={{
          border: '1px solid rgba(242,215,213,0.75)',
          background: 'var(--bg-cream, #FDF8F5)',
          boxShadow: '0 32px 64px rgba(0,61,91,0.18)',
        }}
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="max-h-[94dvh] overflow-y-auto overscroll-contain p-5 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:p-8">
          <button
            type="button"
            className="absolute right-5 top-5 rounded-full p-2 text-[#003D5B]/45 hover:bg-[#F2D7D5]/45"
            onClick={() => !saving && onClose()}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-2 flex items-center gap-2.5">
            <div className="rounded-xl bg-[#003D5B] p-2">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-serif-premium text-xl font-bold text-[#003D5B]">
                Consentimiento informado
              </h2>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#003D5B]/45">
                Obligatorio antes de tu primer tratamiento
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-[#7A746E]">
            Para tu seguridad y la del centro, necesitamos que leas y aceptes las siguientes
            declaraciones antes de realizar cualquier tratamiento en Amore.
          </p>

          {/* Cláusulas */}
          <div className="mt-5 space-y-3">
            {CONSENTIMIENTO_CLAUSULAS.map((cl) => {
              const checked = !!checks[cl.key];
              return (
                <button
                  key={cl.key}
                  type="button"
                  onClick={() => setChecks((s) => ({ ...s, [cl.key]: !s[cl.key] }))}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                    checked
                      ? 'border-[#BFC9A2]/70 bg-[#BFC9A2]/12'
                      : 'border-[#F2D7D5]/70 bg-white/85 hover:bg-[#F2D7D5]/15'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                      checked ? 'border-[#003D5B] bg-[#003D5B]' : 'border-[#003D5B]/30 bg-white'
                    }`}
                  >
                    {checked ? <CheckCircle2 className="h-4 w-4 text-white" /> : null}
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold text-[#003D5B]">{cl.titulo}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[#7A746E]">{cl.texto}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Contraindicaciones declaradas */}
          <label className="mt-5 block">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#003D5B]/55">
              ¿Alguna condición de salud que debamos saber? (opcional)
            </span>
            <textarea
              value={contra}
              onChange={(e) => setContra(e.target.value)}
              rows={2}
              placeholder="Ej: embarazo, alergias, medicación, cirugías recientes…"
              className="mt-1 w-full resize-none rounded-xl border border-[#F2D7D5]/75 bg-white px-3 py-2 text-sm text-[#003D5B] outline-none"
            />
          </label>

          {/* Firma */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#003D5B]/55">
                Nombre completo (firma) *
              </span>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre y apellido"
                className="mt-1 w-full rounded-xl border border-[#F2D7D5]/75 bg-white px-3 py-2 text-sm text-[#003D5B] outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#003D5B]/55">
                DNI *
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ej: 30123456"
                className="mt-1 w-full rounded-xl border border-[#F2D7D5]/75 bg-white px-3 py-2 text-sm text-[#003D5B] outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#003D5B]/55">
                Fecha de nacimiento *
              </span>
              <input
                type="date"
                value={fechaNac}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setFechaNac(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#F2D7D5]/75 bg-white px-3 py-2 text-sm text-[#003D5B] outline-none"
              />
            </label>
          </div>

          {err ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">
              {err}
            </p>
          ) : null}

          <motion.button
            type="button"
            disabled={!puedeGuardar}
            whileTap={{ scale: puedeGuardar ? 0.98 : 1 }}
            onClick={() => void firmar()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white disabled:pointer-events-none disabled:opacity-40"
            style={{
              background: 'linear-gradient(90deg, #BFC9A2 0%, #003D5B 100%)',
              boxShadow: '0 14px 32px rgba(0,61,91,0.2)',
            }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />}
            {saving ? 'Guardando…' : 'Acepto y firmo el consentimiento'}
          </motion.button>

          {!todasAceptadas ? (
            <p className="mt-3 text-center text-[11px] text-[#7A746E]">
              Tocá las tres declaraciones para aceptarlas.
            </p>
          ) : nombre.trim().length < 3 ? (
            <p className="mt-3 text-center text-[11px] text-[#7A746E]">
              Escribí tu nombre completo como firma.
            </p>
          ) : !dniOk ? (
            <p className="mt-3 text-center text-[11px] text-[#7A746E]">
              Ingresá tu número de DNI.
            </p>
          ) : !fechaNacOk ? (
            <p className="mt-3 text-center text-[11px] text-[#7A746E]">
              Indicá tu fecha de nacimiento.
            </p>
          ) : null}

          <p className="mt-4 text-center text-[10px] leading-relaxed text-[#7A746E]">
            Al firmar dejás constancia digital con fecha y hora. Podés solicitar una copia en recepción.
          </p>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
