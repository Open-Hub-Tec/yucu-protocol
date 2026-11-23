/**
 * Respuestas del asistente en modo de DEMOSTRACIÓN (sin proveedor de IA). #154; ADR-006, D4.
 *
 * Solo orienta hacia flujos que existen en la app, con botones. Nunca afirma precios, saldos,
 * certificaciones, dictámenes, instalaciones ni servicios que no existen. Todo lleva source 'simulated'.
 */
import { normalizeText } from './lotFields';
import type { ChatOption, ChatReply } from './types';

const REGISTER: ChatOption = { id: 1, title: '📦 Registrar un lote', subtitle: 'Paso a paso', icon: 'add_box', action: 'registrar_lote' };
const PHOTO: ChatOption = { id: 2, title: '📸 Tomar foto al producto', subtitle: 'La IA sugiere, usted decide', icon: 'photo_camera', action: 'evaluar_foto' };
const PAYMENTS: ChatOption = { id: 3, title: '💰 Ver mis pagos', subtitle: 'Pantalla de pagos', icon: 'payments', action: 'ver_pagos' };

function numbered(options: ChatOption[]): ChatOption[] {
  return options.map((o, i) => ({ ...o, id: i + 1 }));
}

function reply(text: string, options: ChatOption[] = []): ChatReply {
  return { reply: text, options: numbered(options), source: 'simulated' };
}

const has = (text: string, words: string[]) => words.some((w) => text.includes(w));

export function simulatedChatReply(message: string): ChatReply {
  const clean = normalizeText(typeof message === 'string' ? message : '');

  if (has(clean, ['pulque', 'aguamiel', 'tinacal', 'maguey'])) {
    return reply('Con gusto. Para registrar su pulque, toque el botón de abajo y le pregunto los datos uno por uno.', [
      { id: 0, title: '🏺 Registrar pulque', subtitle: 'Paso a paso', icon: 'local_bar', action: 'registrar_pulque' },
      REGISTER,
    ]);
  }
  if (has(clean, ['miel', 'abeja', 'colmena'])) {
    return reply('Con gusto. Para registrar su miel, toque el botón de abajo.', [
      { id: 0, title: '🍯 Registrar miel', subtitle: 'Paso a paso', icon: 'inventory_2', action: 'registrar_miel' },
      REGISTER,
    ]);
  }
  if (has(clean, ['cafe', 'pergamino'])) {
    return reply('Con gusto. Para registrar su café, toque el botón de abajo.', [
      { id: 0, title: '☕ Registrar café', subtitle: 'Paso a paso', icon: 'add_box', action: 'registrar_cafe' },
      PHOTO,
    ]);
  }
  if (has(clean, ['registrar', 'producto', 'cosecha', 'lote', 'dar de alta', 'vender', 'inscribir'])) {
    return reply('Puede registrar café, miel, pulque, maíz, frijol, textiles o tejido de palma. Toque el botón para empezar.', [
      REGISTER,
      { id: 0, title: '☕ Registrar café', subtitle: 'Paso a paso', icon: 'add_box', action: 'registrar_cafe' },
    ]);
  }
  if (has(clean, ['foto', 'camara', 'calidad', 'humedad', 'muestra', 'evalua'])) {
    return reply(
      'Puede tomarle una foto a su producto. Cuando la IA está disponible, le dice lo que ve como sugerencia; no es un dictamen ni una certificación.',
      [PHOTO],
    );
  }
  if (has(clean, ['saldo', 'pago', 'dinero', 'cobrar', 'retirar', 'billetera', 'cuanto tengo'])) {
    return reply('Sus pagos se ven en la pantalla de pagos. Desde aquí no puedo consultar su saldo.', [PAYMENTS]);
  }
  if (has(clean, ['futbol', 'pelicula', 'chiste', 'politica', 'cancion'])) {
    return reply('Disculpe, solo puedo ayudarle con el registro de sus productos y el uso de esta aplicación.', [REGISTER]);
  }
  if (has(clean, ['que hace', 'para que sirve', 'para que sirbe', 'como funciona', 'ayuda', 'puede hacer', 'pued ehacer', 'que mas'])) {
    return reply(
      'Esta aplicación es un prototipo. Aquí puede:\n\n• Registrar su lote: usted dice o escribe los datos, la app se los lee y usted confirma.\n• Tomar foto a su producto.\n• Ver la pantalla de pagos.',
      [REGISTER, PHOTO, PAYMENTS],
    );
  }
  return reply('Estoy en modo de demostración y puedo ayudarle con lo básico. ¿Qué desea hacer?', [REGISTER, PHOTO, PAYMENTS]);
}
