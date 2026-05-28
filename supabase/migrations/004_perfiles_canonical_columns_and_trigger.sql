-- ═══════════════════════════════════════════════════════════════════════════
-- Nombres de columnas alineados con el front + perfil garantizado tras signUp.
--
-- Motivo del trigger: si el proyecto exige confirmar email, signUp puede no devolver
-- sesión JWT; la política RLS "auth.uid() = id" rechaza INSERT anónimos y la tabla
-- queda vacía. El trigger en auth.users usa SECURITY DEFINER y sí crea la fila.
-- ═══════════════════════════════════════════════════════════════════════════

-- Estado de cuenta en perfiles (registro inicial pending)
ALTER TABLE public.perfiles_clientes
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Interés declarado en el formulario de alta (opcional en DB antigua)
ALTER TABLE public.perfiles_clientes ADD COLUMN IF NOT EXISTS tratamiento_interes text;

-- Renombre desde esquema legado español si aplica
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'perfiles_clientes'
      AND column_name = 'nombre_completo'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'perfiles_clientes'
      AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.perfiles_clientes RENAME COLUMN nombre_completo TO full_name;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'perfiles_clientes'
      AND column_name = 'telefono_whatsapp'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'perfiles_clientes'
      AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.perfiles_clientes RENAME COLUMN telefono_whatsapp TO phone;
  END IF;
END $$;



-- ─── Trigger: al crear usuario en Auth, crear (o fusionar) fila en perfiles ───
CREATE OR REPLACE FUNCTION public.handle_new_user_perfil_cliente()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full text;
  v_phone text;
  v_trat text;
BEGIN
  v_full := trim(coalesce(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'nombre_completo',
    ''
  ));
  v_phone := trim(coalesce(
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'telefono_whatsapp',
    ''
  ));
  v_trat := trim(coalesce(
    NEW.raw_user_meta_data->>'tratamiento_interes',
    ''
  ));

  INSERT INTO public.perfiles_clientes (id, full_name, phone, status, tratamiento_interes)
  VALUES (
    NEW.id,
    CASE WHEN v_full = '' THEN 'Cliente Amore' ELSE v_full END,
    CASE WHEN v_phone = '' THEN 'pendiente' ELSE v_phone END,
    'pending',
    nullif(v_trat, '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_perfil_cliente ON auth.users;

CREATE TRIGGER on_auth_user_created_perfil_cliente
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user_perfil_cliente();

-- Si tu versión de Postgres marca error con EXECUTE PROCEDURE, cambiá a:
-- EXECUTE FUNCTION public.handle_new_user_perfil_cliente();
