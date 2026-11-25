import React, { useState, useEffect, useRef } from 'react';
import { PROTOCOL_FEES } from '../config/protocolFees';

interface ExplainerVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateScreen?: (screen: any) => void;
}

interface Chapter {
  id: 'intro' | 'openhub' | 'trustlesswork' | 'raiz' | 'fieldtestimony' | 'soroban';
  title: string;
  badge: string;
  durationSec: number;
  icon: string;
  color: string;
  headline: string;
  narration: string;
  highlights: string[];
  visualTag: string;
  bgGradient: string;
  isVideoChapter?: boolean;
}

const CHAPTERS: Chapter[] = [
  {
    id: 'intro',
    title: '1. Validación en Campo',
    badge: '50+ Productores',
    durationSec: 18,
    icon: 'groups',
    color: '#032517',
    headline: '50+ Productores Validados en 6 Comunidades de la Mixteca',
    narration:
      'Bienvenidos. El Instituto Tecnológico de Tlaxiaco presenta la infraestructura validada con más de 50 productores y artesanos en San Juan Mixtepec, Yucuhiti, Ñumí, Xochixtlán, Tijaltepec y Tlaxiaco, eliminando el intermediarismo abusivo con tecnología de frontera.',
    highlights: [
      '52 productores y artesanos censados activos en el piloto',
      'Artesanos y artesanas entrevistados por brigadas estudiantiles (muestra cualitativa)',
      '0% pérdida de datos bajo condiciones de parcela offline'
    ],
    visualTag: '🌿 Mixteca Alta Oaxaqueña',
    bgGradient: 'from-emerald-950 via-[#032517] to-neutral-900'
  },
  {
    id: 'openhub',
    title: '2. Open Hub TecNM',
    badge: 'Estudiantes TecNM',
    durationSec: 20,
    icon: 'hub',
    color: '#0e7490',
    headline: 'Open Hub: El Centro de Innovación Abierta de Tlaxiaco',
    narration:
      'Open Hub es el nodo de desarrollo tecnológico y vinculación académica del Tec de Tlaxiaco. Aquí los estudiantes de ingeniería programan módulos, validan contratos inteligentes y auditan fricción en campo como parte de sus materias. Si una issue forma parte de Drips Wave, Drips le paga directamente a quien la resolvió.',
    highlights: [
      'Nodo de investigación y desarrollo de software comunitario',
      'Estudiantes del TecNM Campus Tlaxiaco programan Yucu como parte de sus materias',
      'Auditorías de usabilidad con adultos mayores (tejedoras de Xochixtlán y Mixtepec, productor de café)'
    ],
    visualTag: '🏫 TecNM Campus Tlaxiaco',
    bgGradient: 'from-cyan-950 via-slate-900 to-neutral-900'
  },
  {
    id: 'trustlesswork',
    title: '3. Trustless Work Escrow',
    badge: 'ADR-001 • Soroban',
    durationSec: 22,
    icon: 'verified_user',
    color: '#b45309',
    headline: 'Trustless Work: Escrow por Hitos y Liquidación SPEI Banxico',
    narration:
      'Siguiendo la decisión de arquitectura ADR-001, Yucu integra Trustless Work en Soroban. Los fondos del comprador se custodian en contratos de Trustless Work: se libera un 30% de anticipo al certificar origen, y el 70% restante al entregar en la bodega municipal de Tlaxiaco, liquidado directo a tarjetas Bienestar vía Etherfuse SPEI.',
    highlights: [
      'Hito 1 (30% Anticipo): Liberado contra atestación inmutable de origen (0x01_ORIGIN)',
      'Hito 2 (70% Liquidación): Al registrar entrega física en bodega cooperativa',
      'Rieles híbridos fiduciarios: Etherfuse SPEI y MicoPay efectivo en báscula'
    ],
    visualTag: '🤝 Escrow Descentralizado Soroban',
    bgGradient: 'from-amber-950 via-stone-900 to-neutral-900'
  },
  {
    id: 'raiz',
    title: '4. Yucu PWA & Oráculos IA',
    badge: 'ADR-002 • Zero-Typing',
    durationSec: 22,
    icon: 'record_voice_over',
    color: '#15803d',
    headline: 'PWA Offline-First y 4 Oráculos de IA Autónomos',
    narration:
      'En cumplimiento con ADR-002, Yucu es una PWA abierta sin contraseñas ni dependencias comerciales. Permite registrar café, pulque, miel y telar por voz en mixteco Tu’un Savi o español en 112px. Sus 4 oráculos de IA auditan calidad SCAA, deforestación satelital EUDR y resuelven rutas de pago.',
    highlights: [
      'Botones táctiles gigantes de 112px y oráculo de voz en Tu’un Savi',
      'Oráculo satelital EUDR contra deforestación post-2020 para Europa',
      'Cero seed phrases: acceso por SMS OTP y Carnets QR comunitarios físicos'
    ],
    visualTag: '🌱 PWA Abierta W3C',
    bgGradient: 'from-emerald-950 via-teal-950 to-neutral-900'
  },
  {
    id: 'fieldtestimony',
    title: '5. Testimonio en Video',
    badge: 'Testimonio de Campo',
    durationSec: 26,
    icon: 'videocam',
    color: '#7c3aed',
    headline: 'Evidencia de Campo: Productora de Chocolate Artesanal',
    narration:
      'Observa el testimonio real grabado en campo por los estudiantes. Una productora de chocolate tradicional de quinta generación en Oaxaca, explica cómo el registro directo y la autenticación protegen el valor del cacao contra intermediarios.',
    highlights: [
      'Video real en MP4 grabado por brigadas estudiantiles del TecNM',
      'Productora de chocolate artesanal sin intermediarios ni coyotes',
      'Respaldo audiovisual y documental integrado en repositorio GitHub'
    ],
    visualTag: '🎥 Grabación de Campo Directa',
    bgGradient: 'from-purple-950 via-slate-900 to-neutral-900',
    isVideoChapter: true
  },
  {
    id: 'soroban',
    title: '6. Regalías y Tequio',
    badge: 'Smart Contracts',
    durationSec: 20,
    icon: 'diamond',
    color: '#be123c',
    headline: `${PROTOCOL_FEES.artisanResaleRoyaltyPct}% de Regalías Perpetuas y Fondo de Tequio Comunal`,
    narration:
      `A través de contratos inteligentes en Soroban, cada pieza artesanal y lote conserva un ${PROTOCOL_FEES.artisanResaleRoyaltyPct}% de regalías perpetuas para la creadora en reventas secundarias, y un ${PROTOCOL_FEES.resaleTequioPct}% automático para el fondo de obras comunitarias Tequio Comunal de Tlaxiaco.`,
    highlights: [
      'Smart contracts en Rust/WASM para protección de artesanas textiles',
      `${PROTOCOL_FEES.artisanResaleRoyaltyPct}% automático para la creadora en reventas en galerías y boutiques`,
      `${PROTOCOL_FEES.resaleTequioPct}% acreditado a la tesorería comunal de la asamblea para infraestructura`
    ],
    visualTag: '💎 Blindaje On-Chain',
    bgGradient: 'from-rose-950 via-neutral-900 to-stone-950'
  }
];

