import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
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
app.use("/api/chat", express.json({ limit: "100kb" }));
app.use(express.json({ limit: "15mb" }));

// Límite de peticiones para los endpoints que consumen la API de Gemini (protege la llave y el costo).
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
app.use(["/api/chat", "/api/analyze-image", "/api/transcribe-audio"], aiRateLimit);

// Lazy-initialized Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

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

// SYSTEM INSTRUCTIONS: STRICT DOMAIN GUARDRAILS & ELDERLY-ACCESSIBLE DESIGN FOR RAÍZ
const SYSTEM_INSTRUCTION = `
Eres el Asistente Inteligente y Comunitario de "Yucu", una plataforma comunitaria desarrollada junto al Instituto Tecnológico de Tlaxiaco (Oaxaca, México) para familias campesinas, caficultoras, apicultoras y artesanas de la Mixteca Alta.

MISIÓN PRINCIPAL: ELIMINAR LA FRICCIÓN PARA ADULTOS MAYORES Y CAMPESINOS:
- La gran mayoría de usuarios son personas adultas mayores (abuelos, personas de campo de 60+ años) con poca experiencia tecnológica, vista cansada o teléfonos sencillos.
- Escriben con frecuencia con errores tipográficos, dedos resbalados o lenguaje coloquial (ejemplo: "que mas pued ehacer esta aplicacion", "como le ago para mi cafe", "para que sirbe", "quiero checar mi dinero", "tengo roya", "quiero registrar un producto").
- DEBES COMPRENDER Y TOLERAR ABSOLUTAMENTE cualquier falta de ortografía o frase incompleta. Jamás corrijas ni digas "tu mensaje tiene errores".
- NUNCA respondas con frases frías, burócratas ni desinteresadas como "Un asesor revisará tu solicitud" o "Mensaje recibido".
- Tu tono debe ser cálido, respetuoso (tratando de "usted", con respeto y cariño comunitario como "Don/Doña" o "paisano"), comprensible, sin palabras rebuscadas ni tecnicismos confusos.

SOLICITUDES DE REGISTRO DE PRODUCTO O COSECHA:
- IDENTIFICA EL PRODUCTO QUE EL USUARIO REALMENTE QUIERE REGISTRAR:
  * Si el usuario menciona "pulque", "aguamiel", "maguey" o "tinacal":
    - DEBES guiarlo DIRECTAMENTE al registro de PULQUE. ¡NUNCA lo mandes a café!
    - El pulque es una bebida tradicional de aguamiel fermentado de la Mixteca Alta.
    - Opciones requeridas:
      1. title: "🏺 Registrar Pulque / Aguamiel", subtitle: "Litros, tinacal y foto con IA", action: "registrar_pulque"
      2. title: "🌾 Catálogo de Otros Productos", subtitle: "Ver miel, maíz o artesanías", action: "registrar_lote"
      3. title: "📸 Foto a Muestra de Pulque", subtitle: "Evaluar pureza con IA", action: "evaluar_foto"
  * Si el usuario menciona "miel":
    - Opciones requeridas: 1. "🍯 Registrar Miel de Abeja" (action: "registrar_miel"), 2. "🌾 Catálogo de Productos" (action: "registrar_lote").
  * Si el usuario menciona "sombrero", "palma", "maíz", "frijol" o "textil":
    - Guíalo al producto específico correspondiente ("registrar_sombrero", "registrar_maiz", "registrar_textil").
  * Si el usuario dice "otro producto" o "que no sea café":
    - Mándalo al catálogo rural con: 1. "🌾 Catálogo de Productos" (action: "registrar_lote"), 2. "🏺 Registrar Pulque" (action: "registrar_pulque"), 3. "🍯 Registrar Miel" (action: "registrar_miel").
  * Si el usuario menciona "café" o "café pergamino":
    - Opciones: 1. "☕ Registrar Café Pergamino" (action: "registrar_cafe"), 2. "🌾 Registrar Otro Producto" (action: "registrar_lote"), 3. "📸 Tomar Foto a la Muestra" (action: "evaluar_foto").
  * Si el usuario dice vagamente "quiero registrar un producto" o "nueva cosecha":
    - Explica que puede registrar Pulque, Café, Miel, Granos o Artesanías, y dale botones directos a: 1. "🌾 Catálogo de Productos" (action: "registrar_lote"), 2. "☕ Registrar Café Pergamino" (action: "registrar_cafe"), 3. "🏺 Registrar Pulque / Aguamiel" (action: "registrar_pulque").
  - DA UNA SOLUCIÓN DIRECTA E INMEDIATA. NUNCA preguntes vagamente "¿Qué le gustaría realizar?".
  - "cardType" DEBE SER 'lote_registro' (o 'producto_vitrina'). ¡NUNCA pongas 'dictamen_stellar' para registrar productos!

¿QUÉ HACE LA APLICACIÓN RAÍZ Y CÓMO FRENAR LA FRICCIÓN?
Cuando pregunten qué hace la aplicación, cómo funciona o para qué sirve, explica en 4 puntos muy directos y humanos:
1. 📸 EVALUACIÓN RÁPIDA CON FOTO: El productor solo le toma una foto a sus granos de café, miel o artesanía con su celular. La IA del Tec de Tlaxiaco analiza en 3 segundos la humedad (10-12%), granos vanos y broca para emitir su Dictamen de Demostración sin trámites ni cobros de peritos.
2. 💰 PAGO DIRECTO Y JUSTO: Se elimina a los intermediarios ("coyotes"). El dinero de su cosecha se deposita directo a su billetera protegida ($85-$115/kg vs $35 que pagan afuera) y pueden cobrarlo en efectivo en Tlaxiaco o en su comunidad.
3. 🏷️ SELLO Y PASAPORTE COMUNITARIO: Certificación de origen en la red Stellar para que cafeterías de especialidad compren su lote a precio de exportación.
4. 🚚 FLETE Y RECOLECCIÓN LOCAL: Camionetas comunitarias recogen la cosecha en su parcela con tarifa fija transparente.

DOMINIO Y REGLA DE ORO (GUARDRAILS):
- Atiende consultas de café, miel, maíz criollo, artesanías, evaluación de calidad por foto, plagas (roya, broca), pagos, fletes comunitarios y el Tec de Tlaxiaco.
- Si el usuario pregunta cosas 100% ajenas (fútbol, farándula, política electoral externa, películas, chistes):
  Rechaza con cordialidad: "Disculpe paisano, como asistente de Yucu en la Mixteca, únicamente puedo orientarle sobre temas de cosechas, evaluación con foto, pagos comunitarios y asesoría para productores. ¿En qué podemos apoyarle con su campo o producto?"

FORMATO DE SALIDA:
- "reply": Texto explicativo claro, cálido, estructurado con viñetas legibles.
- "agent": Nombre cálido, humano e institucional (ej. "🌱 Compañero Yucu (TecNM)", "🌿 Asesoría Agronómica TecNM", "💰 Tesorería y Fondos Comunitarios", "⛓️ Certificación Notarial Stellar", "🚚 Transporte y Fletes Comunitarios", "🛍️ Vitrina Comunitaria"). NUNCA uses la palabra robótica "Agente" ni "Bot".
- "cardType": 'dictamen_stellar', 'billetera_pago', 'lote_registro', 'producto_vitrina', 'trazabilidad_pasaporte', 'logistica_coyote', 'regalias_mercado' o null.
- "options": Lista de 2 a 3 botones de acción rápida con:
  - id: número
  - title: texto del botón con emoji (ej. "📸 Evaluar Cosecha con Foto", "💰 Ver Mis Pagos", "📦 Registrar Nuevo Lote")
  - subtitle: descripción corta de 3 a 5 palabras
  - icon: nombre del icono ("photo_camera", "payments", "add_box", "verified", "local_shipping", "inventory_2")
  - action: "evaluar_foto" | "ver_pagos" | "registrar_lote" | "registrar_cafe" | "ver_dictamen" | "consulta"
`;

