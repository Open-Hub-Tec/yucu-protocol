import React, { useState, useEffect, useRef } from 'react';
import { AppLanguage, ScreenView, PendingOfflineLot, ArtisanVisibilityLevel, InformedConsentRecord } from '../types';
import { startAudioRecording, LiveRecorderSession } from '../utils/audioRecorder';
import { getProductProfile, ProductProfile, sanitizeProductName } from '../utils/productUtils';
import { saveOfflineLot } from '../utils/offlineStorage';
import { assistant, type AISource } from '../core/ai';
import { DemoBadge } from './DemoBadge';

interface RegisterCoffeeLotScreenProps {
  selectedProductType?: string;
  onNavigateScreen: (screen: ScreenView) => void;
  onLotCreated?: (customLot?: any) => void;
  elderMode?: boolean;
  appLanguage?: AppLanguage;
  isOnline?: boolean;
}

/** Perfil del formulario → código de categoría de `LOT_CATEGORIES`, para comparar con lo que ve la IA. */
const PROFILE_TO_LOT_CATEGORY: Partial<Record<ProductProfile['key'], string>> = {
  cafe: 'coffee',
  miel: 'honey',
  pulque: 'pulque',
  maiz: 'maize',
  textil: 'textile',
  sombrero: 'palm',
};

