import React, { useState } from 'react';
import { DemoBadge } from './DemoBadge';
import { PROTOCOL_FEES } from '../config/protocolFees';
import {
  COUNTRY_CONFIGS,
  HybridPaymentIntent,
  HybridSettlementOrchestrator,
  SupportedCountry,
} from '../core/settlement/HybridSettlementOrchestrator';

interface HybridArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPayments?: () => void;
}

export const HybridArchitectureModal: React.FC<HybridArchitectureModalProps> = ({
  isOpen,
  onClose,
  onOpenPayments,
}) => {
  const [activeTab, setActiveTab] = useState<'mapa' | 'simulador' | 'comparativa'>('mapa');
  const [selectedCountry, setSelectedCountry] = useState<SupportedCountry>('MX');

  // Simulator state
  const [simOriginCountry, setSimOriginCountry] = useState<SupportedCountry>('BR');
  const [simTargetCountry, setSimTargetCountry] = useState<SupportedCountry>('MX');
  const [simAmountMxn, setSimAmountMxn] = useState<number>(3450);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<HybridPaymentIntent | null>(null);

  if (!isOpen) return null;

  const handleRunSimulation = () => {
    setSimulating(true);
    setSimResult(null);

    setTimeout(() => {
      setSimulating(false);
      const producerNames = {
        MX: 'Don Aurelio Bautista (Oaxaca)',
        BO: 'Doña Esperanza Mamani (Los Yungas)',
        BR: 'João Paulo da Silva (Minas Gerais)',
      };
      const accounts = {
        MX: 'CLABE SPEI Bienestar: 0121 8000 4812 9012 34',
        BO: 'QR Simple Banco Unión: BO-QR-881920',
        BR: 'Chave PIX CPF: 123.456.789-00',
      };
      const institutions = {
        MX: 'Banco del Bienestar / BBVA vía Etherfuse',
        BO: 'Banco Unión vía Polar Stellar Anchor',
        BR: 'Banco Central do Brasil vía PIX Rails',
      };

      const intent = HybridSettlementOrchestrator.createSettlementOrder({
        lotCode: 'MX-2026-984',
        country: simTargetCountry,
        amountMxnEquivalent: simAmountMxn,
        producerName: producerNames[simTargetCountry],
        producerAccount: accounts[simTargetCountry],
        institution: institutions[simTargetCountry],
      });
      setSimResult(intent);
    }, 1200);
  };

  const countries = HybridSettlementOrchestrator.getSupportedCountries();
  const currentConfig = COUNTRY_CONFIGS[selectedCountry];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#fcf9f3] rounded-3xl overflow-hidden shadow-2xl border border-[#c1c8c2]/50 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-linear-to-r from-[#032517] via-[#0b3b24] to-[#a73918] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-neutral-950 font-black flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[26px]">hub</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-black tracking-tight text-white">
                  Arquitectura Híbrida Trilateral
                </h3>
                <DemoBadge detail="Tipos de cambio fijos y folios SPEI generados localmente; no hay conversión real a pesos." />
                <span className="text-[9.5px] bg-amber-400 text-neutral-950 font-black px-2 py-0.5 rounded-full uppercase">
                  MX · BO · BR
                </span>
              </div>
              <p className="text-[11.5px] text-emerald-200">
                Orquestación: Etherfuse + Polar (Stellar) + PIX + MicoPay
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Sub-nav Tabs */}
        <div className="px-4 py-2 bg-white border-b border-[#c1c8c2]/30 flex items-center justify-between">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('mapa')}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'mapa'
                  ? 'bg-[#032517] text-white shadow-xs'
                  : 'bg-[#f0eee8] text-[#424843] hover:bg-[#ebe8e2]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              <span>Mapa de Infraestructura</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('simulador')}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'simulador'
                  ? 'bg-[#032517] text-white shadow-xs'
                  : 'bg-[#f0eee8] text-[#424843] hover:bg-[#ebe8e2]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">payments</span>
              <span>Simulador Transfronterizo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('comparativa')}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'comparativa'
                  ? 'bg-[#032517] text-white shadow-xs'
                  : 'bg-[#f0eee8] text-[#424843] hover:bg-[#ebe8e2]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">balance</span>
              <span>¿Por qué Híbrido?</span>
            </button>
          </div>

          <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            Sin comisión campesina
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* TAB 1: MAPA DE INFRAESTRUCTURA */}
          {activeTab === 'mapa' && (
            <div className="flex flex-col gap-4">
              {/* Country Selector Pills */}
              <div className="grid grid-cols-3 gap-2">
                {countries.map((c) => (
                  <button
                    key={c.countryCode}
                    type="button"
                    onClick={() => setSelectedCountry(c.countryCode)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selectedCountry === c.countryCode
                        ? 'bg-white border-[#032517] ring-2 ring-[#032517] shadow-sm'
                        : 'bg-[#f0eee8] border-[#c1c8c2]/50 hover:bg-[#ebe8e2]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[18px]">{c.flag}</span>
                        <span className="text-[13px] font-bold text-[#032517]">{c.countryName}</span>
                      </div>
                      <span className="text-[10.5px] text-[#727973] font-semibold block">
                        {c.anchorProvider}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {c.currencyCode}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected Country Deep Dive Card */}
              <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2]/50 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#c1c8c2]/30 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[24px]">{currentConfig.flag}</span>
                    <div>
                      <h4 className="text-[15px] font-black text-[#032517]">
                        Rieles en {currentConfig.countryName}: {currentConfig.localRailName}
                      </h4>
                      <p className="text-[11px] text-[#424843]">
                        Proveedor Principal: <strong>{currentConfig.anchorProvider}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#727973] block uppercase font-bold">Tiempo de Liquidación</span>
                    <span className="text-[13px] font-bold text-emerald-700">~{currentConfig.settlementTimeSec} segundos</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-[#424843] uppercase tracking-wider">
                    Capacidades y Ventajas Estratégicas:
                  </span>
                  <div className="space-y-1.5">
                    {currentConfig.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-[#fcf9f3] p-2 rounded-xl border border-[#c1c8c2]/30">
                        <span className="material-symbols-outlined text-emerald-700 text-[18px] shrink-0 mt-0.5">
                          verified
                        </span>
                        <span className="text-[12px] text-[#032517] leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Core Stellar & Soroban Layer Card */}
              <div className="bg-linear-to-br from-[#032517] to-[#1b3b2b] text-white p-4 rounded-2xl border border-emerald-500/30 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[20px]">🌌</span>
                    <h4 className="text-[14px] font-bold text-white">
                      Capa Central Neutral: Stellar & Soroban Smart Contracts
                    </h4>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                    Multi-Path Payments
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[18px]">🔄</span>
                    <span className="text-[11px] font-bold block text-white mt-1">Conversión FX sin Spread</span>
                    <span className="text-[9.5px] text-emerald-200 block">DEX & AMM Stellar</span>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[18px]">⚖️</span>
                    <span className="text-[11px] font-bold block text-white mt-1">Custodia FairEscrow</span>
                    <span className="text-[9.5px] text-emerald-200 block">Soroban al pesar cosecha</span>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[18px]">👑</span>
                    <span className="text-[11px] font-bold block text-white mt-1">{`${PROTOCOL_FEES.artisanResaleRoyaltyPct}% Regalía Perpetua`}</span>
                    <span className="text-[9.5px] text-emerald-200 block">Artesanas en Reventas</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIMULADOR TRANSFRONTERIZO */}
          {activeTab === 'simulador' && (
            <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2]/50 shadow-xs flex flex-col gap-4">
              <div>
                <h4 className="text-[14px] font-bold text-[#032517]">
                  Simulador de Pago Transfronterizo sin Fricción
                </h4>
                <p className="text-[11.5px] text-[#424843]">
                  Prueba cómo un comprador de un país le paga directamente a un productor en otro país usando la red híbrida.
                </p>
              </div>

              {/* Simulation Configuration Form */}
              <div className="grid grid-cols-2 gap-3 bg-[#fcf9f3] p-3 rounded-2xl border border-[#c1c8c2]/40">
                {/* Origin */}
                <div>
                  <label className="text-[11px] font-bold text-[#424843] block mb-1">
                    País del Comprador (Origen):
                  </label>
                  <select
                    value={simOriginCountry}
                    onChange={(e) => setSimOriginCountry(e.target.value as SupportedCountry)}
                    className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 text-[13px] font-bold text-[#032517] focus:outline-none"
                  >
                    <option value="BR">🇧🇷 Brasil (Paga con PIX)</option>
                    <option value="MX">🇲🇽 México (Paga con SPEI / Tarjeta)</option>
                    <option value="BO">🇧🇴 Bolivia (Paga con QR Simple)</option>
                  </select>
                </div>

                {/* Target */}
                <div>
                  <label className="text-[11px] font-bold text-[#424843] block mb-1">
                    País del Campesino (Destino):
                  </label>
                  <select
                    value={simTargetCountry}
                    onChange={(e) => setSimTargetCountry(e.target.value as SupportedCountry)}
                    className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 text-[13px] font-bold text-[#032517] focus:outline-none"
                  >
                    <option value="MX">🇲🇽 México (Don Aurelio / Oaxaca)</option>
                    <option value="BO">🇧🇴 Bolivia (Doña Esperanza / Yungas)</option>
                    <option value="BR">🇧🇷 Brasil (João Paulo / Minas Gerais)</option>
                  </select>
                </div>

                {/* Amount */}
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-[#424843] block mb-1">
                    Monto de la cosecha (Equivalente MXN):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={simAmountMxn}
                      onChange={(e) => setSimAmountMxn(Number(e.target.value))}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-1.5 text-[14px] font-bold text-[#032517]"
                    />
                    <button
                      type="button"
                      onClick={handleRunSimulation}
                      disabled={simulating}
                      className="px-5 py-2 rounded-xl bg-[#032517] hover:bg-[#1b3b2b] text-white font-bold text-[13px] shrink-0 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {simulating ? (
                        <>
                          <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                          <span>Orquestando...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                          <span>Ejecutar Liquidación</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulation Output Card */}
              {simResult && (
                <div className="bg-emerald-50 border-2 border-emerald-400 p-4 rounded-2xl flex flex-col gap-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-emerald-300/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-800 text-[22px]">check_circle</span>
                      <span className="text-[13px] font-black text-emerald-950">
                        Liquidación Exitosa en Tiempo Real
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-200 text-emerald-950 font-mono font-bold px-2 py-0.5 rounded-full">
                      Tiempo: 1.8 segundos
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div>
                      <span className="text-[10px] text-[#727973] uppercase font-bold block">Origen Comprador</span>
                      <span className="font-bold text-[#032517]">
                        {COUNTRY_CONFIGS[simOriginCountry].flag} {COUNTRY_CONFIGS[simOriginCountry].countryName}
                      </span>
                      <span className="text-[11px] text-[#424843] block">
                        Riel: {COUNTRY_CONFIGS[simOriginCountry].localRailName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#727973] uppercase font-bold block">Destino Productor</span>
                      <span className="font-bold text-[#032517]">
                        {COUNTRY_CONFIGS[simTargetCountry].flag} {simResult.producerDestination.name}
                      </span>
                      <span className="text-[11px] text-[#424843] block truncate">
                        {simResult.producerDestination.accountIdentifier}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-[#727973] uppercase font-bold block">Monto Entregado al Campesino</span>
                      <span className="text-[16px] font-black text-emerald-900">
                        {COUNTRY_CONFIGS[simTargetCountry].currencySymbol} {simResult.amountLocal.toLocaleString()} {simResult.currencyCode}
                      </span>
                      <span className="text-[9.5px] text-emerald-700 block font-semibold">Cobro al productor: ninguno en el prototipo</span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-[#727973] uppercase font-bold block">Orquestador Asignado</span>
                      <span className="text-[12px] font-bold text-[#032517] block">{simResult.provider}</span>
                      <span className="text-[9.5px] text-[#727973] font-mono block truncate">
                        Ref: {simResult.trackingReference}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/80 p-2 rounded-xl border border-emerald-300 text-[10.5px] font-mono text-emerald-950 flex items-center justify-between">
                    <span>Tx Hash Stellar: {simResult.stellarTxHash}</span>
                    <span className="text-emerald-700 font-bold">Ledger #52491902</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMPARATIVA ESTRATÉGICA */}
          {activeTab === 'comparativa' && (
            <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2]/50 shadow-xs flex flex-col gap-3">
              <h4 className="text-[14px] font-bold text-[#032517]">
                ¿Por qué una Arquitectura Híbrida y no solo un proveedor?
              </h4>

              <div className="space-y-2 text-[12px] text-[#424843] leading-relaxed">
                <div className="p-3 bg-[#fcf9f3] rounded-xl border border-[#c1c8c2]/40">
                  <h5 className="font-bold text-[#032517] flex items-center gap-1.5 mb-1">
                    <span>🇲🇽</span>
                    <span>¿Por qué Etherfuse en México?</span>
                  </h5>
                  <p>
                    Etherfuse resuelve la tokenización del peso mexicano (<strong>MXNe</strong>) y la inversión en <strong>CETES</strong> con cumplimiento regulatorio ante Banxico. Permite liquidar directo a la Tarjeta Bienestar o CLABE de cualquier campesino en segundos.
                  </p>
                </div>

                <div className="p-3 bg-[#fcf9f3] rounded-xl border border-[#c1c8c2]/40">
                  <h5 className="font-bold text-[#032517] flex items-center gap-1.5 mb-1">
                    <span>🇧🇴</span>
                    <span>¿Por qué Polar en Bolivia?</span>
                  </h5>
                  <p>
                    Polar es el ancla especializada creada en Bolivia para la red Stellar. Conecta el sistema <strong>QR Simple de ASFI</strong> con la red Stellar sin que los campesinos de Los Yungas sufran por la falta física de dólares en el país, recibiendo Bolivianos directos a su cuenta de Banco Unión.
                  </p>
                </div>

                <div className="p-3 bg-[#fcf9f3] rounded-xl border border-[#c1c8c2]/40">
                  <h5 className="font-bold text-[#032517] flex items-center gap-1.5 mb-1">
                    <span>🇧🇷</span>
                    <span>¿Por qué PIX en Brasil?</span>
                  </h5>
                  <p>
                    PIX es la infraestructura de pagos públicos más rápida del continente. Al conectarla con anclas de Stellar BRL, las cafeterías y tostadores de especialidad en Brasil pueden comprar lotes comunitarios en 2 segundos con su CPF o celular.
                  </p>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300">
                  <h5 className="font-bold text-emerald-950 flex items-center gap-1.5 mb-1">
                    <span>💳</span>
                    <span>¿Por qué MicoPay en la Parcela?</span>
                  </h5>
                  <p className="text-emerald-900">
                    MicoPay opera en la <strong>última milla rural</strong>: permite a los transportistas y camioneros locales actuar como cajeros móviles en efectivo cuando no hay señal de internet, liquidando mediante código QR seguro sin trámites bancarios.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#f0eee8] border-t border-[#c1c8c2]/30 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[#424843]">
            <span className="material-symbols-outlined text-[16px] text-emerald-700">verified</span>
            <span>Auditoría de Contratos Soroban por TecNM Open Hub</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPayments && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPayments();
                }}
                className="px-3 py-1.5 rounded-xl border border-[#032517] text-[#032517] font-bold text-[12px] hover:bg-white transition-colors cursor-pointer"
              >
                Ver Mis Pagos
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-[#032517] text-white rounded-xl text-[12px] font-bold cursor-pointer hover:bg-[#1b3b2b]"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