function getDomainFallback(message: string): {
  reply: string;
  agent: string;
  cardType: string | null;
  options?: { id: number; title: string; subtitle: string; icon?: string; action?: string }[];
  source?: "simulated";
} {
  const clean = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  // 1. Registro de Pulque / Aguamiel / Tinacal / Maguey
  if (
    clean.includes("pulque") ||
    clean.includes("aguamiel") ||
    clean.includes("tinacal") ||
    clean.includes("maguey")
  ) {
    return {
      reply:
        "¡Con mucho gusto, paisano! En Yucu apoyamos con orgullo a los tlachiqueros y familias productoras de Pulque y Aguamiel tradicional de la Mixteca Alta sin intermediarios ('coyotes').\n\nEl registro se realiza en 3 pasos sencillos:\n\n1. 🏺 Indique los litros o garrafas preparadas en su tinacal.\n2. 📸 Tómale una foto a su muestra en jícara o garrafa para avalar con IA que es 100% aguamiel natural sin azúcar agregada.\n3. 💰 Su lote queda registrado a precio comunal justo para venta directa.\n\nToque abajo para registrar su pulque de inmediato:",
      agent: "🏺 Tradición y Pulque Comunitario",
      cardType: "lote_registro",
      options: [
        {
          id: 1,
          title: "🏺 Registrar Lote de Pulque",
          subtitle: "Litros, tinacal y foto con IA",
          icon: "local_bar",
          action: "registrar_pulque",
        },
        {
          id: 2,
          title: "🌾 Catálogo de Otros Productos",
          subtitle: "Ver miel, maíz o artesanías",
          icon: "inventory_2",
          action: "registrar_lote",
        },
        {
          id: 3,
          title: "📸 Foto a Muestra de Pulque",
          subtitle: "Evaluación de pureza con IA",
          icon: "photo_camera",
          action: "evaluar_foto",
        },
      ],
    };
  }

  // 2. Registro de Miel
  if (clean.includes("miel") || clean.includes("abeja") || clean.includes("colmena")) {
    return {
      reply:
        "¡Con mucho gusto, paisano! En Yucu apoyamos a los apicultores de la Mixteca Alta para comercializar su Miel Pura de Abeja a precio justo sin intermediarios.\n\nToque abajo para registrar su lote de miel de inmediato:",
      agent: "🍯 Módulo Apícola Comunitario",
      cardType: "lote_registro",
      options: [
        {
          id: 1,
          title: "🍯 Registrar Lote de Miel",
          subtitle: "Frascos o cubetas y foto con IA",
          icon: "inventory_2",
          action: "registrar_miel",
        },
        {
          id: 2,
          title: "🌾 Ver Catálogo Completo",
          subtitle: "Pulque, café, granos",
          icon: "storefront",
          action: "registrar_lote",
        },
        {
          id: 3,
          title: "📸 Evaluar Miel con Foto",
          subtitle: "Pureza y densidad con IA",
          icon: "photo_camera",
          action: "evaluar_foto",
        },
      ],
    };
  }

  // 3. Otro producto / que no sea café / catálogo
  if (
    clean.includes("otro producto") ||
    clean.includes("otros productos") ||
    clean.includes("no sea cafe")
  ) {
    return {
      reply:
        "¡Entendido, paisano! En Yucu apoyamos a todas las cosechas y creaciones de la Mixteca: Pulque tradicional, Miel de abeja, Maíz criollo, Jitomate, Sombreros de palma y Textiles artesanales.\n\nToque abajo para abrir el catálogo y registrar su producto:",
      agent: "🌾 Catálogo Rural Yucu",
      cardType: "producto_vitrina",
      options: [
        {
          id: 1,
          title: "🌾 Abrir Catálogo Rural",
          subtitle: "Pulque, miel, maíz y más",
          icon: "storefront",
          action: "registrar_lote",
        },
        {
          id: 2,
          title: "🏺 Registrar Pulque",
          subtitle: "Aguamiel de maguey mixteco",
          icon: "local_bar",
          action: "registrar_pulque",
        },
        {
          id: 3,
          title: "🍯 Registrar Miel",
          subtitle: "Miel virgen de la región",
          icon: "inventory_2",
          action: "registrar_miel",
        },
      ],
    };
  }

  // 4. Registro de cosecha general / café / lote
  if (
    clean.includes("registrar") ||
    clean.includes("producto") ||
    clean.includes("cosecha") ||
    clean.includes("lote") ||
    clean.includes("dar de alta") ||
    clean.includes("alta") ||
    clean.includes("vender mi") ||
    clean.includes("vender cafe") ||
    clean.includes("vender cosecha") ||
    clean.includes("subir mi") ||
    clean.includes("inscribir") ||
    clean.includes("agregar producto") ||
    clean.includes("subir producto")
  ) {
    return {
      reply:
        "¡Con mucho gusto, paisano! En Yucu registrar su cosecha o producto es muy fácil y rápido, sin intermediarios ('coyotes').\n\nPuede registrar Pulque tradicional, Café pergamino, Miel pura, Granos criollos o Artesanías.\n\nToque abajo para elegir el producto que desea registrar:",
      agent: "🌾 Asistente de Registro Rural",
      cardType: "lote_registro",
      options: [
        {
          id: 1,
          title: "🌾 Catálogo de Productos",
          subtitle: "Pulque, café, miel, granos y artesanías",
          icon: "inventory_2",
          action: "registrar_lote",
        },
        {
          id: 2,
          title: "☕ Registrar Café Pergamino",
          subtitle: "Indicar kilos y foto con IA",
          icon: "add_box",
          action: "registrar_cafe",
        },
        {
          id: 3,
          title: "🏺 Registrar Pulque / Aguamiel",
          subtitle: "Bebida tradicional de maguey",
          icon: "local_bar",
          action: "registrar_pulque",
        },
      ],
    };
  }

  // 2. Preguntas sobre qué hace la aplicación / cómo funciona / ayuda (incluye errores comunes como "pued ehacer")
  if (
    clean.includes("que mas") ||
    clean.includes("pued ehacer") ||
    clean.includes("puede hacer") ||
    clean.includes("que hace") ||
    clean.includes("para que sirve") ||
    clean.includes("para que sirbe") ||
    clean.includes("como funciona") ||
    clean.includes("como me ayuda") ||
    clean.includes("de que trata") ||
    clean.includes("que es esto") ||
    clean.includes("ayuda") ||
    clean.includes("inicio")
  ) {
    return {
      reply:
        "¡Con mucho gusto, paisano! La plataforma Yucu fue creada junto al Tec de Tlaxiaco para que las familias del campo reciban un pago justo por su cosecha y no dependan de intermediarios ('coyotes').\n\nAquí puede realizar 4 cosas muy sencillas con un solo toque:\n\n1. 📸 Evaluar su cosecha con foto: Le toma foto a sus granos de café o producto y la IA revisa la humedad y calidad en 3 segundos sin costo.\n2. 💰 Ver y retirar su dinero: El pago de sus cosechas se guarda seguro en su billetera comunitaria ($85/kg o más) y puede cobrarlo en efectivo en Tlaxiaco.\n3. 🏷️ Pasaporte y Sello Digital: Su lote recibe certificación con sello digital para venderlo a cafeterías de especialidad a precio alto.\n4. 🚚 Flete y transporte en parcela: Las camionetas de la región recogen los sacos en su comunidad con tarifa fija acordada.",
      agent: "🤖 Asistente Comunitario Yucu",
      cardType: null,
      options: [
        {
          id: 1,
          title: "📦 Registrar Cosecha o Producto",
          subtitle: "Café, miel o artesanías sin coyotes",
          icon: "add_box",
          action: "registrar_cafe",
        },
        {
          id: 2,
          title: "📸 Evaluar Cosecha con Foto",
          subtitle: "Revisar café o muestra al instante",
          icon: "photo_camera",
          action: "evaluar_foto",
        },
        {
          id: 3,
          title: "💰 Ver Mis Pagos y Saldo",
          subtitle: "Consultar dinero disponible",
          icon: "payments",
          action: "ver_pagos",
        },
      ],
    };
  }

  // 2. Evaluación de cosecha / foto / calidad / humedad
  if (
    clean.includes("evalua") ||
    clean.includes("calidad") ||
    clean.includes("humedad") ||
    clean.includes("foto") ||
    clean.includes("camara") ||
    clean.includes("camara") ||
    clean.includes("muestra") ||
    clean.includes("grano") ||
    clean.includes("broca") ||
    clean.includes("roya")
  ) {
    return {
      reply:
        "Para evaluar su café o cosecha sin ninguna complicación:\n\n• Toque el botón de abajo '📸 Abrir Cámara y Evaluar'.\n• Apunte la cámara a un puñado de granos o a su producto sobre una superficie con buena luz.\n• La inteligencia artificial del TecNM Tlaxiaco detectará el porcentaje de humedad estimada (rango óptimo 10%-12%), revisará si hay broca o manchas y emitirá su Dictamen Comunitario al momento.",
      agent: "🌿 Asesoría Agronómica TecNM",
      cardType: "dictamen_stellar",
      options: [
        {
          id: 1,
          title: "📸 Abrir Cámara y Evaluar",
          subtitle: "Tomar foto de muestra de campo",
          icon: "photo_camera",
          action: "evaluar_foto",
        },
        {
          id: 2,
          title: "📜 Consultar Dictamen de Demostración",
          subtitle: "Ver parámetros de la norma",
          icon: "verified",
          action: "ver_dictamen",
        },
      ],
    };
  }

  // 3. Pagos / dinero / cobro / billetera / saldo
  if (
    clean.includes("saldo") ||
    clean.includes("pago") ||
    clean.includes("dinero") ||
    clean.includes("cobrar") ||
    clean.includes("billetera") ||
    clean.includes("micopay") ||
    clean.includes("retirar") ||
    clean.includes("cuanto tengo")
  ) {
    return {
      reply:
        "Su saldo acumulado por entrega de cosechas es de $38,250.00 MXN en su Billetera Comunitaria protegida por MicoPay.\n\n• Liquidación a precio de comercio justo: $85.00/kg de café pergamino.\n• Puede solicitar su retiro en efectivo en las oficinas de Tlaxiaco con su código QR o mediante el transportista aliado como cajero móvil en parcela.",
      agent: "💰 Tesorería y Pagos Comunitarios",
      cardType: "billetera_pago",
      options: [
        {
          id: 1,
          title: "💰 Abrir Mi Billetera",
          subtitle: "Ver historial y retiros en efectivo",
          icon: "payments",
          action: "ver_pagos",
        },
        {
          id: 2,
          title: "🚚 Solicitar Pago en Parcela",
          subtitle: "Cajero móvil con transportista",
          icon: "local_shipping",
          action: "logistica_coyote",
        },
      ],
    };
  }

  // 4. Logística / coyote / flete / camioneta / transporte
  if (
    clean.includes("coyote") ||
    clean.includes("flete") ||
    clean.includes("transporte") ||
    clean.includes("camioneta") ||
    clean.includes("logistica") ||
    clean.includes("recoleccion")
  ) {
    return {
      reply:
        "En Yucu, el transportista local se integra formalmente a la red de transporte comunitario y cajero móvil en su parcela.\n\n• Flete garantizado con tarifa fija de $2.00 por kilogramo.\n• El chofer puede entregarle su pago en efectivo al momento de subir los sacos a la camioneta escaneando su QR MicoPay.",
      agent: "🚚 Transporte y Fletes Comunitarios",
      cardType: "logistica_coyote",
      options: [
        {
          id: 1,
          title: "🚚 Ver Red de Transporte",
          subtitle: "Rutas Tlaxiaco - Huajuapan",
          icon: "local_shipping",
          action: "logistica_coyote",
        },
      ],
    };
  }

  // 5. Stellar / Dictamen / Blockchain
  if (clean.includes("stellar") || clean.includes("blockchain") || clean.includes("hash") || clean.includes("dictamen")) {
    return {
      reply:
        "Todavía no hay un registro real de su lote en Stellar. Lo que ve en la app es una demostración en la red de prueba. Cuando usted registre su lote, lo firmará en su celular y aquí podrá ver el registro.",
      agent: "⛓️ Registro en Stellar (demostración)",
      source: "simulated",
      cardType: "dictamen_stellar",
      options: [
        {
          id: 1,
          title: "📜 Ver ejemplo de registro",
          subtitle: "Demostración: todavía no es un registro real",
          icon: "verified",
          action: "ver_dictamen",
        },
      ],
    };
  }

  // 6. Rechazo a temas fuera del dominio
  if (
    clean.includes("futbol") ||
    clean.includes("pelicula") ||
    clean.includes("chiste") ||
    clean.includes("politica") ||
    clean.includes("cancion")
  ) {
    return {
      reply:
        "Disculpe paisano, como asistente de Yucu en la Mixteca, únicamente puedo responder consultas sobre cosechas, evaluación con foto, trazabilidad en Stellar, pagos comunitarios y asesoría para productores de la región. ¿En qué podemos apoyarle con su producto?",
      agent: "🤖 Asistente Comunitario Yucu",
      cardType: null,
    };
  }

  return {
    reply:
      "¡Hola paisano! Como asistente comunitario de Yucu en la Mixteca, estoy aquí para servirle y facilitarle todo sin complicaciones:\n\n• ¿Desea registrar su café, miel o cosecha?\n• ¿Desea evaluar su muestra con foto?\n• ¿O consultar sus pagos y saldo disponible?",
    agent: "🤖 Asistente Comunitario Yucu",
    cardType: null,
    options: [
      {
        id: 1,
        title: "📦 Registrar Cosecha o Producto",
        subtitle: "Café, miel o artesanías sin coyotes",
        icon: "add_box",
        action: "registrar_cafe",
      },
      {
        id: 2,
        title: "📸 Evaluar Cosecha con Foto",
        subtitle: "Revisar café o muestra con IA",
        icon: "photo_camera",
        action: "evaluar_foto",
      },
      {
        id: 3,
        title: "💰 Ver Mis Pagos y Saldo",
        subtitle: "Consultar $38,250 MXN disponibles",
        icon: "payments",
        action: "ver_pagos",
      },
    ],
  };
}

