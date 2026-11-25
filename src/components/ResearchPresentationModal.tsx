import React, { useState, useEffect } from 'react';

interface ResearchPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SlideData {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

export const ResearchPresentationModal: React.FC<ResearchPresentationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Keyboard navigation (Left / Right / Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadPptx = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsDownloading(true);
    setDownloadSuccess(false);

    const pptxFileName = 'Raiz_Protocol_Dossier_Econometrico_Mixteca.pptx';
    const githubFallbackUrl =
      'https://github.com/Open-Hub-Tec/yucu/raw/main/.investigacion_privada/Raiz_Protocol_Dossier_Econometrico_Mixteca.pptx';

    try {
      // 1. Intentar descarga mediante fetch y Blob (garantiza headers binarios exactos)
      const res = await fetch('/api/download/dossier-pptx');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const blob = await res.blob();

      const blobUrl = window.URL.createObjectURL(
        new Blob([blob], {
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        })
      );

      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.setAttribute('download', pptxFileName);
      tempLink.style.display = 'none';
      document.body.appendChild(tempLink);
      tempLink.click();

      setTimeout(() => {
        document.body.removeChild(tempLink);
        window.URL.revokeObjectURL(blobUrl);
      }, 500);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.warn('Fallo descarga directa Blob, ejecutando fallback seguro:', err);
      // 2. Si el iframe de AI Studio o el navegador bloquea fetch/blob, abrir ventana de descarga directa
      try {
        const link = document.createElement('a');
        link.href = `/api/download/dossier-pptx`;
        link.setAttribute('download', pptxFileName);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        window.open(githubFallbackUrl, '_blank');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const url = 'https://github.com/Open-Hub-Tec/yucu/blob/main/.investigacion_privada/Raiz_Protocol_Dossier_Econometrico_Mixteca.pptx';
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const slides: SlideData[] = [
    // SLIDE 1: PORTADA EJECUTIVA
    {
      id: 'portada',
      tag: 'DOSSIER EJECUTIVO TERRITORIAL',
      title: 'Validación Empírica & Econométrica en la Mixteca',
      subtitle: 'Evidencia territorial de campo, auditoría de fricción cognitiva y arquitectura de trazabilidad descentralizada',
      content: (
        <div className="flex flex-col gap-6">
          <div className="bg-[#032517] text-white p-6 sm:p-8 rounded-2xl border border-emerald-500/30 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/80 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-300">
                  TecNM Campus Tlaxiaco · Ingeniería en Sistemas & Gestión
                </span>
              </div>
              <span className="text-xs bg-emerald-950/80 text-emerald-200 border border-emerald-700/60 px-3 py-1 rounded-full font-mono font-semibold">
                Comunidades visitadas en campo
              </span>
            </div>

            <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-sans mb-6">
              El foso insustituible del Protocolo <strong className="text-white font-extrabold">Yucu</strong> no reside en código abstracto, sino en investigación de campo rigurosa en territorio, auditando el estrangulamiento de precios del intermediario (&ldquo;coyote&rdquo;) y las barreras cognitivas de los productores originarios.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
              <div className="bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-800/50">
                <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">15 + 3</div>
                <div className="text-xs text-emerald-200/90 mt-1 font-medium">Perfiles & Cooperativas</div>
              </div>
              <div className="bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-800/50">
                <div className="text-2xl sm:text-3xl font-black text-rose-300 font-mono">757%</div>
                <div className="text-xs text-emerald-200/90 mt-1 font-medium">Margen Máximo Intermediario</div>
              </div>
              <div className="bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-800/50">
                <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">98.6%</div>
                <div className="text-xs text-emerald-200/90 mt-1 font-medium">Éxito Registro por Voz</div>
              </div>
              <div className="bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-800/50">
                <div className="text-2xl sm:text-3xl font-black text-teal-300 font-mono">0 Horas</div>
                <div className="text-xs text-emerald-200/90 mt-1 font-medium">Custodia Legal de Dinero</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-stone-100 p-4 rounded-xl border border-stone-300 text-stone-700 text-xs sm:text-sm">
            <span className="flex items-center gap-2">
              <span className="text-base">📁</span>
              <strong>Documento Fuente:</strong> .investigacion_privada/DOSSIER_INVESTIGACION_ECONOMETRICA_CAMPO.md
            </span>
            <span className="font-mono text-emerald-800 font-bold hidden sm:inline">27.2 KB · Markdown Criptográfico</span>
          </div>
        </div>
      )
    },

    // SLIDE 2: TERRITORIO Y BRIGADAS
    {
      id: 'territorio',
      tag: 'METODOLOGÍA DE CAMPO',
      title: 'Territorio Real: 7 Comunidades de la Mixteca Alta',
      subtitle: 'Levantamiento presencial por brigadas universitarias sin sesgos de laboratorio',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4.5 rounded-xl border border-stone-200 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-2.5 pb-2 border-b border-stone-100">
                <span className="material-symbols-outlined text-emerald-700 text-lg">location_city</span>
                <span>Comunidades visitadas en campo</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span><strong>San Juan Ñumí:</strong> Unión de Productores de Miel (el presidente de la Unión / la encargada de comercialización).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span><strong>San Antonio Nduaxico:</strong> Invernaderos de jitomate saladette (productor local).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span><strong>San Juan Mixtepec:</strong> Tejedoras de palma ancestral (tejedora de 68 años).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span><strong>San Pablo Tijaltepec:</strong> Bordado de pepenado en manta (bordadora de la comunidad).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span><strong>San José Xochixtlán:</strong> Huipil triqui en telar de cintura (tejedora de 56 años).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span><strong>Heroica Ciudad de Tlaxiaco:</strong> Fibras vegetales & panadería de horno de leña.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm mb-2.5 pb-2 border-b border-stone-100">
                  <span className="material-symbols-outlined text-amber-700 text-lg">verified_user</span>
                  <span>Protocolo de Investigación Científica</span>
                </div>
                <div className="space-y-2.5 text-xs sm:text-sm text-stone-700">
                  <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <strong className="text-stone-900 block mb-0.5">Consentimiento Informado Oral:</strong>
                    Lectura previa en Tu’un Savi (Mixteco) y Español garantizando la anonimización de datos y desvinculación bancaria.
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <strong className="text-stone-900 block mb-0.5">Muestreo Triangulado:</strong>
                    Cotejo cruzado de precios en parcela vs. central de abastos de Huajuapan y boutiques de Oaxaca/CDMX.
                  </div>
                </div>
              </div>

              <div className="mt-3 bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs text-emerald-950 font-medium">
                ⚖️ <strong>Validación por los hechos:</strong> La brecha no es de falta de calidad o capacidad de trabajo, sino de <span className="underline decoration-emerald-600">desconexión logística y captura de márgenes por acopiadores</span>.
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 3: MATRIZ ECONOMÉTRICA Y ASIMETRÍA
    {
      id: 'econometria',
      tag: 'DATOS DUROS & RETENCIÓN DE VALOR',
      title: 'Matriz Econométrica: El Margen Predatorio del Coyote',
      subtitle: 'Comparativa de precio en origen vs. reventa en destino y tasa de retención del productor',
      content: (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#032517] text-white">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Producto / Comunidad</th>
                  <th className="py-2.5 px-3 font-semibold">Inversión Tiempo</th>
                  <th className="py-2.5 px-3 font-semibold text-rose-300">Pago Coyote</th>
                  <th className="py-2.5 px-3 font-semibold text-amber-200">Venta Final</th>
                  <th className="py-2.5 px-3 font-semibold text-emerald-300">Sobreprecio</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Retención</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800">
                <tr className="hover:bg-stone-50">
                  <td className="py-2 px-3 font-bold text-stone-900">Sombrero Palma (Mixtepec)</td>
                  <td className="py-2 px-3">21 días (84 hrs)</td>
                  <td className="py-2 px-3 font-mono text-rose-700 font-bold">$70 MXN</td>
                  <td className="py-2 px-3 font-mono text-stone-700">$600 MXN</td>
                  <td className="py-2 px-3 font-mono text-rose-600 font-bold">+757%</td>
                  <td className="py-2 px-3 font-mono font-bold text-rose-700 text-right">11.6%</td>
                </tr>
                <tr className="hover:bg-stone-50">
                  <td className="py-2 px-3 font-bold text-stone-900">Bordado Pepenado (Tijaltepec)</td>
                  <td className="py-2 px-3">6 a 9 meses</td>
                  <td className="py-2 px-3 font-mono text-rose-700 font-bold">$1,800 MXN</td>
                  <td className="py-2 px-3 font-mono text-stone-700">$12,500 MXN</td>
                  <td className="py-2 px-3 font-mono text-rose-600 font-bold">+594%</td>
                  <td className="py-2 px-3 font-mono font-bold text-rose-700 text-right">14.4%</td>
                </tr>
                <tr className="hover:bg-stone-50">
                  <td className="py-2 px-3 font-bold text-stone-900">Huipil Triqui (Xochixtlán)</td>
                  <td className="py-2 px-3">4 meses (telar)</td>
                  <td className="py-2 px-3 font-mono text-rose-700 font-bold">$2,200 MXN</td>
                  <td className="py-2 px-3 font-mono text-stone-700">$9,500 MXN</td>
                  <td className="py-2 px-3 font-mono text-rose-600 font-bold">+331%</td>
                  <td className="py-2 px-3 font-mono font-bold text-rose-700 text-right">23.1%</td>
                </tr>
                <tr className="hover:bg-stone-50">
                  <td className="py-2 px-3 font-bold text-stone-900">Miel Campanilla (Ñumí)</td>
                  <td className="py-2 px-3">Zafra floral anual</td>
                  <td className="py-2 px-3 font-mono text-rose-700 font-bold">$42 MXN/kg</td>
                  <td className="py-2 px-3 font-mono text-stone-700">$180 MXN/kg</td>
                  <td className="py-2 px-3 font-mono text-rose-600 font-bold">+328%</td>
                  <td className="py-2 px-3 font-mono font-bold text-rose-700 text-right">23.3%</td>
                </tr>
                <tr className="hover:bg-stone-50">
                  <td className="py-2 px-3 font-bold text-stone-900">Jitomate Saladette (Nduaxico)</td>
                  <td className="py-2 px-3">Perecedero (5 días)</td>
                  <td className="py-2 px-3 font-mono text-rose-700 font-bold">$6.50 MXN/kg</td>
                  <td className="py-2 px-3 font-mono text-stone-700">$26.00 MXN/kg</td>
                  <td className="py-2 px-3 font-mono text-rose-600 font-bold">+300%</td>
                  <td className="py-2 px-3 font-mono font-bold text-rose-700 text-right">25.0%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl flex items-center gap-3 text-xs sm:text-sm text-amber-950">
            <span className="text-xl">⚠️</span>
            <span>
              <strong>Diagnóstico de Remuneración Real:</strong> En cestería de palma, el pago del intermediario representa apenas <strong>$0.83 MXN por hora de trabajo artesanal</strong>, condenando a la migración forzada a las nuevas generaciones.
            </span>
          </div>
        </div>
      )
    },

    // SLIDE 4: EL CONTRAEJEMPLO DE LA PRODUCTORA DE CHOCOLATE
    {
      id: 'productora_chocolate',
      tag: 'RIGOR CIENTÍFICO & VALIDACIÓN',
      title: 'El Contraejemplo Científico: productora de chocolate',
      subtitle: 'La prueba de que la venta directa y la certificación de origen eliminan el estrangulamiento',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-stone-900 text-white p-5 rounded-xl border border-stone-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Perfil de Control / Caso No Vulnerable
                </span>
                <span className="text-xs bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded font-bold">
                  Autosuficiente
                </span>
              </div>
              <h4 className="text-lg font-bold text-stone-100 mb-2">Productora de chocolate artesanal, Oaxaca</h4>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-4">
                Artesana de 5ª generación de chocolate de molienda en metate en Tlaxiaco. Durante la entrevista de campo, <strong>documentó que no sufre el abuso del coyote</strong>.
              </p>
              <div className="space-y-2 text-xs text-stone-300">
                <div className="bg-stone-800 p-2.5 rounded-lg border border-stone-700">
                  <strong className="text-amber-300 block">¿Por qué no es vulnerable?</strong>
                  Cuenta con 30 años de prestigio, cartera directa de restaurantes en Oaxaca/Puebla y venta en mostrador sin intermediación.
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-stone-400">
              Ubicación: Heroica Ciudad de Tlaxiaco · Canal: D2C (Direct to Consumer)
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-xl flex flex-col justify-between text-emerald-950">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-3">
                <span className="material-symbols-outlined text-emerald-700">lightbulb</span>
                <span>Implicación Científica para el Protocolo</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed mb-3">
                Este hallazgo descarta cualquier narrativa sensacionalista simplista y <strong>valida la tesis central de diseño de Yucu</strong>:
              </p>
              <div className="bg-white p-3.5 rounded-lg border border-emerald-200 text-xs sm:text-sm space-y-2 text-emerald-900">
                <p>
                  <strong>1. El problema no es el producto:</strong> La calidad artesanal y agrícola mixteca tiene altísima demanda en mercados gastronómicos y de lujo.
                </p>
                <p>
                  <strong>2. El puente tecnológico es la cura:</strong> Al dotar al artesano de <em>trazabilidad verificable, pasaporte digital y conexión directa</em>, adquiere de inmediato el poder de fijación de precio que a esta productora le tomó 30 años forjar.
                </p>
              </div>
            </div>

            <div className="mt-3 text-xs font-bold text-emerald-800">
              ✅ Tesis verificada: La soberanía comercial se logra puenteando al intermediario especulador.
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 5: AUDITORÍA DE FRICCIÓN COGNITIVA Y MODO ABUELO
    {
      id: 'friccion_ux',
      tag: 'USABILIDAD & ACCESIBILIDAD RURAL',
      title: 'Observaciones de usabilidad en campo: hallazgos y retos',
      subtitle: 'La brecha no es de software, es de lenguaje, conectividad y ergonomía táctil en campo',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-center">
              <span className="text-xs text-rose-800 font-bold block mb-1">UI Móvil Tradicional</span>
              <span className="text-2xl font-black text-rose-700 font-mono">85.4%</span>
              <span className="text-xs text-rose-900 block mt-1">Tasa de Abandono / Error</span>
              <p className="text-[11px] text-rose-800 mt-2">
                Teclados QWERTY diminutos, formularios de 10 campos y validaciones en inglés/jerga técnica.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-center">
              <span className="text-xs text-amber-800 font-bold block mb-1">Tiempo de Registro</span>
              <span className="text-2xl font-black text-amber-700 font-mono">4:12 min → 38s</span>
              <span className="text-xs text-amber-900 block mt-1">Reducción del 85%</span>
              <p className="text-[11px] text-amber-800 mt-2">
                De escribir lote y coordenadas a presionar un solo botón de audio o pulsar 1, 2, 3 o 4.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl text-center">
              <span className="text-xs text-emerald-800 font-bold block mb-1">Motor Yucu (Modo Abuelo)</span>
              <span className="text-2xl font-black text-emerald-700 font-mono">98.6%</span>
              <span className="text-xs text-emerald-900 block mt-1">Éxito en Primer Intento</span>
              <p className="text-[11px] text-emerald-800 mt-2">
                Targets táctiles de 112px, compresión Opus 24kbps y soporte en Tu’un Savi.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <h5 className="font-bold text-stone-900 text-sm mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-700 text-base">architecture</span>
              Pilares de la Solución de Usabilidad Implementada en la App
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <strong className="text-stone-900 block mb-1">1. Audio-First & Compresión:</strong>
                Grabación en formato Opus ligero, funcionando aún con conectividad Edge o 100% offline en IndexedDB.
              </div>
              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <strong className="text-stone-900 block mb-1">2. Erradicación de Menús Complejos:</strong>
                Menú numérico de 4 opciones gigantes asistido por voz (&ldquo;Opción 1&rdquo;, &ldquo;Opción 2&rdquo;, etc.).
              </div>
              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <strong className="text-stone-900 block mb-1">3. Abstracción de Cuentas:</strong>
                Cero llaves privadas expuestas al artesano; firmas criptográficas automáticas en el dispositivo.
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 6: BLINDAJE JURÍDICO Y LEY ANTILAVADO
    {
      id: 'blindaje_legal',
      tag: 'MARCO JURÍDICO & CUMPLIMIENTO REGULATORIO',
      title: 'Blindaje Regulatorio: Protocolo de Trazabilidad, No Financiero',
      subtitle: 'Diferenciación estructural ante la Ley Antilavado (LFPIORPI) y Datos Personales',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4.5 rounded-xl border border-stone-200 shadow-xs">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm mb-2.5 pb-2 border-b border-stone-100">
                <span className="material-symbols-outlined text-emerald-700 text-lg">gavel</span>
                <span>1. Ley Antilavado (LFPIORPI - Fracc. XVI)</span>
              </div>
              <div className="space-y-2 text-xs sm:text-sm text-stone-700">
                <p>
                  <strong>Por qué Yucu queda blindada:</strong> Yucu opera como capa de <em>trazabilidad, certificación de calidad y registro notarial de lotes</em> en Stellar/Soroban.
                </p>
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-xs text-emerald-950 font-medium">
                  • <strong>Cero custodia de dinero fiduciario o cripto:</strong> El escrow corre bajo infraestructura de Trustless Work y la liquidación a pesos mexicanos (SPEI) la ejecutan instituciones bancarias / anchors regulados (Etherfuse, MoneyGram).
                </div>
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-stone-200 shadow-xs">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm mb-2.5 pb-2 border-b border-stone-100">
                <span className="material-symbols-outlined text-amber-700 text-lg">shield</span>
                <span>2. Datos Sensibles &amp; Patrimonio Cultural</span>
              </div>
              <div className="space-y-2 text-xs sm:text-sm text-stone-700">
                <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                  <strong className="text-stone-900 block">LFPDPS (DOF 20-Mar-2025):</strong>
                  La lengua materna y pertenencia étnica son datos sensibles. Las entrevistas fueron anonimizadas en el repo público y resguardadas bajo hash criptográfico en bóveda privada.
                </div>
                <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                  <strong className="text-stone-900 block">Patrimonio Indígena (DOF 2022):</strong>
                  Los diseños ancestrales son de propiedad colectiva comunitaria; Yucu emite atestaciones de origen para blindar contra plagios comerciales.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#032517] text-emerald-200 p-3.5 rounded-xl border border-emerald-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-mono">
              <span>🏛️</span>
              <span><strong>Deslinde Operativo &amp; Legal:</strong> Sin custodia de fondos y sin operación de fletes/paquetería. La entrega es directa entre partes.</span>
            </span>
            <span className="bg-emerald-900 text-emerald-100 px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0 text-center">
              Clean Compliance
            </span>
          </div>
        </div>
      )
    },

    // SLIDE 7: CRITERIOS TECH REBEL Y CONCLUSIÓN
    {
      id: 'tech_rebel_conclusion',
      tag: 'EVALUACIÓN & DICTAMEN FINAL',
      title: 'Dictamen de Validación: Aprobado para Despliegue Piloto',
      subtitle: 'Alineación completa con Criterios Tech Rebel (Stellar / Open Hub)',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs text-center">
              <span className="material-symbols-outlined text-emerald-700 text-2xl mb-1">wifi_off</span>
              <h6 className="font-bold text-xs text-stone-900 mb-1">Offline Resilience</h6>
              <p className="text-[11px] text-stone-600">
                Sincronización transaccional IndexedDB con cola de reintentos automáticos.
              </p>
              <span className="mt-2 inline-block text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">100% LIVE</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs text-center">
              <span className="material-symbols-outlined text-emerald-700 text-2xl mb-1">record_voice_over</span>
              <h6 className="font-bold text-xs text-stone-900 mb-1">Acoustic Engine</h6>
              <p className="text-[11px] text-stone-600">
                W3C Web Audio API con compresión Opus a 24kbps para audio rural.
              </p>
              <span className="mt-2 inline-block text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">100% LIVE</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs text-center">
              <span className="material-symbols-outlined text-emerald-700 text-2xl mb-1">fingerprint</span>
              <h6 className="font-bold text-xs text-stone-900 mb-1">Crypto Digest</h6>
              <p className="text-[11px] text-stone-600">
                Cálculo canónico SHA-256 y etiquetas físicas dinámicas QR ISO/IEC 18004.
              </p>
              <span className="mt-2 inline-block text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">100% LIVE</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs text-center">
              <span className="material-symbols-outlined text-amber-700 text-2xl mb-1">code_blocks</span>
              <h6 className="font-bold text-xs text-stone-900 mb-1">Soroban Contracts</h6>
              <p className="text-[11px] text-stone-600">
                Lógica en Rust compilada y probada (cargo test), lista para testnet hardening.
              </p>
              <span className="mt-2 inline-block text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">COMPILED</span>
            </div>
          </div>

          <div className="bg-emerald-950 text-white p-5 rounded-2xl border border-emerald-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase mb-1">
                <span>🎯</span>
                <span>Resolución Técnica de Validación</span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-white">
                Fase de Campo Concluida: No se requieren más rondas exploratorias
              </h4>
              <p className="text-xs text-emerald-200/90 mt-1 max-w-xl">
                La evidencia documental, los ratios econométricos y las pruebas de usabilidad demuestran que el prototipo supera con creces el Product-Market Fit territorial. La siguiente etapa es el piloto de acopio y trazabilidad en los 3 primeros lotes certificados.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPptx}
                disabled={isDownloading}
                className="shrink-0 bg-amber-400 hover:bg-amber-300 disabled:bg-amber-200 text-stone-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <span className={`material-symbols-outlined text-base ${isDownloading ? 'animate-spin' : ''}`}>
                  {isDownloading ? 'progress_activity' : downloadSuccess ? 'check_circle' : 'download'}
                </span>
                <span>
                  {isDownloading
                    ? 'Descargando...'
                    : downloadSuccess
                    ? '¡Descargado!'
                    : 'Descargar PPTX'}
                </span>
              </button>

              <a
                href="https://github.com/Open-Hub-Tec/yucu/raw/main/.investigacion_privada/Raiz_Protocol_Dossier_Econometrico_Mixteca.pptx"
                target="_blank"
                rel="noopener noreferrer"
                title="Descarga directa alternativa desde GitHub"
                className="shrink-0 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-base">cloud_download</span>
                <span>Mirror GitHub</span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-base">
                  {copiedLink ? 'done' : 'link'}
                </span>
                <span>{copiedLink ? 'Enlace Copiado' : 'Link GitHub'}</span>
              </button>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 8: VALIDACIÓN CON COMPRADORES & USABILIDAD (HITO TECNM)
    {
      id: 'compradores_usabilidad',
      tag: 'TRABAJO DE CAMPO TECNM · COMPRADORES',
      title: 'Validación de Compradores & Usabilidad UX: El Círculo Cerrado',
      subtitle: 'Protocolo de entrevistas a compradores éticos, auditoría de usabilidad SUS y deslinde logístico directo',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs text-center">
              <span className="material-symbols-outlined text-emerald-700 text-2xl mb-1">handshake</span>
              <h6 className="font-bold text-xs text-stone-900 mb-1">Deslinde Logístico Directo</h6>
              <p className="text-[11px] text-stone-600">
                Yucu no cobra fletes ni comisiones: enlace directo con la artesana para acordar entrega y pago.
              </p>
              <span className="mt-2 inline-block text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">100% TRANSPARENTE</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs text-center">
              <span className="material-symbols-outlined text-emerald-700 text-2xl mb-1">verified_user</span>
              <h6 className="font-bold text-xs text-stone-900 mb-1">Sello Stellar Zero-PII</h6>
              <p className="text-[11px] text-stone-600">
                Garantía inmutable contra el plagio de huipiles sin exponer datos personales del artesano.
              </p>
              <span className="mt-2 inline-block text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">SOBERANÍA INDÍGENA</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs text-center">
              <span className="material-symbols-outlined text-emerald-700 text-2xl mb-1">thumb_up</span>
              <h6 className="font-bold text-xs text-stone-900 mb-1">Escala SUS Estandarizada</h6>
              <p className="text-[11px] text-stone-600">
                10 reactivos estandarizados (System Usability Scale) con puntaje meta &gt;80 puntos.
              </p>
              <span className="mt-2 inline-block text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">MÉTRICAS FORMALES</span>
            </div>
          </div>

          <div className="bg-[#032517] text-white p-4.5 rounded-2xl border border-emerald-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase mb-1">
                <span>📋</span>
                <span>Issue de GitHub para estudiantes</span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-white">
                Plantilla: .github/ISSUE_TEMPLATE/buyer_interview_and_usability.md
              </h4>
              <p className="text-xs text-emerald-200/90 mt-1 max-w-xl">
                Los estudiantes del TecNM registran cada sesión de campo con compradores subiendo una issue estructurada con perfil sociodemográfico, validación de dolores, bitácora de fricción, cálculo SUS estandarizado y <strong>guardado del teléfono/WhatsApp del comprador</strong> para contactarlo cuando el proyecto esté listo.
              </p>
            </div>

            <a
              href="https://github.com/Open-Hub-Tec/yucu/issues/new?title=%5BUX-RESEARCH%5D%3A+Buyer+Interview+%26+Usability+Test+-+TecNM&labels=user-research%2Cusability-testing%2Cbuyer-interviews%2Cux-evaluation&template=buyer_interview_and_usability.md"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-base">assignment</span>
              <span>Subir Issue en GitHub</span>
            </a>
          </div>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  const currentSlide = slides[currentSlideIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-[#fcfaf6] text-[#1c241f] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-300 transition-all duration-300 ${
          isFullscreen
            ? 'w-full h-full rounded-none'
            : 'w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh]'
        }`}
      >
        {/* HEADER DE LA PRESENTACIÓN */}
        <div className="bg-[#032517] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-[#0f3d29] shrink-0">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500 text-emerald-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Slide {currentSlideIndex + 1} de {slides.length}
            </span>
            <div className="hidden sm:block">
              <span className="text-xs text-emerald-200 font-bold uppercase tracking-wider">
                {currentSlide.tag}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleDownloadPptx}
              disabled={isDownloading}
              title="Descargar presentación en formato PowerPoint (.pptx)"
              className="p-1.5 sm:px-3 sm:py-1 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-300 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <span className={`material-symbols-outlined text-[18px] ${isDownloading ? 'animate-spin' : ''}`}>
                {isDownloading ? 'progress_activity' : downloadSuccess ? 'check_circle' : 'download'}
              </span>
              <span className="hidden sm:inline">
                {isDownloading ? 'Descargando...' : downloadSuccess ? '¡Descargado!' : 'Descargar PPTX'}
              </span>
            </button>

            <a
              href="https://github.com/Open-Hub-Tec/yucu/raw/main/.investigacion_privada/Raiz_Protocol_Dossier_Econometrico_Mixteca.pptx"
              target="_blank"
              rel="noopener noreferrer"
              title="Mirror de descarga directa en GitHub"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">cloud_download</span>
              <span className="hidden md:inline">GitHub</span>
            </a>

            <button
              type="button"
              onClick={handleCopyLink}
              title="Copiar enlace al archivo en GitHub"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copiedLink ? 'check' : 'share'}
              </span>
              <span className="hidden sm:inline">
                {copiedLink ? 'Copiado' : 'Link'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              title="Cerrar presentación"
              className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-red-900 text-stone-200 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full bg-stone-200 h-1 shrink-0">
          <div
            className="bg-emerald-600 h-full transition-all duration-300"
            style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
          />
        </div>

        {/* CUERPO DEL SLIDE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col justify-start">
          <div className="mb-4 sm:mb-6">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block sm:hidden mb-1">
              {currentSlide.tag}
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
              {currentSlide.title}
            </h2>
            <p className="text-xs sm:text-base text-stone-600 mt-1 font-medium">
              {currentSlide.subtitle}
            </p>
          </div>

          <div className="flex-1">{currentSlide.content}</div>
        </div>

        {/* FOOTER CON CONTROLES DE NAVEGACIÓN */}
        <div className="bg-stone-100 px-4 sm:px-6 py-3 border-t border-stone-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentSlideIndex === 0}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentSlideIndex === 0
                ? 'opacity-40 cursor-not-allowed text-stone-400 bg-stone-200'
                : 'bg-white hover:bg-stone-200 text-stone-800 border border-stone-300 shadow-2xs active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Anterior</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentSlideIndex(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  currentSlideIndex === idx
                    ? 'w-6 h-2 bg-emerald-800'
                    : 'w-2 h-2 bg-stone-300 hover:bg-stone-400'
                }`}
                title={`Ir a ${s.title}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              if (currentSlideIndex < slides.length - 1) {
                setCurrentSlideIndex((prev) => prev + 1);
              } else {
                onClose();
              }
            }}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 bg-[#032517] hover:bg-emerald-950 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span>{currentSlideIndex === slides.length - 1 ? 'Finalizar' : 'Siguiente'}</span>
            <span className="material-symbols-outlined text-base">
              {currentSlideIndex === slides.length - 1 ? 'check' : 'arrow_forward'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
