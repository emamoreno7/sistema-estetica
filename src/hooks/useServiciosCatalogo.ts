import { useEffect, useState } from 'react';
import type { ServicioCategoria } from '@/data/serviciosCatalogo';
import { serviciosCatalogo } from '@/data/serviciosCatalogo';
import { fetchServiciosActivos, rowsToCategorias } from '@/lib/serviciosDb';

/**
 * Catálogo para la web: arranca con el dataset estático y lo reemplaza
 * por la tabla `servicios` cuando Supabase responde con filas activas.
 */
export function useServiciosCatalogo() {
  const [categorias, setCategorias] = useState<ServicioCategoria[]>(serviciosCatalogo);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDb, setFromDb] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const { rows, error: e } = await fetchServiciosActivos();
      if (!alive) return;
      setLoading(false);
      if (e) {
        setError(e);
        return;
      }
      if (rows.length > 0) {
        setCategorias(rowsToCategorias(rows));
        setFromDb(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { categorias, loading, error, fromDb };
}
