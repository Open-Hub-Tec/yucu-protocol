import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { aiRoutes } from "./src/server/routes/ai";
import { legacyRoutes } from "./src/server/routes/legacy";

const app = express();
const PORT = 3000;

app.use((_req: Request, res: Response, next: any) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// Límites de tamaño: el chat solo recibe texto; imagen y audio llegan en base64 y necesitan más espacio.
app.use(["/api/chat", "/api/extract-lot"], express.json({ limit: "100kb" }));
app.use(express.json({ limit: "15mb" }));

// Límite de peticiones para los endpoints de IA (protege la llave y el costo).
// Ventana fija en memoria por IP: suficiente para un piloto; en producción usar un almacén compartido.
const AI_WINDOW_MS = 10 * 60 * 1000;
const AI_MAX_REQUESTS = 30;
const aiHits = new Map<string, { count: number; windowStart: number }>();
function aiRateLimit(req: Request, res: Response, next: any) {
  const ip = req.ip || req.socket.remoteAddress || "desconocida";
  const now = Date.now();
  const entry = aiHits.get(ip);
  if (!entry || now - entry.windowStart > AI_WINDOW_MS) {
    aiHits.set(ip, { count: 1, windowStart: now });
    return next();
  }
  entry.count += 1;
  if (entry.count > AI_MAX_REQUESTS) {
    const retrySeconds = Math.ceil((entry.windowStart + AI_WINDOW_MS - now) / 1000);
    res.setHeader("Retry-After", String(retrySeconds));
    return res.status(429).json({ error: `Demasiadas solicitudes. Intenta de nuevo en ${retrySeconds} segundos.` });
  }
  return next();
}
app.use(["/api/chat", "/api/analyze-image", "/api/transcribe-audio", "/api/extract-lot"], aiRateLimit);

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "Yucu - Backend API" });
});

// Endpoint to view or download the complete Knowledge Base / Technical Blueprint
app.get("/api/dossier", (_req: Request, res: Response) => {
  try {
    const filePath = path.join(process.cwd(), "CHAT_RURAL_KNOWLEDGE_BASE.md");
    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "text/markdown; charset=utf-8");
      res.setHeader("Content-Disposition", 'inline; filename="CHAT_RURAL_KNOWLEDGE_BASE.md"');
      return res.send(fs.readFileSync(filePath, "utf-8"));
    }
    return res.status(404).send("Document not found");
  } catch (err: any) {
    return res.status(500).send("Error reading document");
  }
});

// Explicit download endpoints with proper binary MIME types and attachment disposition
app.get(
  [
    "/api/download/dossier-pptx",
    "/api/download/pptx-dossier",
    "/Raiz_Protocol_Dossier_Econometrico_Mixteca.pptx",
  ],
  (_req: Request, res: Response) => {
    try {
      const filePath = path.join(process.cwd(), "public", "Raiz_Protocol_Dossier_Econometrico_Mixteca.pptx");
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="Raiz_Protocol_Dossier_Econometrico_Mixteca.pptx"'
        );
        res.setHeader("Content-Length", stat.size.toString());
        res.setHeader("Cache-Control", "public, max-age=3600");
        return res.sendFile(filePath);
      }
      return res.status(404).send("PowerPoint Dossier file not found");
    } catch (err: any) {
      return res.status(500).send("Error downloading PowerPoint Dossier file");
    }
  }
);

// Base64 helper endpoint for iframe-safe downloads
app.get("/api/download/dossier-pptx-base64", (_req: Request, res: Response) => {
  try {
    const filePath = path.join(process.cwd(), "public", "Raiz_Protocol_Dossier_Econometrico_Mixteca.pptx");
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      return res.json({
        filename: "Raiz_Protocol_Dossier_Econometrico_Mixteca.pptx",
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        size: buffer.length,
        base64: buffer.toString("base64"),
      });
    }
    return res.status(404).json({ error: "File not found" });
  } catch (err: any) {
    return res.status(500).json({ error: "Error reading file" });
  }
});

app.get(["/api/download/pptx", "/Raiz_Protocol_Stellar_PitchDeck.pptx"], (_req: Request, res: Response) => {
  try {
    const filePath = path.join(process.cwd(), "public", "Raiz_Protocol_Stellar_PitchDeck.pptx");
    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
      res.setHeader("Content-Disposition", 'attachment; filename="Raiz_Protocol_Stellar_PitchDeck.pptx"');
      return res.sendFile(filePath);
    }
    return res.status(404).send("PowerPoint file not found");
  } catch (err: any) {
    return res.status(500).send("Error downloading PowerPoint file");
  }
});

app.get(["/api/download/docx", "/Raiz_Protocol_Stellar_PitchDeck.docx"], (_req: Request, res: Response) => {
  try {
    const filePath = path.join(process.cwd(), "public", "Raiz_Protocol_Stellar_PitchDeck.docx");
    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", 'attachment; filename="Raiz_Protocol_Stellar_PitchDeck.docx"');
      return res.sendFile(filePath);
    }
    return res.status(404).send("Word document file not found");
  } catch (err: any) {
    return res.status(500).send("Error downloading Word document");
  }
});

// Rutas de IA (#154): viven en src/server/routes/ai.ts
app.use("/api", aiRoutes);

// Rutas /api/v1/* (#106): viven en src/server/routes/legacy.ts
app.use("/api/v1", legacyRoutes);


async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global error handler middleware
  app.use((err: any, _req: Request, res: Response, _next: any) => {
    // Errores del cliente (p. ej. 413 por cuerpo demasiado grande) conservan su código.
    if (typeof err?.status === "number" && err.status >= 400 && err.status < 500) {
      return res.status(err.status).json({ error: err.type === "entity.too.large" ? "La solicitud es demasiado grande." : "Solicitud inválida." });
    }
    console.error("Express uncaught error:", err);
    res.status(500).json({ error: "Error interno del servidor", message: err?.message });
  });

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Yucu server running on http://0.0.0.0:${PORT}`);
  });

  server.on("error", (err: any) => {
    console.error("Server listen error:", err);
  });
}

process.on("uncaughtException", (err) => {
  console.error("Process uncaught exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Process unhandled rejection:", reason);
});

startServer();
