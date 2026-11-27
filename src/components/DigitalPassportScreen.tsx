import React, { useState } from 'react';
import { AppLanguage, DigitalPassportLot, ScreenView } from '../types';
import { PROTOCOL_FEES } from '../config/protocolFees';
import { DemoBadge } from './DemoBadge';
import { ExplicacionSello } from './accesibilidad/ExplicacionSello';

interface DigitalPassportScreenProps {
  lot: DigitalPassportLot;
  onNavigateScreen: (screen: ScreenView) => void;
  onOpenDictamen: (lot: DigitalPassportLot) => void;
  onOpenQrTag?: (lot: DigitalPassportLot) => void;
  onOpenLotsModal?: () => void;
  onDirectMessageProducer: (producerName: string, productTitle?: string) => void;
  onAddToCart: (item: {
    id: string;
    title: string;
    price: number;
    artisanName: string;
    location: string;
    imageUrl: string;
    quantity: number;
    unit: string;
  }) => void;
  onToggleVisibility?: (lotId: string, visible: boolean) => void;
  elderMode?: boolean;
  appLanguage?: AppLanguage;
  initialViewMode?: 'productor' | 'comprador';
}

// Smart Terminology Resolver so products like Mole, Textiles, Mezcal or Chapulines aren't called "cosechas"
function getProductTerminology(title: string, productType: string) {
  const combined = `${title || ''} ${productType || ''}`.toLowerCase();

  // 1. Moles, salsas, pastas, chocolate elaborado, tlayudas, pan
  const isGastronomiaElaborada =
    combined.includes('mole') ||
    combined.includes('coloradito') ||
    combined.includes('chichilo') ||
    combined.includes('pipian') ||
    combined.includes('pipián') ||
    combined.includes('adobo') ||
    combined.includes('chocolate') ||
    combined.includes('pasta') ||
    combined.includes('tlayuda') ||
    combined.includes('totopo') ||
    combined.includes('tejate') ||
    combined.includes('pan') ||
    combined.includes('queso') ||
    combined.includes('quesillo');

  // 2. Artesanías, textiles, telar, sombreros, barro, alebrijes
  const isArtesania =
    combined.includes('textil') ||
    combined.includes('rebozo') ||
    combined.includes('telar') ||
    combined.includes('sombrero') ||
    combined.includes('palma') ||
    combined.includes('artesan') ||
    combined.includes('barro') ||
    combined.includes('alebrije') ||
    combined.includes('huipil');

  // 3. Destilados y fermentados tradicionales (Mezcal, Pulque, Aguamiel)
  const isBebida =
    combined.includes('mezcal') ||
    combined.includes('pulque') ||
    combined.includes('aguamiel') ||
    combined.includes('tepache') ||
    combined.includes('destilado');

  // 4. Insectos de milpa (Chapulines, chicatanas, gusanos)
  const isInsectos =
    combined.includes('chapul') ||
    combined.includes('chicatana') ||
    combined.includes('gusano') ||
    combined.includes('chinicuil');

  if (isGastronomiaElaborada) {
    const isMole = combined.includes('mole') || combined.includes('coloradito');
    const isChoc = combined.includes('chocolate');
    return {
      noun: isMole ? 'elaboración de mole' : isChoc ? 'molienda de chocolate' : 'elaboración tradicional',
      tabLabel: isMole ? 'Mi Mole (Productor)' : isChoc ? 'Mi Chocolate (Productor)' : 'Mi Elaboración (Productor)',
      bannerTitle: isMole
        ? '¡Tu elaboración de mole ya está registrada y protegida!'
        : isChoc
        ? '¡Tu chocolate artesanal ya está registrado y protegido!'
        : '¡Tu elaboración tradicional ya está registrada y protegida!',
      bannerSubtext: 'Nadie puede copiar tu receta ni tu origen. Tu lote cuenta con respaldo comunitario.',
      quantityLabel: isMole ? '1. Cantidad de Pasta / Mole' : isChoc ? '1. Cantidad de Chocolate' : '1. Cantidad Elaborada',
      quantityUnitDesc: isMole ? 'Pasta lista para entrega o envasado' : 'Listo para entrega o empaque',
      totalValueLabel: isMole ? '3. Valor Total de tu Elaboración' : '3. Valor Total de tu Lote',
      nextActionQuestion: isMole
        ? '¿Qué deseas hacer ahora con tu elaboración de mole?'
        : '¿Qué deseas hacer ahora con tu elaboración?',
      tagLabel: 'Ver e Imprimir mi Etiqueta QR',
      tagSubtext: isMole
        ? 'Para colocar al frasco, cazuela, cubeta o empaque antes de entregar'
        : 'Para colocar a la bolsa, paquete o canasto antes de entregar',
      shareGreeting: `Hola, le comparto la ficha de demostración de mi elaboración tradicional de "${title}" (Lote #${productType}) con Sello de Calidad respaldado por el TecNM Tlaxiaco.`,
      timelineLabel: 'Bitácora de Ingredientes, Tueste y Molienda',
      registerAnother: 'Registrar Otra Elaboración o Producto',
      buyerBubble: 'Aquí tienes la ficha transparente de esta elaboración gastronómica tradicional de Oaxaca validada por la red comunitaria.',
      producerRole: 'Cocinera / Productora Tradicional'
    };
  }

  // 2. Tenates y Cestería Tradicional
  const isTenate =
    combined.includes('tenate') ||
    combined.includes('tanate') ||
    (combined.includes('canasto') && combined.includes('palma'));

  if (isTenate) {
    return {
      noun: 'tenate de palma',
      tabLabel: 'Mi Tenate (Artesano)',
      bannerTitle: '¡Tu tenate de palma ya está registrado y protegido!',
      bannerSubtext: 'Pieza de cestería ancestral tejida a mano con palma dulce y amparada contra intermediarios.',
      quantityLabel: '1. Piezas de Tenate Elaboradas',
      quantityUnitDesc: 'Tenates terminados listos para entrega',
      totalValueLabel: '3. Valor Total de tus Tenates',
      nextActionQuestion: '¿Qué deseas hacer ahora con tu tenate de palma?',
      tagLabel: 'Ver e Imprimir Etiqueta de Autenticidad',
      tagSubtext: 'Para atar con fibra de palma al tenate antes de entregar',
      shareGreeting: `Hola, le comparto la ficha de demostración de mi tenate ceremonial de palma dulce "${title}" con Sello de Autenticidad del TecNM Tlaxiaco.`,
      timelineLabel: 'Bitácora de Corte de Palma, Tintes y Doble Nudo',
      registerAnother: 'Registrar Otro Tenate o Artesanía',
      buyerBubble: 'Aquí tienes la ficha transparente de este tenate tradicional mixteco tejido a mano con palma dulce y tintes naturales.',
      producerRole: 'Maestra / Maestro Tejedor de Palma'
    };
  }

  if (isArtesania) {
    return {
      noun: 'pieza artesanal',
      tabLabel: 'Mi Artesanía (Artesano)',
      bannerTitle: '¡Tu pieza artesanal ya está registrada y protegida!',
      bannerSubtext: 'Tu trabajo hecho a mano está amparado contra plagios e intermediarios abusivos.',
      quantityLabel: '1. Piezas Elaboradas',
      quantityUnitDesc: 'Piezas únicas listas para venta',
      totalValueLabel: '3. Valor Total de tus Piezas',
      nextActionQuestion: '¿Qué deseas hacer ahora con tu pieza artesanal?',
      tagLabel: 'Ver e Imprimir Etiqueta de Autenticidad',
      tagSubtext: 'Para atar o coser con hilo a la prenda, sombrero o artesanía',
      shareGreeting: `Hola, le comparto la ficha de demostración de mi artesanía "${title}" con Sello de Autenticidad respaldado por el TecNM Tlaxiaco.`,
      timelineLabel: 'Bitácora de Telar, Fibras y Acabados',
      registerAnother: 'Registrar Otra Artesanía o Creación',
      buyerBubble: 'Aquí tienes la ficha transparente de esta pieza artesanal única hecha a mano en la Mixteca Alta.',
      producerRole: 'Maestra / Maestro Artesano'
    };
  }

  if (isBebida) {
    return {
      noun: 'bebida tradicional',
      tabLabel: 'Mi Producción (Productor)',
      bannerTitle: '¡Tu bebida tradicional ya está registrada y protegida!',
      bannerSubtext: 'Origen auténtico de tinacal o palenque avalado por la red comunitaria.',
      quantityLabel: '1. Volumen / Litros Preparados',
      quantityUnitDesc: 'Listo para envasado o distribución',
      totalValueLabel: '3. Valor Total de tu Producción',
      nextActionQuestion: '¿Qué deseas hacer ahora con tu producción?',
      tagLabel: 'Ver e Imprimir mi Etiqueta QR',
      tagSubtext: 'Para colocar a la garrafa, botella o barrica antes de entregar',
      shareGreeting: `Hola, le comparto la ficha de demostración de mi producción de "${title}" con Sello de Autenticidad del TecNM Tlaxiaco.`,
      timelineLabel: 'Bitácora de Maguey, Fermentación y Destilación',
      registerAnother: 'Registrar Otra Bebida o Lote',
      buyerBubble: 'Aquí tienes la ficha transparente de esta bebida ancestral elaborada con métodos sustentables.',
      producerRole: 'Maestro Palenquero / Tlachiquero'
    };
  }

  if (isInsectos) {
    return {
      noun: 'recolección de milpa',
      tabLabel: 'Mi Recolección (Productor)',
      bannerTitle: '¡Tu recolección de milpa ya está registrada y protegida!',
      bannerSubtext: 'Chapulines limpios y tostados al comal de barro con sal marina, ajo y limón.',
      quantityLabel: '1. Cantidad Tostada y Limpia',
      quantityUnitDesc: 'Listo en canasto o medidas de entrega',
      totalValueLabel: '3. Valor Total de tu Recolección',
      nextActionQuestion: '¿Qué deseas hacer ahora con tu recolección?',
      tagLabel: 'Ver e Imprimir Etiqueta QR',
      tagSubtext: 'Para colocar al canasto, frasco o bolsa antes de entregar',
      shareGreeting: `Hola, le comparto la ficha de demostración de mi recolección tradicional de "${title}" con Sello de Calidad del TecNM Tlaxiaco.`,
      timelineLabel: 'Bitácora de Milpa, Lavado y Comal de Barro',
      registerAnother: 'Registrar Otra Recolección o Producto',
      buyerBubble: 'Aquí tienes la ficha transparente de esta recolección silvestre tradicional de Oaxaca tostada al comal.',
      producerRole: 'Recolectora / Productor de Milpa'
    };
  }

  // Por defecto agrícola (Café, Maíz, Miel, Jitomate, Hortalizas, etc.)
  return {
    noun: 'cosecha',
    tabLabel: 'Mi Cosecha (Productor)',
    bannerTitle: '¡Tu cosecha ya está registrada y protegida!',
    bannerSubtext: 'Nadie puede copiar tu nombre ni regatear tu origen. Tu lote cuenta con respaldo comunitario.',
    quantityLabel: '1. Cantidad de tu Cosecha',
    quantityUnitDesc: 'Listo para entrega o acopio',
    totalValueLabel: '3. Valor Total de tu Cosecha',
    nextActionQuestion: '¿Qué deseas hacer ahora con tu cosecha?',
    tagLabel: 'Ver e Imprimir mi Etiqueta QR Física',
    tagSubtext: 'Para colgar al costal, canasto o bolsa antes de entregar',
    shareGreeting: `Hola, le comparto la ficha de demostración de mi cosecha "${title}" con Sello de Calidad respaldado por el TecNM Tlaxiaco.`,
    timelineLabel: 'Bitácora de Parcela y Cosecha',
    registerAnother: 'Registrar Otra Cosecha o Producto',
    buyerBubble: 'Aquí tienes la ficha transparente de esta cosecha validada en la Mixteca Alta por la red comunitaria.',
    producerRole: 'Productor Comunitario'
  };
}

