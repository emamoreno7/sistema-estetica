import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutList, Loader2, Pencil, Plus, RefreshCw } from 'lucide-react';
import type { ServicioRow } from '@/lib/serviciosDb';
import { formatPrecioArs } from '@/lib/serviciosDb';
import {
  createServicioAdmin,
  listServiciosAdmin,
  setServicioActivoAdmin,
  updateServicioPrecioDescripcionAdmin,
} from '@/features/admin/adminServiciosApi';
import { DEFAULT_SERVICE_IMAGE } from '@/data/serviciosCatalogo';
import { getPortalAdminEmails, getPortalAdminUserIds } from '@/config/admin';
import { AdminShell } from './AdminShell';

type AdminOutletCtx = { onSignOut: () => void };

const CATEGORIAS_NUEVO = [
  { id: 'corporal', label: 'Remodelación Corporal' },
  { id: 'bienestar', label: 'Bienestar' },
  { id: 'facial', label: 'Facial & Mirada' },
  { id: 'especialidades', label: 'Epecialidades' },
] as const;

export default function AdminServicesView() {
  const { onSignOut } = useOutletContext<AdminOutletCtx>();
  const [rows, setRows] = useState<ServicioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);

  const [editRow, setEditRow] = useState<ServicioRow | null>(null);
  const [precioEdit, setPrecioEdit] = useState('');
  const [descEdit, setDescEdit] = useState('');
  const [saving, setSaving] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [catId, setCatId] = useState<string>(CATEGORIAS_NUEVO[0].id);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('0');
  const [nuevoDur, setNuevoDur] = useState('60');
  const [nuevoDesc, setNuevoDesc] = useState('');
  const [nuevoImg, setNuevoImg] = useState(DEFAULT_SERVICE_IMAGE);

  const admins = getPortalAdminEmails();
  const adminIds = getPortalAdminUserIds();

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { rows: r, error } = await listServiciosAdmin();
    if (error) setErr(error);
    else setRows(r);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openEdit(r: ServicioRow) {
    setActionErr(null);
    setEditRow(r);
    setPrecioEdit(String(r.precio));
    setDescEdit(r.descripcion);
  }

  async function guardarEdicion() {
    if (!editRow) return;
    setActionErr(null);
    const precio = Number.parseFloat(precioEdit.replace(',', '.'));
    if (Number.isNaN(precio) || precio < 0) {
      setActionErr('Precio inválido.');
      return;
    }
    setSaving(true);
    const { error } = await updateServicioPrecioDescripcionAdmin(editRow.id, {
      precio,
      descripcion: descEdit.trim(),
    });
    setSaving(false);
    if (error) {
      setActionErr(error);
      return;
    }
    setEditRow(null);
    await load();
  }

  async function toggleActivo(r: ServicioRow) {
    setActionErr(null);
    const { error } = await setServicioActivoAdmin(r.id, !r.activo);
    if (error) {
      setActionErr(error);
      return;
    }
    await load();
  }

  async function crearServicio() {
    setActionErr(null);
    const precio = Number.parseFloat(nuevoPrecio.replace(',', '.'));
    const dur = Number.parseInt(nuevoDur, 10);
    if (!nuevoNombre.trim()) {
      setActionErr('Completá el nombre del servicio.');
      return;
    }
    if (Number.isNaN(precio) || precio < 0) {
      setActionErr('Precio inválido.');
      return;
    }
    if (Number.isNaN(dur) || dur < 5) {
      setActionErr('Duración inválida (mín. 5 min).');
      return;
    }
    const cat = CATEGORIAS_NUEVO.find((c) => c.id === catId)!;
    setSaving(true);
    const { error } = await createServicioAdmin({
      categoria_id: cat.id,
      categoria_label: cat.label,
      nombre: nuevoNombre.trim(),
      precio,
      duracion_minutos: dur,
      descripcion: nuevoDesc.trim(),
      imagen_url: nuevoImg.trim() || DEFAULT_SERVICE_IMAGE,
      activo: true,
    });
    setSaving(false);
    if (error) {
      setActionErr(error);
      return;
    }
    setCreateOpen(false);
    setNuevoNombre('');
    setNuevoPrecio('0');
    setNuevoDur('60');
    setNuevoDesc('');
    setNuevoImg(DEFAULT_SERVICE_IMAGE);
    await load();
  }

  return (
    <AdminShell
      onSignOut={onSignOut}
      title="Seos"
      subtitle="Precios, descripciones y visibilidad en la web. Los clientes ven los servicios activos de la tabla servicios."
      actions={
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-full border border-[#BFC9A2]/50 bg-white/90 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#003D5B]"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </motion.button>
      }
    >
      {admins.length === 0 && adminIds.length === 0 && (
        <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-950">
          Configurá <code className="text-xs">VITE_ADMIN_EMAILS</code> en <code>.env</code>.
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setActionErr(null);
            setCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-lg"
          style={{ background: 'linear-gradient(96deg, #003D5B 0%, #005578 100%)', boxShadow: '0 12px 32px rgba(0,61,91,0.22)' }}
        >
          <Plus className="h-4 w-4" />
          Nuevo Servicio
        </motion.button>
      </div>

      {actionErr ? <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{actionErr}</div> : null}

     <div className="overflow-hidden rounded-3xl border border-[#F2D7D5]/60 bg-[#FDF8F5]/95 shadow-xl backdrop-blur-sm" style={{ boxShadow: '0 24px 64px rgba(0,61,91,0.08)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F2D7D5]/50 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <LayoutList className="h-5 w-5 text-[#003D5B]/55" />
            <h2 className="text-serif-premium text-lg font-bold text-[#003D5B]">Servicios en Supabase</h2>
          </div>
          <p className="text-xs text-[#7A746E]">{rows.length} fila(s)</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-[#003D5B]/55">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando…</span>
          </div>
        ) : err ? (
          <div className="px-6 py-16 text-center text-sm text-red-700">{err}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#F2D7D5]/40 bg-gradient-to-r from-[#fffefd] to-[#FDF8F5]">
                  <th className="whitespace-nowrap px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#003D5B]/55 sm:px-6">Nombre</th>
                  <th className="whitespace-nowrap px-3 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#003D5B]/55">Precio</th>
                  <th className="whitespace-nowrap px-3 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#003D5B]/55">Duración</th>
                  <th className="whitespace-nowrap px-3 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#003D5B]/55">Estado</th>
                  <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-[#003D5B]/55 sm:px-6">Acciones</th>
                </tr>
             </thead>
              <tbody className="divide-y divide-[#F2D7D5]/35">
                {rows.map((r) => (
                  <motion.tr key={r.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cursor-pointer transition-colors hover:bg-[#FFFDFB]/95" onClick={() => openEdit(r)}>
                    <td className="px-5 py-4 font-semibold text-[#003D5B] sm:px-6">
                      <span className="block">{r.nombre}</span>
                      <span className="mt-0.5 block text-[11px] font-normal text-[#7A746E]">{r.categoria_label}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-[#003D5B]">{formatPrecioArs(r.precio)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-[#7A746E]">{r.duracion_minutos} min</td>
                    <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => void toggleActivo(r)} className={`rounded-full px-3 py-1 text-[11px] font-semibold ${r.activo ? 'border border-emerald-200 bg-emerald-50 text-emerald-900' : 'border border-[#003D5B]/15 bg-[#003D5B]/08 text-[#003D5B]/70'}`}>
                        {r.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right sm:px-6" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => openEdit(r)} className="inline-flex items-center gap-1.5 rounded-full border border-[#003D5B]/12 bg-white px-4 py-2 text-[11px] font-semibold text-[#003D5B]">
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <p className="py-14 text-center text-sm text-[#7A746E]">No hay filas. Ejecutá la migración 007 o creá el primer servicio.</p>}
          </div>
        )}
      </div>     {/* Modales */}
      <AnimatePresence>
        {editRow ? (
          <>
            <motion.button type="button" aria-label="Cerrar" className="fixed inset-0 z-[120] bg-[#003D5B]/35 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !saving && setEditRow(null)} />
            <motion.div role="dialog" aria-modal="true" initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} className="fixed left-1/2 top-1/2 z-[121] w-[min(100vw-1.5rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[#F2D7D5]/70 p-6 shadow-2xl sm:p-8" style={{ background: '#FDF8F5', boxShadow: '0 28px 80px rgba(0,61,91,0.16)' }} onClick={(e) => e.stopPropagation()}>
              <h2 className="text-serif-premium text-lg font-bold text-[#003D5B]">{editRow.nombre}</h2>
              <p className="mt-1 text-xs text-[#7A746E]">{editRow.categoria_label}</p>
              <div className="mt-5 space-y-4">
                <div><label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#003D5B]/55">Precio (ARS)</label><input type="number" min={0} step="0.01" value={precioEdit} onChange={(e) => setPrecioEdit(e.target.value)} className="w-full rounded-2xl border border-[#F2D7D5]/80 bg-white px-4 py-3 text-sm text-[#003D5B] outline-none focus:ring-2 focus:ring-[#BFC9A2]/50" /></div>
                <div><label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#003D5B]/55">Descripción</label><textarea value={descEdit} onChange={(e) => setDescEdit(e.target.value)} rows={5} className="w-full resize-y rounded-2xl border border-[#F2D7D5]/80 bg-white px-4 py-3 text-sm text-[#003D5B] outline-none focus:ring-2 focus:ring-[#BFC9A2]/50" /></div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2"><motion.button type="button" whileTap={{ scale: 0.98 }} disabled={saving} onClick={() => void guardarEdicion()} className="flx-1 rounded-full bg-[#003D5B] py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-50">Guardar</motion.button><button type="button" disabled={saving} onClick={() => setEditRow(null)} className="rounded-full border border-[#003D5B]/15 px-6 py-3 text-xs font-semibold text-[#003D5B]/70">Cancelar</button></div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {createOpen ? (
          <>
            <motion.button type="button" aria-label="Cerrar" className="fixed inset-0 z-[120] bg-[#003D5B]/35 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !saving && setCreateOpen(false)} />
            <motion.div role="dialog" aria-modal="true" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed left-1/2 top-1/2 z-[121] max-h-[90vh] w-[min(100vw-1.5rem,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-[#F2D7D5]/70 p-6 shadow-2xl sm:p-8" style={{ background: '#FDF8F5', boxShadow: '0 28px 80px rgba(0,61,91,0.16)' }} onClick={(e) => e.stopPropagation()}>
              <h2 className="text-serif-premium text-lg font-bold text-[#003D5B]">Nuevo servicio</h2>
              <div className="mt-5 space-y-4">
                <div><label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#003D5B]/55">Categoría</label><select value={catId} onChange={(e) => setCatId(e.target.value)} className="w-full rounded-2xl border border-[#F2D7D5]/80 bg-white px-4 py-3 text-sm text-[#003D5B]">{CATEGORIAS_NUEVO.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
                <div><label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#003D5B]/55">Nombre</label><input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} className="w-full rounded-2xl border border-[#F2D7D5]/80 bg-white px-4 py-3 txt-sm text-[#003D5B]" placeholder="Ej. Limpieza profunda" /></div>
                <div className="grid grid-cols-2 gap-3"><div><label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#003D5B]/55">Precio ARS</label><input type="number" min={0} step="0.01" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} className="w-full rounded-2xl border border-[#F2D7D5]/80 bg-white px-4 py-3 text-sm" /></div><div><label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#003D5B]/55">Duración (min)</label><input type="number" min={5} value={nuevoDur} onChange={(e) => setNuevoDur(e.target.value)} className="w-full rounded-2xl border border-[#F2D7D5]/80 bg-white px-4 py-3 text-sm" /></div></div>
                <div><label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#003D5B]/55">Descripción</label><textarea value={nuevoDesc} onChange={(e) => setNuevoDesc(e.target.value)} rows={4} className="w-fulrounded-2xl border border-[#F2D7D5]/80 bg-white px-4 py-3 text-sm" /></div>
                <div><label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#003D5B]/55">Imagen (ruta)</label><input value={nuevoImg} onChange={(e) => setNuevoImg(e.target.value)} className="w-full rounded-2xl border border-[#F2D7D5]/80 bg-white px-4 py-3 text-sm" placeholder={DEFAULT_SERVICE_IMAGE} /></div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2"><motion.button type="button" whileTap={{ scale: 0.98 }} disabled={saving} onClick={() => void crearServicio()} className="flex-1 rounded-full bg-[#003D5B] py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-50">Crear</motion.button><button type="button" disabled={saving} onClick={() => setCreateOpen(false)} className="rounded-full border border-[#003D5B]/15 px-6 py-3 text-xs font-semibold text-[#003D5B]/70">Cancelar</button></div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </AdminShell>
  );
}
