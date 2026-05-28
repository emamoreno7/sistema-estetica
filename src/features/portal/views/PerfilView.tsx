import { motion } from 'framer-motion';
import { Bell, Download, Heart, Mail, MapPin, Phone, Shield, Star, Stethoscope } from 'lucide-react';
import { usePortalCliente } from '@/context/PortalClienteContext';

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
                Ficha Médica & Consentimientos
              </h3>
              <p className="text-[11px] text-[#7A746E]">Tu información de salud, protegida y confidencial</p>
            </div>
            <span className="ml-auto rounded-full bg-[#F2D7D5]/35 px-3 py-1 text-[10px] font-semibold text-[#003D5B]">
              En preparación
            </span>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <p className="text-center text-sm leading-relaxed text-[#7A746E]">
            Cuando carguemos tu ficha después de tu primera sesión aparecerán acá tus datos sanitarios relevantes,
            declaraciones firmadas y documentación asociada a tu tratamiento.
          </p>

          <div className="rounded-xl border border-dashed border-champagne-200 bg-champagne-50/40 px-4 py-8 text-center">
            <Shield className="mx-auto mb-2 h-6 w-6 text-champagne" />
            <p className="text-xs text-[#7A746E]">
              No hay consentimientos digitales en el portal hasta que recepción confirme tu plan activo.
            </p>
          </div>

          <p className="text-center text-[10px] leading-relaxed text-[#7A746E]">
            Tu información médica es estrictamente confidencial y solo es accesible por tu profesional tratante.
            <br />
            Cumplimos con la Ley de Protección de Datos Personales vigente.
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
    </div>
  );
}
