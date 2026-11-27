import { Router, Request, Response } from "express";
import { PROTOCOL_FEES } from "../../config/protocolFees";

// Rutas /api/v1/* (antes estaban en server.ts). Ver docs/arquitectura/SERVIDOR.md, sección 2.
export const legacyRoutes = Router();

// ============================================================================
// YUCU PROTOCOL: DEVELOPER & RWA ATTESTATION INFRASTRUCTURE REST API (v1)
// Designed for external consumption by fintechs, roasters, agtechs & dApps
// ============================================================================

// 1. Protocol Specification & Soroban Smart Contract Metadata
legacyRoutes.get("/protocol/spec", (_req: Request, res: Response) => {
  res.json({
    // Varias direcciones de contratos y oráculos de esta ficha son de ejemplo (#106).
    source: "simulated",
    protocol: "Yucu Protocol",
    version: "1.2.0-prototype",
    network: {
      ledger: "Stellar Network",
      vm: "Soroban (WebAssembly / Rust)",
      rpcEndpoint: "https://soroban-testnet.stellar.org",
      networkPassphrase: "Test SDF Network ; September 2015",
    },
    standards: {
      escrow: "Trustless Work Soroban Standard (ADR-001)",
      identity: "W3C Offline-First PWA + Community Ed25519 Key derivation (ADR-002)",
      traceability: "GS1 Digital Link + ISO/IEC 18004 Vector Hang-Tag",
      assetCompliance: "SEP-8 (Regulated Assets) & SEP-40 (Oracle Feeds)",
    },
    contracts: {
      attestationRegistry: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
      trustlessWorkEscrow: "CA6D3K64P2K3M5K739A776SOROBANFAIRESCROWMIXTECA0001COMMUNAL",
      treasuryFeeBumpRelayer: "GRELAYER_TECNM_FEE_BUMP_SPONSOR_MASTER_TREASURY_0001",
    },
    schemas: [
      { id: "0x01_VOICE_ORIGIN", name: "Origen Oral & Geográfico Indígena", issuer: "Asamblea Comunal & Notario Acústico Tu'un Savi" },
      { id: "0x02_QUALITY_SCAA", name: "Calidad Óptica & Fitosanitaria SCAA", issuer: "Laboratorio de Calidad TecNM (>85 pts)" },
      { id: "0x03_EUDR_DEFORESTATION", name: "Anti-Deforestación Satelital Copernicus", issuer: "Sentinel-2 Multiespectral Geofence (EUDR 2026)" },
      { id: "0x04_SETTLEMENT_CLEARANCE", name: "Custodia de Hitos & Liquidación Trustless Work", issuer: "Smart Contract Soroban + Banxico SPEI" },
      { id: "0x05_DPP_CIRCULARITY", name: "Pasaporte Digital de Producto Europeo (ESPR) & Insetting de Carbono", issuer: "Calculadora de Biomasa Agroforestal Mixteca" },
      { id: "0x06_INDIGENOUS_IP", name: `Escudo de Patrimonio Cultural Colectivo & Regalías (${PROTOCOL_FEES.artisanResaleRoyaltyPct}%+${PROTOCOL_FEES.resaleTequioPct}%)`, issuer: "Registro de Diseños Tradicionales (Ley 2022)" },
      { id: "0x07_IOT_COLD_CHAIN", name: "Telemetría Dinámica de Tránsito (Humedad/Temp/Brix)", issuer: "Sensores IoT en Almacenamiento Temporal Soroban (TTL 60d)" },
      { id: "0x08_SANCTION_USMCA", name: "Regla de Origen T-MEC & Despacho Aduanal Fitosanitario", issuer: "SENASICA / USDA Organic Conformity Gateway" }
    ],
    oracles: [
      { id: "IndigenousVoiceAgent", dialect: "Tu'un Savi / Spanish", role: "Oral harvest ingestion & SHA-256 digest" },
      { id: "SCAACuppingVisionAgent", domain: "SCAA Specialty (>85 pts) / Master Textiles", role: "Sensory & optical audit" },
      { id: "SentinelEUDRSatelliteAgent", satellite: "Copernicus Sentinel-2 Multispectral", role: "Anti-deforestation proof" },
      { id: "DPPCircularityAgent", standard: "EU ESPR / GS1 Digital Link", role: "Carbon insetting & lifecycle passport" },
      { id: "IndigenousIPGuardianAgent", legalFramework: "Ley Federal Protección Patrimonio 2022", role: "Anti-biopiracy & royalty enforcement" },
      { id: "SettlementSolverAgent", rails: ["Banxico SPEI", "MicoPay Cash", "Polar QR Simple", "PIX"], role: "Zero-fee off-ramp" }
    ],
    storagePolicy: {
      ephemeralTelemetry: "Soroban Temporary Storage (TTL 60 days, near-zero cost)",
      canonicalOriginAttestation: "Soroban Persistent Storage (Auto-bumped by TecNM Relayer)",
    }
  });
});