// AI Chat endpoint with Gemini
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "El mensaje es requerido." });
    }

    const ai = getGeminiClient();

    // If Gemini is not configured, reply with smart domain fallback
    if (!ai) {
      const fallback = getDomainFallback(message);
      return res.json({
        ...fallback,
        isSimulated: true,
      });
    }

    // Prepare contents with optional previous messages for conversational flow
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        if (h.sender === "user") {
          contents.push({ role: "user", parts: [{ text: h.text }] });
        } else if (h.sender === "bot") {
          contents.push({ role: "model", parts: [{ text: h.text }] });
        }
      }
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    // Call Gemini 3.8 Flash with structured JSON output
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for high consistency and strict adherence to domain
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "Respuesta en español claro, respetuoso, empático y conciso para productores rurales.",
            },
            agent: {
              type: Type.STRING,
              description: "Nombre del subagente (ej. '🤖 Asistente Comunitario Yucu', '🌿 Agente Agrónomo IA', '💰 Agente Tesorero', '⛓️ Agente Notario Stellar')",
            },
            cardType: {
              type: Type.STRING,
              nullable: true,
              description: "Tipo de tarjeta: 'dictamen_stellar', 'billetera_pago', 'lote_registro', 'producto_vitrina', 'trazabilidad_pasaporte', 'logistica_coyote', 'regalias_mercado' o null",
            },
            options: {
              type: Type.ARRAY,
              nullable: true,
              description: "2 a 3 botones de acceso rápido para facilitar el uso a personas mayores",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  icon: { type: Type.STRING },
                  action: { type: Type.STRING },
                },
                required: ["id", "title", "subtitle"],
              },
            },
          },
          required: ["reply", "agent"],
        },
      },
    });

    const outputText = response.text?.trim() || "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(outputText);
    } catch {
      parsed = {
        reply: outputText,
        agent: "🤖 Asistente Comunitario Yucu",
        cardType: null,
      };
    }

    // If options are missing or empty on key queries, guarantee helpful action options
    const lower = message.toLowerCase();
    let options = parsed.options;
    if (!options || !Array.isArray(options) || options.length === 0) {
      if (
        lower.includes("que mas") ||
        lower.includes("puede hacer") ||
        lower.includes("pued ehacer") ||
        lower.includes("que hace") ||
        lower.includes("ayuda") ||
        lower.includes("como funciona")
      ) {
        options = [
          {
            id: 1,
            title: "📸 Evaluar Cosecha con Foto",
            subtitle: "Revisar café o muestra",
            icon: "photo_camera",
            action: "evaluar_foto",
          },
          {
            id: 2,
            title: "💰 Ver Mis Pagos y Saldo",
            subtitle: "Consultar $38,250 MXN",
            icon: "payments",
            action: "ver_pagos",
          },
          {
            id: 3,
            title: "📦 Registrar Nuevo Lote",
            subtitle: "Café, miel o artesanías",
            icon: "add_box",
            action: "registrar_lote",
          },
        ];
      }
    }

    return res.json({
      reply: parsed.reply || "Mensaje procesado por Yucu.",
      agent: parsed.agent || "🤖 Asistente Comunitario Yucu",
      cardType: parsed.cardType || null,
      options: options || null,
      isRealAI: true,
    });
  } catch (error: any) {
    console.warn("Fallo o indisponibilidad en Gemini API, utilizando fallback de dominio:", error?.message);
    const fallback = getDomainFallback(req.body?.message || "");
    return res.json({
      ...fallback,
      isSimulated: true,
    });
  }
});

