import type { Response } from "express";

/**
 * Formato único de error del servidor (docs/arquitectura/SERVIDOR.md, sección 4).
 * `error`: frase corta en español que se puede mostrar tal cual. `code`: en inglés y mayúsculas.
 * Nunca se manda la pila, el mensaje del proveedor ni datos de la petición.
 */
export interface ApiError {
  error: string;
  code?: string;
}

export function sendError(res: Response, status: number, error: string, code?: string) {
  const body: ApiError = code ? { error, code } : { error };
  return res.status(status).json(body);
}
