import React, { useState } from 'react';
import { PROTOCOL_FEES } from '../config/protocolFees';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCard?: (type: any) => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  onOpenCard
}) => {
  const [activeTab, setActiveTab] = useState<'vision' | 'logistica' | 'regalias' | 'micopay' | 'estudiantes' | 'markdown'>('vision');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullMarkdownDoc = `# OPEN HUB TEC: PLATAFORMA INTEGRAL DE TRAZABILIDAD, COMERCIO JUSTO Y PAGOS COMUNITARIOS EN LA MIXTECA OAXAQUEÑA
**Instituto Tecnológico de Tlaxiaco (TecNM) • Red Stellar & Soroban**

---

## 1. RESUMEN EJECUTIVO Y VISIÓN
**Yucu** es una infraestructura socio-tecnológica diseñada para eliminar la asimetría de información y el despojo económico en las comunidades de la Mixteca Alta. 
Combina:
1. **Módulo Único de Registro Universal**: Registro ágil de café, miel, telar de cintura, barro y palma mediante interfaces ultraligeras y notas de voz en Tu'un Savi / Español.
2. **Dictamen Agroecológico TecNM**: Verificación científica de calidad (humedad, libre de plaguicidas, altitud) anclada criptográficamente en Stellar Testnet.
3. **Trato y Entrega Directa (Deslinde Logístico)**: Yucu no opera paqueterías ni fletes. La entrega física se acuerda directamente entre comprador y artesano en taller o parcela, eliminando al intermediario especulador.
4. **Regalías Perpetuas On-Chain**: Smart contracts en Soroban que garantizan un ${PROTOCOL_FEES.artisanResaleRoyaltyPct}% perpetuo a las artesanas y creadores sobre cualquier reventa secundaria en galerías o el extranjero.
5. **MicoPay & Billetera Comunitaria**: Custodia en Escrow con USDC, cobros con código QR y red de liquidación en efectivo sin intermediación bancaria tradicional.
6. **Estudiantes TecNM**: Estudiantes del TecNM Campus Tlaxiaco programan Yucu como parte de sus materias.

---

## 2. TRATO DIRECTO Y DESLINDE LOGÍSTICO
- **Principio Fundamental**: Yucu **no gestiona logística, no opera transporte ni cobra fletes de entrega**.
- **Solución Yucu**: 
  - La entrega o recolección física se acuerda libre y directamente entre el comprador y el productor/artesano (en taller, parcela o punto convenido).
  - Yucu se enfoca 100% en la **trazabilidad de origen, certificación de calidad del TecNM y sellado inmutable en Stellar**.
  - El pago condicionado (Escrow) protege a ambas partes sin que la plataforma asuma pasivos de transporte o paquetería.

---

## 3. CONTRATO DE REGALÍAS PERPETUAS (MERCADO SECUNDARIO)
- **Problema Histórico**: Un huipil comprado en $2,000 MXN en Tlaxiaco se revende en $15,000 MXN en boutiques de Polanco o Europa sin que la artesana reciba un centavo adicional.
- **Solución Soroban**:
  - Cada pieza tiene un Pasaporte Digital NFT/Tokenizado con la identidad de la artesana.
  - Si el comprador revende la pieza en el mercado secundario integrado, el contrato retiene el ${PROTOCOL_FEES.artisanResaleRoyaltyPct}% del monto total de la reventa y lo transfiere automáticamente a la billetera MicoPay de la artesana creadora.

---

## 4. MICOPAY: BILLETERA Y LIQUIDEZ RURAL
- **Cero Volatilidad**: Respaldado 1:1 en USDC sobre Stellar (bajísimas comisiones < $0.001 USD por transacción).
- **Escrow Automatizado**: El comprador deposita los fondos antes del despacho; se liberan al productor al momento del pesaje y dictamen técnico.
- **Red de Retiro**: Puntos de entrega de efectivo en el Centro de Acopio del Tec en Tlaxiaco, cooperativas y cajeros móviles autorizados.

---

## 5. VINCULACIÓN ACADÉMICA Y PARTICIPACIÓN ESTUDIANTIL
- Estudiantes del TecNM Campus Tlaxiaco programan Yucu como parte de sus materias.
- Si una issue forma parte de Drips Wave, Drips le paga directamente a quien la resolvió.
`;

  const handleCopyMarkdown = () => {
    navigator.clipboard?.writeText(fullMarkdownDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#fcf9f3] w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl border border-[#c1c8c2] flex flex-col overflow-hidden text-[#1c1c18]">
        {/* Modal Header */}
        <div className="bg-[#032517] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[22px] border border-emerald-500/30">
              📖
            </span>
            <div>
              <h3 className="text-[16px] font-black tracking-tight leading-tight">
                Expediente Técnico &amp; Base de Conocimiento
              </h3>
              <p className="text-[11px] text-emerald-200/90">
                Yucu • Arquitectura de Innovación Rural Stellar &amp; Soroban
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'done_all' : 'content_copy'}
              </span>
              <span>{copied ? '¡Copiado!' : 'Copiar Notion'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-[16px] transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#f0eee8] border-b border-[#c1c8c2]/50 p-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('vision')}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all cursor-pointer ${
              activeTab === 'vision'
                ? 'bg-[#032517] text-white shadow-xs'
                : 'text-[#424843] hover:bg-[#e4e1d9]'
            }`}
          >
            🌟 Visión General
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logistica')}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all cursor-pointer ${
              activeTab === 'logistica'
                ? 'bg-[#032517] text-white shadow-xs'
                : 'text-[#424843] hover:bg-[#e4e1d9]'
            }`}
          >
            🤝 Trato Directo (Sin Logística)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('regalias')}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all cursor-pointer ${
              activeTab === 'regalias'
                ? 'bg-rose-900 text-white shadow-xs'
                : 'text-[#424843] hover:bg-[#e4e1d9]'
            }`}
          >
            💎 {`${PROTOCOL_FEES.artisanResaleRoyaltyPct}% Regalías Soroban`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('micopay')}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all cursor-pointer ${
              activeTab === 'micopay'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'text-[#424843] hover:bg-[#e4e1d9]'
            }`}
          >
            💳 MicoPay &amp; Efectivo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('estudiantes')}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all cursor-pointer ${
              activeTab === 'estudiantes'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-[#424843] hover:bg-[#e4e1d9]'
            }`}
          >
            🎓 Estudiantes TecNM
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('markdown')}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all cursor-pointer ${
              activeTab === 'markdown'
                ? 'bg-gray-800 text-white shadow-xs'
                : 'text-[#424843] hover:bg-[#e4e1d9]'
            }`}
          >
            📄 Markdown Completo
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 overflow-y-auto flex-1 text-[13px] leading-relaxed space-y-3">
          {activeTab === 'vision' && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5">
                <h4 className="font-extrabold text-emerald-950 text-[14px] mb-1">
                  🌟 El Salto Cuántico Tecnológico de la Mixteca
                </h4>
                <p className="text-emerald-900 text-[12.5px]">
                  Yucu trasciende un simple catálogo digital. Es un ecosistema vivo donde la ciencia agronómica del Instituto Tecnológico de Tlaxiaco se une a la solidez de los contratos inteligentes en Stellar para blindar el valor creado por los pueblos originarios.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white p-3 rounded-xl border border-[#c1c8c2]/60 shadow-2xs">
                  <div className="text-[20px] mb-1">🌱</div>
                  <h5 className="font-bold text-[#032517] text-[13px]">Registro Universal Sin Fricción</h5>
                  <p className="text-[11.5px] text-[#424843] mt-0.5">
                    Un campesino o artesana no necesita contraseñas complejas. Se registra por voz en Tu&apos;un Savi o español en 90 segundos.
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#c1c8c2]/60 shadow-2xs">
                  <div className="text-[20px] mb-1">⛓️</div>
                  <h5 className="font-bold text-[#032517] text-[13px]">Notaría Inmutable Stellar</h5>
                  <p className="text-[11.5px] text-[#424843] mt-0.5">
                    Dictámenes de laboratorio certificados (humedad, altitud, pureza botánica) firmados y sellados en ledger público inalterable.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logistica' && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[20px]">🤝</span>
                  <h4 className="font-extrabold text-amber-950 text-[14px]">
                    Trato Directo y Deslinde Logístico de Entrega
                  </h4>
                </div>
                <p className="text-amber-900 text-[12.5px] leading-relaxed">
                  <strong>Yucu no se mete con la logística ni con los fletes de entrega.</strong> La entrega o retiro de la pieza física o cosecha se acuerda de forma 100% directa y libre entre el comprador y el artesano (en el taller, parcela o punto acordado).
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#c1c8c2]/60 shadow-2xs space-y-2">
                <h5 className="font-bold text-[#032517]">¿Por qué Yucu no opera paqueterías ni fletes?</h5>
                <ul className="list-disc pl-4 space-y-1.5 text-[12px] text-[#424843]">
                  <li>
                    <strong>Enfoque en Bien Público:</strong> Yucu es un protocolo descentralizado de trazabilidad, certificación de calidad del TecNM y atestación en Stellar, no una empresa de mensajería ni una fletera.
                  </li>
                  <li>
                    <strong>Cero Pasivos de Transporte:</strong> No cobra comisiones de envío, no fija tarifas de fletes ni opera vehículos. Las partes pactan libremente el retiro o entrega.
                  </li>
                  <li>
                    <strong>Custodia de Pago Segura (Escrow):</strong> El dinero se resguarda en contrato inteligente y se libera cuando el comprador confirma la recepción de la pieza auténtica en mano.
                  </li>
                </ul>
              </div>

              {onOpenCard && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCard('logistica_coyote');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#032517] hover:bg-[#1b3b2b] text-white font-bold text-[12px] transition-all cursor-pointer"
                >
                  Ver Tarjeta de Trato Directo en el Chat
                </button>
              )}
            </div>
          )}

          {activeTab === 'regalias' && (
            <div className="space-y-3">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[20px]">💎</span>
                  <h4 className="font-extrabold text-rose-950 text-[14px]">
                    Regalías Perpetuas On-Chain ({`${PROTOCOL_FEES.artisanResaleRoyaltyPct}% en Soroban`})
                  </h4>
                </div>
                <p className="text-rose-900 text-[12.5px]">
                  {`Blindaje definitivo contra la apropiación cultural y la especulación artística. Si una pieza textil o cerámica es revendida en el mercado secundario internacional por coleccionistas o galerías, la artesana original recibe automáticamente el ${PROTOCOL_FEES.artisanResaleRoyaltyPct}%.`}
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#c1c8c2]/60 space-y-2 text-[12px]">
                <div className="flex justify-between items-center border-b pb-1.5 border-[#c1c8c2]/30">
                  <span className="font-medium text-[#727973]">Venta Inicial en Parcela/Taller:</span>
                  <span className="font-bold text-[#032517]">$2,000 MXN (100% para la artesana)</span>
                </div>
                <div className="flex justify-between items-center border-b pb-1.5 border-[#c1c8c2]/30">
                  <span className="font-medium text-[#727973]">Reventa en Galería (Nueva York/Berlín):</span>
                  <span className="font-bold text-amber-700">$10,000 MXN</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <span className="font-bold text-emerald-950">{`${PROTOCOL_FEES.artisanResaleRoyaltyPct}% Transferido Automáticamente:`}</span>
                  <span className="font-extrabold text-emerald-800 text-[13px]">{`+$${(10000 * PROTOCOL_FEES.artisanResaleRoyaltyPct / 100).toLocaleString('es-MX')} MXN (50 USDC)`}</span>
                </div>
              </div>

              {onOpenCard && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCard('regalias_mercado');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-[12px] transition-all cursor-pointer"
                >
                  Ver Tarjeta Interactiva de Regalías en el Chat
                </button>
              )}
            </div>
          )}

          {activeTab === 'micopay' && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[20px]">💳</span>
                  <h4 className="font-extrabold text-amber-950 text-[14px]">
                    MicoPay: Billetera Rural sin Volatilidad
                  </h4>
                </div>
                <p className="text-amber-900 text-[12.5px]">
                  El campesino nunca se expone a fluctuaciones cripto. Todas las transacciones se denominan en pesos mexicanos respaldados 1:1 en USDC sobre Stellar con comisiones despreciables (&lt; $0.01 MXN).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="bg-white p-3 rounded-xl border border-[#c1c8c2]/60">
                  <span className="font-bold text-[#032517] block">🔒 Custodia Escrow</span>
                  <p className="text-[#727973] text-[11px] mt-0.5">
                    El comprador deposita en garantía. El productor tiene la certeza de pago antes de cargar el camión.
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#c1c8c2]/60">
                  <span className="font-bold text-[#032517] block">🏦 Retiro SPEI / Efectivo</span>
                  <p className="text-[#727973] text-[11px] mt-0.5">
                    Cajero central en el Tec de Tlaxiaco, transferencias bancarias o cobro directo con QR en comercios locales.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'estudiantes' && (
            <div className="space-y-3">
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[20px]">🎓</span>
                  <h4 className="font-extrabold text-purple-950 text-[14px]">
                    Estudiantes TecNM &amp; GitHub Open Hub
                  </h4>
                </div>
                <p className="text-purple-900 text-[12.5px]">
                  Estudiantes del TecNM Campus Tlaxiaco programan Yucu como parte de sus materias. Si una issue forma parte de Drips Wave, Drips le paga directamente a quien la resolvió.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#c1c8c2]/60 text-[12px] space-y-2">
                <p className="text-[#424843]">
                  Los estudiantes de Ingeniería en Sistemas e Informática del Instituto Tecnológico de Tlaxiaco resuelven tareas de mantenimiento, conexión de sensores IoT o soporte a campesinos.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'markdown' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-bold text-[#727973]">
                  Documento Completo en formato Markdown:
                </span>
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="text-[12px] text-emerald-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  <span>{copied ? '¡Copiado!' : 'Copiar todo'}</span>
                </button>
              </div>
              <pre className="bg-[#1c1c18] text-emerald-300 p-3 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-[350px] leading-relaxed whitespace-pre-wrap border border-white/10">
                {fullMarkdownDoc}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#f0eee8] border-t border-[#c1c8c2]/50 p-3 flex items-center justify-between">
          <span className="text-[11px] text-[#727973]">
            TecNM Tlaxiaco • Mixteca Oaxaqueña • Stellar Testnet
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#032517] hover:bg-[#1b3b2b] text-white font-bold text-[12px] cursor-pointer"
          >
            Cerrar Expediente
          </button>
        </div>
      </div>
    </div>
  );
};