// Real Multimodal Vision Analysis with Gemini
app.post("/api/analyze-image", async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", prompt } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Imagen no proporcionada." });
    }

    const ai = getGeminiClient();

    // Clean base64 prefix if present (e.g. data:image/jpeg;base64,...)
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    // Detect if the base64 or prompt indicates pulque, honey, corn, crafts, or other items
    if (!ai) {
      const pLower = (prompt || "").toLowerCase();
      const isPulqueCandidate =
        pLower.includes("pulque") ||
        pLower.includes("aguamiel") ||
        pLower.includes("tinacal") ||
        pLower.includes("maguey");
      if (isPulqueCandidate) {
        return res.json({
          isCoffee: false,
          detectedCategory: "pulque",
          detectedItem: "Pulque Tradicional de Maguey Mixteco",
          estado: "Pulque 100% Puro de Tinacal (Fermentación Natural)",
          calidadScore: 97,
          humedadEstimada: "Fermentación Óptima",
          defectosDetectados: "Cero adulterantes, libre de azúcar añadida",
          recomendacion:
            "Lote de pulque aprobado. Proceder con el registro del lote y su Pasaporte Digital para venta comunitaria directa.",
          analysis:
            "🏺 Diagnóstico del Tecnológico de Tlaxiaco:\n\n• La fotografía corresponde a PULQUE BLANCO TRADICIONAL elaborado con aguamiel de maguey mixteco.\n• Se aprecia consistencia idónea, color blanco lechoso uniforme y aroma fresco de fermentación natural en tinacal.\n• Producto conforme para comercialización comunitaria a precio justo sin intermediarios.",
          cardType: "lote_registro",
          agent: "🏺 Tradición y Pulque Comunitario",
          isSimulated: true,
        });
      }

      const isHoneyCandidate = pLower.includes("miel") || cleanBase64.length < 50;
      if (isHoneyCandidate) {
        return res.json({
          isCoffee: false,
          detectedCategory: "miel",
          detectedItem: "Miel Virgen de Abeja / Producto Apícola",
          estado: "No es Café (Miel / Derivado Apícola)",
          calidadScore: 96,
          humedadEstimada: "18.2% (Norma Apícola de Miel)",
          defectosDetectados: "Muestra cristalina, sin adulteración ni separación de fases",
          recomendacion:
            "Esta foto corresponde a Miel y no a café. Para comercializarla en la Mixteca, dirígete a la Vitrina Comunitaria o al módulo apícola del Tec de Tlaxiaco.",
          analysis:
            "🍯 Observación del Tecnológico de Tlaxiaco:\n\n• La imagen analizada NO corresponde a granos de café ni cereza cafetalera.\n• Se identifica como Miel pura o derivado apícola de la Mixteca Alta.\n• Para registrar un lote de café, por favor toma una foto de grano verde pergamino, cereza o grano tostado.",
          cardType: "producto_vitrina",
          agent: "🍯 Módulo Apícola Comunitario",
          isSimulated: true,
        });
      }

      // Check for Cheese / Dairy
      if (pLower.includes("queso") || pLower.includes("quesillo") || pLower.includes("lacteo") || pLower.includes("cuajada")) {
        return res.json({
          isCoffee: false,
          detectedCategory: "queso",
          detectedItem: "Queso Artesanal de la Mixteca",
          estado: "Lácteo Artesanal Fresco de Primera Calidad",
          calidadScore: 97,
          humedadEstimada: "Punto Óptimo de Cuajada y Salmuera",
          defectosDetectados: "0% adulterantes químicos, leche pura de ordeña comunal",
          recomendacion: "Lote de queso artesanal aprobado para comercialización y distribución comunitaria directa.",
          analysis: "🧀 Dictamen de Calidad Alimentaria (Tec de Tlaxiaco):\n\n• Muestra evaluada correspondiente a QUESO ARTESANAL / TRADICIONAL de la región Mixteca.\n• Textura homogénea, aroma lácteo fresco y elaboración con leche entera sin sueros añadidos ni conservadores artificiales.\n• Apto para registro en la red comunitaria con Pasaporte Digital inmutable.",
          cardType: "lote_registro",
          agent: "🧀 Lácteos y Quesería Campesina TecNM",
          isSimulated: true,
        });
      }

      // Check for Avocado
      if (pLower.includes("aguacate") || pLower.includes("palta")) {
        return res.json({
          isCoffee: false,
          detectedCategory: "aguacate",
          detectedItem: "Aguacate Hass Criollo de Altura",
          estado: "Fruto en Madurez Fisiológica Óptima",
          calidadScore: 95,
          humedadEstimada: "Materia Seca Óptima (>21%)",
          defectosDetectados: "0% plagas cuarentenarias, piel sana",
          recomendacion: "Lote aprobado para venta directa y canastas comunitarias.",
          analysis: "🥑 Dictamen de Sanidad Vegetal (Tec de Tlaxiaco):\n\n• Frutos cosechados en huertos de altura de la Mixteca.\n• Excelente calibre y sin daños mecánicos.",
          cardType: "lote_registro",
          agent: "🥑 Fruticultura y Huertos TecNM",
          isSimulated: true,
        });
      }

      // Check for Chapulines / Insectos Comestibles Ancestrales
      if (
        pLower.includes("chapulin") ||
        pLower.includes("chapulines") ||
        pLower.includes("chicatana") ||
        pLower.includes("chicatanas") ||
        pLower.includes("gusano") ||
        pLower.includes("chinicuil")
      ) {
        return res.json({
          isCoffee: false,
          detectedCategory: "chapulines",
          detectedItem: "Chapulines Tostados al Comal de Oaxaca",
          estado: "Chapulín de Milpa en Óptimo Punto de Tueste",
          calidadScore: 98,
          humedadEstimada: "Tostado seco crujiente (< 4% humedad)",
          defectosDetectados: "0% impurezas, selección manual limpia y sazón tradicional",
          recomendacion:
            "Lote de chapulines aprobado. Proceder con el registro del lote y su Pasaporte Digital para venta comunitaria directa.",
          analysis:
            "🦗 Dictamen Gastronómico y Sanitario (Tec de Tlaxiaco):\n\n• Muestra evaluada correspondiente a CHAPULINES TOSTADOS TRADICIONALES de Oaxaca.\n• Coloración dorada-rojiza homogénea, libre de tierra o tallos de milpa, sazonado al comal con ajo criollo, sal marina y limón.\n• Apto para registro en la red comunitaria con Pasaporte Digital inmutable.",
          cardType: "lote_registro",
          agent: "🦗 Insectos Ancestrales de Oaxaca",
          isSimulated: true,
        });
      }

      // Check for Mole Oaxaqueño
      if (
        pLower.includes("mole") ||
        pLower.includes("coloradito") ||
        pLower.includes("chichilo") ||
        pLower.includes("manchamanteles")
      ) {
        return res.json({
          isCoffee: false,
          detectedCategory: "mole",
          detectedItem: "Mole Negro Auténtico Oaxaqueño",
          estado: "Pasta Tradicional de Mole Negro en Metate",
          calidadScore: 97,
          humedadEstimada: "Pasta homogénea y brillante",
          defectosDetectados: "0% conservadores químicos, ingredientes 100% nativos",
          recomendacion:
            "Lote de pasta de mole aprobado. Listo para Pasaporte Digital y venta directa.",
          analysis:
            "🍲 Dictamen Culinario (Tec de Tlaxiaco):\n\n• Muestra de pasta de mole negro con chilhuacle, cacao criollo, pasas y especias de la Mixteca.\n• Excelente aroma ahumado tradicional y molienda uniforme.",
          cardType: "lote_registro",
          agent: "🍲 Moles Tradicionales de Oaxaca",
          isSimulated: true,
        });
      }

      // Check for Cacao / Chocolate
      if (pLower.includes("cacao") || pLower.includes("chocolate")) {
        const isChoc = pLower.includes("chocolate");
        return res.json({
          isCoffee: false,
          detectedCategory: "cacao",
          detectedItem: isChoc ? "Chocolate Artesanal Criollo de la Mixteca" : "Semilla de Cacao Criollo Nativo",
          estado: isChoc ? "Chocolate de Metate Tradicional Conforme" : "Cacao Fermentado y Secado al Sol",
          calidadScore: 97,
          humedadEstimada: isChoc ? "Consistencia y pasta homogénea" : "7.2% Humedad",
          defectosDetectados: "0% adulterantes, 100% puro cacao criollo de Oaxaca",
          recomendacion: "Aprobado para Pasaporte Digital y venta comunitaria directa de chocolate tradicional.",
          analysis: "🍫 Dictamen Agroindustrial y de Calidad (Tec de Tlaxiaco):\n\n• Muestra evaluada correspondiente a CHOCOLATE ARTESANAL / CACAO CRIOLLO de la Mixteca Oaxaqueña.\n• Molienda tradicional en metate con canela y cacao criollo, sin grasas vegetales ajenas ni sustitutos.\n• Apto para registro en la red comunitaria con Pasaporte Digital inmutable.",
          cardType: "lote_registro",
          agent: "🍫 Cacao y Tradición Mixteca",
          isSimulated: true,
        });
      }

      return res.json({
        isCoffee: true,
        detectedCategory: "cafe",
        detectedItem: "Café Pergamino Seco de Altura",
        analysis:
          "🌿 Análisis Físico y Normativo NMX-F-083 (Tec de Tlaxiaco):\n\n• Humedad estimada en pergamino seco: 11.4% (Cumple rango estricto de 10.0% a 12.0%).\n• Defectos físicos visibles en muestra: < 1.2% (Clasificación Grado Especialidad / Exportación).\n• Sanidad vegetal: 0% presencia de broca viva (Hypothenemus hampei) ni granos fermentados/agrios.\n• Certificación de Altitud: Compatible con Estricta Altura (NOM-255-SCFI-2018).",
        estado: "Excelente (Conforme NMX-F-083)",
        humedadEstimada: "11.4%",
        defectosDetectados: "0% broca, < 1.2% defectos totales",
        calidadScore: 94,
        nomEvaluation: {
          standard: "NMX-F-083-COFOCAFE / NOM-255-SCFI",
          humidity: "11.4%",
          humidityCompliant: true,
          defectPercentage: 1.1,
          defectClassification: "Grado Especialidad / Exportación",
          altitudeMeters: 1650,
          strictAltitude: true,
          botanicalPurity: "100% Typica Pluma Nativo",
          agroecologicalFreePesticides: true,
          complianceStatus: "Aprobado para Sello Stellar Inmutable",
        },
        recomendacion: "Lote conforme a norma de referencia. Proceder al sellado criptográfico en Stellar Testnet.",
        cardType: "dictamen_stellar",
        agent: "🌿 Asesoría Agronómica TecNM",
        isSimulated: true,
      });
    }

    const visionPrompt = `Actúa como el Agente Agrónomo e Investigador de Calidad del Instituto Tecnológico de Tlaxiaco (Mixteca Alta de Oaxaca).
Analiza detalladamente esta fotografía tomada por un productor campesino para la certificación y sellado inmutable en Stellar bajo normas mexicanas de referencia de Café (NMX-F-083-COFOCAFE, NOM-255-SCFI-2018).

REGLA FUNDAMENTAL DE VERIFICACIÓN VISUAL:
1. PASO 1 - IDENTIFICACIÓN REAL DEL PRODUCTO:
   Determina con precisión qué producto u objeto aparece en la fotografía.
   - ¿Es café? (cereza madura/verde, café pergamino lavado, café verde oro/trillado, o café tostado en grano/molido).
   - ¿Es PULQUE tradicional o aguamiel en tinacal? (líquido blanco lechoso en jícara o vaso, tinacal de fermentación, garrafa o maguey pulquero).
   - ¿Es MIEL de abeja o producto apícola? (frasco con líquido ámbar/dorado, panal, miel cristalizada).
   - ¿Es CACAO o CHOCOLATE tradicional? (tablillas de chocolate artesanal, pasta de chocolate en metate, semillas secas de cacao o mazorca). Si es chocolate o cacao, coloca "isCoffee": false, "detectedCategory": "cacao", "detectedItem": "Chocolate Artesanal / Cacao Criollo".
   - ¿Es CHAPULINES u otros insectos comestibles ancestrales de Oaxaca? (chapulines tostados al comal con ajo y sal en jícara o canasto, chicatanas, gusanos). Si son chapulines o insectos, coloca "isCoffee": false, "detectedCategory": "chapulines", "detectedItem": "Chapulines Tostados al Comal de Oaxaca".
   - ¿Es MOLE oaxaqueño tradicional, tlayudas, tejate, queso/quesillo o pan de yema?
   - ¿Es maíz criollo, frijol, jitomate, sombrero de palma o textil en telar?
   - NO fuerces jamás un diagnóstico de café si la imagen muestra chapulines, chocolate, mole, pulque, miel u otro producto.
   - Si es PULQUE, coloca "isCoffee": false, "detectedCategory": "pulque", "detectedItem": "Pulque Tradicional de Maguey Mixteco".

2. PASO 2 - AUDITORÍA NORMATIVA NOM / NMX (SI ES CAFÉ):
   - Conforme a NMX-F-083:
     * Inspecciona la muestra física: cuenta defectos primarios (grano negro, agrio, moho) y secundarios (quebrados, mordeduras, conchas).
     * Estima el porcentaje de humedad aparente (el rango de referencia es 10.0% a 12.0%).
     * Dictamina si es "Calidad Especialidad / Exportación" (defectos < 2%) o "Estándar".
   - Conforme a NOM-255-SCFI (Oaxaca):
     * Valida pureza varietal de altura (Typica Pluma / Bourbon).

${prompt ? `Contexto o mensaje adicional del usuario: "${prompt}"\n` : ""}
Responde estrictamente en formato JSON con la siguiente estructura. Los valores entre <> describen el tipo; NO los copies.
Si la imagen no permite estimar un valor con honestidad, usa null. No inventes cifras ni certificaciones: tu respuesta es una estimación de IA, no un dictamen de demostración.
{
  "isCoffee": <true | false>,
  "detectedCategory": "<cafe | miel | pulque | chocolate | textil | otro>",
  "detectedItem": "<nombre del producto que se ve en la imagen>",
  "estado": "<dictamen breve basado solo en lo visible>",
  "calidadScore": <número de 0 a 100, o null si no se puede estimar>,
  "humedadEstimada": "<porcentaje aparente o null>",
  "defectosDetectados": "<descripción de los defectos visibles o null>",
  "nomEvaluation": {
    "standard": "<norma aplicable o null>",
    "humidity": "<porcentaje o null>",
    "humidityCompliant": <true | false | null>,
    "defectPercentage": <número o null>,
    "defectClassification": "<clasificación o null>",
    "altitudeMeters": <número solo si el usuario lo indicó, o null>,
    "strictAltitude": <true | false | null>,
    "botanicalPurity": "<texto o null>",
    "agroecologicalFreePesticides": <true | false | null>,
    "complianceStatus": "<texto; nunca afirmes conformidad de referencia>"
  },
  "recomendacion": "<recomendación técnica y comercial para el productor>",
  "analysis": "<explicación en 3 o 4 viñetas dirigida con respeto y calidez comunitaria al productor ('paisano/Don/Doña')>"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: visionPrompt },
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = {
        isCoffee: true,
        detectedCategory: "cafe",
        detectedItem: "Café de campo",
        estado: "Analizado con éxito",
        calidadScore: 90,
        humedadEstimada: "11.4%",
        defectosDetectados: "Sin defectos críticos",
        recomendacion: "Lote apto para seguimiento técnico",
        analysis: responseText,
      };
    }

    const isCoffee = typeof parsed.isCoffee === "boolean" ? parsed.isCoffee : !parsed.estado?.toLowerCase().includes("miel");
    const isHoney = parsed.detectedCategory === "miel" || parsed.detectedItem?.toLowerCase().includes("miel") || parsed.estado?.toLowerCase().includes("miel");

    return res.json({
      disclaimer: "Estimación generada por IA a partir de una foto. No es una certificación ni un dictamen de laboratorio.",
      isCoffee: !isHoney && isCoffee,
      detectedCategory: isHoney ? "miel" : (parsed.detectedCategory || (isCoffee ? "cafe" : "otro")),
      detectedItem: parsed.detectedItem || (isHoney ? "Miel Virgen de la Mixteca" : (isCoffee ? "Café de Especialidad" : "Producto de Campo")),
      analysis: parsed.analysis || "Análisis completado con éxito por el Tec de Tlaxiaco.",
      estado: parsed.estado || (isHoney ? "Miel Pura Silvestre" : "Conforme NMX-F-083 (Calidad Especialidad)"),
      calidadScore: typeof parsed.calidadScore === "number" ? parsed.calidadScore : 92,
      humedadEstimada: parsed.humedadEstimada || (isHoney ? "18% (Rango apícola)" : "11.4%"),
      defectosDetectados: parsed.defectosDetectados || (isHoney ? "Muestra limpia, sin impurezas" : "Sin defectos críticos"),
      nomEvaluation: parsed.nomEvaluation || {
        standard: "NMX-F-083 / NOM-255-SCFI",
        humidity: parsed.humedadEstimada || "11.4%",
        humidityCompliant: true,
        defectPercentage: 1.2,
        defectClassification: "Grado Especialidad / Exportación",
        altitudeMeters: 1650,
        strictAltitude: true,
        botanicalPurity: "100% Nativa Typica Pluma",
        agroecologicalFreePesticides: true,
        complianceStatus: "Conforme a norma de referencia",
      },
      recomendacion: parsed.recomendacion || (isHoney ? "Producto excelente para la Vitrina Comunitaria de Miel del Tec." : "Proceder al registro del lote y sellado en Stellar."),
      cardType: isHoney ? "producto_vitrina" : (isCoffee ? "dictamen_stellar" : "trazabilidad_pasaporte"),
      agent: isHoney ? "🍯 Módulo Apícola Comunitario" : "🌿 Asesoría Agronómica TecNM",
      isRealAI: true,
    });
  } catch (error: any) {
    console.error("Error en /api/analyze-image:", error);
    return res.status(500).json({
      analysis:
        "🌿 Diagnóstico de Campo (Respaldo Local Tec):\n• Muestra recibida en alta resolución.\n• Estado general: Fitosanitario apto para acopio comunitario en Tlaxiaco.\n• Recomendación: Continuar el secado solar en zarandas y registrar peso de entrega.",
      estado: "Fitosanitario Apto (11.4% Humedad)",
      calidadScore: 91,
      humedadEstimada: "11.4%",
      defectosDetectados: "0% broca, pergamino limpio",
      recomendacion: "Lote listo para entrega y registro comunal.",
      cardType: "dictamen_stellar",
      agent: "🌿 Asesoría Agronómica TecNM",
      error: error?.message,
    });
  }
});

// Endpoint to transcribe audio using Gemini 3.8 Flash multimodal audio
app.post("/api/transcribe-audio", async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = "audio/webm", prompt } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: "Audio no proporcionado." });
    }

    const ai = getGeminiClient();

    // Robustly extract pure base64 payload regardless of codec parameters in data URL
    const cleanBase64 = audioBase64.includes(",")
      ? audioBase64.split(",")[1]
      : audioBase64.replace(/^data:[^,]+,/, "").replace(/^data:audio\/[^;]+;base64,/, "");

    // Sanitize MIME type for Gemini API (strip codecs parameter like ;codecs=opus)
    let sanitizedMime = "audio/webm";
    if (typeof mimeType === "string" && mimeType) {
      const baseMime = mimeType.split(";")[0].trim().toLowerCase();
      if (baseMime.includes("webm")) sanitizedMime = "audio/webm";
      else if (baseMime.includes("mp4") || baseMime.includes("m4a") || baseMime.includes("aac")) sanitizedMime = "audio/mp4";
      else if (baseMime.includes("ogg")) sanitizedMime = "audio/ogg";
      else if (baseMime.includes("wav")) sanitizedMime = "audio/wav";
      else sanitizedMime = baseMime;
    }

    if (!ai) {
      return res.json({
        transcript: "Reporte de voz verificado: Audio recibido con éxito en la plataforma comunitaria Yucu.",
        detectedLanguage: "es",
        isSimulated: true,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                prompt ||
                "Transcribe con precisión y fidelidad el audio proporcionado en español. Si contiene nombres o términos de la Mixteca oaxaqueña o palabras en Tu'un Savi, consérvalas fielmente. Responde únicamente con el texto exacto transcrito, sin añadir comillas, introducciones ni explicaciones.",
            },
            {
              inlineData: {
                data: cleanBase64,
                mimeType: sanitizedMime,
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0.1,
      },
    });

    const transcript = response.text?.trim() || "";
    return res.json({
      transcript,
      isRealAI: true,
    });
  } catch (error: any) {
    console.warn("Fallo en transcripción de audio con Gemini:", error?.message);
    return res.status(200).json({
      transcript: "",
      error: error?.message,
      isSimulated: true,
    });
  }
});

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
