import { Keypair, Networks, StrKey } from "@stellar/stellar-sdk";

// Configuración del patrocinio de comisiones y reservas (#94).
// Todo es testnet (docs/arquitectura/SERVIDOR.md, sección 6).

/** IDs de contratos de contracts/deployments/testnet.json que la app usa. Una prueba revisa que coincidan. */
export const TESTNET_CONTRACTS = {
  lotPassport: "CAPXWYKU5GESGPZ57LNRCLOVHSBGDOZQVAWC6CWIQ655RSZ2ZGZI2BO7",
  perpetualRoyalties: "CCNPTDDVW3RW53YQACZ2UFFHVLUJXNCMZ3TSK7TB552SUU6DDL26FRKU",
} as const;

/**
 * Lista blanca: qué funciones de cada contrato se patrocinan. Solo las que firma la propia persona.
 * `fair_escrow` y `attestation_registry` no están: son material didáctico (AGENTS.md, regla 2).
 * `certify_lot` tampoco: la firma el certificador de la plataforma (#92), no la artesana.
 */
export const SPONSORED_CONTRACT_FUNCTIONS: Readonly<Record<string, readonly string[]>> = {
  [TESTNET_CONTRACTS.lotPassport]: ["register_lot"],
  [TESTNET_CONTRACTS.perpetualRoyalties]: ["register_heritage_item", "execute_secondary_sale"],
};

/**
 * Funciones del flujo de un escrow de Trustless Work que firma la persona (#96).
 * Solo se patrocinan si el escrow es de una compra dada de alta (SponsorStore.isRegisteredEscrow).
 */
export const SPONSORED_ESCROW_FUNCTIONS: readonly string[] = [
  "fund_escrow",
  "change_milestone_status",
  "approve_milestone",
  "release_funds",
  "dispute_escrow",
];

export const TESTNET_RPC_URL = "https://soroban-testnet.stellar.org";

export interface SponsorConfig {
  /** Llave de la cuenta patrocinadora. `null` si falta o no es válida: las rutas responden 503. */
  sponsor: Keypair | null;
  networkPassphrase: string;
  rpcUrl: string;
  /** Emisor del USDC configurado. `null`: no se patrocinan trustlines ni altas de cuenta. */
  usdcIssuer: string | null;
  /** Comisión máxima por transacción, en stroops (`SPONSOR_MAX_FEE`). */
  maxFee: number;
  /** Transacciones patrocinadas por cuenta y por día (`SPONSOR_MAX_TX_PER_DAY`). */
  maxTxPerDay: number;
  /** Altas de cuenta con reserva patrocinada por día, en total (`SPONSOR_MAX_ACCOUNTS_PER_DAY`). */
  maxAccountsPerDay: number;
  /** Gasto máximo de la cuenta patrocinadora por día, en stroops (`SPONSOR_MAX_FEE_PER_DAY`). */
  maxFeePerDay: number;
}

export const SPONSOR_DEFAULTS = {
  maxFee: 1_000_000, // 0.1 XLM
  maxTxPerDay: 10,
  maxAccountsPerDay: 20,
  maxFeePerDay: 50_000_000, // 5 XLM
} as const;

function positiveInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === "") return fallback;
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : fallback;
}

function sponsorKeypair(secret: string | undefined): Keypair | null {
  if (!secret) return null;
  try {
    return Keypair.fromSecret(secret.trim());
  } catch {
    // Nunca se imprime la llave, ni siquiera una parte (SERVIDOR.md, sección 6).
    console.warn("STELLAR_SPONSOR_SECRET no es una llave válida: el patrocinio queda desactivado.");
    return null;
  }
}

export function loadSponsorConfig(env: Record<string, string | undefined> = process.env): SponsorConfig {
  const issuer = env.SPONSOR_USDC_ISSUER?.trim();
  return {
    sponsor: sponsorKeypair(env.STELLAR_SPONSOR_SECRET),
    networkPassphrase: Networks.TESTNET,
    rpcUrl: TESTNET_RPC_URL,
    usdcIssuer: issuer && StrKey.isValidEd25519PublicKey(issuer) ? issuer : null,
    maxFee: positiveInt(env.SPONSOR_MAX_FEE, SPONSOR_DEFAULTS.maxFee),
    maxTxPerDay: positiveInt(env.SPONSOR_MAX_TX_PER_DAY, SPONSOR_DEFAULTS.maxTxPerDay),
    maxAccountsPerDay: positiveInt(env.SPONSOR_MAX_ACCOUNTS_PER_DAY, SPONSOR_DEFAULTS.maxAccountsPerDay),
    maxFeePerDay: positiveInt(env.SPONSOR_MAX_FEE_PER_DAY, SPONSOR_DEFAULTS.maxFeePerDay),
  };
}
