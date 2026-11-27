// Textos de las pantallas de la artesana que cambia W53 #182 (sello, cancelar, micrófono, escuchar).
// Van juntos aquí para poder revisarlos y, más adelante, traducirlos (FRONTEND.md, sección 6).
// Reglas: tú, frases cortas, sin palabras técnicas (ADR-004 D1) y nunca "oficial" ni "certificado" (regla 8, #108).

export const TEXTOS_SELLO = {
  titulo: 'Qué dice este sello',
  explicacion: 'Este sello dice que tú lo hiciste. No cobra nada.',
} as const;

export const TEXTOS_NAVEGACION = {
  regresar: 'Regresar',
  cancelar: 'Cancelar',
  cerrar: 'Cerrar',
} as const;

export const TEXTOS_ACCIONES = {
  /** Frase antes de guardar un producto, por ejemplo "Vas a guardar tu café. Puedes cambiarlo después." */
  antesDeGuardar: (producto: string): string => {
    const nombre = producto.trim().toLowerCase() || 'producto';
    return `Vas a guardar tu ${nombre}. Puedes cambiarlo después.`;
  },
} as const;

export const TEXTOS_MICROFONO = {
  grabar: 'Tócalo para hablar o mantenlo presionado',
  enviar: 'Toca otra vez para enviar',
  soltarParaEnviar: 'Suelta para enviar',
  grabando: 'Te estoy escuchando',
  cancelar: 'Cancelar',
  limite: 'Máximo 1 minuto',
  sinTextoEnVivo: 'Habla cerca del teléfono.',
} as const;

export const TEXTOS_ESCUCHAR = {
  escuchar: 'Escuchar',
  repetir: 'Repetir',
  detener: 'Detener',
  cerrarTexto: 'Cerrar',
  sinVoz: 'Este teléfono no tiene voz en español. Pide a tu promotora que te lo lea.',
} as const;
