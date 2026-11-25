import React, { useState } from 'react';
import { DigitalPassportLot, ScreenView } from '../types';

interface RaizLandingPageProps {
  onNavigateScreen: (screen: ScreenView, productType?: string) => void;
  onOpenExplainerVideo?: () => void;
  onOpenProtocolModal?: () => void;
  onOpenPresentation?: () => void;
  onSelectLot?: (lot: DigitalPassportLot) => void;
  lots?: DigitalPassportLot[];
}

export const RaizLandingPage: React.FC<RaizLandingPageProps> = ({
  onNavigateScreen,
  onOpenExplainerVideo,
  onOpenProtocolModal,
  onOpenPresentation,
  onSelectLot,
  lots = []
}) => {
  // Calculator state
  const [commodityType, setCommodityType] = useState<'cafe' | 'textil' | 'miel' | 'palma'>('cafe');
  const [volume, setVolume] = useState<number>(100); // 100 kg or 100 pieces
  const [activeTab, setActiveTab] = useState<'vision' | 'pilares' | 'impacto' | 'techrebel'>('vision');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Economic calculation formulas based on field audits in Tlaxiaco
  const getEconomicMetrics = () => {
    switch (commodityType) {
      case 'cafe': {
        const coyotePricePerKg = 42; // Coyote pays $42 MXN/kg
        const yucuFairPricePerKg = 185; // Yucu direct price $185 MXN/kg
        const retailResalePricePerKg = 420; // Roasted retail price in CDMX
        const coyoteTotal = volume * coyotePricePerKg;
        const yucuTotal = volume * yucuFairPricePerKg;
        const addedValueToProducer = yucuTotal - coyoteTotal;
        const gapPercent = Math.round(((retailResalePricePerKg - coyotePricePerKg) / retailResalePricePerKg) * 100);
        return { unit: 'kg de café pergamino', coyoteTotal, yucuTotal, addedValueToProducer, gapPercent, fairPrice: yucuFairPricePerKg, coyotePrice: coyotePricePerKg };
      }
      case 'textil': {
        const coyotePricePerPiece = 350; // Coyote pays $350 for backstrap loom
        const yucuFairPricePerPiece = 1450; // Fair trade direct price
        const retailResalePricePerPiece = 3200; // Boutique CDMX/Oaxaca
        const coyoteTotal = volume * coyotePricePerPiece;
        const yucuTotal = volume * yucuFairPricePerPiece;
        const addedValueToProducer = yucuTotal - coyoteTotal;
        const gapPercent = Math.round(((retailResalePricePerPiece - coyotePricePerPiece) / retailResalePricePerPiece) * 100);
        return { unit: 'rebozos / huipiles bordados', coyoteTotal, yucuTotal, addedValueToProducer, gapPercent, fairPrice: yucuFairPricePerPiece, coyotePrice: coyotePricePerPiece };
      }
      case 'miel': {
        const coyotePricePerLiter = 45; // Coyote pays $45 MXN/L
        const yucuFairPricePerLiter = 160; // Fair trade virgin campanilla honey
        const retailResalePricePerLiter = 380;
        const coyoteTotal = volume * coyotePricePerLiter;
        const yucuTotal = volume * yucuFairPricePerLiter;
        const addedValueToProducer = yucuTotal - coyoteTotal;
        const gapPercent = Math.round(((retailResalePricePerLiter - coyotePricePerLiter) / retailResalePricePerLiter) * 100);
        return { unit: 'litros de miel virgen de campanilla', coyoteTotal, yucuTotal, addedValueToProducer, gapPercent, fairPrice: yucuFairPricePerLiter, coyotePrice: coyotePricePerLiter };
      }
      case 'palma': {
        const coyotePricePerUnit = 25; // Coyote pays $25 for handmade palm hat
        const yucuFairPricePerUnit = 140; // Direct artisan fair price
        const retailResalePricePerUnit = 320;
        const coyoteTotal = volume * coyotePricePerUnit;
        const yucuTotal = volume * yucuFairPricePerUnit;
        const addedValueToProducer = yucuTotal - coyoteTotal;
        const gapPercent = Math.round(((retailResalePricePerUnit - coyotePricePerUnit) / retailResalePricePerUnit) * 100);
        return { unit: 'sombreros / tenates de palma fina', coyoteTotal, yucuTotal, addedValueToProducer, gapPercent, fairPrice: yucuFairPricePerUnit, coyotePrice: coyotePricePerUnit };
      }
    }
  };

  const metrics = getEconomicMetrics();

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#fcfaf6] text-[#1c241f] pb-24 selection:bg-[#c7ebd4] selection:text-[#002b18]">
      {/* 1. TOP ANNOUNCEMENT & TECH REBEL CONTEXT BAR */}
      <div className="w-full bg-[#032517] text-[#e2efe6] px-4 py-2.5 text-xs border-b border-[#0f3d29]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="font-semibold text-emerald-300">Tech Rebel Product Showcase</span>
            <span aria-hidden="true" className="text-emerald-700">·</span>
            <span>Programa Alebrije & Red de Innovación Rural</span>
            <span aria-hidden="true" className="text-emerald-700">·</span>
            <span className="text-stone-300">TecNM Campus Tlaxiaco, Oaxaca</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://techrebel.world"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-300 hover:text-white underline underline-offset-2 transition-colors"
            >
              techrebel.world ↗
            </a>
            <span aria-hidden="true" className="text-emerald-700">·</span>
            <a
              href="https://github.com/Open-Hub-Tec/yucu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-300 hover:text-white underline underline-offset-2 transition-colors"
            >
              GitHub Open-Hub-Tec/yucu ↗
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER NAV */}
      <header className="sticky top-0 z-30 bg-[#fcfaf6]/95 backdrop-blur-md border-b border-[#e5dfd5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#032517] text-[#c7ebd4] flex items-center justify-center font-black text-xl shadow-xs">
              Y
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#032517]">Yucu Protocol</span>
                <span className="text-xs text-emerald-800 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full">Mixteca · Stellar</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-none">Atestaciones de Verdad Física, RWA y Montaña en Soroban</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-700">
            <button
              onClick={() => setActiveTab('vision')}
              className={`hover:text-[#032517] transition-colors ${activeTab === 'vision' ? 'text-[#032517] font-bold border-b-2 border-[#032517] pb-1' : ''}`}
            >
              Visión & Dolor
            </button>
            <button
              onClick={() => setActiveTab('pilares')}
              className={`hover:text-[#032517] transition-colors ${activeTab === 'pilares' ? 'text-[#032517] font-bold border-b-2 border-[#032517] pb-1' : ''}`}
            >
              3 Pilares Técnicos
            </button>
            <button
              onClick={() => setActiveTab('impacto')}
              className={`hover:text-[#032517] transition-colors ${activeTab === 'impacto' ? 'text-[#032517] font-bold border-b-2 border-[#032517] pb-1' : ''}`}
            >
              Calculadora Anti-Coyote
            </button>
            <button
              onClick={() => setActiveTab('techrebel')}
              className={`hover:text-[#032517] transition-colors ${activeTab === 'techrebel' ? 'text-[#032517] font-bold border-b-2 border-[#032517] pb-1' : ''}`}
            >
              Marco Tech Rebel
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigateScreen('menu_principal')}
              className="bg-[#032517] text-[#e2efe6] hover:bg-[#002b18] px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">phone_android</span>
              <span>Abrir App / PWA</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[#e5dfd5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left copy */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#a73918] mb-3">
                <span>Mixteca Alta de Oaxaca</span>
                <span aria-hidden="true">·</span>
                <span>TecNM Campus Tlaxiaco</span>
                <span aria-hidden="true">·</span>
                <span>Soroban Smart Contracts</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-[#032517] tracking-tight leading-[1.12] mb-5">
                El protocolo que defiende a quien cultiva la tierra y teje el origen.
              </h1>

              <p className="text-base sm:text-lg text-stone-700 leading-relaxed mb-8">
                <strong>Yucu Protocol</strong> (del mixteco <em>Yuku</em>: Cerro/Montaña sagrada de la Mixteca) es un bien público digital de código abierto diseñado para eliminar la intermediación abusiva en comunidades campesinas e indígenas. Conecta la parcela con el comprador global mediante registro por voz en lenguas originarias, atestaciones criptográficas en <strong>Stellar</strong> y custodia de pagos condicionados por hitos vía <strong>Trustless Work</strong>.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-10">
                <button
                  onClick={() => onNavigateScreen('menu_principal')}
                  className="bg-[#032517] text-white hover:bg-[#0c3924] px-6 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">play_circle</span>
                  <span>Probar la Aplicación en Vivo</span>
                </button>

                <button
                  onClick={() => onNavigateScreen('vitrina_productos')}
                  className="bg-[#ebe6dc] hover:bg-[#ded7c9] text-[#032517] px-5 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 border border-[#cfc8ba] active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                  <span>Vitrina de Compradores B2B</span>
                </button>

                {onOpenExplainerVideo && (
                  <button
                    onClick={onOpenExplainerVideo}
                    className="bg-white hover:bg-stone-50 text-[#a73918] px-4 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 border border-[#e5dfd5] active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">videocam</span>
                    <span>Testimonio de Campo</span>
                  </button>
                )}
              </div>

              {/* Zero-Pill Hard Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-[#e5dfd5]">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#032517]">79</div>
                  <div className="text-xs text-stone-600 mt-1">Productores entrevistados en campo</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#a73918]">1,200%</div>
                  <div className="text-xs text-stone-600 mt-1">Brecha máxima del coyote superada</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#032517]">&lt; 9 seg</div>
                  <div className="text-xs text-stone-600 mt-1">Adopción del QR físico en adultos mayores</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-800">100%</div>
                  <div className="text-xs text-stone-600 mt-1">Resiliencia offline en montaña sin 4G</div>
                </div>
              </div>
            </div>

            {/* Right Card / Interactive Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-[#ded7c9] relative">
                <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span className="text-xs font-bold text-[#032517]">Pasaporte Digital de Cosecha #MX-984</span>
                  </div>
                  <span className="text-xs text-stone-500 font-mono">Soroban Ledger #5249102</span>
                </div>

                <div className="relative rounded-xl overflow-hidden mb-4 bg-stone-100 aspect-video">
                  <img
                    src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
                    alt="Café de Especialidad Santa María Yucuhiti"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-[#032517]/90 text-white text-[11px] px-2.5 py-1 rounded-md backdrop-blur-xs font-medium">
                    Santa María Yucuhiti · 1,820 msnm
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-stone-600">Productor Certificado</span>
                    <span className="font-bold text-[#032517]">Don Juan López Bautista (64 años)</span>
                  </div>
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-stone-600">Variedad y Calidad</span>
                    <span className="font-semibold text-stone-900">Pluma Hidalgo Lavado · SCAA 87.5 pts</span>
                  </div>
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-stone-600">Cumplimiento Ambiental</span>
                    <span className="font-semibold text-emerald-800">EUDR Deforestation-Free (Satélite)</span>
                  </div>
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-stone-600">Escrow Soroban</span>
                    <span className="font-semibold text-[#032517]">Trustless Work Milestone Locked ($1,500 USDC)</span>
                  </div>
                </div>

                {/* Hash copy block */}
                <div className="bg-[#f7f4ed] rounded-lg p-3 text-xs border border-[#e5dfd5]">
                  <div className="flex items-center justify-between text-stone-600 mb-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider">SHA-256 Digest Comunitario</span>
                    <button
                      onClick={() => handleCopyHash('0x9f83a7b2c5e1d48937f2a1b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9')}
                      className="text-[#a73918] hover:underline font-bold text-[11px]"
                    >
                      {copiedHash ? '✓ Copiado' : 'Copiar Hash'}
                    </button>
                  </div>
                  <div className="font-mono text-[10px] text-stone-800 break-all select-all">
                    0x9f83a7b2c5e1d48937f2a1b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500">Etiqueta Física Hang-Tag: ISO/IEC 18004</span>
                  <button
                    onClick={() => {
                      if (lots[0] && onSelectLot) {
                        onSelectLot(lots[0]);
                      }
                      onNavigateScreen('pasaporte_digital');
                    }}
                    className="text-xs font-bold text-[#032517] hover:text-[#a73918] transition-colors flex items-center gap-1"
                  >
                    <span>Inspeccionar Lote Completo</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE 3 ARCHITECTURAL PILLARS (TECH REBEL SPECIFICATION) */}
      <section className="py-16 md:py-24 border-b border-[#e5dfd5] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="text-xs font-bold text-[#a73918] uppercase tracking-wider mb-2">
              Arquitectura de Solución (ADR-001 & ADR-002)
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#032517] tracking-tight">
              Los 3 Pilares de Yucu Protocol
            </h2>
            <p className="text-stone-600 mt-3 text-sm sm:text-base">
              Diseñado con rigor de ingeniería para funcionar donde no hay señal y donde las personas no saben inglés ni manejan contraseñas complejas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-[#fcfaf6] border border-[#ded7c9] hover:border-[#032517] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#032517] text-[#c7ebd4] flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-[24px]">mic</span>
              </div>
              <div className="text-xs font-semibold text-stone-500 mb-1">Pilar 1 · Fricción Cero</div>
              <h3 className="text-xl font-bold text-[#032517] mb-3">Trazabilidad Offline-First</h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                El campesino no escribe en teclados pequeños. Dicta su cosecha en <strong>Tu’un Savi (Mixteco)</strong> o español rural con un botón táctil gigante de 112px. El audio se comprime a 24kbps Opus y se almacena en <strong>IndexedDB local</strong> con persistencia ACID sin perder un solo byte en la montaña.
              </p>
              <ul className="text-xs text-stone-700 space-y-2 border-t border-stone-200 pt-4">
                <li className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                  <span>Cero contraseñas y cero seed phrases</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                  <span>Sincronización automática al detectar red</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                  <span>Estándar W3C Progressive Web App (PWA)</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-[#fcfaf6] border border-[#ded7c9] hover:border-[#032517] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#a73918] text-white flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
              </div>
              <div className="text-xs font-semibold text-stone-500 mb-1">Pilar 2 · Gemelo Físico-Digital</div>
              <h3 className="text-xl font-bold text-[#032517] mb-3">Atestación en Stellar</h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                Un digest canónico <strong>SHA-256</strong> liga la geolocalización, fotografía, audio en lengua y parámetros de calidad. Se estampa en el contrato <code>lot_passport</code> en <strong>Soroban</strong> y se imprime en una etiqueta física <strong>Hang-Tag QR</strong> cosida a la tela o costal, legible por cualquier cámara en menos de 9 segundos.
              </p>
              <ul className="text-xs text-stone-700 space-y-2 border-t border-stone-200 pt-4">
                <li className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                  <span>Verificación pública instantánea sin instalar apps</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                  <span>Defensa jurídica y técnica contra piratería</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                  <span>Cumplimiento regulatorio europeo (EUDR)</span>
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-[#fcfaf6] border border-[#ded7c9] hover:border-[#032517] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#002b18] text-emerald-300 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-[24px]">lock</span>
              </div>
              <div className="text-xs font-semibold text-stone-500 mb-1">Pilar 3 · Liquidación Condicionada</div>
              <h3 className="text-xl font-bold text-[#032517] mb-3">Escrow Trustless Work</h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                En lugar de reinventar contratos de custodia, Yucu adopta la infraestructura de <strong>Trustless Work en Soroban</strong>. El comprador institucional bloquea el pago (USDC). Se libera un <strong>30% de anticipo</strong> al registrar la cosecha y el <strong>70% restante</strong> cuando la bodega comunitaria valida la entrega física.
              </p>
              <ul className="text-xs text-stone-700 space-y-2 border-t border-stone-200 pt-4">
                <li className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                  <span>Arbitraje tripartito con cooperativa comunal</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                  <span>Salida a pesos SPEI vía Etherfuse</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                  <span>sin costo y sin comisiones para el productor</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE ANTI-COYOTE ECONOMIC CALCULATOR */}
      <section className="py-16 md:py-24 border-b border-[#e5dfd5] bg-[#f7f4ed]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <div className="text-xs font-bold text-[#a73918] uppercase tracking-wider mb-2">
              Validación Cuantitativa de Campo
            </div>
            <h2 className="text-3xl font-black text-[#032517] tracking-tight">
              Calculadora de Impacto Económico Comunitario
            </h2>
            <p className="text-stone-600 text-sm mt-2">
              Datos matemáticos levantados con 79 familias campesinas y artesanas en San Cristóbal Amoltepec, Santa María Yucuhiti, Ñumí y Mixtepec.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#ded7c9]">
            {/* Commodity Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
              <button
                onClick={() => setCommodityType('cafe')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  commodityType === 'cafe'
                    ? 'bg-[#032517] text-white border-[#032517] shadow-sm'
                    : 'bg-[#fcfaf6] text-stone-700 border-stone-200 hover:border-stone-300'
                }`}
              >
                ☕ Café de Especialidad
              </button>
              <button
                onClick={() => setCommodityType('textil')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  commodityType === 'textil'
                    ? 'bg-[#032517] text-white border-[#032517] shadow-sm'
                    : 'bg-[#fcfaf6] text-stone-700 border-stone-200 hover:border-stone-300'
                }`}
              >
                🧵 Telar de Cintura
              </button>
              <button
                onClick={() => setCommodityType('miel')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  commodityType === 'miel'
                    ? 'bg-[#032517] text-white border-[#032517] shadow-sm'
                    : 'bg-[#fcfaf6] text-stone-700 border-stone-200 hover:border-stone-300'
                }`}
              >
                🍯 Miel Virgen de Campanilla
              </button>
              <button
                onClick={() => setCommodityType('palma')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  commodityType === 'palma'
                    ? 'bg-[#032517] text-white border-[#032517] shadow-sm'
                    : 'bg-[#fcfaf6] text-stone-700 border-stone-200 hover:border-stone-300'
                }`}
              >
                👒 Palma Fina y Tenates
              </button>
            </div>

            {/* Volume slider */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-stone-800">
                  Volumen del lote: <span className="text-[#032517] font-extrabold">{volume.toLocaleString('es-MX')} {metrics.unit}</span>
                </label>
                <span className="text-xs text-stone-500">Mueve el control para simular</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-[#032517] h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-stone-200">
              <div className="p-4 rounded-xl bg-red-50/70 border border-red-200">
                <div className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">
                  Intermediario Tradicional ("Coyote")
                </div>
                <div className="text-2xl font-black text-red-900 mb-1">
                  ${metrics.coyoteTotal.toLocaleString('es-MX')} MXN
                </div>
                <p className="text-xs text-red-700">
                  Pago en efectivo castigado: ${metrics.coyotePrice} MXN por unidad. El productor pierde el control de su cosecha.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300">
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">
                  Liquidación Yucu + Trustless Work
                </div>
                <div className="text-2xl font-black text-emerald-950 mb-1">
                  ${metrics.yucuTotal.toLocaleString('es-MX')} MXN
                </div>
                <p className="text-xs text-emerald-800">
                  Precio justo garantizado: ${metrics.fairPrice} MXN por unidad sin intermediación predatoria.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#032517] text-white">
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                  Ganancia Directa Recuperada
                </div>
                <div className="text-2xl font-black text-white mb-1">
                  +${metrics.addedValueToProducer.toLocaleString('es-MX')} MXN
                </div>
                <p className="text-xs text-stone-300">
                  Brecha de explotación superada: <strong>{metrics.gapPercent}%</strong>. El pago va directo a la artesana, sin descuentos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TECH REBEL METHODOLOGY ALIGNMENT (ALBERTO CHAVES & BRANDON MENTORSHIP) */}
      <section className="py-16 md:py-24 border-b border-[#e5dfd5] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-12">
            <div className="text-xs font-bold text-[#a73918] uppercase tracking-wider mb-2">
              Alineación Metodológica · Tech Rebel World
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#032517] tracking-tight">
              "Builders should leave with products, not certificates"
            </h2>
            <p className="text-stone-600 mt-2 text-sm sm:text-base">
              Yucu no es un proyecto de laboratorio teórico. Sigue paso a paso el <strong>Tech Rebel Loop</strong> impulsado por Alberto Chaves y la asesoría técnica de Brandon en el ecosistema Stellar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-5 rounded-xl bg-[#fcfaf6] border border-stone-200">
              <div className="text-xs font-bold text-[#032517] mb-1">1. LEARN</div>
              <div className="text-sm font-semibold text-stone-900 mb-2">Fundamentos de Stellar</div>
              <p className="text-xs text-stone-600">
                Capacitación de estudiantes TecNM en Rust, Soroban y contratos inteligentes de micropago.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#fcfaf6] border border-stone-200">
              <div className="text-xs font-bold text-[#032517] mb-1">2. DISCOVER</div>
              <div className="text-sm font-semibold text-stone-900 mb-2">Dolor Real en Parcela</div>
              <p className="text-xs text-stone-600">
                79 entrevistas de campo demostrando la pérdida económica y la brecha del coyote.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#fcfaf6] border border-stone-200">
              <div className="text-xs font-bold text-[#032517] mb-1">3. PROTOTYPE</div>
              <div className="text-sm font-semibold text-stone-900 mb-2">Fricción Humana Cero</div>
              <p className="text-xs text-stone-600">
                PWA con botones de 112px, voz en Tu'un Savi y etiqueta QR física probada en campo.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-300">
              <div className="text-xs font-bold text-emerald-900 mb-1">4. BUILD (ACTUAL)</div>
              <div className="text-sm font-semibold text-emerald-950 mb-2">Escrow Trustless Work</div>
              <p className="text-xs text-emerald-800">
                Integración de SDK Soroban y puesta en marcha en Stellar Testnet con Alberto y Brandon.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#fcfaf6] border border-stone-200">
              <div className="text-xs font-bold text-[#032517] mb-1">5. SCALE</div>
              <div className="text-sm font-semibold text-stone-900 mb-2">Grants & Expansión</div>
              <p className="text-xs text-stone-600">
                Stellar Community Fund, Open Source Grants y despliegue del piloto en El Salvador y Oaxaca.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. LIVE SHOWCASE & DIRECT DISPATCH */}
      <section className="py-16 md:py-20 bg-[#fcfaf6] border-b border-[#e5dfd5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-xs font-bold text-[#a73918] uppercase tracking-wider mb-1">
                Lotes Certificados en Tiempo Real
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#032517]">
                Muestras Validadas en la Mixteca Alta
              </h2>
            </div>
            <button
              onClick={() => onNavigateScreen('vitrina_productos')}
              className="text-xs sm:text-sm font-bold text-[#032517] hover:text-[#a73918] flex items-center gap-1.5 transition-colors"
            >
              <span>Ver Catálogo Completo B2B</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lots.slice(0, 3).map((lot) => (
              <div
                key={lot.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#ded7c9] shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden bg-stone-100">
                  <img
                    src={lot.imageUrl}
                    alt={lot.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-[#032517]/90 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">
                    Folio #{lot.code}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-[#a73918] font-bold mb-1">{lot.productType}</div>
                    <h3 className="text-base font-bold text-[#032517] mb-1.5 line-clamp-1">{lot.title}</h3>
                    <p className="text-xs text-stone-600 line-clamp-2 mb-4">{lot.producerStory || lot.variety}</p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">
                      ${lot.priceUsd ? lot.priceUsd * 20 : 185} MXN <span className="text-[10px] font-normal text-stone-500">/ unidad</span>
                    </span>
                    <button
                      onClick={() => {
                        if (onSelectLot) onSelectLot(lot);
                        onNavigateScreen('pasaporte_digital');
                      }}
                      className="bg-[#ebe6dc] hover:bg-[#ded7c9] text-[#032517] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>Ver Pasaporte</span>
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION & FOOTER */}
      <footer className="bg-[#032517] text-white pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-[#c7ebd4] tracking-tight mb-4">
              ¿Listo para ver Yucu Protocol en acción?
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-8">
              Explora la Progressive Web App en vivo, regístrate como productor, o realiza una simulación de compra con el Smart Escrow en Soroban.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigateScreen('menu_principal')}
                className="bg-[#c7ebd4] text-[#002b18] hover:bg-emerald-300 px-6 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">smartphone</span>
                <span>Lanzar PWA Móvil</span>
              </button>

              <button
                onClick={() => onNavigateScreen('vitrina_productos')}
                className="bg-[#002b18] hover:bg-[#0c3924] text-white border border-emerald-800 px-6 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">local_mall</span>
                <span>Explorar Vitrina B2B</span>
              </button>

              {onOpenProtocolModal && (
                <button
                  onClick={onOpenProtocolModal}
                  className="bg-transparent hover:bg-white/10 text-stone-300 border border-stone-600 px-5 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">dns</span>
                  <span>Consola de Infraestructura</span>
                </button>
              )}
            </div>
          </div>

          <div className="pt-8 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
            <div>
              © 2026 Yucu Protocol · Desarrollado por TecNM Campus Tlaxiaco, Oaxaca. Código Abierto bajo Licencia MIT.
            </div>
            <div className="flex items-center gap-4 text-stone-300">
              <a href="https://techrebel.world" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300">
                Tech Rebel
              </a>
              <span>·</span>
              <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300">
                Stellar Network
              </a>
              <span>·</span>
              <a href="https://trustlesswork.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300">
                Trustless Work
              </a>
              <span>·</span>
              <a href="https://github.com/Open-Hub-Tec/yucu" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300">
                GitHub Repo
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