export const ExplainerVideoModal: React.FC<ExplainerVideoModalProps> = ({
  isOpen,
  onClose,
  onNavigateScreen
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'video_testimony' | 'interactive_tour'>('video_testimony');
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const activeChapter = CHAPTERS[currentChapterIndex];
  const timerRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Handle Speech narration whenever chapter changes or playback state changes
  useEffect(() => {
    if (!isOpen || activeViewMode !== 'interactive_tour') {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (isVoiceMuted || !isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeChapter.narration);
      utterance.lang = 'es-MX';
      utterance.rate = 0.95 * playbackSpeed;
      utterance.pitch = 1.0;
      utteranceRef.current = utterance;

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
      }
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen, activeViewMode, currentChapterIndex, isPlaying, isVoiceMuted, playbackSpeed]);

  // Tick animation and auto-advancement for chapter in interactive mode
  useEffect(() => {
    if (!isOpen || activeViewMode !== 'interactive_tour' || !isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = 100;
    const stepPercent = (intervalMs / (activeChapter.durationSec * 1000)) * 100 * playbackSpeed;

    timerRef.current = setInterval(() => {
      setPlaybackProgress((prev) => {
        const next = prev + stepPercent;
        if (next >= 100) {
          if (currentChapterIndex < CHAPTERS.length - 1) {
            setCurrentChapterIndex((curr) => curr + 1);
            return 0;
          } else {
            setIsPlaying(false);
            return 100;
          }
        }
        return next;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, activeViewMode, isPlaying, currentChapterIndex, activeChapter.durationSec, playbackSpeed]);

  if (!isOpen) return null;

  const handleSelectChapter = (idx: number) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentChapterIndex(idx);
    setPlaybackProgress(0);
    setIsPlaying(true);
    if (CHAPTERS[idx].isVideoChapter) {
      setActiveViewMode('video_testimony');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#121614] border border-[#2b3a32] text-neutral-100 rounded-3xl w-full max-w-4xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-black/40 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              <span className="material-symbols-outlined text-[20px]">play_circle</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] sm:text-[15px] font-black text-white">
                  Audiovisual & Video de Infraestructura Yucu
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  TecNM • 50+ Productores
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Evidencia de campo, testimonio en video y arquitectura Trustless Work sobre Stellar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
            title="Cerrar video"
          >
            ✕
          </button>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-neutral-900/60 border-b border-white/10">
          <button
            type="button"
            onClick={() => {
              setActiveViewMode('video_testimony');
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeViewMode === 'video_testimony'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white/5 text-neutral-300 hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">videocam</span>
            <span>📹 Testimonio Real en Video (MP4)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveViewMode('interactive_tour');
              setIsPlaying(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeViewMode === 'interactive_tour'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white/5 text-neutral-300 hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">auto_stories</span>
            <span>🌿 Recorrido de Infraestructura (6 Capítulos)</span>
          </button>
        </div>

        {/* MAIN STAGE CONTENT */}
        {activeViewMode === 'video_testimony' ? (
          /* REAL VIDEO PLAYER STAGE */
          <div className="flex-1 flex flex-col bg-black overflow-y-auto">
            <div className="relative w-full aspect-video bg-neutral-950 flex items-center justify-center">
              {/* El video se retiró del repositorio público por privacidad (docs/research/PRIVACIDAD.md). */}
              <div className="flex flex-col items-center gap-2 px-6 text-center text-neutral-300">
                <span className="material-symbols-outlined text-[40px] text-purple-300">lock</span>
                <p className="text-sm font-bold text-white">Video resguardado por privacidad</p>
                <p className="text-xs max-w-md">
                  La grabación se conserva en el archivo privado del equipo de investigación. Solo se publica con el
                  consentimiento por escrito de la participante.
                </p>
              </div>
            </div>

            {/* Video Metadata Card */}
            <div className="p-4 sm:p-5 bg-neutral-900/90 border-t border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Evidencia Hito 1.1 • Estudio de Campo
                    </span>
                    <span className="text-[12px] text-neutral-400">
                      Oaxaca, México • Septiembre 2026
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white mt-1">
                    Entrevista: productora de chocolate artesanal, Oaxaca
                  </h3>
                  <p className="text-xs text-neutral-300">
                    5ª generación familiar dedicada al chocolate de cacao fino de aroma. Documentado por la estudiante <strong>Yuliana Morales</strong> (Ing. en Sistemas Computacionales, TecNM Campus Tlaxiaco - PR #34).
                  </p>
                </div>

              </div>

              {/* Research Insights from the Video */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <div className="bg-black/40 p-2.5 rounded-xl border border-white/10 text-xs">
                  <div className="font-bold text-emerald-400 flex items-center gap-1 mb-0.5">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span>
                    Modelo Directo
                  </div>
                  <p className="text-neutral-300 text-[11px]">
                    Sin intermediarios abusivos (coyotes): trato directo en taller o parcela y pagos garantizados en Stellar.
                  </p>
                </div>

                <div className="bg-black/40 p-2.5 rounded-xl border border-white/10 text-xs">
                  <div className="font-bold text-amber-400 flex items-center gap-1 mb-0.5">
                    <span className="material-symbols-outlined text-[15px]">verified</span>
                    Cacao de Origen
                  </div>
                  <p className="text-neutral-300 text-[11px]">
                    Materia prima seleccionada de Tapachula con formulación tradicional, almendrada y amarga.
                  </p>
                </div>

                <div className="bg-black/40 p-2.5 rounded-xl border border-white/10 text-xs">
                  <div className="font-bold text-cyan-400 flex items-center gap-1 mb-0.5">
                    <span className="material-symbols-outlined text-[15px]">security</span>
                    Protección Cultural
                  </div>
                  <p className="text-neutral-300 text-[11px]">
                    El pasaporte RWA blinda la receta ancestral contra imitaciones y despojo comercial.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* INTERACTIVE TOUR STAGE */
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Cinematic Chapter Card */}
            <div
              className={`relative w-full aspect-video bg-linear-to-br ${activeChapter.bgGradient} flex flex-col justify-between p-4 sm:p-6 overflow-hidden border-b border-white/10 transition-all duration-700 select-none`}
            >
              {/* Top Stage Bar */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase border border-white/20 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-emerald-400">
                      {activeChapter.icon}
                    </span>
                    {activeChapter.badge}
                  </span>
                  <span className="text-[11px] text-white/70 font-medium hidden sm:inline-block">
                    {activeChapter.visualTag}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-white/80 bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                    Capítulo {currentChapterIndex + 1} de {CHAPTERS.length}
                  </span>
                  {isPlaying && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/40">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      REPRODUCIENDO
                    </span>
                  )}
                </div>
              </div>

              {/* Center Stage */}
              <div className="relative z-10 my-auto py-2">
                <h3 className="text-[17px] sm:text-[21px] font-black tracking-tight leading-tight text-white mb-2 drop-shadow-md">
                  {activeChapter.headline}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                  {activeChapter.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="bg-black/45 backdrop-blur-sm p-2.5 rounded-xl border border-white/15 shadow-sm flex items-start gap-2"
                    >
                      <span className="material-symbols-outlined text-emerald-400 text-[18px] shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span className="text-[11px] sm:text-[12px] font-medium leading-snug text-neutral-200">
                        {h}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Narration Banner */}
              <div className="relative z-10 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/15 flex items-center justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[20px] text-emerald-400 shrink-0 mt-0.5">
                    record_voice_over
                  </span>
                  <p className="text-[12px] sm:text-[13px] text-emerald-100 font-medium leading-snug line-clamp-2">
                    "{activeChapter.narration}"
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVoiceMuted((prev) => !prev)}
                  className={`p-2 rounded-xl border shrink-0 transition-colors cursor-pointer ${
                    isVoiceMuted
                      ? 'bg-red-500/20 border-red-500/40 text-red-300'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                  title={isVoiceMuted ? 'Activar voz' : 'Silenciar voz'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isVoiceMuted ? 'volume_off' : 'volume_up'}
                  </span>
                </button>
              </div>
            </div>

            {/* Controls Bar for Interactive Tour */}
            <div className="p-3 bg-black/70 border-t border-white/10 space-y-2">
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full transition-all duration-150"
                  style={{ width: `${playbackProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentChapterIndex > 0) {
                        handleSelectChapter(currentChapterIndex - 1);
                      }
                    }}
                    disabled={currentChapterIndex === 0}
                    className="p-1.5 rounded-lg bg-white/10 text-white disabled:opacity-30 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">skip_previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPlaying((prev) => !prev)}
                    className="p-1.5 rounded-lg bg-emerald-500 text-black font-bold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentChapterIndex < CHAPTERS.length - 1) {
                        handleSelectChapter(currentChapterIndex + 1);
                      }
                    }}
                    disabled={currentChapterIndex === CHAPTERS.length - 1}
                    className="p-1.5 rounded-lg bg-white/10 text-white disabled:opacity-30 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">skip_next</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto">
                  {CHAPTERS.map((ch, idx) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handleSelectChapter(idx)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        currentChapterIndex === idx
                          ? 'bg-white text-black'
                          : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                      }`}
                    >
                      {idx + 1}. {ch.badge}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-2.5 bg-neutral-950 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span>🏛️ Instituto Tecnológico de Tlaxiaco (TecNM)</span>
            <span>•</span>
            <span>Stellar Community Fund &amp; Open Hub</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
