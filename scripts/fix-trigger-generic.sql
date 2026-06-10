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
    CASE WHEN v_full = '' THEN 'Cliente' ELSE v_full END,
    CASE WHEN v_phone = '' THEN 'pendiente' ELSE v_phone END,
    'pending',
    nullif(v_trat, '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
