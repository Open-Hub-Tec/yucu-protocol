import { Response } from "express";

// Formato único de error del servidor (docs/arquitectura/SERVIDOR.md, sección 4).
// `error` se puede mostrar tal cual a una persona mayor; `code` es para que la app decida qué hacer.
// Nunca se manda la pila, el mensaje del proveedor ni datos de la petición.
export function sendError(res: Response, status: number, error: string, code?: string) {
  return res.status(status).json(code ? { error, code } : { error });
}
