/**
 * Configuracion de marca centralizada.
 *
 * Editar estos valores para personalizar el sistema para cada cliente.
 * Despues de cambiarlos, no es necesario tocar ningun otro archivo.
 *
 * Ver guia completa en docs/PERSONALIZACION.md
 */
export const brand = {
  /** Nombre completo del negocio (footer, emails, titulos formales) */
  businessName: 'Tu Estetica',

  /** Nombre corto (botones, mensajes breves) */
  shortName: 'Tu Estetica',

  /** Titulo del panel de administracion */
  backofficeName: 'Backoffice',

  /** Nombre del asistente virtual / chatbot */
  assistantName: 'Asistente Virtual',

  /** Etiqueta del equipo de soporte (ej: "Contactá al equipo X") */
  supportLabel: 'nuestro equipo',

  /** Mensaje de bienvenida para nuevos clientes */
  memberSinceLabel: 'Nuevo miembro',

  /** Nombre generico cuando no hay nombre cargado del cliente */
  clientFallbackName: 'Cliente',

  /** Texto del boton flotante de WhatsApp */
  whatsappCtaLabel: 'Escribino por WhatsApp',

  /** Titulo en el portal del cliente */
  portalDataTitle: 'Tus datos',

  /** Nombre para el copyright del footer */
  copyrightName: 'Tu Estetica',
} as const;
