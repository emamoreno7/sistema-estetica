import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  Download,
  FileSignature,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldAlert,
  Star,
  Stethoscope,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { usePortalCliente } from '@/context/PortalClienteContext';
import { useConsentimiento } from '@/context/ConsentimientoContext';
import { useAuth } from '@/context/AuthContext';
import { ConsentimientoModal } from '@/components/portal/ConsentimientoModal';

export function PerfilView() {
  const {
    activeTreatment,
    displayName,
    greetingName,
    photoUrl,
    emailShown,
    phoneDisplay,
    memberSinceLabel,
    loyaltyPoints,
    tratamientoInteresLabel,
  } = usePortalCliente();

  const { session } = useAuth();
  const uid = session?.user?.id ?? '';
  const { consentimiento, firmado, loading: consentLoading, noMigrado, setConsentimiento } =
    useConsentimiento();
  const [consentOpen, setConsentOpen] = useState(false);

  const sucursalHint =
    activeTreatment?.sucursal ?? 'Coordinamos sucursal y horarios en recepción o por WhatsApp';

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong relative overflow-hidden rounded-2xl p-6 lg:p-8"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-[#F2D7D5] to-[#BFC9A2] opacity-60" />
        <div className="relative flex flex-col items-center gap-5 sm:flex-row">
          <div className="relative">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt=""
                className="h-20 w-20 rounded-2xl border-4 border-champagne-200 object-cover shadow-lg"
              />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-champagne-200 bg-gradient-to-br from-[#F2D7D5]/80 to-[#BFC9A2]/80 text-2xl font-bold text-[#003D5B] shadow-lg"
                aria-hidden
              >
                {greetingName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-br from-[#F2D7D5] to-[#BFC9A2] p-1.5">
              <Shield className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-serif-premium text-xl font-bold text-[#003D5B]">{displayName}</h2>
            <p className="text-xs text-[#7A746E]">Cliente Amore • Miembro desde {memberSinceLabel}</p>
            {tratamientoInteresLabel ? (
              <p className="mt-2 text-xs text-[#003D5B]/80">
                Tu interés: <span className="font-semibold">{tratamientoInteresLabel}</span>
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              {emailShown ? (
                <div className="flex items-center gap-1.5 text-xs text-[#7A746E]">
                  <Mail className="h-3.5 w-3.5 text-[#003D5B]" /> {emailShown}
                </div>
              ) : null}
              {phoneDisplay ? (
                <div className="flex items-center gap-1.5 text-xs text-[#7A746E]">
                  <Phone className="h-3.5 w-3.5 text-[#003D5B]" /> {phoneDisplay}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-xl font-bold text-champagne">{activeTreatment ? 1 : 0}</p>
              <p className="text-[10px] text-[#7A746E]">Activos</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-[#003D5B]">0</p>
              <p className="text-[10px] text-[#7A746E]">Sesiones</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold bg-gradient-to-r from-[#F2D7D5] to-[#BFC9A2] bg-clip-text text-transparent">
                {loyaltyPoints}
              </p>
              <p className="text-[10px] text-[#7A746E]">Puntos</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong overflow-hidden rounded-2xl"
      >
        <div className="border-b border-champagne-200 bg-gradient-to-r from-champagne-50 to-transparent px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F2D7D5] to-[#BFC9A2] shadow-sm">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-serif-premium text-base font-bold text-[#003D5B]">
                Consentimiento informado
              </h3>
              <p className="text-[11px] text-[#7A746E]">Obligatorio antes de realizar tratamientos</p>
            </div>
            {consentLoading ? (
              <Loader2 className="ml-auto h-4 w-4 animate-spin text-[#003D5B]/50" />
            ) : firmado ? (
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#BFC9A2]/35 px-3 py-1 text-[10px] font-semibold text-[#003D5B]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Firmado
              </span>
            ) : (
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold text-amber-900">
                <ShieldAlert className="h-3.5 w-3.5" /> Pendiente
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4 p-6">
          {firmado && consentimiento ? (
            <>
              <div className="flex items-start gap-3 rounded-xl border border-[#BFC9A2]/45 bg-[#BFC9A2]/10 px-4 py-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#4A6741]" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#003D5B]">
                    Consentimiento firmado correctamente
                  </p>
                  <p className="mt-0.5 text-xs text-[#7A746E]">
                    Firmado por <strong>{consentimiento.nombre_firma}</strong>
                    {consentimiento.firmado_at
                      ? ` · ${format(new Date(consentimiento.firmado_at), "d 'de' MMMM yyyy", { locale: es })}`
                      : ''}
                  </p>
                  {consentimiento.contraindicaciones ? (
                    <p className="mt-1 text-xs italic text-[#7A746E]/85">
                      Observaciones declaradas: {consentimiento.contraindicaciones}
                    </p>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConsentOpen(true)}
                className="w-full rounded-full border border-[#003D5B]/15 bg-white/70 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#003D5B]"
              >
                Volver a revisar / actualizar
              </button>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-5 text-center">
                <ShieldAlert className="mx-auto mb-2 h-6 w-6 text-amber-600" />
                <p className="text-sm font-semibold text-amber-950">
                  Todavía no firmaste el consentimiento
                </p>
                <p className="mt-1 text-xs text-amber-900/80">
                  Es un paso obligatorio y necesario para poder reservar y realizar tus tratamientos.
                </p>
              </div>
              <button
                type="button"
                disabled={!uid || noMigrado}
                onClick={() => setConsentOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-lg disabled:opacity-50"
                style={{ background: '#003D5B', boxShadow: '0 10px 28px rgba(0,61,91,0.18)' }}
              >
                <FileSignature className="h-4 w-4" />
                Leer y firmar consentimiento
              </button>
              {noMigrado ? (
                <p className="text-center text-[10px] text-amber-700">
                  (El módulo de consentimientos aún no está habilitado en el servidor.)
                </p>
              ) : null}
            </>
          )}

          <p className="text-center text-[10px] leading-relaxed text-[#7A746E]">
            Tu información médica es estrictamente confidencial y solo es accesible por tu profesional tratante.
            <br />
            Cumplimos con la Ley 25.326 de Protección de Datos Personales.
          </p>
        </div>
      </motion.div>

      <div>
        <h3 className="text-serif-premium mb-3 text-base font-bold text-[#003D5B]">Configuración</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: Shield, title: 'Seguridad', desc: 'Contraseña y verificación' },
            { icon: Bell, title: 'Notificaciones', desc: 'Recordatorios de turnos' },
            { icon: Star, title: 'Programa de Fidelidad', desc: 'Canjeá puntos cuando actives tratamientos' },
            { icon: MapPin, title: 'Sucursal Preferida', desc: sucursalHint },
            { icon: Heart, title: 'Favoritos', desc: 'Tratamientos guardados' },
            { icon: Download, title: 'Mis Documentos', desc: 'Consentimientos e historial' },
          ].map((item, i) => (
            <motion.button
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              whileHover={{ y: -2 }}
              className="glass group flex items-start gap-4 rounded-2xl p-5 text-left transition-all hover:shadow-md"
            >
              <div className="rounded-xl bg-gradient-to-br from-champagne-50 to-transparent p-3 transition-colors group-hover:bg-champagne-100">
                <item.icon className="h-5 w-5 text-champagne" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#003D5B]">{item.title}</h3>
                <p className="mt-0.5 text-xs text-[#7A746E]">{item.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {consentOpen && uid ? (
          <ConsentimientoModal
            clienteId={uid}
            nombreSugerido={displayName}
            onClose={() => setConsentOpen(false)}
            onFirmado={(c) => {
              setConsentimiento(c);
              setConsentOpen(false);
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