export const RegisterCoffeeLotScreen: React.FC<RegisterCoffeeLotScreenProps> = ({
  selectedProductType = 'Café',
  onNavigateScreen,
  onLotCreated,
  elderMode = true,
  appLanguage = 'es',
  isOnline = true
}) => {
  const isMixteco = appLanguage === 'mix';
  const cleanProductName = sanitizeProductName(selectedProductType || 'Café');
  const profile: ProductProfile = getProductProfile(cleanProductName);

  const isCoffee = profile.key === 'cafe';
  const isPulque = profile.key === 'pulque';
  const isHoney = profile.key === 'miel';
  const isCorn = profile.key === 'maiz';
  const isSombrero = profile.key === 'sombrero';
  const isHandicraft = profile.key === 'textil';
  const isTomato = profile.key === 'jitomate';

  const defaultPhotoOne = profile.defaultPhotoOne;
  const defaultPhotoTwo = profile.defaultPhotoTwo;

  const defaultField1 = profile.field1Default;
  const defaultField2 = profile.field2Default;
  const defaultField3 = profile.field3Default;

  const [photoCount, setPhotoCount] = useState<number>(1);
  const [photoOneUrl, setPhotoOneUrl] = useState<string>(defaultPhotoOne);
  const [photoTwoUrl, setPhotoTwoUrl] = useState<string | null>(null);
  const [targetSlot, setTargetSlot] = useState<1 | 2>(2);
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const [isLiveCameraActive, setIsLiveCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [photoSuccessToast, setPhotoSuccessToast] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [liveVoiceTranscript, setLiveVoiceTranscript] = useState<string>('');
  const [recordedAudioNote, setRecordedAudioNote] = useState<{
    audioUrl: string;
    transcript: string;
    duration: string;
  } | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

  const audioSessionRef = useRef<LiveRecorderSession | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const [variedad, setVariedad] = useState<string>(defaultField1);
  const [altitud, setAltitud] = useState<string>(defaultField2);
  const [proceso, setProceso] = useState<string>(defaultField3);
  const [activeEditingField, setActiveEditingField] = useState<string | null>(null);

  // Configuración Soberana de Visibilidad y Consentimiento Informado (LFPDPPP y Ley de Salvaguarda 2022)
  const [visibilityOption, setVisibilityOption] = useState<ArtisanVisibilityLevel>('nombre_comunidad');
  const [artisanFullName, setArtisanFullName] = useState<string>(
    isHandicraft ? 'Doña Rosalía Santiago Méndez' : isSombrero ? 'Don Margarito Cruz Bautista' : 'Don Efraín Bautista Santiago'
  );
  const [artisanFirstName, setArtisanFirstName] = useState<string>(
    isHandicraft ? 'Doña Rosalía' : isSombrero ? 'Don Margarito' : 'Don Efraín'
  );
  const [artisanCommunity, setArtisanCommunity] = useState<string>(
    isHandicraft ? 'San Juan Mixtepec, Tlaxiaco' : isSombrero ? 'San Juan Mixtepec, Tlaxiaco' : 'Magdalena Peñasco, Tlaxiaco'
  );
  const [artisanCooperative, setArtisanCooperative] = useState<string>(
    isHandicraft ? 'Colectivo de Tejedoras de Tijaltepec' : isHoney ? 'Unión de Apicultores de San Juan Ñumí' : 'Cooperativa de Productores Yuu Savi'
  );
  const [voiceConsentGiven, setVoiceConsentGiven] = useState<boolean>(true);
  const [voiceConsentLang, setVoiceConsentLang] = useState<'mix' | 'es'>(isMixteco ? 'mix' : 'mix');
  const [isPlayingConsentAudio, setIsPlayingConsentAudio] = useState<boolean>(false);

  const togglePlayConsentAudio = () => {
    if (isPlayingConsentAudio) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingConsentAudio(false);
      return;
    }

    setIsPlayingConsentAudio(true);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const textToSpeak =
        voiceConsentLang === 'mix'
          ? "Yu'u kaxi yu ja na koo sutu chi foto pieza yu nuu página Yucu, tasa na kuni na satá na. Soo kuati yu ja na kene yu kani ini yu."
          : "Otorgo mi consentimiento previo, libre e informado para que la fotografía y datos de mi pieza se muestren para venta en Yucu, conservando mi derecho a retirarlos o pausarlos cuando lo decida.";
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'es-MX';
      utterance.rate = 0.88;
      utterance.onend = () => setIsPlayingConsentAudio(false);
      utterance.onerror = () => setIsPlayingConsentAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingConsentAudio(false), 3500);
    }
  };

  const getResolvedDisplayName = () => {
    if (visibilityOption === 'cooperativa') return artisanCooperative;
    if (visibilityOption === 'nombre_comunidad') return `${artisanFirstName} · ${artisanCommunity.split(',')[0]}`;
    return artisanFullName;
  };

  const createInformedConsentRecord = (): InformedConsentRecord => {
    const resolvedName = getResolvedDisplayName();
    return {
      granted: voiceConsentGiven,
      visibilityLevel: visibilityOption,
      customDisplayName: resolvedName,
      cooperativeName: artisanCooperative,
      communityName: artisanCommunity,
      voiceConsentRecorded: voiceConsentGiven,
      voiceConsentLanguage: voiceConsentLang,
      consentTimestamp: new Date().toISOString(),
      isPubliclyVisible: true,
      zeroPiiBlockchainProof: {
        ledgerSequence: 52491802,
        sha256Digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        verified: true,
        note: 'Zero-PII On-Chain: La red Stellar solo contiene el hash criptográfico SHA-256. Ningún dato personal reside en el ledger permanente.'
      }
    };
  };

  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  // Lo que la IA ve en la foto. Es una SUGERENCIA, nunca un dictamen (#154; ADR-007, D3).
  const [aiDiagnosis, setAiDiagnosis] = useState<{
    /** null si la IA no reconoció el producto o si no hay con qué comparar. */
    matchesSelectedProduct: boolean | null;
    detectedItem: string | null;
    analysis: string;
    disclaimer: string;
    source: AISource;
  } | null>(null);
  /** Mensaje honesto cuando la IA no está o falló. */
  const [aiError, setAiError] = useState<string | null>(null);

  const [easyMode, setEasyMode] = useState<boolean>(elderMode);

  useEffect(() => {
    setEasyMode(elderMode);
  }, [elderMode]);

  // Synchronize photo and fields whenever the selected product profile changes
  useEffect(() => {
    setPhotoOneUrl(profile.defaultPhotoOne);
    setPhotoTwoUrl(null);
    setPhotoCount(1);
    setVariedad(profile.field1Default);
    setAltitud(profile.field2Default);
    setProceso(profile.field3Default);
    setAiDiagnosis(null);
    setAiError(null);
  }, [cleanProductName, profile.defaultPhotoOne]);

  const [isSpeakingDiagnosis, setIsSpeakingDiagnosis] = useState<boolean>(false);

  const handleSpeakDiagnosis = (customText?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (isSpeakingDiagnosis) {
      window.speechSynthesis.cancel();
      setIsSpeakingDiagnosis(false);
      return;
    }

    const textToRead =
      customText ||
      (aiDiagnosis
        ? `Sugerencia de la IA sobre su foto de ${profile.displayName}. ` +
          (aiDiagnosis.matchesSelectedProduct === false
            ? `Parece ${aiDiagnosis.detectedItem || 'otro producto'}, no ${profile.displayName}. `
            : '') +
          `${aiDiagnosis.analysis} ${aiDiagnosis.disclaimer}`
        : profile.assistiveGuideText);

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'es-MX';
    utterance.rate = 0.92; // Slightly slower for older adults
    utterance.onend = () => setIsSpeakingDiagnosis(false);
    utterance.onerror = () => setIsSpeakingDiagnosis(false);
    setIsSpeakingDiagnosis(true);
    window.speechSynthesis.speak(utterance);
  };

  // Reset scroll to top on mount so user always starts at the beginning sequentially
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Stop camera and audio stream on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioSessionRef.current) {
        audioSessionRef.current.cancel();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  const toggleVoiceNoteRecording = async () => {
    if (isRecording) {
      // STOP recording
      setIsRecording(false);
      setAudioVolume(0);
      if (audioSessionRef.current) {
        try {
          const result = await audioSessionRef.current.stop();
          audioSessionRef.current = null;
          const transcript =
            result.transcript ||
            liveVoiceTranscript ||
            `Lote registrado de ${selectedProductType} con verificación de campo en la Mixteca.`;

          setRecordedAudioNote({
            audioUrl: result.audioUrl,
            transcript,
            duration: formatTimer(result.durationSeconds || recordSeconds),
          });

          setVoiceToast('¡Nota de voz grabada y procesada con éxito!');
          setTimeout(() => setVoiceToast(null), 4000);
        } catch (err) {
          console.error('Error al detener grabación:', err);
          setVoiceToast('Error guardando audio. Intenta de nuevo.');
        }
      }
    } else {
      // START recording
      setLiveVoiceTranscript('');
      setVoiceToast(null);
      try {
        const session = await startAudioRecording({
          onVolumeChange: (vol) => setAudioVolume(vol),
          onInterimTranscript: (text) => setLiveVoiceTranscript(text),
          lang: 'es-MX',
        });
        audioSessionRef.current = session;
        setIsRecording(true);
      } catch (err: any) {
        console.warn('Mic permission error:', err);
        setIsRecording(false);
        setVoiceToast(
          'Permiso de micrófono no disponible en el navegador. Por favor permite el acceso al micrófono.'
        );
      }
    }
  };

  const toggleAudioPlayback = () => {
    if (!recordedAudioNote?.audioUrl) return;

    if (isPlayingAudio) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      setIsPlayingAudio(false);
    } else {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio(recordedAudioNote.audioUrl);
        audioElementRef.current.onended = () => setIsPlayingAudio(false);
      } else {
        audioElementRef.current.src = recordedAudioNote.audioUrl;
      }
      audioElementRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch((e) => console.warn('Audio play error:', e));
    }
  };

  const stopLiveCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  const applyPhotoUrl = (photoUrl: string, label: string = 'Foto tomada') => {
    if (targetSlot === 1) {
      setPhotoOneUrl(photoUrl);
    } else {
      setPhotoTwoUrl(photoUrl);
      setPhotoCount(2);
    }
    stopLiveCamera();
    setShowCameraModal(false);
    setPhotoSuccessToast(`📸 Muestra #${targetSlot} capturada y cargada con éxito`);
    setTimeout(() => setPhotoSuccessToast(null), 3500);

    // Automatically trigger AI Coffee State Detection on new photo
    triggerCoffeeVisionAnalysis(photoUrl);
  };

  const triggerCoffeeVisionAnalysis = async (photoUrlToAnalyze?: string) => {
    const activePhoto = photoUrlToAnalyze || photoTwoUrl || photoOneUrl;
    if (!activePhoto) return;

    setIsAnalyzingAI(true);
    try {
      // If it's a remote URL that isn't data:, convert or send directly
      let base64Data = activePhoto;
      if (!activePhoto.startsWith('data:image/')) {
        try {
          const imgFetch = await fetch(activePhoto);
          const blob = await imgFetch.blob();
          const reader = new FileReader();
          const dataUrlPromise = new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
          });
          reader.readAsDataURL(blob);
          base64Data = await dataUrlPromise;
        } catch {
          base64Data = activePhoto;
        }
      }

      setAiError(null);
      const result = await assistant.analyzeImage(base64Data, 'image/jpeg', profile.displayName);
      if (result.ok) {
        const expected = PROFILE_TO_LOT_CATEGORY[profile.key] ?? null;
        setAiDiagnosis({
          matchesSelectedProduct:
            expected && result.detectedCategory ? result.detectedCategory === expected : null,
          detectedItem: result.detectedItem,
          analysis: result.analysis,
          disclaimer: result.disclaimer,
          source: result.source,
        });
      } else {
        // Sin IA no hay diagnóstico de respaldo: se dice con honestidad (ADR-006, D4).
        setAiDiagnosis(null);
        setAiError(result.error);
      }
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const quickSamples = isPulque
    ? [
        {
          emoji: '🏺',
          label: 'Pulque Blanco',
          title: 'Pulque Blanco en Jícara Tradicional',
          url: 'https://images.unsplash.com/photo-1546853020-ca4909aef454?w=600&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🌱',
          label: 'Maguey Manso',
          title: 'Maguey Pulquero en Terreno',
          url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🥛',
          label: 'Tinacal',
          title: 'Tina de Fermentación de Aguamiel',
          url: 'https://images.unsplash.com/photo-1584285418504-0051b3d377d6?w=600&auto=format&fit=crop&q=80'
        },
        {
          emoji: '☕',
          label: 'Café (No Pulque)',
          title: 'Muestra Control Café',
          isControl: true,
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVqal830zp_JFXZ3K1_Rr7bbte3jwc_lJwXPf-TxcAcEg2raHlxCK89btRwH4uwzhF2fLfO_VmIZsA4gTepWeTnnrV6vLEcToMhwFBkbarbh5uwCol3bpetHUY8kzwnxJxVdtmqGOZThqZnec77V9oKnLql4l29d8XAJan9Acm66pPUlaO6eAOQymtE0KneK_qV0L0sOeux4_wReZWm6lmbXiAdjKdpv5FSyJqzx_42kMz_U4T3L2q_g'
        }
      ]
    : isHandicraft
    ? [
        {
          emoji: '🧵',
          label: 'Huipil',
          title: 'Muestra Huipil Telar',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5Ch3EnTKfOPzLhJvKhO3lCcPIUAE3hVVkfX5Im0s-WO1vCixJXClxdVdruWiPRqr3ZuxAzdlH3yAof7r8gqeX3gu9Ib76kDaeSl6pOyNhXt8PsFUfn2Jc7_xqUysoYwZ8H3nJ1yfgy2pOSZt3H-5XCr1VJuyIa-sigPM_rzR4gUCUs1ekNF4IJND5FqstPVswevuKVBQzWO0uds-_-hVuY5mZRW5VnjA9Ovw00rmRFDxpZZ5yIbtMBA'
        },
        {
          emoji: '🪡',
          label: 'Telar',
          title: 'Muestra Urdido en Telar',
          url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🧶',
          label: 'Hilado',
          title: 'Muestra Madeja de Hilado',
          url: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=600&auto=format&fit=crop&q=80'
        },
        {
          emoji: '☕',
          label: 'Café (No Textil)',
          title: 'Muestra Control Café',
          isControl: true,
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVqal830zp_JFXZ3K1_Rr7bbte3jwc_lJwXPf-TxcAcEg2raHlxCK89btRwH4uwzhF2fLfO_VmIZsA4gTepWeTnnrV6vLEcToMhwFBkbarbh5uwCol3bpetHUY8kzwnxJxVdtmqGOZThqZnec77V9oKnLql4l29d8XAJan9Acm66pPUlaO6eAOQymtE0KneK_qV0L0sOeux4_wReZWm6lmbXiAdjKdpv5FSyJqzx_42kMz_U4T3L2q_g'
        }
      ]
    : isSombrero
    ? [
        {
          emoji: '👒',
          label: 'Sombrero',
          title: 'Muestra Sombrero de Palma',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkQ_T-4HkMOGbUXCEL4WB3G-nckbk4y8MBXaW8RROxSTNJ7CpRum4bbwbnLCoYIsiGQouYyMcMM8EHk1DzR9XrOLMdVSb-RqJUa1aBk1p6JnwmWpKfFndzgY1CS6A1wg_wb_ZV0zrKj5zVgEEMN7Z3_m97Xx-9YigQ14ZAHHNVhaRXXI0nBiVqxjMXJ8MLMVi_gKnPRfs1qzravdO-6Uv0M8q2gl5pOM-K5nYvOyXYJ1GfD99czI_Ltw'
        },
        {
          emoji: '🧺',
          label: 'Tenate',
          title: 'Muestra Tenate de Palma',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADMzysc8buYnt4_J6N6fK3aJOpQwIXmK6rDrxaTI_kI2QHwPZaveZN-R-YpdSXJl83jv428Yd5_IFDtytjOVkkte6-yB6pXskpvxdiTLt3gQ4EoFSAS1SzELEaKKIDGkkY-oWJOM68851O2vaSsz92iubLVZ69vQp19ZYBqh38PsSqvSJ-_I0vXR4ZpTDTgoRrmCS2f5HnSOLlMZWIdp0uyeXZVn1fkdUzQelGLAyhj_tOsM-t8ikpbQ'
        },
        {
          emoji: '🌿',
          label: 'Tejido',
          title: 'Muestra Tejido Artesanal',
          url: 'https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=600&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🍯',
          label: 'Miel (No Palma)',
          title: 'Muestra Control Miel',
          isControl: true,
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8ZBROS9VsAw7NHM5L1DmOrsjS5_bgY5WUAX2CWi4t5af2aINWReGNta7MhraFl1vMglwJfhe52szbMFK3zJCSVdtzGS8Wxk4FAPcGg0ryh6r5SO--xklxpgEP7fXFnRFHhG28vL6IwUl3qW6cFysfAyubAB0o5lspYGGWJSMCYFqxBvweNm6W2qlz6HlxvvKjRiSwLsfBYXxK7Cv3WSoPy77qwwVCiEOx_s0cTXnQKPYnYNHr48piLg'
        }
      ]
    : isHoney
    ? [
        {
          emoji: '🍯',
          label: 'Miel Virgen',
          title: 'Muestra Frasco Miel Virgen',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8ZBROS9VsAw7NHM5L1DmOrsjS5_bgY5WUAX2CWi4t5af2aINWReGNta7MhraFl1vMglwJfhe52szbMFK3zJCSVdtzGS8Wxk4FAPcGg0ryh6r5SO--xklxpgEP7fXFnRFHhG28vL6IwUl3qW6cFysfAyubAB0o5lspYGGWJSMCYFqxBvweNm6W2qlz6HlxvvKjRiSwLsfBYXxK7Cv3WSoPy77qwwVCiEOx_s0cTXnQKPYnYNHr48piLg'
        },
        {
          emoji: '🐝',
          label: 'Apiario',
          title: 'Muestra Panal Colmena',
          url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🌼',
          label: 'Cosecha',
          title: 'Muestra Miel Cosechada',
          url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&auto=format&fit=crop&q=80'
        },
        {
          emoji: '☕',
          label: 'Café (No Miel)',
          title: 'Muestra Control Café',
          isControl: true,
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVqal830zp_JFXZ3K1_Rr7bbte3jwc_lJwXPf-TxcAcEg2raHlxCK89btRwH4uwzhF2fLfO_VmIZsA4gTepWeTnnrV6vLEcToMhwFBkbarbh5uwCol3bpetHUY8kzwnxJxVdtmqGOZThqZnec77V9oKnLql4l29d8XAJan9Acm66pPUlaO6eAOQymtE0KneK_qV0L0sOeux4_wReZWm6lmbXiAdjKdpv5FSyJqzx_42kMz_U4T3L2q_g'
        }
      ]
    : isCorn
    ? [
        {
          emoji: '🌽',
          label: 'Maíz Azul',
          title: 'Muestra Maíz y Frijol Criollo',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAx4jUpQopozBH8CYGA3m-Tfhex_UjwxY-4UKei8h4QhxSSmzObP9OdoONSXqi0XITG11whMMoDAOmA4bw0hSNWommPAh4F1D5ffA86lEaxrdfmf3kJ11rzljgIJllTeHX25OBP5QgRG79YiKsHHOLHgZPBf6D-AEEoGtbjiemIcHXuuXj7ZM1cyu0e6F19V9rkEX4nPjc7Dsc2w4tfJ_eHgPoPJzpuWKstIg6jmmd_4HM4ixO1PrSK4Q'
        },
        {
          emoji: '🌾',
          label: 'Milpa',
          title: 'Muestra Mazorca Milpa',
          url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80'
        },
        {
          emoji: '✨',
          label: 'Selección',
          title: 'Muestra Granos Seleccionados',
          url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&auto=format&fit=crop&q=80'
        },
        {
          emoji: '☕',
          label: 'Café (No Maíz)',
          title: 'Muestra Control Café',
          isControl: true,
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVqal830zp_JFXZ3K1_Rr7bbte3jwc_lJwXPf-TxcAcEg2raHlxCK89btRwH4uwzhF2fLfO_VmIZsA4gTepWeTnnrV6vLEcToMhwFBkbarbh5uwCol3bpetHUY8kzwnxJxVdtmqGOZThqZnec77V9oKnLql4l29d8XAJan9Acm66pPUlaO6eAOQymtE0KneK_qV0L0sOeux4_wReZWm6lmbXiAdjKdpv5FSyJqzx_42kMz_U4T3L2q_g'
        }
      ]
    : isTomato
    ? [
        {
          emoji: '🍅',
          label: 'Jitomate',
          title: 'Muestra Jitomates Frescos',
          url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🌱',
          label: 'Invernadero',
          title: 'Muestra Planta y Flor',
          url: 'https://images.unsplash.com/photo-1546470427-227c7369a9b2?w=600&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🧺',
          label: 'Caja',
          title: 'Muestra Caja de Selección',
          url: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&auto=format&fit=crop&q=80'
        },
        {
          emoji: '☕',
          label: 'Café (No Tomate)',
          title: 'Muestra Control Café',
          isControl: true,
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVqal830zp_JFXZ3K1_Rr7bbte3jwc_lJwXPf-TxcAcEg2raHlxCK89btRwH4uwzhF2fLfO_VmIZsA4gTepWeTnnrV6vLEcToMhwFBkbarbh5uwCol3bpetHUY8kzwnxJxVdtmqGOZThqZnec77V9oKnLql4l29d8XAJan9Acm66pPUlaO6eAOQymtE0KneK_qV0L0sOeux4_wReZWm6lmbXiAdjKdpv5FSyJqzx_42kMz_U4T3L2q_g'
        }
      ]
    : profile.key === 'otro'
    ? [
        ...profile.sampleChips.map((chip) => ({
          emoji: chip.emoji,
          label: chip.label,
          title: chip.title,
          url: chip.url
        })),
        {
          emoji: '☕',
          label: 'Café (Control)',
          title: 'Muestra Control Café (No Corresponde)',
          isControl: true,
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVqal830zp_JFXZ3K1_Rr7bbte3jwc_lJwXPf-TxcAcEg2raHlxCK89btRwH4uwzhF2fLfO_VmIZsA4gTepWeTnnrV6vLEcToMhwFBkbarbh5uwCol3bpetHUY8kzwnxJxVdtmqGOZThqZnec77V9oKnLql4l29d8XAJan9Acm66pPUlaO6eAOQymtE0KneK_qV0L0sOeux4_wReZWm6lmbXiAdjKdpv5FSyJqzx_42kMz_U4T3L2q_g'
        }
      ]
    : [
        {
          emoji: '🍒',
          label: 'Cereza',
          title: 'Muestra Cereza',
          url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
        },
        {
          emoji: '☕',
          label: 'Pergamino',
          title: 'Muestra Pergamino',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVqal830zp_JFXZ3K1_Rr7bbte3jwc_lJwXPf-TxcAcEg2raHlxCK89btRwH4uwzhF2fLfO_VmIZsA4gTepWeTnnrV6vLEcToMhwFBkbarbh5uwCol3bpetHUY8kzwnxJxVdtmqGOZThqZnec77V9oKnLql4l29d8XAJan9Acm66pPUlaO6eAOQymtE0KneK_qV0L0sOeux4_wReZWm6lmbXiAdjKdpv5FSyJqzx_42kMz_U4T3L2q_g'
        },
        {
          emoji: '🪵',
          label: 'Tostado',
          title: 'Muestra Tostado',
          url: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=600&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🍯',
          label: 'Miel (No Café)',
          title: 'Muestra Miel (No Café)',
          isControl: true,
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8ZBROS9VsAw7NHM5L1DmOrsjS5_bgY5WUAX2CWi4t5af2aINWReGNta7MhraFl1vMglwJfhe52szbMFK3zJCSVdtzGS8Wxk4FAPcGg0ryh6r5SO--xklxpgEP7fXFnRFHhG28vL6IwUl3qW6cFysfAyubAB0o5lspYGGWJSMCYFqxBvweNm6W2qlz6HlxvvKjRiSwLsfBYXxK7Cv3WSoPy77qwwVCiEOx_s0cTXnQKPYnYNHr48piLg'
        }
      ];

  const handleDirectCamera = (slot: 1 | 2) => {
    setTargetSlot(slot);
    stopLiveCamera();
    setShowCameraModal(false);
    // Directly trigger native camera capture input
    setTimeout(() => {
      cameraInputRef.current?.click();
    }, 50);
  };

  const handleDirectGallery = (slot: 1 | 2) => {
    setTargetSlot(slot);
    stopLiveCamera();
    setShowCameraModal(false);
    setTimeout(() => {
      galleryInputRef.current?.click();
    }, 50);
  };

  const startLiveCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    setCameraError(null);
    stopLiveCamera();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador no soporta visor web en vivo.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      mediaStreamRef.current = stream;
      setIsLiveCameraActive(true);
      setCameraFacing(facing);
    } catch (err: any) {
      console.warn('Error accediendo al visor de cámara:', err);
      setCameraError(
        'El visor web fue restringido por el navegador o iframe. Usa el botón "Abrir Cámara del Dispositivo" para tomar la foto con tu app de cámara.'
      );
      setIsLiveCameraActive(false);
    }
  };

  const handleCaptureRealPhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth > 0 ? video.videoWidth : 1280;
      canvas.height = video.videoHeight > 0 ? video.videoHeight : 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        applyPhotoUrl(photoDataUrl, 'Cámara web');
      }
    } catch (e) {
      console.error('Error al capturar:', e);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const photoUrl = uploadEvent.target?.result as string;
      if (photoUrl) {
        applyPhotoUrl(photoUrl, file.name);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const labelField1 = profile.field1Label;
  const labelField2 = profile.field2Label;
  const labelField3 = profile.field3Label;

  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationStep, setValidationStep] = useState<number>(1);

  const handleSendValidation = async () => {
    // If working without network coverage in the mountain parcel, persist to IndexedDB immediately
    if (!isOnline) {
      try {
        const offlineRecord: PendingOfflineLot = {
          tempId: `PARCELA-${Date.now()}`,
          producerName: 'Don Eutiquio (Productor Mixteco)',
          community: 'Santa María Cuquila, Tlaxiaco',
          cropType: isCoffee ? 'cafe' : isHoney ? 'miel' : isPulque ? 'pulque' : 'artesania',
          variety: variedad || profile.displayName,
          weightKgOrUnits: profile.defaultVolume || 50,
          priceExpectedMxn: profile.defaultPrice || 120,
          photoDataUrl: photoOneUrl,
          recordedAt: Date.now(),
          syncStatus: 'pending'
        };
        await saveOfflineLot(offlineRecord);
      } catch (err) {
        console.warn('Error guardando en almacenamiento fuera de línea:', err);
      }
    }

    setIsValidating(true);
    setValidationStep(1);

    setTimeout(() => {
      setValidationStep(2);
    }, 800);

    setTimeout(() => {
      setValidationStep(3);
    }, 1600);

    setTimeout(() => {
      setIsValidating(false);
      if (onLotCreated) {
        const consentRecord = createInformedConsentRecord();
        const finalProducerName = getResolvedDisplayName();
        const finalLocation = visibilityOption === 'cooperativa' ? 'Comunidades Unidas de la Mixteca Alta' : artisanCommunity;

        if (isPulque) {
          onLotCreated({
            title: 'Pulque Tradicional de Maguey Mixteco',
            productType: 'Bebidas Tradicionales',
            variety: variedad,
            altitude: altitud,
            process: proceso,
            imageUrl: photoOneUrl,
            producerName: finalProducerName,
            location: finalLocation,
            informedConsent: consentRecord,
            tags: profile.lotTags,
            pricePerKg: profile.defaultPrice,
            volumeKg: profile.defaultVolume,
            notes: 'Pulque blanco artesanal elaborado a partir de aguamiel de maguey mixteco en tinacal tradicional.'
          });
        } else if (isHandicraft) {
          onLotCreated({
            title: 'Rebozo Tradicional en Telar de Cintura',
            productType: 'Textil Mixteco',
            variety: variedad,
            altitude: altitud,
            process: proceso,
            imageUrl: photoOneUrl,
            producerName: finalProducerName,
            location: finalLocation,
            informedConsent: consentRecord,
            tags: ['Telar de cintura', 'Grana cochinilla', 'Artesanía Certificada', 'Mixteca Alta'],
            pricePerKg: 1850,
            volumeKg: 1,
            notes: 'Pieza artesanal única tejida a mano en telar de cintura con hilos teñidos vegetalmente.'
          });
        } else if (isSombrero) {
          const isTenateItem =
            variedad?.toLowerCase().includes('tenate') ||
            profile.displayName?.toLowerCase().includes('tenate') ||
            selectedProductType?.toLowerCase().includes('tenate');

          onLotCreated({
            title: isTenateItem ? 'Tenate Ceremonial de Palma Dulce' : 'Sombrero Costeño de Palma Fina',
            productType: isTenateItem ? 'Cestería & Tejido de Palma' : 'Tejido de Palma',
            variety: variedad,
            altitude: altitud,
            process: proceso,
            imageUrl: photoOneUrl,
            producerName: finalProducerName,
            location: finalLocation,
            informedConsent: consentRecord,
            tags: isTenateItem
              ? ['Tenate tradicional', 'Palma dulce', 'Doble nudo', 'Artesanía Certificada', 'Mixteca Alta']
              : ['Palma dulce', 'Hecho a mano', 'Artesanía Certificada'],
            pricePerKg: isTenateItem ? 380 : 350,
            volumeKg: isTenateItem ? 3 : 1,
            notes: isTenateItem
              ? 'Tenate tradicional mixteco tejido a mano con palma dulce y tintes naturales.'
              : 'Sombrero tradicional tejido a mano con palma dulce de la Mixteca.'
          });
        } else if (isHoney) {
          onLotCreated({
            title: 'Miel Virgen de Campanilla Silvestre',
            productType: 'Miel Pura Orgánica',
            variety: variedad,
            altitude: altitud,
            process: proceso,
            imageUrl: photoOneUrl,
            producerName: finalProducerName,
            location: finalLocation,
            informedConsent: consentRecord,
            tags: ['Sin adulteración', 'Floración silvestre', 'Pura de abeja'],
            pricePerKg: 180,
            volumeKg: 25,
            notes: 'Miel virgen cosechada en apiarios de la Mixteca Alta, sin calentar ni pasteurizar.'
          });
        } else if (isCorn) {
          onLotCreated({
            title: 'Maíz Azul Criollo de la Mixteca',
            productType: 'Grano Criollo Nativo',
            variety: variedad,
            altitude: altitud,
            process: proceso,
            imageUrl: photoOneUrl,
            producerName: finalProducerName,
            location: finalLocation,
            informedConsent: consentRecord,
            tags: ['Libre de OGM', 'Milpa comunitaria', 'Grano nativo'],
            pricePerKg: 22,
            volumeKg: 450,
            notes: 'Maíz nativo criollo cultivado en milpa tradicional con frijol y calabaza.'
          });
        } else if (isTomato) {
          onLotCreated({
            title: 'Jitomate Saladette Agroecológico',
            productType: 'Hortaliza Agroecológica',
            variety: variedad,
            altitude: altitud,
            process: proceso,
            imageUrl: photoOneUrl,
            producerName: finalProducerName,
            location: finalLocation,
            informedConsent: consentRecord,
            tags: ['Libre de pesticidas', 'Cosecha fresca', 'Riego limpio', 'Mixteca Alta'],
            pricePerKg: 32,
            volumeKg: 180,
            notes: 'Jitomate cultivado sin agroquímicos sintéticos en invernadero comunitario de la Mixteca.'
          });
        } else if (profile.key === 'otro') {
          onLotCreated({
            title: `${profile.displayName} (${variedad})`,
            productType: profile.displayName,
            variety: variedad,
            altitude: altitud,
            process: proceso,
            imageUrl: photoOneUrl,
            producerName: finalProducerName,
            location: finalLocation,
            informedConsent: consentRecord,
            tags: profile.lotTags,
            pricePerKg: profile.defaultPrice,
            volumeKg: profile.defaultVolume,
            notes: `Lote registrado de ${profile.displayName} cosechado/elaborado por productores de la Mixteca.`
          });
        } else {
          onLotCreated({
            title: `Café ${variedad}`,
            productType: 'Café de Especialidad',
            variety: variedad,
            altitude: altitud,
            process: proceso,
            imageUrl: photoOneUrl,
            producerName: finalProducerName,
            location: finalLocation,
            informedConsent: consentRecord,
            tags: ['Cero broca', 'Grano parejo', 'Fermentación en frío', 'NMX-F-083']
          });
        }
      }
      onNavigateScreen('pasaporte_digital');
    }, 2400);
  };

  return (
    <main className="flex-1 w-full max-w-md mx-auto px-4 py-2 flex flex-col gap-4 pb-36">
      {/* Offline Rural Indicator Banner: ONLY when disconnected */}
      {!isOnline && (
        <div className="bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-400/90 rounded-2xl p-3 shadow-xs flex items-center gap-2.5 text-[#a73918]">
          <span className="material-symbols-outlined text-[24px] text-orange-700 shrink-0 animate-bounce">
            cloud_off
          </span>
          <div className="text-[12px] leading-tight">
            <strong className="block font-black text-[#032517] text-[13px]">
              🏕️ Modo Parcela Sin Internet
            </strong>
            <span className="text-[#a73918] font-medium">
              Puedes tomar fotos, notas de voz y registrar tu cosecha. Se guardará de forma segura en este teléfono hasta tener señal en el pueblo.
            </span>
          </div>
        </div>
      )}

      {/* Navigation and Context Step Badge & Modo Fácil Toggle */}
      <div className="pt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onNavigateScreen('catalogo_producto')}
            className="inline-flex items-center gap-1 font-bold text-[#032517] hover:text-[#a73918] bg-white rounded-full border border-[#c1c8c2]/50 shadow-2xs px-2.5 py-1 text-[12px] active:scale-95 transition-all cursor-pointer"
            title="Cambiar de producto o volver al catálogo"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Cambiar</span>
          </button>
          <div className="inline-flex items-center gap-1.5 bg-[#f0eee8] px-2.5 py-1 rounded-full border border-[#c1c8c2]/40">
            <span className="w-2 h-2 rounded-full bg-[#a73918]"></span>
            <span className="text-[12px] text-[#1c1c18] font-bold truncate max-w-[130px] sm:max-w-none">
              Paso 3 de 4 · {profile.displayName}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setEasyMode(!easyMode)}
          className={`px-2.5 py-1 rounded-full text-[11px] sm:text-[12px] font-extrabold flex items-center gap-1 border transition-all cursor-pointer ${
            easyMode
              ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-2xs'
              : 'bg-white text-[#424843] border-[#c1c8c2]/60 hover:bg-[#f0eee8]'
          }`}
          title="Activar o desactivar modo simplificado para personas mayores"
        >
          <span>👴🏽</span>
          <span>{easyMode ? 'Modo Fácil Activo' : 'Activar Modo Fácil'}</span>
        </button>
      </div>

      {/* Elder Assistance Card (Zero Friction Guide) */}
      {easyMode && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-3.5 border-2 border-amber-300/80 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[24px]">elderly</span>
          </div>
          <div className="flex-1 text-[13px] text-amber-950">
            <div className="font-extrabold flex items-center justify-between">
              <span>Guía Asistida para Personas Mayores</span>
              <button
                type="button"
                onClick={() => handleSpeakDiagnosis()}
                className="text-[11px] bg-white hover:bg-amber-100 text-amber-950 font-bold px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <span className="material-symbols-outlined text-[15px] text-amber-700">
                  {isSpeakingDiagnosis ? 'volume_off' : 'volume_up'}
                </span>
                <span>{isSpeakingDiagnosis ? 'Detener Voz' : 'Escuchar Guía'}</span>
              </button>
            </div>
            <p className="mt-1 text-[12px] leading-snug text-amber-900/90 font-medium">
              {profile.assistiveGuideText}
            </p>
          </div>
        </div>
      )}

      {/* Bubble 1: Assistant instructions */}
      <section className="flex flex-col gap-1 items-start">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-[#032517] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[16px]">school</span>
          </div>
          <span className="text-[13px] font-bold text-[#032517]">TecNM Tlaxiaco • Guía Comunitario</span>
          <span className="text-[11px] text-[#424843]">Hoy 10:42 AM</span>
        </div>

        <div className="bg-[#f6f3ed] text-[#032517] rounded-2xl rounded-tl-xs p-4 shadow-xs max-w-[96%] border border-[#c1c8c2]/30">
          <p className="text-[15px] leading-relaxed text-[#1c1c18] font-medium">
            {profile.assistantPromptText}
          </p>
          <div className="mt-3 pt-3 border-t border-[#c1c8c2]/40 flex items-center justify-between text-[#1c1c18] text-[13px]">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-[18px] text-[#a73918]">verified</span>
              {profile.verificationBadge}
            </span>
            <span className="text-[12px] italic text-[#424843]">
              {profile.verificationSubtitle}
            </span>
          </div>
        </div>
      </section>

      {/* Photo Upload Module */}
      <section className="bg-white rounded-2xl p-4 border border-[#c1c8c2]/50 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a73918]">add_photo_alternate</span>
            <h2 className="text-[16px] font-bold text-[#032517]">
              {isHandicraft || isSombrero ? 'Muestras de la Pieza' : isPulque ? 'Muestras de Pulque / Tinacal' : 'Muestras de Cosecha'}
            </h2>
          </div>
          <span className="text-[12px] text-[#424843] bg-[#f0eee8] px-2.5 py-0.5 rounded-full font-medium">
            {photoCount} de 2 capturadas
          </span>
        </div>

        {/* Previews Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Preview Card 1: Allows retaking or taking real photo */}
          <div className="relative rounded-2xl overflow-hidden border border-[#c1c8c2] aspect-square bg-[#f0eee8] flex flex-col group shadow-xs">
            <img
              src={photoOneUrl}
              alt="Muestra de producto"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#032517]/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
              <div className="flex items-center justify-between text-white">
                <span className="text-[12px] font-semibold">Muestra #1</span>
                <button
                  type="button"
                  onClick={() => {
                    setTargetSlot(1);
                    setShowCameraModal(true);
                  }}
                  className="bg-white/20 hover:bg-white/40 px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-0.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[12px]">photo_camera</span>
                  Cambiar
                </button>
              </div>
            </div>
          </div>

          {/* Upload Slot 2: Add or show photo 2 */}
          {!photoTwoUrl ? (
            <div className="min-h-[48px] aspect-square rounded-2xl border-2 border-dashed border-[#a73918]/60 bg-[#ffdbd1]/20 hover:bg-[#ffdbd1]/30 transition-all flex flex-col items-center justify-between p-2.5 text-center shadow-xs">
              <button
                type="button"
                onClick={() => handleDirectCamera(2)}
                className="w-full flex-1 flex flex-col items-center justify-center gap-1.5 cursor-pointer group active:scale-95 transition-all"
                title="Abrir cámara del teléfono o dispositivo"
              >
                <div className="w-11 h-11 rounded-full bg-[#a73918] group-hover:bg-[#8e2e12] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-extrabold text-[#a73918]">Tomar Foto Real</span>
                  <span className="text-[10px] text-[#424843]">Abre tu cámara</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetSlot(2);
                  setShowCameraModal(true);
                }}
                className="w-full mt-1 py-1 px-2 rounded-lg bg-white/80 hover:bg-white text-[#032517] text-[10px] font-bold border border-[#c1c8c2]/50 shadow-2xs transition-colors cursor-pointer"
              >
                Más opciones...
              </button>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-[#c1c8c2] aspect-square bg-[#f0eee8] flex flex-col group shadow-xs">
              <img
                src={photoTwoUrl}
                alt="Muestra #2"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#032517]/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                <div className="flex items-center justify-between text-white">
                  <span className="text-[12px] font-semibold">Muestra #2</span>
                  <span className="material-symbols-outlined text-[16px] text-[#c7ebd4]">check_circle</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPhotoTwoUrl(null);
                  setPhotoCount(1);
                }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center active:scale-95 cursor-pointer"
                title="Quitar foto"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}
        </div>

        {/* Defect Checklist */}
        <div className="bg-[#f6f3ed] rounded-xl p-3 flex items-start gap-2 text-[#424843] border border-[#c1c8c2]/30">
          <span className="material-symbols-outlined text-[18px] text-[#a73918] mt-0.5">info</span>
          <p className="text-[12px] leading-relaxed text-[#1c1c18]">
            {profile.defectCheckText}
          </p>
        </div>

        {/* AI Product State Detection Card */}
        <div className="rounded-2xl border-2 border-emerald-600/40 bg-gradient-to-br from-emerald-50/90 via-white to-[#f0eee8] p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#032517] text-white flex items-center justify-center shadow-xs shrink-0">
                <span className="material-symbols-outlined text-[22px] text-emerald-400">psychology</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[14px] font-extrabold text-[#032517]">
                    Evaluación de Calidad con IA
                  </span>
                  <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    TecNM Tlaxiaco
                  </span>
                </div>
                <span className="text-[11px] text-[#424843] block mt-0.5">
                  {profile.aiEvaluatingSubtitle}
                </span>
              </div>
            </div>

            {aiDiagnosis && (
              <button
                type="button"
                onClick={() => handleSpeakDiagnosis()}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-[#032517] border border-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
                title="Escuchar la sugerencia en voz alta"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-700">
                  {isSpeakingDiagnosis ? 'volume_off' : 'volume_up'}
                </span>
                <span>{isSpeakingDiagnosis ? 'Pausar' : 'Escuchar'}</span>
              </button>
            )}
          </div>

          {/* Diagnosis Result or Call to Action */}
          {aiDiagnosis ? (
            <div
              className={`rounded-2xl p-3.5 border-2 shadow-xs flex flex-col gap-3 text-[13px] ${
                aiDiagnosis.matchesSelectedProduct === false
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-white border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[24px] text-[#424843]">
                    {aiDiagnosis.matchesSelectedProduct === false ? 'warning' : 'lightbulb'}
                  </span>
                  <span className="text-[14px] font-extrabold text-[#032517]">Lo que ve la IA (sugerencia)</span>
                </div>
                {aiDiagnosis.source === 'simulated' && <DemoBadge detail="Respuesta de demostración." />}
              </div>

              {aiDiagnosis.matchesSelectedProduct === false && (
                <div className="bg-white p-3 rounded-xl border border-amber-300 text-amber-950 text-[13px] leading-snug">
                  Parece {aiDiagnosis.detectedItem || 'otro producto'}, no {profile.displayName}. Revise la foto antes de seguir.
                </div>
              )}

              <div className="text-[13px] leading-relaxed whitespace-pre-line p-2.5 rounded-xl border bg-[#f6f3ed] text-[#1c1c18] border-[#c1c8c2]/50">
                {aiDiagnosis.analysis}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-[#424843] leading-tight flex-1">{aiDiagnosis.disclaimer}</span>
                <button
                  type="button"
                  onClick={() => triggerCoffeeVisionAnalysis()}
                  disabled={isAnalyzingAI}
                  className="px-3 py-1.5 rounded-xl bg-[#032517] hover:bg-[#1b3b2b] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-50 shrink-0"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  <span>Revisar otra vez</span>
                </button>
              </div>
            </div>
          ) : isAnalyzingAI ? (
            <div className="bg-white rounded-2xl p-5 border-2 border-emerald-300 flex flex-col items-center justify-center gap-2.5 text-center py-6 shadow-sm">
              <span className="material-symbols-outlined text-[36px] text-emerald-600 animate-spin">
                sync
              </span>
              <span className="text-[15px] font-extrabold text-[#032517]">
                {profile.aiEvaluatingText}
              </span>
              <span className="text-[12px] text-[#424843]">
                {profile.aiEvaluatingSubtitle}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {aiError && (
                <div role="status" className="bg-amber-50 text-amber-950 border border-amber-300 rounded-xl p-3 text-[13px] font-bold">
                  {aiError}
                </div>
              )}
              {/* Giant Accessible Button for Older Adults */}
              <button
                type="button"
                onClick={() => triggerCoffeeVisionAnalysis()}
                disabled={isAnalyzingAI}
                className="w-full min-h-[52px] py-3 px-4 rounded-2xl bg-[#032517] hover:bg-[#153a27] text-white text-[15px] font-extrabold flex items-center justify-center gap-2.5 shadow-md cursor-pointer transition-all active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-[24px] text-emerald-400">
                  search_check
                </span>
                <span>TOCAR AQUÍ PARA QUE LA IA MIRE LA FOTO</span>
              </button>

              <div className="bg-white/90 rounded-xl p-2.5 border border-dashed border-emerald-400/80 text-[12px] text-[#424843] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-700 text-[18px]">verified</span>
                  <span>La IA le dice lo que ve en la foto. Es una sugerencia, no un dictamen.</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDirectCamera(1)}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-[11px] font-bold border border-amber-300 shrink-0 cursor-pointer"
                >
                  📷 Tomar Foto
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bubble 2: Parcel pre-filled metadata */}
      <section className="flex flex-col gap-2 items-start">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-[#032517] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[16px]">school</span>
          </div>
          <span className="text-[13px] font-bold text-[#032517]">TecNM Tlaxiaco • Guía Comunitario</span>
        </div>

        <div className="bg-[#f6f3ed] text-[#032517] rounded-2xl rounded-tl-xs p-4 shadow-xs w-full border border-[#c1c8c2]/30 flex flex-col gap-3">
          <p className="text-[15px] leading-relaxed text-[#1c1c18] font-medium">
            {isHandicraft || isSombrero
              ? 'Indica los datos de tu pieza artesanal o grábalo en una nota de voz. Puedes editar cualquier dato tocando el lápiz:'
              : isPulque
              ? 'Indica los datos de tu pulque o tinacal o grábalo en una nota de voz. Puedes editar cualquier dato tocando el lápiz:'
              : isHoney
              ? 'Indica los datos de tu apiario o grábalo en una nota de voz. Puedes editar cualquier dato tocando el lápiz:'
              : 'Indica los datos de tu cosecha o grábalo en una nota de voz. Hemos prellenado los datos de tu parcela registrada:'}
          </p>

          {/* Pre-filled cards */}
          <div className="space-y-2 pt-1">
            {/* 1. Variedad / Técnica */}
            <div className="bg-white rounded-xl p-3 flex items-center justify-between border border-[#c1c8c2]/40 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#a73918] text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <div>
                  <div className="text-[11px] font-bold text-[#424843] uppercase tracking-wider">
                    {labelField1}
                  </div>
                  {activeEditingField === 'variedad' ? (
                    <input
                      type="text"
                      value={variedad}
                      onChange={(e) => setVariedad(e.target.value)}
                      onBlur={() => setActiveEditingField(null)}
                      autoFocus
                      className="text-[15px] font-semibold text-[#032517] border-b border-[#a73918] outline-none"
                    />
                  ) : (
                    <div className="text-[15px] text-[#032517] font-semibold">{variedad}</div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveEditingField(activeEditingField === 'variedad' ? null : 'variedad')}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#424843] hover:bg-[#f0eee8]"
                aria-label={`Editar ${labelField1}`}
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>

            {/* 2. Altitud / Material */}
            <div className="bg-white rounded-xl p-3 flex items-center justify-between border border-[#c1c8c2]/40 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#a73918] text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <div>
                  <div className="text-[11px] font-bold text-[#424843] uppercase tracking-wider">
                    {labelField2}
                  </div>
                  {activeEditingField === 'altitud' ? (
                    <input
                      type="text"
                      value={altitud}
                      onChange={(e) => setAltitud(e.target.value)}
                      onBlur={() => setActiveEditingField(null)}
                      autoFocus
                      className="text-[15px] font-semibold text-[#032517] border-b border-[#a73918] outline-none"
                    />
                  ) : (
                    <div className="text-[15px] text-[#032517] font-semibold">{altitud}</div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveEditingField(activeEditingField === 'altitud' ? null : 'altitud')}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#424843] hover:bg-[#f0eee8]"
                aria-label={`Editar ${labelField2}`}
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>

            {/* 3. Proceso / Elaboración */}
            <div className="bg-white rounded-xl p-3 flex items-center justify-between border border-[#c1c8c2]/40 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#a73918] text-white flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <div>
                  <div className="text-[11px] font-bold text-[#424843] uppercase tracking-wider">
                    {labelField3}
                  </div>
                  {activeEditingField === 'proceso' ? (
                    <input
                      type="text"
                      value={proceso}
                      onChange={(e) => setProceso(e.target.value)}
                      onBlur={() => setActiveEditingField(null)}
                      autoFocus
                      className="text-[15px] font-semibold text-[#032517] border-b border-[#a73918] outline-none"
                    />
                  ) : (
                    <div className="text-[15px] text-[#032517] font-semibold">{proceso}</div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveEditingField(activeEditingField === 'proceso' ? null : 'proceso')}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#424843] hover:bg-[#f0eee8]"
                aria-label={`Editar ${labelField3}`}
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>
          </div>

          {/* Voice Input Recorder - Primary Voice-First Option (Variant-Friendly) */}
          <div className="pt-1 flex flex-col gap-2">
            <div className={`p-3 rounded-2xl border transition-all ${
              isRecording
                ? 'bg-red-50 border-red-300 shadow-md ring-2 ring-red-400'
                : 'bg-[#fffaf5] border-[#fe7952]/60 shadow-xs'
            }`}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleVoiceNoteRecording}
                  className={`w-14 h-14 rounded-full text-white flex items-center justify-center shrink-0 active:scale-95 shadow-md cursor-pointer transition-transform ${
                    isRecording ? 'bg-red-600 animate-pulse' : 'bg-[#a73918] hover:bg-[#8c2d12]'
                  }`}
                  title={isRecording ? 'Detener y guardar audio' : 'Grabar tu voz en tu lengua'}
                  aria-label={isRecording ? 'Detener grabación de voz' : 'Grabar descripción en tu lengua materna'}
                >
                  <span className="material-symbols-outlined text-[30px]">
                    {isRecording ? 'stop' : 'mic'}
                  </span>
                </button>
                <div className="flex-1 overflow-hidden">
                  <div className="text-[14px] text-[#032517] font-extrabold truncate flex items-center gap-1.5">
                    {isRecording && <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping inline-block" />}
                    <span>{isRecording ? 'Escuchando tu voz...' : '🗣️ Habla en tu lengua materna'}</span>
                  </div>
                  <div className="text-[12px] text-[#424843] leading-snug">
                    {isRecording
                      ? liveVoiceTranscript
                        ? `"${liveVoiceTranscript}"`
                        : 'Grabando audio de origen...'
                      : 'Graba en tu variante (Mixteco, Zapoteco o Español). No necesitas escribir.'}
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className={`text-[13px] font-mono font-black ${isRecording ? 'text-red-700 animate-pulse' : 'text-[#a73918]'}`}>
                    {formatTimer(recordSeconds)}
                  </span>
                  <span className="text-[10px] text-[#727973] uppercase font-bold">
                    {isRecording ? 'REC' : 'VOZ'}
                  </span>
                </div>
              </div>
            </div>

            {/* Live audio level meter when recording */}
            {isRecording && (
              <div className="flex items-center gap-2 px-2">
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider flex items-center gap-1">
                  Volumen:
                </span>
                <div className="flex-1 h-1.5 bg-[#dcdad4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-75"
                    style={{ width: `${Math.max(8, audioVolume)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-[#424843]">{audioVolume}%</span>
              </div>
            )}

            {/* Toast notification */}
            {voiceToast && (
              <div className="text-[11px] font-medium text-[#032517] bg-[#e7f3ec] border border-[#a1d1b5] px-3 py-1.5 rounded-xl flex items-center justify-between">
                <span>{voiceToast}</span>
                <button
                  type="button"
                  onClick={() => setVoiceToast(null)}
                  className="text-[#424843] text-[13px] ml-1"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* User Chat Bubble Preview with playable audio note */}
      <div className="flex justify-end">
        <div className="bg-[#1b3b2b] text-white rounded-2xl rounded-tr-xs p-3.5 max-w-[92%] shadow-xs flex flex-col gap-2">
          {recordedAudioNote ? (
            <div>
              {/* Playable audio chip */}
              <div className="flex items-center gap-2.5 bg-black/25 rounded-xl p-2 mb-1.5 border border-white/15">
                <button
                  type="button"
                  onClick={toggleAudioPlayback}
                  className="w-8 h-8 rounded-full bg-[#a73918] hover:bg-[#8c2d12] text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition-transform active:scale-95"
                  title={isPlayingAudio ? 'Pausar audio' : 'Reproducir nota de voz'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isPlayingAudio ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <div className="flex-1 flex flex-col">
                  <span className="text-[11px] font-bold text-[#c7ebd4] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">mic</span>
                    Nota de voz grabada ({recordedAudioNote.duration})
                  </span>
                  <div className="flex items-center gap-1 h-2 mt-0.5">
                    {[40, 75, 55, 90, 60, 85, 45, 70, 95, 50, 80, 65, 40].map((h, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full ${
                          isPlayingAudio ? 'bg-[#ffdbd1] animate-pulse' : 'bg-white/40'
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[13px] leading-relaxed text-[#fcf9f3]">
                "{recordedAudioNote.transcript}"
              </p>
            </div>
          ) : (
            <p className="text-[14px] leading-relaxed text-[#fcf9f3]">
              {isPulque
                ? 'Pulque blanco tradicional elaborado con aguamiel de maguey mixteco en tinacal comunitario.'
                : isHandicraft || isSombrero
                ? 'Pieza elaborada artesanalmente a mano con técnicas ancestrales de la Mixteca Alta.'
                : isHoney
                ? 'Miel virgen cosechada en apiarios de la Mixteca Alta, floración silvestre.'
                : 'Lote cosechado en la ladera sur de la Mixteca. Secado natural y selección artesanal.'}
            </p>
          )}

          <div className="flex items-center justify-end gap-1 text-[#83a590] text-[11px]">
            <span>{recordedAudioNote ? 'Audio verificado' : '10:44 AM'}</span>
            <span className="material-symbols-outlined text-[14px]">done_all</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN CRÍTICA: Nivel de Visibilidad y Consentimiento Informado (Autodeterminación Indígena) */}
      <section className="bg-white rounded-2xl p-4.5 border-2 border-[#a73918]/30 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#c1c8c2]/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#ffdbd1] text-[#a73918] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <div>
              <h3 className="text-[14px] font-black text-[#032517]">
                Nivel de Visibilidad y Consentimiento
              </h3>
              <p className="text-[11px] text-[#424843]">
                Autodeterminación comunitaria · Ley de Salvaguarda 2022
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-[#c7ebd4] text-[#002113] px-2 py-0.5 rounded-full">
            Tú Decides
          </span>
        </div>

        <p className="text-[12.5px] text-[#1c1c18] leading-relaxed">
          La ley protege que <strong>tú decidas libremente qué datos se publican</strong> para vender.
          Elige cómo deseas que aparezca tu autoría en la vitrina digital:
        </p>

        {/* 3 Opciones Claras de Visibilidad */}
        <div className="space-y-2">
          {/* Opción 1: Nombre Completo */}
          <label
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              visibilityOption === 'nombre_completo'
                ? 'bg-[#fcf9f3] border-[#a73918] ring-1 ring-[#a73918]'
                : 'bg-white border-[#c1c8c2]/60 hover:bg-[#fcf9f3]/60'
            }`}
          >
            <input
              type="radio"
              name="visibilityLevel"
              value="nombre_completo"
              checked={visibilityOption === 'nombre_completo'}
              onChange={() => setVisibilityOption('nombre_completo')}
              className="mt-1 text-[#a73918] focus:ring-[#a73918]"
            />
            <div className="flex-1 text-[12px]">
              <span className="font-extrabold text-[#032517] block">
                1. Mostrar mi nombre completo
              </span>
              <span className="text-[#424843] block text-[11px] leading-tight mt-0.5">
                Para consolidar tu marca o firma artesanal personal ante compradores directos.
              </span>
              {visibilityOption === 'nombre_completo' && (
                <input
                  type="text"
                  value={artisanFullName}
                  onChange={(e) => setArtisanFullName(e.target.value)}
                  placeholder="Tu nombre y apellidos completos"
                  className="mt-2 w-full text-[13px] font-bold text-[#032517] bg-white border border-[#a73918] rounded-lg px-2.5 py-1.5 outline-none"
                />
              )}
            </div>
          </label>

          {/* Opción 2: Solo Nombre de Pila y Comunidad */}
          <label
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              visibilityOption === 'nombre_comunidad'
                ? 'bg-[#fcf9f3] border-[#a73918] ring-1 ring-[#a73918]'
                : 'bg-white border-[#c1c8c2]/60 hover:bg-[#fcf9f3]/60'
            }`}
          >
            <input
              type="radio"
              name="visibilityLevel"
              value="nombre_comunidad"
              checked={visibilityOption === 'nombre_comunidad'}
              onChange={() => setVisibilityOption('nombre_comunidad')}
              className="mt-1 text-[#a73918] focus:ring-[#a73918]"
            />
            <div className="flex-1 text-[12px]">
              <span className="font-extrabold text-[#032517] block">
                2. Mostrar solo mi nombre de pila y mi comunidad
              </span>
              <span className="text-[#424843] block text-[11px] leading-tight mt-0.5">
                Protege tu privacidad personal manteniendo el orgullo de tu identidad y pueblo (ej. "Doña Rosalía · San Juan Mixtepec").
              </span>
              {visibilityOption === 'nombre_comunidad' && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#727973] font-bold uppercase block">Nombre de pila</label>
                    <input
                      type="text"
                      value={artisanFirstName}
                      onChange={(e) => setArtisanFirstName(e.target.value)}
                      placeholder="Ej. Doña Rosalía"
                      className="w-full text-[12px] font-bold text-[#032517] bg-white border border-[#a73918] rounded-lg px-2 py-1 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#727973] font-bold uppercase block">Comunidad</label>
                    <input
                      type="text"
                      value={artisanCommunity}
                      onChange={(e) => setArtisanCommunity(e.target.value)}
                      placeholder="Ej. San Juan Mixtepec"
                      className="w-full text-[12px] font-bold text-[#032517] bg-white border border-[#a73918] rounded-lg px-2 py-1 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </label>

          {/* Opción 3: Solo Nombre de la Cooperativa */}
          <label
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              visibilityOption === 'cooperativa'
                ? 'bg-[#fcf9f3] border-[#a73918] ring-1 ring-[#a73918]'
                : 'bg-white border-[#c1c8c2]/60 hover:bg-[#fcf9f3]/60'
            }`}
          >
            <input
              type="radio"
              name="visibilityLevel"
              value="cooperativa"
              checked={visibilityOption === 'cooperativa'}
              onChange={() => setVisibilityOption('cooperativa')}
              className="mt-1 text-[#a73918] focus:ring-[#a73918]"
            />
            <div className="flex-1 text-[12px]">
              <span className="font-extrabold text-[#032517] block">
                3. Mostrar solo el nombre de mi cooperativa o colectivo
              </span>
              <span className="text-[#424843] block text-[11px] leading-tight mt-0.5">
                Resguardo colectivo absoluto: tu nombre individual no aparece públicamente.
              </span>
              {visibilityOption === 'cooperativa' && (
                <input
                  type="text"
                  value={artisanCooperative}
                  onChange={(e) => setArtisanCooperative(e.target.value)}
                  placeholder="Nombre de la cooperativa o colectivo"
                  className="mt-2 w-full text-[13px] font-bold text-[#032517] bg-white border border-[#a73918] rounded-lg px-2.5 py-1.5 outline-none"
                />
              )}
            </div>
          </label>
        </div>

        {/* Consentimiento por Voz en Mixteco o Español */}
        <div className="bg-[#f6f3ed] rounded-xl p-3 border border-[#c1c8c2]/40 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[12px] font-black text-[#032517]">
              <span className="material-symbols-outlined text-[17px] text-[#a73918]">record_voice_over</span>
              <span>Consentimiento en Voz</span>
            </div>
            {/* Idioma Selector */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#c1c8c2]/60 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setVoiceConsentLang('mix')}
                className={`px-2 py-0.5 rounded-md cursor-pointer ${
                  voiceConsentLang === 'mix' ? 'bg-[#a73918] text-white' : 'text-[#424843]'
                }`}
              >
                Tu'un Savi
              </button>
              <button
                type="button"
                onClick={() => setVoiceConsentLang('es')}
                className={`px-2 py-0.5 rounded-md cursor-pointer ${
                  voiceConsentLang === 'es' ? 'bg-[#a73918] text-white' : 'text-[#424843]'
                }`}
              >
                Español
              </button>
            </div>
          </div>

          <p className="text-[11.5px] italic text-[#424843] bg-white p-2.5 rounded-lg border border-[#c1c8c2]/30 leading-snug">
            {voiceConsentLang === 'mix'
              ? '"Yu\'u kaxi yu ja na koo sutu chi foto pieza yu nuu página Yucu, tasa na kuni na satá na. Soo kuati yu ja na kene yu kani ini yu..."'
              : '"Otorgo mi consentimiento libre para que la fotografía y datos seleccionados de mi pieza se muestren para venta en Yucu, conservando mi derecho a retirarlos o pausarlos cuando lo decida."'}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlayConsentAudio}
              className="flex-1 bg-white hover:bg-stone-50 border border-[#a73918] text-[#a73918] font-bold text-[11px] py-1.5 px-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[15px]">
                {isPlayingConsentAudio ? 'stop' : 'volume_up'}
              </span>
              <span>{isPlayingConsentAudio ? 'Detener lectura' : 'Escuchar audio'}</span>
            </button>

            <button
              type="button"
              onClick={() => setVoiceConsentGiven((prev) => !prev)}
              className={`flex-1 font-bold text-[11px] py-1.5 px-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all ${
                voiceConsentGiven
                  ? 'bg-[#032517] text-[#c7ebd4]'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {voiceConsentGiven ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span>{voiceConsentGiven ? 'Consentimiento Otorgado' : 'No Otorgado'}</span>
            </button>
          </div>
        </div>

        {/* Garantía Criptográfica Stellar Zero-PII */}
        <div className="bg-[#e7f3ec] rounded-xl p-3 border border-[#a1d1b5] text-[11px] text-[#032517] space-y-1">
          <div className="flex items-center gap-1.5 font-black text-[#002113]">
            <span className="material-symbols-outlined text-[16px] text-emerald-800">lock</span>
            <span>Garantía Técnica: Zero-PII en Blockchain Stellar</span>
          </div>
          <p className="leading-snug text-[#1b3b2b]">
            En Stellar <strong>solo va la huella digital criptográfica (hash SHA-256)</strong>, nunca tu nombre ni tu foto.
            Como la blockchain no se puede borrar, la ley exige que el QR apunte a una ficha web viva que <strong>sí se puede editar o pausar</strong> con el botón <em>"Dejar de mostrarme"</em>, manteniendo intacta la autenticidad de tu pieza.
          </p>
        </div>
      </section>

      {/* Fixed Sticky Action Dock */}
      <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto z-40 bg-[#fcf9f3]/95 backdrop-blur-md px-4 py-3 border-t border-[#c1c8c2]/30">
        <button
          type="button"
          onClick={handleSendValidation}
          disabled={isValidating}
          className="w-full min-h-[50px] h-13 bg-[#a73918] text-white rounded-full text-[16px] font-bold shadow-lg hover:bg-[#6c1900] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
        >
          {isValidating ? (
            <>
              <span className="material-symbols-outlined text-[22px] animate-spin">progress_activity</span>
              <span>Validando Lote...</span>
            </>
          ) : (
            <>
              <span>Enviar lote a validación</span>
              <span className="material-symbols-outlined text-[22px]">send</span>
            </>
          )}
        </button>
      </div>

      {/* Validation Simulation Modal (Paso 4) */}
      {isValidating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#c1c8c2]/50 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#ffdbd1] text-[#a73918] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[34px] animate-spin">
                sync
              </span>
            </div>

            <span className="text-[12px] font-bold text-[#a73918] bg-[#ffdbd1] px-3 py-1 rounded-full mb-2">
              Paso 4 de 4 · Certificación Normativa
            </span>

            <h3 className="text-[18px] font-bold text-[#032517] mb-2">
              {isPulque
                ? 'Certificación Tradicional y Sellado Stellar'
                : isHandicraft || isSombrero
                ? 'Certificación Artesanal y Sellado Stellar'
                : 'Auditoría de Calidad y Sellado Stellar'}
            </h3>

            <div className="w-full space-y-2.5 my-4 text-left">
              <div className="flex items-center gap-2 text-[13px]">
                <span className={`material-symbols-outlined text-[18px] ${validationStep >= 1 ? 'text-[#032517]' : 'text-gray-300'}`}>
                  {validationStep >= 1 ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className={validationStep >= 1 ? 'text-[#032517] font-semibold' : 'text-gray-400'}>
                  {isPulque
                    ? '1. Muestra analizada (100% Aguamiel de Maguey Mixteco)'
                    : isHandicraft
                    ? '1. Muestra analizada (Telar de cintura tradicional)'
                    : isSombrero
                    ? '1. Muestra analizada (Palma dulce fina de la Mixteca)'
                    : isHoney
                    ? '1. Muestra analizada (Miel virgen pura de abeja)'
                    : isCorn
                    ? '1. Muestra analizada (Maíz criollo nativo)'
                    : isTomato
                    ? '1. Muestra analizada (Jitomate agroecológico)'
                    : isCoffee
                    ? '1. Muestra analizada (Café pergamino de altura)'
                    : `1. Muestra analizada (${profile.displayName} auténtico)`}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[13px]">
                <span className={`material-symbols-outlined text-[18px] ${validationStep >= 2 ? 'text-[#032517]' : 'text-gray-300'}`}>
                  {validationStep >= 2 ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className={validationStep >= 2 ? 'text-[#032517] font-semibold' : 'text-gray-400'}>
                  {isPulque
                    ? '2. Fermentación tradicional óptima sin químicos ni adulterantes'
                    : isHandicraft
                    ? '2. Certificación de origen e iconografía Mixteca tradicional'
                    : isSombrero
                    ? '2. Tejido uniforme y ribete tradicional de la Mixteca'
                    : isHoney
                    ? '2. Libre de adulteración y azúcares añadidos'
                    : isCorn
                    ? '2. Grano sano, libre de gorgojo y sin OGM'
                    : isTomato
                    ? '2. Cosecha fresca, libre de pesticidas sintéticos'
                    : isCoffee
                    ? '2. Conforme a NMX-F-083 (Humedad 11.4% y <2% defectos)'
                    : `2. Calidad comprobada, 100% genuino de la Mixteca`}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[13px]">
                <span className={`material-symbols-outlined text-[18px] ${validationStep >= 3 ? 'text-emerald-600' : 'text-gray-300'}`}>
                  {validationStep >= 3 ? 'verified_user' : 'radio_button_unchecked'}
                </span>
                <span className={validationStep >= 3 ? 'text-[#032517] font-bold' : 'text-gray-400'}>
                  3. Sellado inalterable de autenticidad comunal (Red Stellar)
                </span>
              </div>
            </div>

            <p className="text-[12px] text-[#424843]">
              Generando Pasaporte Digital y folio inmutable...
            </p>
          </div>
        </div>
      )}

      {/* Toast confirmation */}
      {photoSuccessToast && (
        <div className="fixed top-4 inset-x-4 z-50 max-w-sm mx-auto bg-[#032517] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center justify-between text-[12px] font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
            <span>{photoSuccessToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setPhotoSuccessToast(null)}
            className="text-white/70 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hidden Inputs for Direct Camera & Gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Real Camera Modal */}
      {showCameraModal && (
        <div
          onClick={() => {
            stopLiveCamera();
            setShowCameraModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-4 shadow-2xl border border-[#c1c8c2]/50 flex flex-col gap-3 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#c1c8c2]/30 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px] text-emerald-700">photo_camera</span>
                <span className="text-[13px] font-bold text-[#032517]">
                  Tomar Foto Real - Muestra #{targetSlot}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopLiveCamera();
                  setShowCameraModal(false);
                }}
                className="w-7 h-7 rounded-full bg-[#f0eee8] text-[#1c1c18] flex items-center justify-center text-[12px] hover:bg-[#ebe8e2] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Live Camera Viewfinder */}
            {isLiveCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center border-2 border-emerald-500 shadow-inner">
                <video
                  ref={(el) => {
                    if (el && mediaStreamRef.current && el.srcObject !== mediaStreamRef.current) {
                      el.srcObject = mediaStreamRef.current;
                      el.play().catch((err) => console.warn('Error play video:', err));
                    }
                    (videoRef as any).current = el;
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Reticle / Viewfinder guide */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
                  <div className="text-[10px] text-white/90 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs w-fit">
                    🔴 Cámara en vivo activa
                  </div>
                  <div className="self-center w-36 h-36 border-2 border-dashed border-white/60 rounded-xl" />
                  <div className="text-center text-[10px] text-white/80 bg-black/40 py-0.5 rounded">
                    Centra el grano verde o muestra
                  </div>
                </div>

                {/* Capture Trigger */}
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleCaptureRealPhoto}
                    className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[13px] shadow-lg flex items-center gap-1.5 border-2 border-white cursor-pointer active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">camera</span>
                    <span>Disparar Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopLiveCamera}
                    className="w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer"
                    title="Cerrar visor"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {/* DIRECT NATIVE CAMERA TRIGGER (PRIMARY & UNIVERSAL) */}
                <button
                  type="button"
                  onClick={() => handleDirectCamera(targetSlot)}
                  className="w-full p-3.5 rounded-2xl bg-[#032517] hover:bg-[#1b3b2b] text-white flex items-center gap-3 shadow-md active:scale-98 transition-all cursor-pointer text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[26px] text-emerald-300">photo_camera</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-[13px] font-extrabold block">📸 Abrir Cámara del Teléfono</span>
                    <span className="text-[11px] text-emerald-200/90 block leading-tight">
                      Captura la foto directamente con la cámara de tu dispositivo
                    </span>
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => startLiveCamera('environment')}
                    className="p-3 rounded-2xl bg-[#f0eee8] hover:bg-[#e4e1d9] text-[#032517] flex flex-col items-center justify-center gap-1 border border-[#c1c8c2]/60 active:scale-98 transition-all cursor-pointer text-center"
                  >
                    <span className="material-symbols-outlined text-[22px] text-emerald-700">videocam</span>
                    <span className="text-[12px] font-bold">Visor en Pantalla</span>
                    <span className="text-[10px] text-[#727973]">Webcam en vivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDirectGallery(targetSlot)}
                    className="p-3 rounded-2xl bg-[#f0eee8] hover:bg-[#e4e1d9] text-[#032517] flex flex-col items-center justify-center gap-1 border border-[#c1c8c2]/60 active:scale-98 transition-all cursor-pointer text-center"
                  >
                    <span className="material-symbols-outlined text-[22px] text-[#a73918]">photo_library</span>
                    <span className="text-[12px] font-bold">Subir de Galería</span>
                    <span className="text-[10px] text-[#727973]">Fotos guardadas</span>
                  </button>
                </div>

                {cameraError && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-amber-700 shrink-0 mt-0.5">info</span>
                    <div className="flex-1">
                      <p className="leading-snug font-medium">{cameraError}</p>
                      <button
                        type="button"
                        onClick={() => handleDirectCamera(targetSlot)}
                        className="mt-1.5 px-3 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                        <span>Abrir cámara del dispositivo</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick samples */}
                <div className="border-t border-[#c1c8c2]/30 pt-2">
                  <span className="text-[10px] font-bold text-[#727973] uppercase tracking-wide block mb-1.5">
                    O selecciona una muestra para probar la IA:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {quickSamples.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyPhotoUrl(sample.url, sample.title)}
                        className={`p-1.5 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                          sample.isControl
                            ? 'border-amber-300 bg-amber-50/50 hover:bg-amber-100'
                            : 'border-[#c1c8c2]/50 hover:bg-[#f0eee8]'
                        }`}
                        title={sample.title}
                      >
                        <span className="text-[16px]">{sample.emoji}</span>
                        <span
                          className={`text-[10px] font-bold truncate max-w-full ${
                            sample.isControl ? 'text-amber-900' : 'text-[#1c1c18]'
                          }`}
                        >
                          {sample.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
