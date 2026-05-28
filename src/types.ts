// ═══════════════════════════════════════════════════════
// Tipos de Datos - Sistema de Gestión Estética
// ═══════════════════════════════════════════════════════

export interface User {
  id: string;
  nombre: string;
  email: string;
  foto_perfil: string;
  telefono: string;
}

export interface Service {
  id: string;
  nombre: string;
  descripcion: string;
  descripcion_larga: string;
  beneficios: string[];
  imagen_url: string;
  video_url?: string;
  categoria: string;
  duracion: string;
  precio: string;
}

export interface Treatment {
  id: string;
  user_id: string;
  service_id: string;
  total_sesiones: number;
  sesiones_completadas: number;
  fecha_inicio: string;
  estado: 'activo' | 'completado' | 'pausado';
  proxima_sesion: string;
}

export interface Session {
  id: string;
  treatment_id: string;
  nro_sesion: number;
  fecha: string;
  notas_profesional: string;
  fotos_progreso: string[];
  observaciones_cliente: string;
}

export type ViewType = 'dashboard' | 'servicios' | 'evolucion' | 'perfil';