export const DigitalPassportScreen: React.FC<DigitalPassportScreenProps> = ({
  lot,
  onNavigateScreen,
  onOpenDictamen,
  onOpenQrTag,
  onOpenLotsModal,
  onDirectMessageProducer,
  onAddToCart,
  onToggleVisibility,
  elderMode = false,
  appLanguage = 'es',
  initialViewMode = 'productor'
}) => {
  const isMixteco = appLanguage === 'mix';

  // Toggle between Campesino/Producer Mode and Buyer View
  const [viewMode, setViewMode] = useState<'productor' | 'comprador'>(initialViewMode);
  // Collapsible for technical data (NMX, NOM, Humedad, Soroban) - closed by default to avoid cognitive overload
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState<boolean>(false);
  const [visibilityToast, setVisibilityToast] = useState<string | null>(null);

  const term = getProductTerminology(lot.title, lot.productType);
  const totalEstimatedValue = lot.volumeKg * lot.pricePerKg;

  // Soberanía y Visibilidad Informada
  const isPubliclyVisible = lot.informedConsent ? lot.informedConsent.isPubliclyVisible !== false : true;
  const visibilityLevel = lot.informedConsent?.visibilityLevel || 'nombre_completo';

  const effectiveProducerName = !isPubliclyVisible
    ? 'Identidad en Resguardo Privado (A petición del artesano)'
    : visibilityLevel === 'cooperativa'
    ? lot.informedConsent?.cooperativeName || lot.producerName
    : visibilityLevel === 'nombre_comunidad'
    ? lot.informedConsent?.customDisplayName || `${lot.producerName.split(' ')[0]} · ${lot.location.split(',')[0]}`
    : lot.producerName;

  const visibilityBadge =
    visibilityLevel === 'cooperativa'
      ? { label: 'Resguardo Colectivo', icon: 'groups', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' }
      : visibilityLevel === 'nombre_comunidad'
      ? { label: 'Identidad Comunitaria Protegida', icon: 'location_on', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' }
      : { label: 'Artesano(a) Autor(a)', icon: 'badge', color: 'bg-amber-100 text-amber-900 border-amber-300' };

  const shareMessage = `Hola, le comparto la ficha de demostración de ${term.noun} "${lot.title}" (Lote #${lot.code}) con Sello de Calidad respaldado por el TecNM Tlaxiaco. Cantidad: ${lot.volumeKg} kg a $${lot.pricePerKg.toFixed(2)} MXN/kg.`;
  const shareUrl = `${window.location.origin}/#pasaporte-${lot.code}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareMessage} Ver ficha completa aquí: ${shareUrl}`)}`;

  const buyerLotWhatsappOrderMsg = `¡Hola ${effectiveProducerName}! Vi su lote verificado #${lot.code} "${lot.title}" en el Pasaporte Digital Yucu ($${lot.pricePerKg.toFixed(2)} MXN/kg). Me gustaría adquirirlo directamente y acordar el punto de entrega en la Mixteca o el envío por paquetería.`;
  const buyerLotWhatsappOrderUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(buyerLotWhatsappOrderMsg)}`;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(`${shareMessage}\n${shareUrl}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleBuyLot = () => {
    onAddToCart({
      id: lot.id,
      title: `${lot.title} (Lote Verificado)`,
      price: lot.pricePerKg * 10,
      artisanName: lot.producerName,
      location: lot.location,
      imageUrl: lot.imageUrl,
      quantity: 1,
      unit: `${lot.volumeKg > 10 ? '10 kg' : 'Pieza / Unidad'}`
    });
  };

  return (
    <main className="w-full max-w-lg mx-auto px-4 py-3 flex flex-col gap-4 pb-32">
      {/* Top Navigation & Role Toggle */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigateScreen('menu_principal')}
            className={`inline-flex items-center gap-1.5 font-bold text-[#032517] hover:text-[#a73918] bg-white rounded-full border border-[#c1c8c2]/50 shadow-2xs transition-all active:scale-95 cursor-pointer ${
              elderMode ? 'px-4 py-2 text-[15px] min-h-[46px]' : 'px-3 py-1.5 text-[13px]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>{isMixteco ? "Nda'a Menú" : 'Volver al Menú'}</span>
          </button>

          {/* Quick Folio Pill */}
          <span className="text-[12px] font-extrabold text-[#032517] bg-[#c7ebd4] px-3 py-1 rounded-full border border-emerald-300 shadow-2xs flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-emerald-800">verified</span>
            <span>LOTE #{lot.code}</span>
          </span>
        </div>

        {/* View Mode Toggle: Campesino/Creador vs Comprador */}
        <div className="bg-[#f0eee8] p-1 rounded-xl flex items-center border border-[#c1c8c2]/40 shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode('productor')}
            className={`flex-1 py-2 px-3 rounded-lg text-center font-bold text-[13px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              viewMode === 'productor'
                ? 'bg-white text-[#032517] shadow-xs'
                : 'text-[#727973] hover:text-[#1c1c18]'
            }`}
          >
            <span className="text-[16px]">👨‍🌾</span>
            <span>{isMixteco ? 'Mi Producto (Productor)' : term.tabLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('comprador')}
            className={`flex-1 py-2 px-3 rounded-lg text-center font-bold text-[13px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              viewMode === 'comprador'
                ? 'bg-white text-[#a73918] shadow-xs'
                : 'text-[#727973] hover:text-[#1c1c18]'
            }`}
          >
            <span className="text-[16px]">🛒</span>
            <span>{isMixteco ? 'Ver como Comprador' : 'Ver como Comprador'}</span>
          </button>
        </div>
      </div>

      {/* El sello explicado: no es un trámite ni un cobro (W53 #182) */}
      <ExplicacionSello />

      {/* ============================================================== */}
      {/* VISTA DEL PRODUCTOR / ARTESANO / CAMPESINO (CERO FRICCIÓN)      */}
      {/* ============================================================== */}
      {viewMode === 'productor' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* Tarjeta Verde de Éxito y Respaldo Comunitario (DINÁMICA: Mole, Textil, Cosecha, etc.) */}
          <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50/40 rounded-2xl p-4 border-2 border-emerald-400 shadow-xs flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#032517] text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[28px] text-amber-300">
                task_alt
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Registro Exitoso
                </span>
                <span className="text-[11px] text-[#727973] font-medium">
                  TecNM Tlaxiaco
                </span>
              </div>
              <h2 className="text-[17px] font-black text-[#032517] mt-1 leading-snug">
                {term.bannerTitle}
              </h2>
              <p className="text-[13px] text-[#424843] mt-0.5 leading-relaxed">
                {term.bannerSubtext}
              </p>
            </div>
          </div>

          {/* Panel Soberano de Visibilidad y Consentimiento (LFPDPPP & Ley 2022) */}
          <div className="flex flex-col gap-2">
            {!isPubliclyVisible ? (
              <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-3.5 shadow-xs flex flex-col gap-2 text-[#3b0900]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-700 text-[20px]">visibility_off</span>
                    <span className="font-black text-[13px] text-amber-950">Visibilidad Pública Pausada por Ti</span>
                  </div>
                  <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-extrabold">
                    Derecho al Retiro Activo
                  </span>
                </div>
                <p className="text-[12px] text-amber-900 leading-snug">
                  Tus datos personales están en resguardo privado conforme a tu soberanía.
                  <strong> El sello criptográfico en Stellar (#{lot.nomCompliance?.stellarTxLedger || '52,491,802'}) continúa 100% verificado</strong>, respaldando que tu pieza es auténtica y de origen legítimo.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onToggleVisibility?.(lot.id, true);
                      setVisibilityToast('Visibilidad pública reactivada con tu consentimiento.');
                    }}
                    className="bg-[#032517] hover:bg-[#1b3b2b] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[15px] text-emerald-300">visibility</span>
                    <span>Reactivar visibilidad pública</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsComparisonModalOpen(true)}
                    className="text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 text-[11px] font-bold px-2.5 py-1.5 rounded-xl cursor-pointer"
                  >
                    Ver Marco Legal
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-3 border border-[#c1c8c2]/50 shadow-2xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${visibilityBadge.color}`}>
                    <span className="material-symbols-outlined text-[14px]">{visibilityBadge.icon}</span>
                    <span>{visibilityBadge.label}</span>
                  </span>
                  <span className="text-[11px] text-[#424843] hidden sm:inline font-medium">
                    Consentimiento libre otorgado
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onToggleVisibility?.(lot.id, false);
                      setVisibilityToast('Has pausado tu visibilidad pública ("Dejar de mostrarme"). El sello en Stellar sigue protegiendo tu pieza.');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-950 rounded-xl text-[11px] font-bold cursor-pointer transition-all active:scale-95 border border-stone-300"
                    title="Pausar o retirar tu nombre de la vitrina pública"
                  >
                    <span className="material-symbols-outlined text-[15px] text-amber-800">visibility_off</span>
                    <span>Dejar de mostrarme</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsComparisonModalOpen(true)}
                    className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex items-center justify-center cursor-pointer border border-emerald-200"
                    title="Entender la diferencia entre investigación en bóveda y ficha pública"
                  >
                    <span className="material-symbols-outlined text-[16px]">balance</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Toast Notification */}
          {visibilityToast && (
            <div className="text-[12px] font-bold text-[#032517] bg-[#e7f3ec] border border-[#a1d1b5] px-3.5 py-2 rounded-xl flex items-center justify-between shadow-xs animate-fadeIn">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-800">info</span>
                <span>{visibilityToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setVisibilityToast(null)}
                className="text-[#424843] hover:text-black text-[14px] font-bold ml-2 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {/* Tarjeta Visual del Producto */}
          <div className="bg-white rounded-2xl overflow-hidden border border-[#c1c8c2]/50 shadow-xs">
            <div className="relative w-full h-48 overflow-hidden bg-[#f0eee8]">
              <img
                src={lot.imageUrl}
                alt={lot.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] uppercase tracking-wider text-amber-200 font-extrabold bg-[#032517]/90 px-2 py-0.5 rounded-md inline-block mb-1">
                  Folio: {lot.code}
                </span>
                <h1 className="text-[19px] font-black text-white leading-tight drop-shadow-xs">
                  {lot.title}
                </h1>
                <p className="text-[12px] text-white/90 flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px] text-amber-300">
                    {!isPubliclyVisible ? 'lock' : 'pin_drop'}
                  </span>
                  <span>{effectiveProducerName} · {isPubliclyVisible ? lot.location : 'Mixteca Oaxaqueña'}</span>
                </p>
              </div>
            </div>

            {/* Los 4 Números Sagrados del Productor (Legibles a pleno sol) */}
            <div className="p-3.5 bg-[#fcf9f3] border-b border-[#f0eee8] grid grid-cols-2 gap-2 text-[12px]">
              <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-[#727973] block truncate" title={term.quantityLabel}>
                  {term.quantityLabel}
                </span>
                <span className="text-[20px] font-black text-[#032517] block leading-tight">
                  {lot.volumeKg} <span className="text-[12px] font-bold text-[#424843]">kg / u</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block truncate">
                  {term.quantityUnitDesc}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-[#727973] block">
                  2. Precio Sugerido Justo
                </span>
                <span className="text-[20px] font-black text-[#a73918] block leading-tight">
                  ${lot.pricePerKg.toFixed(2)}{' '}
                  <span className="text-[11px] font-bold text-[#424843]">/ kg</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block">
                  Sin coyotes
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border-2 border-emerald-300/80 shadow-2xs col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-extrabold text-[#727973] block">
                    {term.totalValueLabel}
                  </span>
                  <span className="text-[24px] font-black text-[#032517] leading-none">
                    ${totalEstimatedValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                    <span className="text-[13px] font-bold text-[#424843]">MXN</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-semibold block mt-0.5">
                    Monto total estimado que debes cobrar directamente
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">payments</span>
                </div>
              </div>
            </div>

            {/* SECCIÓN PRINCIPAL: ACCIONES CLAVE */}
            <div className="p-4 flex flex-col gap-3">
              <span className="text-[11px] font-extrabold text-[#727973] uppercase tracking-wider block">
                {term.nextActionQuestion}
              </span>

              {/* Botón 1: Ver e Imprimir Etiqueta QR Física */}
              {onOpenQrTag && (
                <button
                  type="button"
                  onClick={() => onOpenQrTag(lot)}
                  className={`w-full bg-[#032517] hover:bg-[#063f27] active:scale-[0.98] transition-all text-white rounded-2xl p-3.5 flex items-center justify-between text-left shadow-md cursor-pointer border border-emerald-600/30 ${
                    elderMode ? 'min-h-[64px]' : 'min-h-[56px]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-400 text-[#032517] flex items-center justify-center shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-[26px]">qr_code_2</span>
                    </div>
                    <div>
                      <h4 className="text-[15px] font-black text-white leading-tight flex items-center gap-1.5">
                        <span>{term.tagLabel}</span>
                        <span className="bg-amber-300 text-[#032517] text-[9px] font-black px-1.5 py-0.2 rounded">
                          Física
                        </span>
                      </h4>
                      <p className="text-[12px] text-emerald-200 mt-0.5">
                        {term.tagSubtext}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-amber-300 text-[22px]">
                    arrow_forward
                  </span>
                </button>
              )}

              {/* Botón 2: Compartir por WhatsApp con Compradores */}
              <div className="flex flex-col gap-1.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] transition-all text-white rounded-2xl p-3.5 flex items-center justify-between text-left shadow-sm cursor-pointer ${
                    elderMode ? 'min-h-[64px]' : 'min-h-[56px]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[26px]">chat</span>
                    </div>
                    <div>
                      <h4 className="text-[15px] font-black text-white leading-tight">
                        Compartir por WhatsApp con Clientes
                      </h4>
                      <p className="text-[12px] text-white/90 mt-0.5">
                        Manda la foto y precio sin intermediarios a tus compradores
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-white text-[22px]">
                    send
                  </span>
                </a>

                {/* Botón secundario: Copiar enlace */}
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="w-full py-2 px-3 rounded-xl bg-[#f0eee8] hover:bg-[#ebe8e2] text-[#424843] text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedLink ? 'check_circle' : 'content_copy'}
                  </span>
                  <span>
                    {copiedLink
                      ? '¡Enlace copiado! Listo para pegar en mensaje'
                      : 'Copiar enlace directo de este producto'}
                  </span>
                </button>
              </div>

              {/* Botón 3: Ver Dictamen de Demostración de Laboratorio (PDF) */}
              <button
                type="button"
                onClick={() => onOpenDictamen(lot)}
                className="w-full bg-white hover:bg-[#f6f3ed] active:scale-[0.98] transition-all text-[#032517] rounded-2xl p-3 flex items-center justify-between text-left shadow-2xs cursor-pointer border border-[#c1c8c2]/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">fact_check</span>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-[#032517] leading-tight">
                      Ver Dictamen de Demostración de Calidad (PDF)
                    </h4>
                    <p className="text-[11px] text-[#727973]">
                      Ficha de demostración de origen y sanidad para restaurantes o clientes
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#727973] text-[18px]">
                  chevron_right
                </span>
              </button>

              {/* ACORDEÓN DESPLEGABLE: DATOS TÉCNICOS Y NORMAS (OPCIONAL) */}
              <div className="pt-2 border-t border-[#f0eee8]">
                <button
                  type="button"
                  onClick={() => setShowTechnicalDetails((prev) => !prev)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#f6f3ed] hover:bg-[#ebe8e2] text-[#032517] font-bold text-[12px] flex items-center justify-between transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#a73918]">
                      science
                    </span>
                    <span>
                      {showTechnicalDetails
                        ? 'Ocultar datos técnicos y de laboratorio'
                        : 'Ver datos técnicos de laboratorio y trazabilidad (Opcional)'}
                    </span>
                  </span>
                  <span className="material-symbols-outlined text-[20px]">
                    {showTechnicalDetails ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {showTechnicalDetails && (
                  <div className="mt-2.5 p-3 rounded-xl bg-white border border-gray-200/80 space-y-3 animate-fade-in text-[12px]">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="font-extrabold text-[#032517]">
                        {lot.nomCompliance?.standard || 'Normatividad Comunitaria'}
                      </span>
                      <span className="bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        Aprobado 100%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-[#fcf9f3] p-2 rounded-lg">
                        <span className="text-[10px] text-[#727973] block uppercase font-bold">
                          Condición / Humedad
                        </span>
                        <strong className="text-[#032517] text-[13px]">
                          {lot.nomCompliance?.humidity || 'Óptimo'}
                        </strong>
                      </div>
                      <div className="bg-[#fcf9f3] p-2 rounded-lg">
                        <span className="text-[10px] text-[#727973] block uppercase font-bold">
                          Calidad de Selección
                        </span>
                        <strong className="text-[#032517] text-[13px]">
                          {lot.nomCompliance?.defectClassification || 'Grado Gourmet'}
                        </strong>
                      </div>
                      <div className="bg-[#fcf9f3] p-2 rounded-lg">
                        <span className="text-[10px] text-[#727973] block uppercase font-bold">
                          Región de Origen
                        </span>
                        <strong className="text-[#032517] text-[13px]">
                          {lot.altitude || 'Oaxaca'}
                        </strong>
                      </div>
                      <div className="bg-[#fcf9f3] p-2 rounded-lg">
                        <span className="text-[10px] text-[#727973] block uppercase font-bold">
                          Pureza de Origen
                        </span>
                        <strong className="text-[#032517] text-[13px] truncate block" title={lot.nomCompliance?.botanicalPurity || lot.variety}>
                          {lot.nomCompliance?.botanicalPurity || lot.variety || '100% Auténtico'}
                        </strong>
                      </div>
                    </div>

                    {/* Explicación de la Cláusula de Ganancia en Reventa */}
                    <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200 text-purple-950 text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-purple-900">
                        <span>💎</span>
                        <span>Garantía de Ganancia por Reventa ({PROTOCOL_FEES.artisanResaleRoyaltyPct}%)</span>
                      </div>
                      <p className="text-purple-900/90 leading-relaxed text-[11px]">
                        Si una tienda, restaurante o distribuidor revende este lote con mayor margen en la ciudad,
                        un <strong>{PROTOCOL_FEES.artisanResaleRoyaltyPct}% de cada reventa secundaria</strong> te corresponde a ti como productor
                        y {PROTOCOL_FEES.resaleTequioPct}% al Fondo Comunal de la Mixteca.
                      </p>
                    </div>

                    {/* Línea de tiempo adaptada al producto */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold text-[#727973] block">
                        {term.timelineLabel}
                      </span>
                      {lot.timeline.map((event, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px]">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: event.color }}
                          ></span>
                          <span className="font-bold text-[#1c1c18]">{event.title}</span>
                          <span className="text-[#727973] text-[10px]">· {event.dateAndLocation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Opciones Adicionales de Navegación */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onNavigateScreen('catalogo_producto')}
              className="w-full py-3 px-4 bg-white hover:bg-[#f6f3ed] active:scale-[0.98] transition-all text-[#032517] rounded-full text-[14px] font-bold border border-[#c1c8c2]/50 shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>{term.registerAnother}</span>
            </button>

            {onOpenLotsModal && (
              <button
                type="button"
                onClick={onOpenLotsModal}
                className="w-full py-2.5 px-4 bg-transparent hover:bg-[#f0eee8] text-[#727973] rounded-full text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                <span>Ver todos Mis Productos Registrados</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA DEL COMPRADOR (MERCADO / VITRINA)                         */}
      {/* ============================================================== */}
      {viewMode === 'comprador' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* Conversational Assistant Bubble for Buyers */}
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#032517] flex items-center justify-center text-white shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
            </div>
            <div className="bg-white text-[#1c1c18] rounded-2xl rounded-tl-xs p-4 max-w-[90%] shadow-xs border border-[#c1c8c2]/40">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[13px] text-[#032517] font-bold">
                  Vitrina Directa · Sin Intermediarios
                </span>
                <span className="text-[11px] text-[#424843]">Garantía Yucu</span>
              </div>
              <p className="text-[13px] text-[#424843] leading-relaxed">
                {term.buyerBubble}
              </p>
            </div>
          </div>

          {/* Main Card */}
          <section className="bg-white rounded-2xl overflow-hidden border border-[#c1c8c2]/50 shadow-sm">
            <div className="relative w-full h-56 overflow-hidden bg-[#f0eee8]">
              <img
                src={lot.imageUrl}
                alt={lot.imageAlt || lot.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#032517]/90 via-black/20 to-black/30"></div>

              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 border border-[#c7ebd4] shadow-sm">
                <span
                  className="material-symbols-outlined text-[#032517] text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <span className="text-[12px] text-[#032517] font-bold">Pasaporte Digital Activo</span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[11px] uppercase tracking-wider text-[#c7ebd4] font-bold bg-[#1b3b2b]/90 px-2.5 py-0.5 rounded-full inline-block">
                  LOTE #{lot.code}
                </span>
                <h1 className="text-[22px] font-bold text-white mt-1 leading-tight tracking-tight">
                  {lot.title}
                </h1>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-4">
              {/* Producer Profile */}
              <div className="flex flex-col gap-2 pb-3 border-b border-[#f0eee8]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#ffdbd1] text-[#3b0900] flex items-center justify-center font-bold text-[16px] border-2 border-[#fe7952]">
                      {lot.producerInitials}
                    </div>
                    <div>
                      <span className="text-[11px] text-[#424843] font-medium block">
                        {term.producerRole}
                      </span>
                      <p className="text-[16px] text-[#1c1c18] font-bold leading-tight flex items-center gap-2">
                        <span>{effectiveProducerName}</span>
                      </p>
                      <p className="text-[13px] text-[#424843] flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[15px] text-[#a73918]">
                          {!isPubliclyVisible ? 'lock' : 'pin_drop'}
                        </span>
                        <span>{isPubliclyVisible ? lot.location : 'Mixteca Oaxaqueña'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#424843] block font-medium">Volumen</span>
                    <span className="text-[18px] text-[#032517] font-bold">{lot.volumeKg} kg</span>
                  </div>
                </div>

                {/* Badge de Soberanía y Consentimiento */}
                <div className="flex items-center justify-between pt-1">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${visibilityBadge.color}`}>
                    <span className="material-symbols-outlined text-[13px]">{visibilityBadge.icon}</span>
                    <span>{visibilityBadge.label}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsComparisonModalOpen(true)}
                    className="text-[#a73918] hover:text-[#6c1900] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">balance</span>
                    <span>Ver Modelo de Consentimiento</span>
                  </button>
                </div>
              </div>

              {/* Regulatory status */}
              <div className="bg-[#f6f3ed] rounded-xl p-3 border border-[#c1c8c2]/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#c7ebd4] text-[#002113] flex items-center justify-center shrink-0 shadow-2xs">
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      gavel
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[14px] font-bold text-[#032517]">
                        Estado: {lot.verifiedStatus}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-full bg-[#abcfb8] text-[#002113] text-[11px] font-bold">
                          {lot.nomCompliance?.immutableSealStatus || 'Con Evidencia'}
                        </span>
                        <DemoBadge detail="La certificación y el sello en Stellar son de demostración hasta conectar un validador humano y la red." />
                      </div>
                    </div>
                    <p className="text-[12px] text-[#424843] mt-0.5">
                      Evaluador: <strong className="text-[#1c1c18]">{lot.evaluatorOrg}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing & Purchase Area */}
              <div className="pt-2 border-t border-[#f0eee8] flex flex-col gap-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[12px] text-[#424843] block">
                      Precio de comercio justo
                    </span>
                    <span className="text-[26px] font-bold text-[#032517]">
                      ${lot.pricePerKg.toFixed(2)}{' '}
                      <span className="text-[14px] font-normal text-[#424843]">MXN / kg</span>
                    </span>
                  </div>
                  <span className="text-[12px] bg-[#c7ebd4] px-3 py-1 rounded-full text-[#002113] font-bold">
                    Garantía Directa
                  </span>
                </div>

                {/* Botón 1: WhatsApp Directo con el Productor (30 segundos) */}
                <a
                  href={buyerLotWhatsappOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[50px] w-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] transition-all text-white rounded-full text-[15px] flex items-center justify-center gap-2 shadow-sm font-black cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[22px]">chat</span>
                  <span>Pactar por WhatsApp con {effectiveProducerName.split(' ')[0]} (30 seg)</span>
                </a>

                {/* Botón 2: Añadir a la Bolsa de Compra Directa */}
                <button
                  type="button"
                  onClick={handleBuyLot}
                  className="min-h-[48px] w-full bg-[#a73918] hover:bg-[#6c1900] active:scale-[0.98] transition-all text-white rounded-full text-[15px] flex items-center justify-center gap-2 shadow-sm font-bold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                  Comprar este Lote Verificado (Bolsa)
                </button>

                {/* Botón 3: Mensaje directo interno */}
                <button
                  type="button"
                  onClick={() => onDirectMessageProducer(lot.producerName, lot.title)}
                  className="min-h-[44px] w-full border-2 border-[#032517] text-[#032517] hover:bg-[#c7ebd4]/20 active:scale-[0.98] transition-all rounded-full text-[14px] flex items-center justify-center gap-2 font-bold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">support_agent</span>
                  Coordinar por Chat Interno con {lot.producerName.split(' ')[0]}
                </button>

                {/* Deslinde Logístico Directo */}
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-300/80 text-[11.5px] text-amber-950 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[17px] text-amber-800 shrink-0 mt-0.5">
                    handshake
                  </span>
                  <div className="space-y-0.5 leading-snug">
                    <strong className="block font-bold text-amber-900">
                      Entrega y Pago 100% Directos:
                    </strong>
                    <span>
                      Yucu no cobra fletes ni comisiones de intermediario. Acuerdas la entrega en persona en la Mixteca o el envío comercial directamente con el productor.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateScreen('vitrina_productos')}
                  className="min-h-[42px] w-full bg-[#f6f3ed] hover:bg-[#ebe8e2] text-[#032517] active:scale-[0.98] transition-all rounded-full text-[13px] flex items-center justify-center gap-2 font-semibold cursor-pointer border border-[#c1c8c2]/50"
                >
                  <span className="material-symbols-outlined text-[18px]">storefront</span>
                  Explorar otros productos en la Vitrina
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Modal Comparativo y Marco Legal: Investigación vs Ficha de Venta con Consentimiento */}
      {isComparisonModalOpen && (
        <div
          onClick={() => setIsComparisonModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#fcf9f3] rounded-3xl overflow-hidden shadow-2xl border border-[#c1c8c2]/60 flex flex-col max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#032517] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-300 text-[24px]">
                  balance
                </span>
                <div>
                  <h3 className="text-[15px] font-extrabold leading-tight">
                    Modelo de Consentimiento y Soberanía Yucu
                  </h3>
                  <p className="text-[11px] text-[#c7ebd4] font-medium">
                    Cumplimiento con la Ley de Salvaguarda 2022 y LFPDPPP
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsComparisonModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all"
                aria-label="Cerrar modal"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-[#1c1c18] text-[12.5px] leading-relaxed">
              <div className="bg-[#fff8f0] p-3.5 rounded-2xl border border-[#fe7952]/40 text-[#3b0900]">
                <strong className="block text-[13px] font-black text-[#a73918] mb-1">
                  💡 La ley no prohíbe vender en línea; exige que el artesano decida qué se publica.
                </strong>
                <span>
                  Existe una diferencia fundamental entre la <em>investigación académica de campo</em> (con testimonios personales reservados) y la <em>ficha pública comercial de venta</em> con consentimiento previo, libre e informado.
                </span>
              </div>

              {/* Tabla Comparativa Esclarecedora */}
              <div className="overflow-hidden rounded-2xl border border-[#c1c8c2]/60 shadow-2xs">
                <table className="w-full text-left text-[11.5px] border-collapse">
                  <thead>
                    <tr className="bg-[#f0eee8] text-[#032517] font-black border-b border-[#c1c8c2]/60">
                      <th className="p-2.5 w-1/3">Criterio</th>
                      <th className="p-2.5 w-1/3 bg-amber-50/70 border-x border-[#c1c8c2]/50">
                        📁 Entrevistas de Investigación (.vault_privado)
                      </th>
                      <th className="p-2.5 w-1/3 bg-emerald-50/70">
                        🏷️ Ficha del Producto en Yucu
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c1c8c2]/40">
                    <tr>
                      <td className="p-2.5 font-bold text-[#032517]">¿Para qué se recogieron los datos?</td>
                      <td className="p-2.5 bg-amber-50/40 border-x border-[#c1c8c2]/30 text-stone-700">Para estudiar el problema, intermediación y costos.</td>
                      <td className="p-2.5 bg-emerald-50/40 font-semibold text-emerald-950">Para vender y generar ingresos justos.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#032517]">¿El artesano autorizó publicarlos?</td>
                      <td className="p-2.5 bg-amber-50/40 border-x border-[#c1c8c2]/30 text-stone-700">No hay registro de autorización pública masiva.</td>
                      <td className="p-2.5 bg-emerald-50/40 font-semibold text-emerald-950">Sí, se le pregunta y registra al registrar su pieza.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#032517]">¿Qué se expone?</td>
                      <td className="p-2.5 bg-amber-50/40 border-x border-[#c1c8c2]/30 text-stone-700">Nombre, edad, lengua, voz y opiniones personales.</td>
                      <td className="p-2.5 bg-emerald-50/40 font-semibold text-emerald-950">Lo que el artesano elija: nombre completo, pila o cooperativa.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#032517]">¿Es un problema legal?</td>
                      <td className="p-2.5 bg-amber-50/40 border-x border-[#c1c8c2]/30 text-amber-900 font-bold">Sí, si no hay consentimiento expreso.</td>
                      <td className="p-2.5 bg-emerald-50/40 font-bold text-emerald-900">No, con consentimiento informado y revocable.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Arquitectura Técnica: Zero-PII en Blockchain Stellar */}
              <div className="bg-[#f6f3ed] p-3.5 rounded-2xl border border-[#c1c8c2]/50 space-y-2">
                <div className="flex items-center gap-2 text-[#032517] font-black text-[13px]">
                  <span className="material-symbols-outlined text-emerald-800 text-[18px]">verified</span>
                  <span>Por qué Stellar solo guarda el Hash SHA-256</span>
                </div>
                <p className="text-[#424843]">
                  La blockchain no se puede borrar, mientras que la ley mexicana (LFPDPPP) otorga el <strong>derecho a retirar o modificar datos personales</strong>.
                </p>
                <ul className="space-y-1.5 list-disc pl-4 text-[#1c1c18]">
                  <li>
                    <strong>En Stellar solo va la huella digital criptográfica (hash SHA-256):</strong> nunca el nombre real ni la fotografía.
                  </li>
                  <li>
                    <strong>El código QR apunta a una ficha pública viva:</strong> que el artesano puede editar, pausar o quitar cuando lo decida.
                  </li>
                  <li>
                    <strong>El sello en Stellar sigue probando la autenticidad:</strong> de la pieza física sin atrapar indeleblemente los datos de la persona.
                  </li>
                  <li>
                    <strong>Botón "Dejar de mostrarme":</strong> el artesano o cooperativa puede retirarse de la vitrina en cualquier momento.
                  </li>
                  <li>
                    <strong>Deslinde Logístico Total:</strong> Yucu no gestiona fletes, paqueterías ni transporte físico. La entrega o retiro de la pieza es un acuerdo 100% directo y libre entre el comprador y el artesano en taller o parcela.
                  </li>
                </ul>
              </div>

              {/* El Caso de 2022 y la Ley */}
              <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 text-[#002113] space-y-1">
                <span className="block font-black text-[12px] text-emerald-900">
                  🛡️ Protección comunitaria frente a plagios (Caso 2022)
                </span>
                <p className="text-[11.5px] leading-relaxed text-[#1b3b2b]">
                  El caso de 2022, cuando marcas extranjeras copiaron huipiles y bordados mixtecos, ocurrió precisamente porque se utilizaron diseños y nombres de comunidades sin su consentimiento ni retribución. La Ley Federal de Protección del Patrimonio Cultural de los Pueblos Indígenas protege a los artesanos de esa explotación. <strong>Yucu es el modelo de cómo dar visibilidad con permiso soberano.</strong>
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#f0eee8] border-t border-[#c1c8c2]/50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsComparisonModalOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#032517] hover:bg-[#1b3b2b] text-white font-bold text-[13px] rounded-xl cursor-pointer transition-all shadow-xs"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
