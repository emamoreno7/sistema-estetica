import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Loader2 } from 'lucide-react';
import type { PostgrestError } from '@supabase/supabase-js';
import { PERFIL_CLIENTE_SELECT_COLUMNS, PERFILES_CLIENTES_TABLE } from '@/lib/perfilCliente';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { fetchActiveServiceNames } from '@/lib/serviciosDb';
import { getAllServiceNames } from '@/data/serviciosCatalogo';
import { normalizePhoneAR } from '@/lib/authPhoneEmail';

function formatInsertPerfilMessage(err: { message?: string; code?: string }): string {
  const m = (err.message ?? '').toLowerCase();
  if (m.includes('row-level security') || m.includes('rls')) {
    return 'No se pudo guardar tu ficha por las reglas de seguridad (RLS). Revisá las políticas INSERT en public.perfiles_clientes.';
  }
  return err.message ?? 'No se pudo guardar tu perfil en Supabase.';
}

/** Si el trigger ya insertó la misma PK, lo tratamos como éxito. */
function isDuplicateInsert(err: PostgrestError): boolean {
  const m = `${err.message}\n${err.details ?? ''}`.toLowerCase();
  const c = String(err.code ?? '');
  return c === '23505' || m.includes('duplicate') || m.includes('unique violation');
}

function isValidEmail(raw: string): boolean {
  const t = raw.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

type Props = {
  onSuccess: () => void;
};

export default function ClientSignupForm({ onSuccess }: Props) {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [servicios, setServicios] = useState<string[]>(() => getAllServiceNames());

  useEffect(() => {
    let alive = true;
    void (async () => {
      const names = await fetchActiveServiceNames();
      if (alive) setServicios(names);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const inputClass =
    'w-full rounded-2xl border border-[#003D5B]/12 bg-white/90 px-4 py-3.5 text-sm text-[#003D5B] outline-none transition placeholder:text-[#003D5B]/35 focus:border-[#003D5B]/28 focus:ring-2 focus:ring-[#F2D7D5]/80';

  /**
   * Sólo columnas presentes en la tabla: id, full_name, phone, status.
   */
  async function insertPerfilCliente(opts: {
    userId: string;
    nombre: string;
    telefono: string;
  }): Promise<PostgrestError | null> {
    const tabla = 'perfiles_clientes' as const;

    const { error } = await supabase.from(tabla).insert([
      {
        id: opts.userId,
        full_name: opts.nombre,
        phone: opts.telefono,
        status: 'pending',
      },
    ]);

    if (!error) return null;
    if (isDuplicateInsert(error)) return null;
    return error;
  }

  async function waitUntilPerfilExists(userId: string, maxAttempts = 8): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      const { data } = await supabase
        .from(PERFILES_CLIENTES_TABLE)
        .select(PERFIL_CLIENTE_SELECT_COLUMNS)
        .eq('id', userId)
        .maybeSingle();
      if (data?.id) return true;
      await new Promise(r => setTimeout(r, 200));
    }
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nombreCompleto.trim() || nombreCompleto.trim().length < 3) {
      setError('Ingresá tu nombre completo.');
      return;
    }
    const emailNorm = email.trim().toLowerCase();
    if (!isValidEmail(emailNorm)) {
      setError('Ingresá un correo válido.');
      return;
    }
    const tel = normalizePhoneAR(telefono);
    if (tel.replace(/\D/g, '').length < 10) {
      setError('Ingresá un número de WhatsApp válido (con código de área).');
      return;
    }
    if (!tratamiento) {
      setError('Elegí un tratamiento de interés.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (!isSupabaseConfigured) {
      setError(
        'Falta configurar Supabase en el build. Revisá la consola del navegador (F12) y las variables VITE_SUPABASE_* .'
      );
      return;
    }

    setBusy(true);
    const fullName = nombreCompleto.trim();

    try {
      const { data, error: signErr } = await supabase.auth.signUp({
        email: emailNorm,
        password,
        options: {
          data: {
            full_name: fullName,
            nombre_completo: fullName,
            phone: tel,
            telefono_whatsapp: tel,
            tratamiento_interes: tratamiento,
          },
        },
      });

      if (signErr) {
        setError(signErr.message);
        setBusy(false);
        return;
      }

      const user = data.user ?? data.session?.user;
      if (!user?.id) {
        setError(
          'No pudimos obtener tu usuario tras registrarte. Volvé a intentar o iniciá sesión si la cuenta ya quedó creada.'
        );
        setBusy(false);
        return;
      }

      if (!data.session) {
        setError(
          'El alta fue registrada pero no hay sesión activa (revisá en Supabase que la confirmación de email esté desactivada para clientes). Podés iniciar sesión desde /ingreso cuando esté configurado.'
        );
        setBusy(false);
        return;
      }

      const profileErr = await insertPerfilCliente({
        userId: user.id,
        nombre: fullName,
        telefono: tel,
      });

      if (profileErr) {
        setError(formatInsertPerfilMessage(profileErr));
        setBusy(false);
        return;
      }

      const okRow = await waitUntilPerfilExists(user.id);
      if (!okRow) {
        setError(
          'Tu cuenta inició sesión pero no pudimos confirmar la ficha en perfiles_clientes. Contactá Amore o revisá el trigger migración.',
        );
        setBusy(false);
        return;
      }

      onSuccess();
      setBusy(false);
    } catch {
      setError('Ocurrió un error inesperado. Intentá de nuevo.');
      setBusy(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="nombre"
          className="mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-[#003D5B]/70"
        >
          Nombre completo
        </label>
        <input
          id="nombre"
          className={inputClass}
          value={nombreCompleto}
          onChange={e => setNombreCompleto(e.target.value)}
          placeholder="Tu nombre y apellido"
          autoComplete="name"
          required
        />
      </div>

      <div>
        <label
          htmlFor="signup-email"
          className="mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-[#003D5B]/70"
        >
          Correo electrónico
        </label>
        <input
          id="signup-email"
          type="email"
          className={inputClass}
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="nombre@ejemplo.com"
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label
          htmlFor="tel"
          className="mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-[#003D5B]/70"
        >
          Teléfono (WhatsApp)
        </label>
        <input
          id="tel"
          className={inputClass}
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
          placeholder="+54 9 … o 011 …"
          inputMode="tel"
          autoComplete="tel"
          required
        />
      </div>

      <div>
        <label
          htmlFor="trat"
          className="mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-[#003D5B]/70"
        >
          Tratamiento de interés
        </label>
        <div className="relative">
          <select
            id="trat"
            className={`${inputClass} appearance-none pr-11`}
            value={tratamiento}
            onChange={e => setTratamiento(e.target.value)}
            required
          >
            <option value="">Seleccioná un servicio</option>
            {servicios.map(name => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#003D5B]/40"
            aria-hidden
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="pw"
          className="mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-[#003D5B]/70"
        >
          Contraseña
        </label>
        <input
          id="pw"
          type="password"
          className={inputClass}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          required
          minLength={6}
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-800">{error}</p>
      )}

      <motion.button
        type="submit"
        disabled={busy}
        whileHover={{ y: busy ? 0 : -1 }}
        whileTap={{ scale: busy ? 1 : 0.99 }}
        className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-lg disabled:opacity-60"
        style={{ background: '#003D5B', boxShadow: '0 10px 28px rgba(0,61,91,0.18)' }}
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creando cuenta…
          </>
        ) : (
          'Unirme a Amore'
        )}
      </motion.button>
    </motion.form>
  );
}
