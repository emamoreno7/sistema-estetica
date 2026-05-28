/** Limpia almacenamiento local y caches del navegador (p. ej. tras cerrar sesión). */
export async function clearLocalAppData(): Promise<void> {
  try {
    sessionStorage.clear();
  } catch {
    /* ignore */
  }

  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith('sb-') || k.toLowerCase().includes('supabase')) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }

  if (typeof caches !== 'undefined') {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch {
      /* ignore */
    }
  }
}
