/**
 * IA del teléfono (#154). Las pantallas importan `assistant` de aquí y nada más.
 */
import type { AssistantPort } from './AssistantPort';
import { HttpAssistant } from './HttpAssistant';

export * from './AssistantPort';
export * from './types';
export * from './lotFields';
export { HttpAssistant } from './HttpAssistant';
export { SimulatedAssistant } from './SimulatedAssistant';

/** Instancia que usan las pantallas. El servidor decide si responde Gemini o la simulación. */
export const assistant: AssistantPort = new HttpAssistant();
