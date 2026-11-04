/**
 * Yucu Core - Índice Público del Núcleo de Dominio
 * Punto de entrada único para React, PWA, Apps Android o Servicios Externos.
 *
 * Nota (ADR-003, #105): `StellarLiveClient` NO se reexporta aquí para que
 * `@stellar/stellar-sdk` nunca llegue al bundle de la interfaz de usuario.
 */

export * from './hooks/useYucuProtocol';
export * from './agents/YucuAgentSwarm';
export * from './blockchain/StellarRavenBridge';
export * from './crypto/CryptoEngine';
export * from './sync/SyncEngine';
export * from './policy/FairTradeEngine';
export * from './blockchain/SorobanAdapter';
export * from './blockchain/TrustlessWorkEscrowAdapter';
export * from './settlement/HybridSettlementOrchestrator';
export * from './auth/RaizAuthEngine';
export * from './ai/RaizAIOracles';
export * from './sdk/RaizProtocolSDK';

import { CryptoEngine } from './crypto/CryptoEngine';
import { SyncEngine } from './sync/SyncEngine';
import { FairTradeEngine } from './policy/FairTradeEngine';
import { SorobanAdapter, DEFAULT_STELLAR_CONFIG } from './blockchain/SorobanAdapter';
import { HybridSettlementOrchestrator } from './settlement/HybridSettlementOrchestrator';
import { RaizAuthEngine } from './auth/RaizAuthEngine';
import { RaizAIOracles } from './ai/RaizAIOracles';
import { raizProtocol } from './sdk/RaizProtocolSDK';

export const RaizCore = {
  crypto: CryptoEngine,
  sync: SyncEngine,
  fairTrade: FairTradeEngine,
  soroban: new SorobanAdapter(DEFAULT_STELLAR_CONFIG),
  settlement: HybridSettlementOrchestrator,
  auth: RaizAuthEngine,
  ai: RaizAIOracles,
  sdk: raizProtocol,

  /**
   * Inicializa los servicios del Core en el ciclo de vida de la app
   */
  init: () => {
    SyncEngine.initAutoSync();
    console.log('🌱 Yucu Infrastructure Protocol & AI Oracles initialized.');
  },
};

export const YucuCore = RaizCore;
export default RaizCore;
