import { PROTOCOL_FEES } from '../config/protocolFees';
import React, { useState, useEffect } from 'react';
import { MOCK_PAYMENTS } from '../data/mockData';
import { DemoBadge } from './DemoBadge';
import { SupportedCountry, COUNTRY_CONFIGS } from '../core/settlement/HybridSettlementOrchestrator';

interface MyPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestWithdrawal?: (amount: number) => void;
  onNavigateToLots?: () => void;
  onOpenArchitecture?: () => void;
  initialCountry?: SupportedCountry;
}

export const MyPaymentsModal: React.FC<MyPaymentsModalProps> = ({
  isOpen,
  onClose,
  onRequestWithdrawal,
  onNavigateToLots,
  onOpenArchitecture,
  initialCountry = 'MX'
}) => {
  const [selectedCountry, setSelectedCountry] = useState<SupportedCountry>(initialCountry);
  const [showVoucher, setShowVoucher] = useState(false);
  const [withdrawalType, setWithdrawalType] = useState<'bienestar' | 'cajero' | 'ventanilla' | 'polar_qr' | 'pix'>('bienestar');
  const [copiedCode, setCopiedCode] = useState(false);
  const [cashCollected, setCashCollected] = useState(false);

  // Tarjeta Bienestar SPEI State (Etherfuse MX)
  const [cardNumber, setCardNumber] = useState('4152 3100 8921 4012');
  const [cardHolder, setCardHolder] = useState('Don Aurelio Bautista Santiago');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [speiTracking, setSpeiTracking] = useState('2026090440014BMA00004891024');

  // Bolivia Polar State
  const [boliviaAccount, setBoliviaAccount] = useState('BO-QR-881920 Banco Unión');
  const [boliviaHolder, setBoliviaHolder] = useState('Doña Esperanza Mamani Quispe');
  
  // Brasil PIX State
  const [pixKey, setPixKey] = useState('35998124021'); // Celular
  const [pixHolder, setPixHolder] = useState('João Paulo da Silva');

  // 12-digit withdrawal code + 4-digit security PIN for ATM / MicoPay
  const [atmCode] = useState('8492 1049 2810');
  const [atmPin] = useState('7421');
  const [voucherPin] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());

  const totalAvailable = MOCK_PAYMENTS.filter((p) => p.status === 'Disponible').reduce(
    (acc, cur) => acc + cur.amount,
    0
  );

  const totalRoyalties = MOCK_PAYMENTS.filter((p) => p.paymentType === 'Regalía Perpetua').reduce(
    (acc, cur) => acc + cur.amount,
    0
  );

  const handleExecuteSpeiTransfer = () => {
    setIsTransferring(true);
    setTimeout(() => {
      setIsTransferring(false);
      setTransferSuccess(true);
      setSpeiTracking(`2026090440014BMA${Math.floor(10000000 + Math.random() * 90000000)}`);
    }, 1800);
  };

  const [copiedReceipt, setCopiedReceipt] = useState(false);

  const handleShareSpei = async () => {
    const text = 
      `🏛️ COMPROBANTE DE DEMOSTRACIÓN DE TRANSFERENCIA SPEI A TARJETA BIENESTAR\n\n` +
      `¡Hola ${cardHolder}! Su pago de café ha sido transferido exitosamente a su cuenta:\n` +
      `💵 Monto: $${totalAvailable.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN\n` +
      `💳 Banco Receptor: Banco del Bienestar (México)\n` +
      `💳 Tarjeta: ${cardNumber.slice(0, 4)} **** **** ${cardNumber.slice(-4)}\n` +
      `🔍 Clave de Rastreo Banxico: ${speiTracking}\n` +
      `✅ Estatus: Liquidado / Exitoso\n\n` +
      `Ya puede disponer de su dinero en la sucursal o cajero del Banco del Bienestar en Tlaxiaco.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Comprobante SPEI Banco del Bienestar', text });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 3000);
    }
  };

  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`Clave de Retiro: ${atmCode.replace(/\s/g, '')} | PIN: ${atmPin}`);
      }
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareWithdrawal = async () => {
    const text = 
      `🏧 ORDEN DE PAGO EN CAJERO AUTOMÁTICO (RETIRO SIN TARJETA)\n\n` +
      `¡Hola Don Efraín! Su pago de café está listo para retirar en efectivo:\n` +
      `💵 Monto a retirar: $${totalAvailable.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN\n` +
      `🔢 Clave de Retiro (12 dígitos): ${atmCode}\n` +
      `🔒 Código de Seguridad (PIN): ${atmPin}\n\n` +
      `Pasos en el cajero (BBVA / Bienestar / Banorte / Azteca en Tlaxiaco):\n` +
      `1. Toca la pantalla del cajero y selecciona "Retiro sin Tarjeta".\n` +
      `2. Escribe la Clave de 12 dígitos.\n` +
      `3. Escribe el PIN de 4 dígitos.\n` +
      `¡El cajero te entregará tus billetes en mano al instante!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Orden de Retiro en Efectivo', text });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleWithdraw = () => {
    if (onRequestWithdrawal) {
      onRequestWithdrawal(totalAvailable);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#fcf9f3] rounded-3xl overflow-hidden shadow-2xl border border-[#c1c8c2]/50 max-h-[88vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-[#c1c8c2]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#ffdbd1] text-[#a73918] flex items-center justify-center font-bold text-[18px]">
              3
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[18px] font-bold text-[#032517]">Mis Pagos y Recibos</h3>
                <DemoBadge detail="Pagos y regalías de ejemplo: todavía no hay liquidaciones reales en SPEI ni en Stellar." />
              </div>
              <p className="text-[12px] text-[#424843]">Pagos de ejemplo para conocer cómo se verán tus liquidaciones</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f0eee8] hover:bg-[#ebe8e2] active:scale-90 text-[#1c1c18] flex items-center justify-center cursor-pointer transition-all"
            aria-label="Cerrar modal de pagos"
            title="Cerrar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Balance Card or Generated Voucher Ticket */}
        {!showVoucher ? (
          <div className="p-4 bg-[#1b3b2b] text-white m-4 rounded-2xl shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#c7ebd4] uppercase tracking-wider font-semibold">
                Saldo disponible para retiro (MXN)
              </span>
              <span className="text-[10px] bg-[#c7ebd4] text-[#002113] font-bold px-2 py-0.5 rounded-full">
                Listo para cobro
              </span>
            </div>
            
            <div className="flex items-baseline justify-between">
              <span className="text-[28px] font-bold text-white">
                ${totalAvailable.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </span>
              <span className="text-[11px] text-[#abcfb8]">
                Sin comisión
              </span>
            </div>

            <p className="text-[12px] text-[#abcfb8] leading-relaxed">
              Elige cómo deseas cobrar tu liquidación directa en Tlaxiaco y la Mixteca sin intermediarios:
            </p>

            <div className="grid grid-cols-3 gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => {
                  setWithdrawalType('bienestar');
                  setShowVoucher(true);
                }}
                className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-extrabold py-2 px-1.5 rounded-xl text-[11px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 text-center leading-tight"
              >
                <span className="material-symbols-outlined text-[18px]">credit_card</span>
                <span>Tarjeta Bienestar (SPEI / Etherfuse)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWithdrawalType('cajero');
                  setShowVoucher(true);
                }}
                className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold py-2 px-1.5 rounded-xl text-[11px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 text-center leading-tight"
              >
                <span className="material-symbols-outlined text-[18px]">local_atm</span>
                <span>Cajero en Parcela (MicoPay)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWithdrawalType('ventanilla');
                  setShowVoucher(true);
                }}
                className="bg-white/15 hover:bg-white/25 text-white font-bold py-2 px-1.5 rounded-xl text-[11px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border border-white/20 active:scale-95 text-center leading-tight"
              >
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                <span>Ventanilla Finabien</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="m-4 space-y-3 animate-fade-in">
            {/* Toggle between 3 methods */}
            <div className="flex bg-[#ebe8e2] p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setWithdrawalType('bienestar')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  withdrawalType === 'bienestar'
                    ? 'bg-[#032517] text-white shadow-xs'
                    : 'text-[#424843] hover:text-[#032517]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">credit_card</span>
                <span>Tarjeta Bienestar</span>
              </button>

              <button
                type="button"
                onClick={() => setWithdrawalType('cajero')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  withdrawalType === 'cajero'
                    ? 'bg-[#032517] text-white shadow-xs'
                    : 'text-[#424843] hover:text-[#032517]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">local_atm</span>
                <span>Cajero Automático</span>
              </button>

              <button
                type="button"
                onClick={() => setWithdrawalType('ventanilla')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  withdrawalType === 'ventanilla'
                    ? 'bg-[#032517] text-white shadow-xs'
                    : 'text-[#424843] hover:text-[#032517]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">storefront</span>
                <span>Ventanilla</span>
              </button>
            </div>

            {/* OPTION 1: TARJETA DEL BIENESTAR (SPEI DIRECTO) */}
            {withdrawalType === 'bienestar' && (
              <div className="bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-400/90 rounded-2xl p-4 text-[#1c1c18] space-y-3 shadow-md">
                <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-800 text-[20px]">account_balance</span>
                    <span className="text-[12px] font-extrabold text-emerald-950 uppercase tracking-wide">
                      Depósito a Tarjeta Banco del Bienestar
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVoucher(false)}
                    className="text-[11px] text-emerald-900 underline font-bold cursor-pointer"
                  >
                    Ocultar
                  </button>
                </div>

                {!transferSuccess ? (
                  <div className="space-y-3">
                    {/* Amount preview */}
                    <div className="flex justify-between items-baseline bg-white p-2.5 rounded-xl border border-emerald-200">
                      <div>
                        <span className="text-[10px] text-[#727973] uppercase font-bold block">Monto a depositar</span>
                        <span className="text-[22px] font-black text-[#032517]">
                          ${totalAvailable.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        SPEI en 3 Segundos
                      </span>
                    </div>

                    {/* Card fields */}
                    <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-2.5 text-[12px]">
                      <div>
                        <label className="text-[11px] font-bold text-[#032517] block mb-1">
                          16 Dígitos de la Tarjeta del Bienestar
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4152 0000 0000 0000"
                          maxLength={19}
                          className="w-full font-mono text-[15px] font-bold p-2.5 rounded-lg border border-emerald-300 focus:outline-emerald-600 bg-emerald-50/40 text-[#032517]"
                        />
                        <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                          ✓ Banco Receptor: 000 Banco del Bienestar S.N.C. (SPEI Banxico)
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-[#032517] block mb-1">
                          Titular de la cuenta
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full text-[13px] font-semibold p-2 rounded-lg border border-[#c1c8c2] bg-gray-50 text-[#1c1c18]"
                        />
                      </div>

                      <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-150 text-[11px] text-[#2d523e]">
                        <p><strong>Cero Comisiones:</strong> No te cobran nada por recibir tu pago de café.</p>
                        <p><strong>Disponibilidad:</strong> Podrás retirar tus billetes en el cajero o ventanilla del Bienestar en Tlaxiaco.</p>
                      </div>
                    </div>

                    {/* Action button */}
                    <button
                      type="button"
                      disabled={isTransferring}
                      onClick={handleExecuteSpeiTransfer}
                      className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isTransferring ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Conectando con Red SPEI Banxico...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">send</span>
                          <span>Transferir ${totalAvailable.toLocaleString('es-MX')} MXN a mi Tarjeta</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* Transfer success receipt */
                  <div className="space-y-3 animate-fade-in">
                    <div className="bg-emerald-700 text-white p-4 rounded-2xl space-y-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[24px] text-emerald-200">check_circle</span>
                        <div>
                          <h5 className="text-[14px] font-bold">¡Transferencia SPEI Exitosa!</h5>
                          <span className="text-[11px] text-emerald-200">Liquidado en Banco del Bienestar</span>
                        </div>
                      </div>
                      <div className="bg-black/25 p-3 rounded-xl space-y-1 text-[11px] font-mono">
                        <p><strong className="text-emerald-200">Monto:</strong> ${totalAvailable.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</p>
                        <p><strong className="text-emerald-200">Tarjeta:</strong> {cardNumber.slice(0, 4)} **** **** {cardNumber.slice(-4)}</p>
                        <p><strong className="text-emerald-200">Titular:</strong> {cardHolder}</p>
                        <p><strong className="text-emerald-200">Clave Rastreo:</strong> {speiTracking}</p>
                        <p><strong className="text-emerald-200">Folio:</strong> SPEI-TLX-88219</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleShareSpei}
                        className="flex-1 h-9 bg-[#032517] hover:bg-[#1b3b2b] text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">share</span>
                        <span>{copiedReceipt ? '¡Comprobante Copiado!' : 'Compartir Comprobante'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTransferSuccess(false)}
                        className="px-3 h-9 bg-white hover:bg-gray-50 border border-[#c1c8c2] text-[#032517] rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>Nueva Orden</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* OPTION 2: CAJERO AUTOMÁTICO */}
            {withdrawalType === 'cajero' && (
              <div className="bg-gradient-to-b from-amber-50 to-white border-2 border-amber-400/90 rounded-2xl p-4 text-[#1c1c18] space-y-3 shadow-md">
                <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-amber-700 text-[20px]">atm</span>
                    <span className="text-[12px] font-extrabold text-amber-950 uppercase tracking-wide">
                      Orden de Pago en Cajero (Sin Tarjeta)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVoucher(false)}
                    className="text-[11px] text-amber-900 underline font-bold cursor-pointer"
                  >
                    Ocultar
                  </button>
                </div>

                {/* Amount */}
                <div className="flex justify-between items-baseline bg-white p-2.5 rounded-xl border border-amber-200">
                  <div>
                    <span className="text-[10px] text-[#727973] uppercase font-bold block">Efectivo a recibir</span>
                    <span className="text-[22px] font-black text-[#032517]">
                      ${totalAvailable.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${cashCollected ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'}`}>
                    {cashCollected ? '✓ Cobrado en Cajero' : '● Activo 24 Horas'}
                  </span>
                </div>

                {/* Clave de Retiro y PIN Box */}
                <div className="bg-[#032517] text-white p-3.5 rounded-2xl space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold">
                      1. Clave de Retiro (12 dígitos)
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="text-[10px] bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded cursor-pointer transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {copiedCode ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedCode ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  
                  <div className="bg-black/30 p-2 rounded-xl text-center font-mono text-[20px] font-extrabold text-amber-300 tracking-wider select-all border border-white/10">
                    {atmCode}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-emerald-800">
                    <div>
                      <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold block">
                        2. PIN de Seguridad
                      </span>
                      <span className="text-[9px] text-emerald-200">4 dígitos secretos</span>
                    </div>
                    <span className="font-mono text-[18px] font-black bg-amber-400 text-amber-950 px-3 py-0.5 rounded-lg">
                      {atmPin}
                    </span>
                  </div>
                </div>

                {/* Simple 3-step Instructions */}
                <div className="bg-white p-3 rounded-xl border border-amber-200 text-[11px] text-[#424843] space-y-1.5">
                  <span className="font-bold text-[#032517] block text-[12px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-amber-600">touch_app</span>
                    <span>Pasos fáciles en el cajero automático:</span>
                  </span>
                  <ol className="list-decimal list-inside space-y-1 pl-1 leading-snug">
                    <li>Acude a cualquier cajero de Tlaxiaco (<strong>BBVA, Bienestar, Banorte o Azteca</strong>).</li>
                    <li>En la pantalla táctil presiona: <strong>"Operaciones sin Tarjeta"</strong> o <strong>"Retiro sin Tarjeta"</strong>.</li>
                    <li>Ingresa la <strong>Clave de 12 dígitos</strong> y luego tu <strong>PIN ({atmPin})</strong>.</li>
                    <li>¡El cajero te despacha los <strong>${totalAvailable.toLocaleString('es-MX')} pesos</strong> en efectivo al momento!</li>
                  </ol>
                </div>

                {/* Quick Share / Copy Code */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleShareWithdrawal}
                    className="flex-1 h-9 bg-[#032517] hover:bg-[#1b3b2b] text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">share</span>
                    <span>{copiedCode ? '¡Código Copiado!' : 'Compartir Clave y PIN'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCashCollected(!cashCollected)}
                    className="px-3 h-9 bg-white hover:bg-gray-50 border border-[#c1c8c2] text-[#032517] rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                    title="Simular retiro cobrado"
                  >
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">
                      {cashCollected ? 'restart_alt' : 'check_circle'}
                    </span>
                    <span>{cashCollected ? 'Reiniciar' : 'Simular Cobro'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* OPTION 3: VENTANILLA */}
            {withdrawalType === 'ventanilla' && (
              <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 text-[#1c1c18] space-y-2.5 shadow-xs">
                <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                  <span className="text-[11px] font-bold text-amber-900 uppercase">
                    🏛️ Ficha de Cobro en Ventanilla Bancaria / Finabien
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowVoucher(false)}
                    className="text-[11px] text-amber-800 underline font-bold cursor-pointer"
                  >
                    Ocultar
                  </button>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[22px] font-extrabold text-[#032517]">
                    ${totalAvailable.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                  <span className="font-mono bg-white px-2.5 py-1 rounded border border-amber-300 font-bold text-[13px] text-[#a73918]">
                    FOLIO: ODP-8849
                  </span>
                </div>
                <div className="text-[11px] text-[#424843] bg-white p-2.5 rounded-xl border border-amber-200 space-y-1">
                  <p><strong>Beneficiario:</strong> Don Aurelio Bautista Santiago</p>
                  <p><strong>Puntos de Cobro en Tlaxiaco:</strong> Banco del Bienestar o Finabien Centro</p>
                  <p><strong>Requisito:</strong> Presentar Credencial INE original (sin tarjeta ni cuenta bancaria).</p>
                  <p><strong>Vigencia:</strong> 15 días naturales · sin comisión.</p>
                </div>
              </div>
            )}

            {/* OPTION 4: BOLIVIA POLAR QR SIMPLE */}
            {withdrawalType === 'polar_qr' && (
              <div className="bg-gradient-to-b from-amber-50 to-white border-2 border-amber-400 rounded-2xl p-4 text-[#1c1c18] space-y-3 shadow-md">
                <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[20px]">🇧🇴</span>
                    <span className="text-[12px] font-extrabold text-amber-950 uppercase tracking-wide">
                      QR Simple ASFI · Polar Stellar Anchor
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVoucher(false)}
                    className="text-[11px] text-amber-900 underline font-bold cursor-pointer"
                  >
                    Ocultar
                  </button>
                </div>

                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] text-[#727973] uppercase font-bold block">Liquidación en Bolivia</span>
                    <span className="text-[24px] font-black text-amber-950">
                      Bs. {(totalAvailable * 0.38).toLocaleString('es-BO', { minimumFractionDigits: 2 })} BOB
                    </span>
                  </div>
                  <span className="text-[10px] bg-amber-200 text-amber-950 font-bold px-2 py-0.5 rounded-full">
                    QR Interbancario
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-amber-300 space-y-2 text-[11.5px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#424843]">Beneficiaria:</span>
                    <strong className="text-[#032517]">{boliviaHolder}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#424843]">Banco Receptor:</span>
                    <strong className="text-[#032517]">Banco Unión (Bolivia)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#424843]">Riel y Protocolo:</span>
                    <strong className="text-amber-800">Polar Anchor (USDC/BOB en Stellar)</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-amber-200">
                    <span className="text-[#424843]">Comisión al Productor:</span>
                    <strong className="text-emerald-700">0.00 BOB (100% Neto)</strong>
                  </div>
                </div>

                <div className="p-2.5 bg-amber-100/60 rounded-xl border border-amber-300 text-[11px] text-amber-950 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-800 text-[18px]">verified</span>
                  <span>Escaneable con cualquier app bancaria de Bolivia (Banco Unión, BCP, Bisa).</span>
                </div>
              </div>
            )}

            {/* OPTION 5: BRASIL PIX INSTANTÂNEO */}
            {withdrawalType === 'pix' && (
              <div className="bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-400 rounded-2xl p-4 text-[#1c1c18] space-y-3 shadow-md">
                <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[20px]">🇧🇷</span>
                    <span className="text-[12px] font-extrabold text-emerald-950 uppercase tracking-wide">
                      PIX Instantâneo · Banco Central do Brasil
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVoucher(false)}
                    className="text-[11px] text-emerald-900 underline font-bold cursor-pointer"
                  >
                    Ocultar
                  </button>
                </div>

                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] text-[#727973] uppercase font-bold block">Liquidación en Brasil</span>
                    <span className="text-[24px] font-black text-emerald-950">
                      R$ {(totalAvailable * 0.28).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} BRL
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-950 font-bold px-2 py-0.5 rounded-full">
                    24/7 em 2 segundos
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-emerald-300 space-y-2 text-[11.5px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#424843]">Beneficiário:</span>
                    <strong className="text-[#032517]">{pixHolder}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#424843]">Chave PIX (Telefone):</span>
                    <strong className="font-mono text-emerald-900">+55 (35) 99812-4021</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#424843]">Orquestrador:</span>
                    <strong className="text-emerald-800">Stellar BRL / BACEN Rails</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-emerald-200">
                    <span className="text-[#424843]">Taxa ao Produtor:</span>
                    <strong className="text-emerald-700">R$ 0,00 (Gratuito)</strong>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-100/60 rounded-xl border border-emerald-300 text-[11px] text-emerald-950 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-800 text-[18px]">bolt</span>
                  <span>Pagamento liquidado e creditado imediatamente na conta do produtor.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History list */}
        <div className="px-4 pb-4 overflow-y-auto space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-[13px] font-bold text-[#032517] uppercase tracking-wide">
              Historial de Recibos y Regalías
            </h4>
            {totalRoyalties > 0 && (
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1">
                <span>💎</span>
                <span>${totalRoyalties.toLocaleString('es-MX')} MXN en Regalías</span>
              </span>
            )}
          </div>

          {/* Educational notice about secondary royalties */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-[11px] text-purple-950 flex items-start gap-2">
            <span className="text-[18px]">✨</span>
            <div>
              <p className="font-bold">Regalías Perpetuas por Reventa en Smart Contract:</p>
              <p className="text-purple-900">
                Cada vez que una tostaduría o boutique revende tu café empacado o una galería vende tu textil, el contrato inteligente en Stellar te deposita automáticamente el <strong>{PROTOCOL_FEES.artisanResaleRoyaltyPct}% del valor de reventa</strong>.
              </p>
            </div>
          </div>

          {MOCK_PAYMENTS.map((payment) => (
            <div
              key={payment.id}
              className={`rounded-xl p-3.5 border flex flex-col gap-1.5 shadow-2xs ${
                payment.paymentType === 'Regalía Perpetua'
                  ? 'bg-purple-50/40 border-purple-300/80'
                  : 'bg-white border-[#c1c8c2]/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#a73918] font-bold block">
                      {payment.lotCode} · {payment.date}
                    </span>
                    {payment.paymentType === 'Regalía Perpetua' && (
                      <span className="bg-purple-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                        💎 Regalía {PROTOCOL_FEES.artisanResaleRoyaltyPct}%
                      </span>
                    )}
                  </div>
                  <h5 className="text-[14px] font-bold text-[#032517] leading-snug">
                    {payment.concept}
                  </h5>
                  <p className="text-[12px] text-[#424843]">{payment.buyer}</p>
                  {payment.resaleOrigin && (
                    <p className="text-[11px] text-purple-900 font-medium mt-0.5">
                      📍 Reventa en: {payment.resaleOrigin}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[16px] font-bold block ${
                    payment.paymentType === 'Regalía Perpetua' ? 'text-purple-950 font-black' : 'text-[#032517]'
                  }`}>
                    +${payment.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      payment.status === 'Disponible'
                        ? 'bg-[#c7ebd4] text-[#002113]'
                        : 'bg-[#f0eee8] text-[#424843]'
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#c1c8c2]/30 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleWithdraw}
              className="flex-1 h-11 bg-[#a73918] hover:bg-[#6c1900] text-white rounded-full font-bold text-[14px] flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              <span>Solicitar Retiro en Chat</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-11 border border-[#c1c8c2] text-[#424843] rounded-full font-bold text-[14px] hover:bg-[#f0eee8] active:scale-98 transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
          {onNavigateToLots && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToLots();
              }}
              className="w-full text-center text-[12px] font-semibold text-[#032517] hover:text-[#a73918] py-1 cursor-pointer"
            >
              Ver mis 4 lotes vinculados en acopio →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
