import React, { useState } from 'react';
import { OrderReceipt } from '../types';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  artisanName: string;
  location: string;
  imageUrl: string;
  quantity: number;
  unit: string;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onClearCart: () => void;
  onOrderConfirmed?: (receipt: OrderReceipt) => void;
  onExploreProducts?: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateQuantity,
  onClearCart,
  onOrderConfirmed,
  onExploreProducts
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'spei' | 'efectivo' | 'escrow'>('spei');
  const [confirmedReceipt, setConfirmedReceipt] = useState<OrderReceipt | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Generador de enlace directo a WhatsApp para pactar pedido sin intermediarios (1 minuto)
  const whatsappSummaryText = items
    .map(
      (it) =>
        `• ${it.quantity}x ${it.title} ($${it.price * it.quantity} MXN) - Artesana: ${it.artisanName} (${it.location})`
    )
    .join('\n');
  const whatsappMessage = `¡Hola! Me pongo en contacto desde Yucu Protocol para pactar la compra directa del siguiente pedido:\n\n${whatsappSummaryText}\n\n💰 Total Comercio Justo: $${total} MXN (100% directo a artesanas)\n\nMe gustaría acordar con ustedes el punto de entrega (en la Mixteca/Oaxaca) o el envío por paquetería comercial.`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

  const getPaymentLabel = (m: 'spei' | 'efectivo' | 'escrow') => {
    switch (m) {
      case 'spei':
        return 'SPEI Directo a Artesano (sin comisión)';
      case 'efectivo':
        return 'Efectivo Contra Entrega (En Mano)';
      case 'escrow':
        return 'Custodia Escrow Stellar (Protegido)';
    }
  };

  const handleExecutePayment = () => {
    setIsSuccess(true);
    const primaryArtisan = items[0]?.artisanName || 'Artesanas de la Mixteca';
    const primaryLocation = items[0]?.location || 'Tlaxiaco, Oaxaca';

    const newReceipt: OrderReceipt = {
      id: `REC-MIX-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      items: items.map((i) => ({
        id: i.id,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        artisanName: i.artisanName,
        location: i.location
      })),
      total,
      paymentMethod: getPaymentLabel(paymentMethod),
      artisanName: primaryArtisan,
      location: primaryLocation,
      status: 'Pago Confirmado',
      stellarTxLedger: Math.floor(52490000 + Math.random() * 10000),
      stellarTxHash: `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      trackingStep: 1
    };

    setTimeout(() => {
      setIsSuccess(false);
      setConfirmedReceipt(newReceipt);
    }, 800);
  };

  const handleGoToChatWithReceipt = () => {
    if (confirmedReceipt && onOrderConfirmed) {
      const receiptToPass = confirmedReceipt;
      onClearCart();
      setConfirmedReceipt(null);
      onClose();
      onOrderConfirmed(receiptToPass);
    } else {
      onClose();
    }
  };

  const handleCopyReceiptText = () => {
    if (!confirmedReceipt) return;
    const text =
      `🧾 COMPROBANTE DE DEMOSTRACIÓN DE COMPRA DIRECTA · PROTOCOLO RAÍZ\n` +
      `Folio: #${confirmedReceipt.id}\n` +
      `Fecha: ${confirmedReceipt.date}\n` +
      `Taller: ${confirmedReceipt.artisanName} (${confirmedReceipt.location})\n` +
      `Método de Pago: ${confirmedReceipt.paymentMethod}\n` +
      `Total: $${confirmedReceipt.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN\n` +
      `Estatus: ✅ PAGO CONFIRMADO (100% Directo a Artesanas - sin comisiones)\n` +
      `Stellar Ledger: #${confirmedReceipt.stellarTxLedger}\n` +
      `Hash Blockchain: ${confirmedReceipt.stellarTxHash}\n\n` +
      `Paso siguiente: Coordinación de entrega en taller o paquetería comercial.`;

    navigator.clipboard?.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
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
        className="w-full max-w-md bg-[#fcf9f3] rounded-3xl overflow-hidden shadow-2xl border border-[#c1c8c2]/50 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-[#c1c8c2]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#032517]">
              {confirmedReceipt ? 'verified' : 'local_mall'}
            </span>
            <h3 className="text-[17px] font-bold text-[#032517]">
              {confirmedReceipt ? 'Comprobante de Demostración de Compra' : 'Bolsa de Compra Directa'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirmedReceipt) {
                onClearCart();
                setConfirmedReceipt(null);
              }
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-[#f0eee8] hover:bg-[#ebe8e2] active:scale-90 text-[#1c1c18] flex items-center justify-center cursor-pointer transition-all"
            aria-label="Cerrar modal"
            title="Cerrar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3.5">
          {/* ========================================================= */}
          {/* VISTA 1: EL ÚLTIMO EVENTO DEL FLUJO (COMPROBANTE EMITIDO) */}
          {/* ========================================================= */}
          {confirmedReceipt ? (
            <div className="space-y-3.5 animate-fade-in">
              {/* Notificación de Éxito y Celebración */}
              <div className="bg-[#032517] text-white p-4 rounded-2xl border border-emerald-500/40 text-center space-y-1.5 shadow-md">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[28px]">
                  ✅
                </div>
                <h4 className="text-[17px] font-black text-white">
                  ¡Pago y Pedido Registrados con Éxito!
                </h4>
                <p className="text-[12px] text-emerald-200/90 max-w-xs mx-auto leading-relaxed">
                  Último evento del flujo completado: el taller de la artesana ha sido notificado para preparar tus piezas.
                </p>
                <div className="inline-block mt-1 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-400/40 text-[11px] font-mono text-emerald-300 font-bold">
                  Folio de Demostración #{confirmedReceipt.id}
                </div>
              </div>

              {/* Ficha Formal del Comprobante */}
              <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2]/50 shadow-2xs space-y-3 text-[12.5px]">
                <div className="flex justify-between items-center pb-2.5 border-b border-[#c1c8c2]/30">
                  <span className="text-[#727973]">Fecha y Hora:</span>
                  <span className="font-semibold text-[#032517]">{confirmedReceipt.date}</span>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-[#c1c8c2]/30">
                  <span className="text-[#727973]">Taller Artesanal:</span>
                  <span className="font-bold text-[#032517] text-right">
                    {confirmedReceipt.artisanName} · {confirmedReceipt.location}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-[#c1c8c2]/30">
                  <span className="text-[#727973]">Método de Pago:</span>
                  <span className="font-bold text-emerald-700">{confirmedReceipt.paymentMethod}</span>
                </div>

                {/* Desglose de piezas */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold text-[#727973] uppercase tracking-wide">
                    Artículos Adquiridos:
                  </p>
                  {confirmedReceipt.items.map((it) => (
                    <div key={it.id} className="flex justify-between items-center text-[12px]">
                      <span className="text-[#1c1c18] font-medium">
                        {it.quantity}x {it.title}
                      </span>
                      <span className="font-bold text-[#032517]">${it.price * it.quantity} MXN</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="pt-2 border-t-2 border-[#032517]/20 flex justify-between items-baseline">
                  <span className="text-[14px] font-extrabold text-[#032517]">Total de Comercio Justo:</span>
                  <span className="text-[20px] font-black text-[#a73918]">
                    ${confirmedReceipt.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>

              {/* Datos de Transferencia Directa SPEI */}
              {paymentMethod === 'spei' && (
                <div className="p-3 bg-[#e8f5e9] rounded-2xl border border-emerald-300 text-[12px] space-y-1">
                  <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">account_balance</span>
                    <span>Datos para Transferencia SPEI (sin comisiones):</span>
                  </p>
                  <p className="text-emerald-900 font-mono text-[11.5px] bg-white p-2 rounded-lg border border-emerald-200">
                    Banco: <strong>Banco del Bienestar / BBVA</strong><br />
                    CLABE: <strong>012 610 0048 2910 4482</strong><br />
                    Beneficiaria: <strong>{confirmedReceipt.artisanName}</strong><br />
                    Concepto: <strong>{confirmedReceipt.id}</strong>
                  </p>
                </div>
              )}

              {/* Certificación Notarial Stellar */}
              <div className="p-2.5 bg-black/5 rounded-xl border border-[#c1c8c2]/40 text-[11px] text-[#424843] flex items-center justify-between">
                <span>Stellar Ledger #{confirmedReceipt.stellarTxLedger}</span>
                <span className="font-mono text-emerald-700 font-bold">
                  Hash: {confirmedReceipt.stellarTxHash?.slice(0, 10)}... ✓
                </span>
              </div>
            </div>
          ) : items.length === 0 ? (
            /* ========================================================= */
            /* BOLSA VACÍA */
            /* ========================================================= */
            <div className="py-10 text-center text-[#424843] flex flex-col items-center">
              <span className="material-symbols-outlined text-[48px] text-[#c1c8c2] block mb-2">
                shopping_bag
              </span>
              <p className="text-[16px] font-bold text-[#032517]">Tu bolsa está vacía</p>
              <p className="text-[13px] mt-1 text-[#727973] max-w-xs leading-relaxed">
                Descubre café de altura, artesanías de palma, barro y textiles directos de la Mixteca.
              </p>
              {onExploreProducts && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onExploreProducts();
                  }}
                  className="mt-4 px-5 py-2.5 bg-[#a73918] hover:bg-[#6c1900] text-white rounded-full font-bold text-[13px] flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">storefront</span>
                  <span>Explorar Vitrina de Productos</span>
                </button>
              )}
            </div>
          ) : (
            /* ========================================================= */
            /* LISTA DE ITEMS + SELECTOR DE MÉTODO DE PAGO */
            /* ========================================================= */
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3 border border-[#c1c8c2]/40 flex gap-3 shadow-2xs"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover bg-[#f0eee8] shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[14px] font-bold text-[#032517] leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[12px] text-[#424843]">
                        {item.artisanName} · {item.location}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[14px] font-bold text-[#a73918]">
                        ${item.price * item.quantity} MXN
                      </span>

                      <div className="flex items-center gap-2 bg-[#f0eee8] rounded-full px-2 py-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity > 1) {
                              onUpdateQuantity(item.id, item.quantity - 1);
                            } else {
                              onRemoveItem(item.id);
                            }
                          }}
                          className="text-[#032517] hover:text-[#a73918] font-bold text-[16px] px-1"
                        >
                          -
                        </button>
                        <span className="text-[12px] font-bold text-[#032517]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="text-[#032517] hover:text-[#a73918] font-bold text-[16px] px-1"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Selector de Método de Pago Directo */}
              <div className="p-3.5 bg-white rounded-2xl border border-[#c1c8c2]/50 space-y-2 shadow-2xs">
                <span className="text-[12px] font-bold text-[#032517] block">
                  Elige tu Método de Pago Directo:
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('spei')}
                    className={`p-2.5 rounded-xl border text-left text-[12px] flex items-center justify-between transition-all cursor-pointer ${
                      paymentMethod === 'spei'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                        : 'border-[#c1c8c2]/60 hover:bg-[#f0eee8] text-[#424843]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-emerald-700">
                        bolt
                      </span>
                      <div>
                        <p className="leading-tight">Transferencia Directa SPEI</p>
                        <p className="text-[10.5px] text-[#727973] font-normal">
                          sin comisiones bancarias · Directo a cuenta Bienestar/BBVA
                        </p>
                      </div>
                    </div>
                    {paymentMethod === 'spei' && (
                      <span className="material-symbols-outlined text-[18px] text-emerald-700">
                        check_circle
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`p-2.5 rounded-xl border text-left text-[12px] flex items-center justify-between transition-all cursor-pointer ${
                      paymentMethod === 'efectivo'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                        : 'border-[#c1c8c2]/60 hover:bg-[#f0eee8] text-[#424843]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-amber-700">
                        handshake
                      </span>
                      <div>
                        <p className="leading-tight">Efectivo Contra Entrega</p>
                        <p className="text-[10.5px] text-[#727973] font-normal">
                          Pagas en mano al retirar en taller o punto en la Mixteca
                        </p>
                      </div>
                    </div>
                    {paymentMethod === 'efectivo' && (
                      <span className="material-symbols-outlined text-[18px] text-emerald-700">
                        check_circle
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('escrow')}
                    className={`p-2.5 rounded-xl border text-left text-[12px] flex items-center justify-between transition-all cursor-pointer ${
                      paymentMethod === 'escrow'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                        : 'border-[#c1c8c2]/60 hover:bg-[#f0eee8] text-[#424843]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-sky-700">
                        security
                      </span>
                      <div>
                        <p className="leading-tight">Custodia Segura Stellar (Escrow)</p>
                        <p className="text-[10.5px] text-[#727973] font-normal">
                          Fondos liberados cuando confirmas recepción de la pieza
                        </p>
                      </div>
                    </div>
                    {paymentMethod === 'escrow' && (
                      <span className="material-symbols-outlined text-[18px] text-emerald-700">
                        check_circle
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Compromiso Comunitario */}
              <div className="p-3 bg-[#f6f3ed] rounded-2xl border border-[#c1c8c2]/40 text-[11.5px] text-[#424843] flex items-start gap-2">
                <span className="material-symbols-outlined text-[17px] text-[#032517] mt-0.5 shrink-0">
                  verified_user
                </span>
                <p>
                  <strong>100% Directo a Artesanas:</strong> Al pagar, obtienes tu Comprobante de Demostración y te enlazamos por Chat o WhatsApp para acordar la entrega libremente.
                </p>
              </div>
            </>
          )}
        </div>

        {/* ========================================================= */}
        {/* FOOTER ACTIONS */}
        {/* ========================================================= */}
        <div className="p-4 bg-white border-t border-[#c1c8c2]/30 space-y-2">
          {confirmedReceipt ? (
            /* ACCIONES DEL ÚLTIMO EVENTO */
            <div className="space-y-2 animate-fade-in">
              <button
                type="button"
                onClick={handleGoToChatWithReceipt}
                className="w-full h-12 bg-[#032517] hover:bg-[#073824] active:scale-98 text-white rounded-full font-black text-[13.5px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[19px] text-emerald-300">chat</span>
                <span>Coordinar Entrega en Chat con la Artesana</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyReceiptText}
                  className="flex-1 h-11 bg-white hover:bg-[#f0eee8] text-[#032517] border border-[#c1c8c2] rounded-full font-bold text-[12.5px] flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {copiedReceipt ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedReceipt ? '¡Comprobante Copiado!' : 'Guardar Comprobante'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClearCart();
                    setConfirmedReceipt(null);
                    onClose();
                    if (onExploreProducts) onExploreProducts();
                  }}
                  className="h-11 px-4 bg-[#f0eee8] hover:bg-[#e4e1d8] text-[#424843] rounded-full font-bold text-[12.5px] flex items-center justify-center gap-1 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Cerrar</span>
                </button>
              </div>
            </div>
          ) : items.length > 0 ? (
            /* ACCIONES PRE-PAGO (1 SOLO CLIC PARA PAGAR Y FINALIZAR) */
            <>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[14px] font-medium text-[#424843]">Total de Comercio Justo:</span>
                <span className="text-[22px] font-bold text-[#032517]">${total} MXN</span>
              </div>

              {/* Botón Principal: Pagar y Confirmar Pedido (Dispara el último evento) */}
              <button
                type="button"
                disabled={isSuccess}
                onClick={handleExecutePayment}
                className="w-full h-12 bg-[#a73918] hover:bg-[#8c2d12] active:scale-98 text-white rounded-full font-black text-[14px] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {isSuccess ? (
                  <>
                    <span className="material-symbols-outlined text-[19px] animate-spin">
                      progress_activity
                    </span>
                    <span>Emitiendo Comprobante de Demostración...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">payments</span>
                    <span>Pagar y Confirmar Pedido (${total} MXN)</span>
                  </>
                )}
              </button>

              {/* Opción Alternativa: Pactar por WhatsApp Directo */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setTimeout(() => {
                    onClearCart();
                    onClose();
                  }, 500);
                }}
                className="w-full h-10 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] rounded-full font-bold text-[12.5px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>O pactar directamente por WhatsApp (30 seg)</span>
              </a>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
