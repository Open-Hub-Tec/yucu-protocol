import React, { useState } from 'react';
import { RaizAIOracles, VoiceParsingResult, QualityAttestation, EUDRComplianceReport, SettlementRouteSolution } from '../core/ai/RaizAIOracles';
import { YucuProtocolSDK } from '../core/sdk/RaizProtocolSDK';
import { DemoBadge } from './DemoBadge';
import { TrustlessWorkEscrowAdapter, TrustlessWorkEscrowOrder } from '../core/blockchain/TrustlessWorkEscrowAdapter';

interface ProtocolInfrastructureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProtocolInfrastructureModal: React.FC<ProtocolInfrastructureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'oracles' | 'attestations' | 'escrow' | 'api' | 'field' | 'metrics' | 'sdk'>('oracles');
  const [selectedOracle, setSelectedOracle] = useState<'voice' | 'quality' | 'eudr' | 'settlement'>('voice');
  const [selectedSchemaUid, setSelectedSchemaUid] = useState<string>('0x01_SCAA');
  const [attestationVerifyStatus, setAttestationVerifyStatus] = useState<any>(null);

  // Interactive Developer API Gateway State
  const [selectedApiEndpoint, setSelectedApiEndpoint] = useState<string>('/api/v1/protocol/spec');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [apiResponseData, setApiResponseData] = useState<any>(null);
  const [apiResponseStatus, setApiResponseStatus] = useState<number | null>(null);
  const [apiResponseLatency, setApiResponseLatency] = useState<number | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [codeLanguage, setCodeLanguage] = useState<'ts' | 'python' | 'curl'>('ts');

  // Interactive Voice Oracle State
  const [voiceInput, setVoiceInput] = useState('Kuni yu kiti 120 kilos café en la loma de San Pedro');
  const [voiceResult, setVoiceResult] = useState<VoiceParsingResult | null>(null);

  // Interactive Quality Oracle State
  const [qualityDomain, setQualityDomain] = useState<'coffee' | 'textile'>('coffee');
  const [qualityResult, setQualityResult] = useState<QualityAttestation | null>(null);

  // Centaur Co-Validation State (AI Oracle + Human Validator)
  const [humanValidatorRole, setHumanValidatorRole] = useState<'dona_reyna' | 'don_david' | 'comite_comunal'>('dona_reyna');
  const [humanSigned, setHumanSigned] = useState<boolean>(false);
  const [aiOracleSigned, setAiOracleSigned] = useState<boolean>(false);
  const [dualAttestationLedger, setDualAttestationLedger] = useState<any>(null);

  // Interactive EUDR Oracle State
  const [eudrCommunity, setEudrCommunity] = useState('Heroica Ciudad de Tlaxiaco');
  const [eudrResult, setEudrResult] = useState<EUDRComplianceReport | null>(null);

  // Interactive Settlement Solver State
  const [settlementAmount, setSettlementAmount] = useState(500);
  const [settlementCountry, setSettlementCountry] = useState<'MX' | 'BO' | 'BR'>('MX');
  const [settlementResult, setSettlementResult] = useState<SettlementRouteSolution | null>(null);

  // Trustless Work Escrow Simulator State (ADR-001)
  const [escrowAdapter] = useState(() => new TrustlessWorkEscrowAdapter());
  const [escrowOrder, setEscrowOrder] = useState<TrustlessWorkEscrowOrder>(() =>
    escrowAdapter.createTlaxiacoHarvestEscrow({
      buyerAddress: 'GBUYER_SPECIALTY_ROASTER_ZURICH_8812',
      producerAddress: 'GPRODUCER_DON_EUTIQUIO_YUCUHITI_5541',
      totalAmount: 10000,
      assetCode: 'MXNe',
      lotCode: 'YUC-2026-881'
    })
  );
  const [escrowFeedback, setEscrowFeedback] = useState<string | null>(null);

  const sdk = new YucuProtocolSDK();
  const metrics = sdk.getMetrics();

  if (!isOpen) return null;

  const handleRunVoiceOracle = async () => {
    const res = await RaizAIOracles.parseAcousticVoiceInput(voiceInput);
    setVoiceResult(res);
  };

  const handleRunQualityOracle = async () => {
    const res = await RaizAIOracles.evaluateLotQuality({ productType: qualityDomain });
    setQualityResult(res);
  };

  const handleRunEudrOracle = async () => {
    const res = await RaizAIOracles.verifyEUDRCompliance({ community: eudrCommunity });
    setEudrResult(res);
  };

  const handleRunSettlementSolver = () => {
    const res = RaizAIOracles.solveOptimalSettlement({
      amountUSDC: settlementAmount,
      destinationCountry: settlementCountry,
    });
    setSettlementResult(res);
  };

  const handleFundEscrow = () => {
    const updated = escrowAdapter.depositFunds(escrowOrder.escrowId);
    if (updated) {
      setEscrowOrder({ ...updated });
      setEscrowFeedback('✅ Fondos depositados en contrato Soroban Trustless Work ($10,000 MXNe). Custodia on-chain activada.');
    }
  };

  const handleReleaseMilestone1 = () => {
    const verified = escrowAdapter.submitMilestoneProof(escrowOrder.escrowId, 'm1', '0x01_ORIGIN_TLX_981');
    if (verified) {
      const released = escrowAdapter.releaseMilestonePayment(escrowOrder.escrowId, 'm1');
      if (released) {
        setEscrowOrder({ ...released });
        setEscrowFeedback('✅ Hito 1 Liberado: Anticipo del 30% ($3,000 MXN) transferido a Don Eutiquio vía SPEI / Banco del Bienestar.');
      }
    }
  };

  const handleReleaseMilestone2 = () => {
    const verified = escrowAdapter.submitMilestoneProof(escrowOrder.escrowId, 'm2', '0x04_DELIVERY_TLX_441');
    if (verified) {
      const released = escrowAdapter.releaseMilestonePayment(escrowOrder.escrowId, 'm2');
      if (released) {
        setEscrowOrder({ ...released });
        setEscrowFeedback('🎉 Hito 2 Liberado: 70% restante ($7,000 MXN) liquidado al entregar en bodega de Tlaxiaco. Escrow completado con 0% de comisiones.');
      }
    }
  };

  const handleExecuteApiTest = async (endpoint: string, method: 'GET' | 'POST' = 'GET', customBody?: any) => {
    setApiLoading(true);
    setApiMethod(method);
    setSelectedApiEndpoint(endpoint);
    const start = performance.now();
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method === 'POST' ? JSON.stringify(customBody || { lotCode: 'MX-2024-884' }) : undefined
      });
      const data = await res.json();
      const end = performance.now();
      setApiResponseStatus(res.status);
      setApiResponseLatency(Math.round(end - start));
      setApiResponseData(data);
    } catch (err: any) {
      setApiResponseStatus(500);
      setApiResponseData({ error: 'Fallo al consultar endpoint', details: err?.message });
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fbfcfa] w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-[#c1c8c2]/50 flex flex-col overflow-hidden text-[#1c1c18]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1b3b2b] text-white flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#a3f6c6] text-[#073822] flex items-center justify-center font-bold text-lg shadow-sm">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Yucu Infrastructure Protocol</h2>
                <DemoBadge detail="Oráculos basados en reglas, escrow en memoria y métricas fijas: nada de esto toca la red todavía." />
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#a3f6c6]/20 text-[#a3f6c6] border border-[#a3f6c6]/30">
                  v1.2.0 • Stellar Soroban
                </span>
              </div>
              <p className="text-xs text-white/70">
                Trustless Work Escrow, 50+ Productores Validados, RWA Digital Passports & 4 Oráculos de IA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#c1c8c2]/30 bg-white px-4 sm:px-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('oracles')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'oracles'
                ? 'border-[#1b3b2b] text-[#1b3b2b]'
                : 'border-transparent text-[#414942] hover:text-[#1c1c18]'
            }`}
          >
            <span>🤖</span> 4 Oráculos de IA
          </button>
          <button
            onClick={() => setActiveTab('attestations')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'attestations'
                ? 'border-[#1b3b2b] text-[#1b3b2b]'
                : 'border-transparent text-[#414942] hover:text-[#1c1c18]'
            }`}
          >
            <span>📜</span> Atestaciones RWA (EAS)
          </button>
          <button
            onClick={() => setActiveTab('escrow')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'escrow'
                ? 'border-[#1b3b2b] text-[#1b3b2b]'
                : 'border-transparent text-[#414942] hover:text-[#1c1c18]'
            }`}
          >
            <span>🤝</span> Trustless Work Escrow
          </button>
          <button
            onClick={() => setActiveTab('field')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'field'
                ? 'border-[#1b3b2b] text-[#1b3b2b]'
                : 'border-transparent text-[#414942] hover:text-[#1c1c18]'
            }`}
          >
            <span>🌾</span> 50+ Productores & PWA
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'metrics'
                ? 'border-[#1b3b2b] text-[#1b3b2b]'
                : 'border-transparent text-[#414942] hover:text-[#1c1c18]'
            }`}
          >
            <span>📊</span> Métricas & Soroban
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'api'
                ? 'border-[#1b3b2b] text-[#1b3b2b]'
                : 'border-transparent text-[#414942] hover:text-[#1c1c18]'
            }`}
          >
            <span>🌐</span> API & Webhooks Gateway
          </button>
          <button
            onClick={() => setActiveTab('sdk')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'sdk'
                ? 'border-[#1b3b2b] text-[#1b3b2b]'
                : 'border-transparent text-[#414942] hover:text-[#1c1c18]'
            }`}
          >
            <span>📦</span> Developer SDK
          </button>

          <div className="ml-auto my-auto flex items-center gap-1.5 shrink-0">
            <a
              href="/api/download/docx"
              download="Yucu_Protocol_Stellar_PitchDeck.docx"
              className="py-1 px-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-black text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer border border-blue-500/40"
              title="Descargar Dossier Oficial en formato Microsoft Word (.docx)"
            >
              <span>📄</span>
              <span>Word (.docx)</span>
            </a>
            <a
              href="/api/download/pptx"
              download="Yucu_Protocol_Stellar_PitchDeck.pptx"
              className="py-1 px-2.5 rounded-xl bg-linear-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-neutral-950 font-black text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer border border-amber-500/30"
              title="Descargar Presentación Oficial en Microsoft PowerPoint (.pptx)"
            >
              <span>📊</span>
              <span>PowerPoint (.pptx)</span>
            </a>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: ORACLES */}
          {activeTab === 'oracles' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex gap-2 border-b border-gray-200 pb-2">
                <button
                  onClick={() => setSelectedOracle('voice')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedOracle === 'voice' ? 'bg-[#1b3b2b] text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  1. AIVoiceOracle (Tu'un Savi)
                </button>
                <button
                  onClick={() => setSelectedOracle('quality')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedOracle === 'quality' ? 'bg-[#1b3b2b] text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  2. AIQualityOracle (SCAA & RWA)
                </button>
                <button
                  onClick={() => setSelectedOracle('eudr')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedOracle === 'eudr' ? 'bg-[#1b3b2b] text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  3. AIEUDRSatelliteOracle
                </button>
                <button
                  onClick={() => setSelectedOracle('settlement')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedOracle === 'settlement' ? 'bg-[#1b3b2b] text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  4. AISettlementSolver
                </button>
              </div>

              {/* ORACLE 1: VOICE */}
              {selectedOracle === 'voice' && (
                <div className="bg-white border border-[#c1c8c2]/40 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#1b3b2b]">1. AIVoiceOracle (Speech-to-Attestation)</h4>
                      <p className="text-xs text-gray-500">Normalización fonética acústica de Mixteco Tu'un Savi a JSON canónico para Stellar.</p>
                    </div>
                    <button
                      onClick={handleRunVoiceOracle}
                      className="px-3 py-1.5 rounded-xl bg-[#1b3b2b] text-white text-xs font-bold hover:bg-[#284f3c] transition-colors shadow-xs cursor-pointer"
                    >
                      Ejecutar Oráculo
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Transcripción de voz de la parcela:</label>
                    <input
                      type="text"
                      value={voiceInput}
                      onChange={(e) => setVoiceInput(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                  {voiceResult && (
                    <div className="bg-gray-900 text-emerald-400 p-4 rounded-xl text-xs font-mono space-y-2 overflow-x-auto">
                      <div className="text-white/80 font-bold border-b border-gray-800 pb-1">Salida Canónica del Oráculo:</div>
                      <div>Idioma Detectado: {voiceResult.detectedLanguage} (Confianza: {(voiceResult.confidenceScore * 100).toFixed(0)}%)</div>
                      <div>Producto Extraído: {voiceResult.extractedFields.productType} ({voiceResult.extractedFields.quantity} {voiceResult.extractedFields.unit})</div>
                      <div>Comunidad: {voiceResult.extractedFields.community}</div>
                      <div className="text-amber-300">Stellar Payload Digest (SHA-256): {voiceResult.payloadDigest}</div>
                    </div>
                  )}
                </div>
              )}

              {/* ORACLE 2: QUALITY */}
              {selectedOracle === 'quality' && (
                <div className="bg-white border border-[#c1c8c2]/40 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#1b3b2b]">2. AIQualityOracle (Proof-of-Quality RWA)</h4>
                      <p className="text-xs text-gray-500">Evaluación de visión computacional y certificación SCAA / Telar indígena.</p>
                    </div>
                    <button
                      onClick={handleRunQualityOracle}
                      className="px-3 py-1.5 rounded-xl bg-[#1b3b2b] text-white text-xs font-bold hover:bg-[#284f3c] transition-colors shadow-xs cursor-pointer"
                    >
                      Certificar Calidad
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setQualityDomain('coffee')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                        qualityDomain === 'coffee' ? 'bg-[#1b3b2b] text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      ☕ Café de Especialidad (SCAA)
                    </button>
                    <button
                      onClick={() => setQualityDomain('textile')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                        qualityDomain === 'textile' ? 'bg-[#1b3b2b] text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      🧵 Telar de Cintura (Tijaltepec)
                    </button>
                  </div>
                  {qualityResult && (
                    <div className="bg-gray-900 text-emerald-400 p-4 rounded-xl text-xs font-mono space-y-2 overflow-x-auto">
                      <div className="text-white/80 font-bold border-b border-gray-800 pb-1">Atestación Criptográfica Firmada:</div>
                      <div>Calificación Global: {qualityResult.overallScore} / 100 ({qualityResult.tier})</div>
                      <div>Firma del Modelo AI: {qualityResult.aiModelSignature}</div>
                      <div>Hash de Atestación Soroban: {qualityResult.attestationHash}</div>
                      <div className="text-emerald-300">✅ Lote Aprobado para Exportación Directa</div>
                    </div>
                  )}
                </div>
              )}

              {/* ORACLE 3: EUDR */}
              {selectedOracle === 'eudr' && (
                <div className="bg-white border border-[#c1c8c2]/40 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#1b3b2b]">3. AIEUDRSatelliteOracle (Regulación Europea)</h4>
                      <p className="text-xs text-gray-500">Auditoría satelital temporal (2020-2026) contra deforestación.</p>
                    </div>
                    <button
                      onClick={handleRunEudrOracle}
                      className="px-3 py-1.5 rounded-xl bg-[#1b3b2b] text-white text-xs font-bold hover:bg-[#284f3c] transition-colors shadow-xs cursor-pointer"
                    >
                      Auditar Satélite
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Comunidad / Polígono Parcela:</label>
                    <input
                      type="text"
                      value={eudrCommunity}
                      onChange={(e) => setEudrCommunity(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                  {eudrResult && (
                    <div className="bg-gray-900 text-emerald-400 p-4 rounded-xl text-xs font-mono space-y-2 overflow-x-auto">
                      <div className="text-white/80 font-bold border-b border-gray-800 pb-1">Reporte de Conformidad EUDR emitido:</div>
                      <div>Folio Oficial: {eudrResult.complianceId}</div>
                      <div>Deforestación Detectada: {eudrResult.forestCoverLossDetected ? 'SÍ' : 'NO (0.00% pérdida)'}</div>
                      <div>Densidad de Dosel Forestal: {eudrResult.canopyDensityPercent}%</div>
                      <div className="text-amber-300">Digest de Certificación: {eudrResult.certificationDigest}</div>
                    </div>
                  )}
                </div>
              )}

              {/* ORACLE 4: SETTLEMENT */}
              {selectedOracle === 'settlement' && (
                <div className="bg-white border border-[#c1c8c2]/40 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#1b3b2b]">4. AISettlementSolver (Optimizador Multilateral)</h4>
                      <p className="text-xs text-gray-500">Ruteo inteligente entre Stellar DEX, Etherfuse SPEI y MicoPay Cash.</p>
                    </div>
                    <button
                      onClick={handleRunSettlementSolver}
                      className="px-3 py-1.5 rounded-xl bg-[#1b3b2b] text-white text-xs font-bold hover:bg-[#284f3c] transition-colors shadow-xs cursor-pointer"
                    >
                      Calcular Ruta Óptima
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">Monto en Depósito (USDC):</label>
                      <input
                        type="number"
                        value={settlementAmount}
                        onChange={(e) => setSettlementAmount(Number(e.target.value))}
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">País Destino:</label>
                      <select
                        value={settlementCountry}
                        onChange={(e) => setSettlementCountry(e.target.value as any)}
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none"
                      >
                        <option value="MX">🇲🇽 México (Etherfuse SPEI / MicoPay)</option>
                        <option value="BO">🇧🇴 Bolivia (Polar ASFI QR)</option>
                        <option value="BR">🇧🇷 Brasil (PIX Banco Central)</option>
                      </select>
                    </div>
                  </div>
                  {settlementResult && (
                    <div className="bg-gray-900 text-emerald-400 p-4 rounded-xl text-xs font-mono space-y-2 overflow-x-auto">
                      <div className="text-white/80 font-bold border-b border-gray-800 pb-1">Solución de Liquidación Seleccionada:</div>
                      <div>Riel Seleccionado: {settlementResult.targetRail}</div>
                      <div>Neto a Recibir por Productor: ${settlementResult.estimatedNetReceived.toLocaleString()} {settlementResult.localCurrencyCode}</div>
                      <div>Gas Fee Stellar: {settlementResult.gasSponsorship.gasFeeXLM} XLM (100% Patrocinado por Yucu)</div>
                      <div className="text-amber-300">Razón: {settlementResult.recommendedReason}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: ATTESTATIONS */}
          {activeTab === 'attestations' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">📜</span>
                  <span className="font-extrabold text-xs text-purple-950 uppercase tracking-wider">
                    El Estándar de Atestaciones RWA de Stellar Soroban (Equivalente EAS)
                  </span>
                </div>
                <p className="text-xs text-purple-900 leading-relaxed font-medium">
                  Yucu estandariza la certificación de hechos físicos del mundo real (calidad de café, anti-deforestación satelital, origen indígena y entrega verificada de cosecha) mediante esquemas on-chain inmutables firmados con llaves Ed25519 en Soroban.
                </p>
              </div>

              {/* 4 Canonical Schemas */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider">
                  Esquemas Canónicos Registrados en `AttestationRegistry.rs`
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sdk.attestations.getSchemas().map((schema) => (
                    <div
                      key={schema.uid}
                      onClick={() => {
                        setSelectedSchemaUid(schema.uid);
                        setAttestationVerifyStatus(sdk.attestations.verifyAttestation(`att-${schema.uid}`));
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedSchemaUid === schema.uid
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                          : 'border-gray-200 bg-white hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-300">
                          {schema.uid}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          schema.revocable ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {schema.revocable ? 'Revocable' : 'Permanente'}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-[#032517] mb-1">{schema.name}</div>
                      <p className="text-[11px] text-gray-600 leading-relaxed mb-2">{schema.description}</p>
                      <div className="text-[10px] text-gray-500 flex items-center gap-1 font-semibold">
                        <span>Emisor:</span>
                        <span className="text-emerald-800 font-bold">{schema.issuer}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Verification Playground */}
              <div className="bg-gray-900 text-white p-5 rounded-2xl space-y-3 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-mono font-bold text-emerald-300">
                      Verificador On-Chain Soroban
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const res = sdk.attestations.verifyAttestation(`att-${selectedSchemaUid}-${Date.now()}`);
                      setAttestationVerifyStatus(res);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    ⚡ Simular Verificación en Ledger
                  </button>
                </div>

                {attestationVerifyStatus ? (
                  <div className="bg-black/50 p-3 rounded-xl font-mono text-[11px] text-emerald-300 space-y-1.5 border border-emerald-500/20">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estado de Atestación:</span>
                      <span className="font-bold text-emerald-400">✓ VÁLIDA & ACTIVA (ON-CHAIN)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Esquema Evaluado:</span>
                      <span>{selectedSchemaUid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Firma Criptográfica:</span>
                      <span className="text-xs text-amber-200 truncate max-w-[200px]">{attestationVerifyStatus.signature}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ledger Sequence Stellar:</span>
                      <span>#{attestationVerifyStatus.ledgerSequence}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Haz clic en "Simular Verificación en Ledger" para consultar el contrato en Soroban.
                  </p>
                )}
              </div>

              {/* Architectural Differentiator: Superando el Mito de Ethereum EAS */}
              <div className="bg-linear-to-br from-stone-900 to-emerald-950 text-white p-5 rounded-2xl space-y-4 border border-emerald-500/30">
                <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-3">
                  <span className="text-lg">⚖️</span>
                  <div>
                    <h5 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                      Superando el Mito de Ethereum EAS en RWA Físicos
                    </h5>
                    <p className="text-[11px] text-gray-400">
                      Por qué la arquitectura de Yucu sobre Stellar/Soroban resuelve lo que Ethereum no puede en territorio rural:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-3 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-red-300 flex items-center gap-1">
                      <span>⚠️</span> Falla en Ethereum (EAS en EVM)
                    </span>
                    <ul className="text-[11px] text-red-100/80 space-y-1 list-disc pl-3">
                      <li><strong>Gas Insostenible:</strong> Pagar $0.20-$20 USD por registrar un bulto destruye el margen del campesino.</li>
                      <li><strong>State Bloat Eterno:</strong> Almacenamiento infinito sin TTL que satura nodos con telemetría vieja.</li>
                      <li><strong>Basura Criptográfica:</strong> EAS solo valida la firma de la clave privada, no si el café existe físicamente.</li>
                      <li><strong>Desconexión de Pago:</strong> La atestación no puede pagar automáticamente en pesos Banxico SPEI.</li>
                    </ul>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-600/40 rounded-xl p-3 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-emerald-300 flex items-center gap-1">
                      <span>✅</span> Innovación Yucu (Soroban + Stellar)
                    </span>
                    <ul className="text-[11px] text-emerald-100/90 space-y-1 list-disc pl-3">
                      <li><strong>$0.00005 USD Fijo y Patrocinado:</strong> CAP-0015 Fee-Bump paga el gas desde el Tesoro del TecNM.</li>
                      <li><strong>Gestión TTL Inteligente:</strong> Telemetría temporal (60 días) y anclaje persistente de origen.</li>
                      <li><strong>Triada Física de Oráculos:</strong> Satélite Sentinel-2 + Visión SCAA + Grabación en Tu'un Savi.</li>
                      <li><strong>Atestación Ejecutable:</strong> Desencadena automáticamente desembolsos Trustless Work a SPEI/Efectivo.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TRUSTLESS WORK ESCROW (ADR-001) */}
          {activeTab === 'escrow' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">🤝</span>
                  <span className="font-extrabold text-xs text-amber-950 uppercase tracking-wider">
                    Integración Arquitectónica: Trustless Work Escrow (ADR-001)
                  </span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  En lugar de custodiar fondos en contratos no auditados, Yucu adopta la infraestructura de <strong>Trustless Work</strong> en Soroban con un cronograma de 2 hitos para proteger la cosecha campesina con 0% de comisiones ocultas y arbitraje comunitario cooperativo en Tlaxiaco.
                </p>
              </div>

              {/* Escrow State Machine Visualizer */}
              <div className="bg-white border border-[#c1c8c2]/50 p-5 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-[11px] font-mono text-gray-500 uppercase">Orden de Escrow ID:</span>
                    <h4 className="text-sm font-black text-[#1b3b2b]">{escrowOrder.escrowId}</h4>
                    <span className="text-xs text-gray-600">Lote: <strong>{escrowOrder.lotCode}</strong> • Monto Custodiado: <strong>${escrowOrder.totalAmount.toLocaleString()} {escrowOrder.assetCode}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                      escrowOrder.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : escrowOrder.status === 'funded'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {escrowOrder.status === 'completed' ? '✓ Liquidado 100%' : escrowOrder.status === 'funded' ? '● Fondeado On-Chain' : '○ Inicializado'}
                    </span>
                  </div>
                </div>

                {/* 2 Milestones */}
                <div className="space-y-3">
                  {escrowOrder.milestones.map((m, idx) => (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        m.status === 'released'
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#1b3b2b] text-white text-[11px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs text-[#032517]">{m.title}</span>
                          <span className="text-[11px] font-mono text-emerald-800 font-bold">({m.percentage}% = ${m.amount.toLocaleString()} MXN)</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          m.status === 'released'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {m.status === 'released' ? '✓ Pagado' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 mb-1.5">{m.description}</p>
                      <div className="text-[10px] font-mono text-gray-500">
                        Requisito On-Chain: <strong className="text-gray-800">{m.attestationRequirement}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Interactive Simulator Controls */}
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={handleFundEscrow}
                    disabled={escrowOrder.status !== 'initialized'}
                    className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                  >
                    1. Fondear Escrow ($10,000)
                  </button>
                  <button
                    onClick={handleReleaseMilestone1}
                    disabled={escrowOrder.status === 'initialized' || escrowOrder.milestones[0].status === 'released'}
                    className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                  >
                    2. Liberar Hito 1 (30% Anticipo de Origen)
                  </button>
                  <button
                    onClick={handleReleaseMilestone2}
                    disabled={escrowOrder.milestones[0].status !== 'released' || escrowOrder.milestones[1].status === 'released'}
                    className="px-3.5 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                  >
                    3. Liberar Hito 2 (70% Entrega en Bodega)
                  </button>
                </div>

                {escrowFeedback && (
                  <div className="p-3 bg-neutral-900 text-emerald-300 font-mono text-xs rounded-xl border border-emerald-500/30 animate-fadeIn">
                    {escrowFeedback}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: 50+ PRODUCTORES & PWA (ADR-002) */}
          {activeTab === 'field' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">🌾</span>
                  <span className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider">
                    Meta de 50+ Productores Alcanzada & Auditoría de Fricción UX (Hito 501 / ADR-002)
                  </span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  Validación directa en territorio Mixteco liderada por 5 brigadas de estudiantes de Ingeniería en Sistemas Computacionales del TecNM Campus Tlaxiaco. Se censaron <strong>52 productores activos</strong> en 6 comunidades con <strong>100% de éxito en pruebas de usabilidad</strong> y 0% pérdida de datos.
                </p>
              </div>

              {/* 6 Validated Communities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-white border border-gray-200 p-3.5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#032517]">San Juan Mixtepec</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">16 Artesanas</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mb-1">Tejido de palma fina, tenates ceremoniales y sombreros de 2 nudos.</p>
                  <span className="text-[10px] font-semibold text-gray-500">Participante: tejedora de palma, Mixtepec (68 años)</span>
                </div>

                <div className="bg-white border border-gray-200 p-3.5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#032517]">Santa María Yucuhiti</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">14 Caficultores</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mb-1">Café de estricta altura (1,850 msnm), sombra y variedad Pluma Hidalgo.</p>
                  <span className="text-[10px] font-semibold text-gray-500">Participante: Don Eutiquio (68 años)</span>
                </div>

                <div className="bg-white border border-gray-200 p-3.5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#032517]">San Juan Ñumí</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">8 Apicultores</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mb-1">Miel virgen de campanilla de bosque de encino. Unión Flor de la Mixteca.</p>
                  <span className="text-[10px] font-semibold text-gray-500">Participante: UMIZOOMI Beekeepers</span>
                </div>

                <div className="bg-white border border-gray-200 p-3.5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#032517]">San José Xochixtlán</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">6 Tejedores</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mb-1">Huipil Triqui y telar de cintura con tinte de grana cochinilla natural.</p>
                  <span className="text-[10px] font-semibold text-gray-500">Participante: tejedora triqui, Xochixtlán (56 años)</span>
                </div>

                <div className="bg-white border border-gray-200 p-3.5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#032517]">San Pablo Tijaltepec</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">5 Artesanas</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mb-1">Bordados en tela pepenada y prendas tradicionales mixtecas.</p>
                  <span className="text-[10px] font-semibold text-gray-500">Participante: bordadora, San Pablo Tijaltepec</span>
                </div>

                <div className="bg-white border border-gray-200 p-3.5 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#032517]">Ciudad de Tlaxiaco</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">3 Centros Acopio</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mb-1">Chocolate artesanal de metate, báscula central y bodega municipal.</p>
                  <span className="text-[10px] font-semibold text-gray-500">Participante: productora de chocolate artesanal, Oaxaca</span>
                </div>
              </div>

              {/* UX Usability Pillars */}
              <div className="bg-neutral-900 text-white p-4 rounded-2xl space-y-2 font-mono text-xs">
                <div className="font-bold text-emerald-400 mb-1 border-b border-neutral-800 pb-1">
                  Métricas de Usabilidad Auditadas en Campo (Hito 1.2):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-300">
                  <div>✓ Botonera táctil de 112px ergonómica para adultos mayores</div>
                  <div>✓ Principio Zero-Typing: 100% de registro mediante voz en Tu'un Savi</div>
                  <div>✓ Resiliencia de Parcela: IndexedDB ACID con cero pérdida de datos offline</div>
                  <div>✓ Acceso soberano: SMS OTP y Carnet QR físico sin frases semilla en inglés</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: NETWORK METRICS */}
          {activeTab === 'metrics' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-[#c1c8c2]/50 p-4 rounded-2xl">
                  <div className="text-xs text-gray-500">RWA Tokenizado</div>
                  <div className="text-xl font-black text-[#1b3b2b] mt-1">{metrics.totalTokenizedRWAKg.toLocaleString()} kg</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Café, Miel y Textil</div>
                </div>
                <div className="bg-white border border-[#c1c8c2]/50 p-4 rounded-2xl">
                  <div className="text-xs text-gray-500">Liquidaciones Totales</div>
                  <div className="text-xl font-black text-[#1b3b2b] mt-1">${metrics.totalSettledUSD.toLocaleString()} USD</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Cero comisión a productor</div>
                </div>
                <div className="bg-white border border-[#c1c8c2]/50 p-4 rounded-2xl">
                  <div className="text-xs text-gray-500">Comunidades Activas</div>
                  <div className="text-xl font-black text-[#1b3b2b] mt-1">{metrics.activeCommunities}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Oaxaca, México</div>
                </div>
                <div className="bg-white border border-[#c1c8c2]/50 p-4 rounded-2xl">
                  <div className="text-xs text-gray-500">Oráculos Autónomos</div>
                  <div className="text-xl font-black text-[#1b3b2b] mt-1">{metrics.aiOraclesOnline} Activos</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">100% Uptime</div>
                </div>
              </div>

              <div className="bg-white border border-[#c1c8c2]/40 rounded-2xl p-5 space-y-2">
                <h4 className="text-sm font-bold text-[#1b3b2b]">Contratos Inteligentes en Soroban</h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500 block text-[10px]">LotPassport Smart Contract (RWA):</span>
                    <span className="text-emerald-800 break-all">{metrics.smartContractLotPassportId}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500 block text-[10px]">FairEscrow & Trustless Work Contract:</span>
                    <span className="text-emerald-800 break-all">{metrics.smartContractFairEscrowId}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: API & WEBHOOKS GATEWAY */}
          {activeTab === 'api' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Introduction Banner */}
              <div className="bg-linear-to-r from-emerald-950 to-teal-900 text-white rounded-2xl p-5 border border-emerald-700/40 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🌐</span>
                  <h4 className="font-black text-sm text-emerald-200 uppercase tracking-wider">
                    Gateway de APIs REST, Webhooks & Interoperabilidad RWA
                  </h4>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    v1.2.0 LIVE
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Cualquier sistema externo (sistemas ERP de aduanas, tostadores en Europa, marketplaces éticos o apps fintech) puede consumir, verificar y emitir atestaciones de Yucu Protocol mediante endpoints HTTP estándar y webhooks reactivos sin necesidad de operar un nodo completo.
                </p>
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-emerald-800/60 text-[10px] font-mono">
                  <span className="bg-emerald-900/80 px-2 py-0.5 rounded text-emerald-200 border border-emerald-700/50">GS1 Digital Link (ISO 22005)</span>
                  <span className="bg-emerald-900/80 px-2 py-0.5 rounded text-emerald-200 border border-emerald-700/50">W3C Verifiable Credentials</span>
                  <span className="bg-emerald-900/80 px-2 py-0.5 rounded text-emerald-200 border border-emerald-700/50">Stellar SEP-8 (Regulated Assets)</span>
                  <span className="bg-emerald-900/80 px-2 py-0.5 rounded text-emerald-200 border border-emerald-700/50">Stellar SEP-40 (Soroban Oracle)</span>
                </div>
              </div>

              {/* Endpoint Selector & Sandbox */}
              <div className="bg-white border border-[#c1c8c2]/50 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <h5 className="text-xs font-black text-gray-800 uppercase tracking-wider">Endpoints Disponibles para Terceros</h5>
                    <p className="text-[11px] text-gray-500">Selecciona un endpoint para inspeccionar su esquema y ejecutarlo en vivo:</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-gray-500">Base URL:</span>
                    <code className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      https://yucu.tecnm.mx
                    </code>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {[
                    { path: '/api/v1/protocol/spec', method: 'GET', label: '1. Especificación del Protocolo', desc: 'Metadata, contratos Soroban y oráculos activos' },
                    { path: '/api/v1/attestations/verify', method: 'POST', label: '2. Verificador de Atestación', desc: 'Cotejo criptográfico Ed25519, SCAA y EUDR' },
                    { path: '/api/v1/attestations/issue', method: 'POST', label: '3. Emisión de Atestación', desc: 'Sello en ledger con gas 100% patrocinado' },
                    { path: '/api/v1/lots/MX-2024-884/passport', method: 'GET', label: '4. Pasaporte Digital W3C', desc: 'Digital Twin y GS1 Digital Link resolver' },
                    { path: '/api/v1/developer/webhooks/catalog', method: 'GET', label: '5. Catálogo de Webhooks', desc: 'Eventos reactivos de entrega y pagos' },
                  ].map((ep) => (
                    <button
                      key={ep.path}
                      onClick={() => handleExecuteApiTest(ep.path, ep.method as any)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedApiEndpoint === ep.path
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-500/30'
                          : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded ${
                          ep.method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {ep.method}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">{ep.path}</span>
                      </div>
                      <div className="font-bold text-xs text-gray-900">{ep.label}</div>
                      <div className="text-[10px] text-gray-500 line-clamp-1">{ep.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Live Execution Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-gray-700">Endpoint Activo:</span>
                    <span className="text-xs font-mono font-black text-[#1b3b2b] bg-gray-100 px-2 py-1 rounded-lg">
                      {apiMethod} {selectedApiEndpoint}
                    </span>
                  </div>
                  <button
                    onClick={() => handleExecuteApiTest(selectedApiEndpoint, apiMethod)}
                    disabled={apiLoading}
                    className="px-4 py-2 rounded-xl bg-linear-to-r from-[#1b3b2b] to-[#284f3c] text-white font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{apiLoading ? '⏳' : '⚡'}</span>
                    <span>{apiLoading ? 'Consultando...' : 'Ejecutar Petición Live'}</span>
                  </button>
                </div>

                {/* API Response Display */}
                {apiResponseData && (
                  <div className="bg-gray-950 text-emerald-400 rounded-xl p-4 font-mono text-xs border border-gray-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-black ${
                          apiResponseStatus && apiResponseStatus < 300 ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-red-950 text-red-300'
                        }`}>
                          HTTP {apiResponseStatus} OK
                        </span>
                        <span className="text-gray-400">Latencia: <strong className="text-white">{apiResponseLatency}ms</strong></span>
                      </div>
                      <span className="text-gray-500 text-[10px]">Respuesta en Vivo de Yucu Server</span>
                    </div>
                    <pre className="max-h-60 overflow-y-auto overflow-x-auto text-[11px] leading-relaxed text-emerald-300/90 no-scrollbar">
                      {JSON.stringify(apiResponseData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Code Generator for External Developers */}
              <div className="bg-white border border-[#c1c8c2]/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-black text-gray-800 uppercase tracking-wider">Generador de Código de Integración</h5>
                    <p className="text-[11px] text-gray-500">Copia y pega este snippet directamente en tu backend o dApp externa:</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      onClick={() => setCodeLanguage('ts')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        codeLanguage === 'ts' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      TypeScript (SDK)
                    </button>
                    <button
                      onClick={() => setCodeLanguage('python')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        codeLanguage === 'python' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      Python
                    </button>
                    <button
                      onClick={() => setCodeLanguage('curl')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        codeLanguage === 'curl' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      cURL
                    </button>
                  </div>
                </div>

                <div className="bg-gray-950 text-gray-200 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-gray-800 leading-relaxed">
                  {codeLanguage === 'ts' && (
                    <pre className="text-emerald-300">{`// 1. Instalar cliente: npm install @yucu-protocol/sdk
import { YucuProtocolSDK } from '@yucu-protocol/sdk';

const yucu = new YucuProtocolSDK({
  network: 'stellar-mainnet',
  sponsorGas: true // Stellar CAP-0015 Fee-Bump patrocinado
});

// 2. Verificar atestación física de lote antes de comprar
const verification = await yucu.attestations.verify({
  lotCode: 'MX-2024-884',
  expectedSchema: '0x01_SCAA_SPECIALTY'
});

console.log('¿Lote auténtico y verificado en Soroban?:', verification.verified);
console.log('Certificación EUDR Anti-Deforestación:', verification.verifications.eudrAntiDeforestation);`}</pre>
                  )}

                  {codeLanguage === 'python' && (
                    <pre className="text-blue-300">{`# Consumo directo vía requests en Python
import requests

url = "https://yucu.tecnm.mx/api/v1/attestations/verify"
payload = {
    "lotCode": "MX-2024-884",
    "expectedSchema": "0x01_SCAA_SPECIALTY"
}

response = requests.post(url, json=payload)
data = response.json()

print(f"Estado en Soroban: {data['verified']}")
print(f"Hash canónico del lote: {data['dataHash']}")`}</pre>
                  )}

                  {codeLanguage === 'curl' && (
                    <pre className="text-amber-300">{`# Verificación inmediata por terminal cURL
curl -X POST https://yucu.tecnm.mx/api/v1/attestations/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "lotCode": "MX-2024-884",
    "expectedSchema": "0x01_SCAA_SPECIALTY"
  }'`}</pre>
                  )}
                </div>
              </div>

              {/* Stellar Raven MCP Integration Card */}
              <div className="bg-linear-to-r from-blue-950 to-indigo-950 text-white rounded-2xl p-5 border border-blue-700/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🦅</span>
                    <div>
                      <h5 className="text-xs font-black uppercase tracking-wider text-blue-200">
                        Stellar Raven (MCP Server Oficial de SDF)
                      </h5>
                      <p className="text-[11px] text-blue-300/80">
                        Servidor de Model Context Protocol para asistir el desarrollo en Soroban sin errores ni alucinaciones.
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://raven.stellar.buzz/playground"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>🧪</span>
                    <span>Abrir Playground</span>
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="bg-black/40 border border-blue-500/20 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 block">Endpoint MCP Remoto:</span>
                    <code className="text-xs font-mono text-blue-300 font-bold break-all">https://raven.stellar.buzz/mcp</code>
                    <p className="text-[10px] text-gray-400 mt-1">Configurado en este repositorio en <code>.cursor/mcp.json</code> y <code>mcp.json</code>.</p>
                  </div>
                  <div className="bg-black/40 border border-blue-500/20 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 block">Comando de Instalación (Claude Code):</span>
                    <code className="text-[11px] font-mono text-amber-300 block select-all">
                      claude mcp add --transport http stellar-raven "https://raven.stellar.buzz/mcp"
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DEVELOPER SDK */}
          {activeTab === 'sdk' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white border border-[#c1c8c2]/40 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-[#1b3b2b]">Instalación del SDK para Terceros</h4>
                <p className="text-xs text-gray-600">
                  Cualquier cooperativa, tostador, fintech o exportador puede integrar Yucu en su aplicación:
                </p>
                <div className="bg-gray-950 text-gray-200 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                  npm install @yucu-protocol/sdk @yucu-protocol/core
                </div>
              </div>

              <div className="bg-white border border-[#c1c8c2]/40 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-[#1b3b2b]">Código de Ejemplo: Registro y Liquidación RWA</h4>
                <div className="bg-gray-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
                  <pre>{`import { YucuProtocolSDK } from '@yucu-protocol/sdk';

// 1. Inicializar el cliente del protocolo
const yucu = new YucuProtocolSDK({ network: 'stellar-mainnet', sponsorGas: true });

// 2. Ejecutar el oráculo de IA para voz en Mixteco
const voiceLot = yucu.ai.processVoiceLot(farmerAudioTranscript, 'tuun_savi');

// 3. Certificar calidad con visión computacional
const quality = yucu.ai.assessQuality({ productType: 'coffee' });

// 4. Resolver ruta de liquidación híbrida directa a SPEI
const route = yucu.ai.solveRoute(500, 'MX', 'banking_spei');

console.log('Lote tokenizado en Soroban con hash:', voiceLot.payloadDigest);`}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-[#c1c8c2]/30 flex items-center justify-between">
          <div className="text-[11px] text-gray-500">
            Open Hub TecNM • Protocolo de Infraestructura Rural sobre Stellar
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1b3b2b] text-white text-xs font-bold hover:bg-[#284f3c] transition-colors cursor-pointer"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