// Ayudantes de la #106: validar el código del lote y responder errores con la forma de SERVIDOR.md (sección 4).
// Formato del código de lote: 2 a 4 letras, guion, año de 4 dígitos, guion, 3 o 4 dígitos (por ejemplo, MX-2024-884).
const LOT_CODE = /^[A-Z]{2,4}-\d{4}-\d{3,4}$/;

/** Devuelve el código en mayúsculas si es válido; si no, null. */
export function normalizeLotCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  return LOT_CODE.test(code) ? code : null;
}

function invalidLotCode(res: Response) {
  return res.status(400).json({
    error: "El código del lote no es válido. Debe verse así: MX-2024-884.",
    code: "INVALID_LOT_CODE",
  });
}

// 2. Verificar una atestación: 501 hasta que exista la versión real.
// Una verificación sirve solo si es real: un "verified: true" de ejemplo engaña a quien lo consuma.
// La verificación real lee la red con AttestationPort (ADR-005); el servidor no tiene API de lectura propia.
legacyRoutes.post("/attestations/verify", (req: Request, res: Response) => {
  if (!normalizeLotCode(req.body?.lotCode)) return invalidLotCode(res);
  return res.status(501).json({
    error: "La verificación de atestaciones todavía no está disponible.",
    code: "NOT_IMPLEMENTED",
  });
});

// 3. Emitir una atestación: 501.
// El servidor nunca emite ni firma por nadie: la persona prepara, firma en su teléfono y envía (AGENTS.md, regla 1).
legacyRoutes.post("/attestations/issue", (req: Request, res: Response) => {
  if (!normalizeLotCode(req.body?.lotCode)) return invalidLotCode(res);
  return res.status(501).json({
    error: "La emisión de atestaciones todavía no está disponible.",
    code: "NOT_IMPLEMENTED",
  });
});

// 4. Pasaporte del lote: datos de demostración marcados como simulados.
// Sin "VerifiableCredential", sin firma (proof), sin hashes y sin nombres de personas.
legacyRoutes.get("/lots/:code/passport", (req: Request, res: Response) => {
  const code = normalizeLotCode(req.params.code);
  if (!code) return invalidLotCode(res);
  return res.json({
    source: "simulated",
    notice: "Ejemplo de demostración. No es un pasaporte real ni está registrado en la red.",
    lotCode: code,
    example: {
      community: "Mixteca Alta, Oaxaca",
      altitudeMeters: 1720,
      varieties: ["Typica", "Bourbon"],
      process: "Lavado tradicional",
    },
  });
});

// 5. Developer Webhook Event Catalog
legacyRoutes.get("/developer/webhooks/catalog", (_req: Request, res: Response) => {
  res.json({
    description: "Yucu Protocol Reactive Event Webhooks for Logistics, Exporters, and ERPs",
    events: [
      {
        topic: "yucu.attestation.issued",
        description: "Fires when an AI Oracle + Community Council anchors a new verifiable attestation on Soroban."
      },
      {
        topic: "yucu.escrow.milestone_unlocked",
        description: "Fires when an on-chain milestone unlocks funds to the producer (SPEI / Cash MicoPay)."
      },
      {
        topic: "yucu.eudr.compliance_alert",
        description: "Fires if satellite telemetry detects vegetation disturbance in the registered parcel."
      },
      {
        topic: "yucu.logistics.handover_confirmed",
        description: "Fires when the sack QR tag is scanned at the central Tlaxiaco warehouse."
      }
    ]
  });
});
