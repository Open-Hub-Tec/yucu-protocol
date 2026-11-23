import React, { useState, useRef, useEffect } from 'react';
import { PROTOCOL_FEES } from '../config/protocolFees';
import { ScreenView, BotCardData, BotCardType, DigitalPassportLot, OrderReceipt } from '../types';
import { BotCardView } from './BotCardView';
import { KnowledgeBaseModal } from './KnowledgeBaseModal';
import { startAudioRecording, LiveRecorderSession } from '../utils/audioRecorder';
import { DemoBadge } from './DemoBadge';
import { assistant, type AISource, type ChatMessage as AssistantMessage } from '../core/ai';

interface ChatScreenProps {
  onNavigateScreen: (screen: ScreenView, productType?: string) => void;
  targetProducer?: string | null;
  initialCustomMessage?: string | null;
  onOpenDictamenModal?: () => void;
  onOpenLotsModal?: () => void;
  onOpenPaymentsModal?: () => void;
  onOpenCartModal?: () => void;
  onOpenMapModal?: () => void;
  onOpenMicDiagnosticModal?: () => void;
  onAddToCart?: (item: any) => void;
  selectedLot?: DigitalPassportLot;
  lastOrderReceipt?: OrderReceipt | null;
  onClearOrderReceipt?: () => void;
}

interface MessageItem {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  type?: 'text' | 'image' | 'voice';
  mediaUrl?: string;
  audioDuration?: string;
  transcription?: string;
  agentTag?: string;
  card?: BotCardData;
  options?: { id: number; title: string; subtitle: string; icon?: string; action?: string }[];
  isCheck?: boolean;
  /** De dónde viene la respuesta de IA; si es 'simulated', se muestra <DemoBadge />. */
  source?: AISource;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onNavigateScreen,
  targetProducer,
  initialCustomMessage,
  onOpenDictamenModal,
  onOpenLotsModal,
  onOpenPaymentsModal,
  onOpenCartModal,
  onOpenMapModal,
  onOpenMicDiagnosticModal,
  onAddToCart,
  selectedLot,
  lastOrderReceipt,
  onClearOrderReceipt
}) => {
  const [activeChannel, setActiveChannel] = useState<'asistente' | 'registro' | 'soporte'>(
    targetProducer || initialCustomMessage || lastOrderReceipt ? 'soporte' : 'asistente'
  );

  const [inputMessage, setInputMessage] = useState<string>(
    initialCustomMessage && !initialCustomMessage.startsWith('Confirmación de pedido')
      ? initialCustomMessage
      : targetProducer && !initialCustomMessage
      ? `Hola ${targetProducer}, me interesa conocer más sobre su lote.`
      : ''
  );

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [liveVoiceTranscript, setLiveVoiceTranscript] = useState<string>('');
  const [micError, setMicError] = useState<string | null>(null);
  const [showCardPicker, setShowCardPicker] = useState<boolean>(false);
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const [isLiveCameraActive, setIsLiveCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [showKnowledgeBaseModal, setShowKnowledgeBaseModal] = useState<boolean>(false);

  // Realistic Bot Typing simulation state
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [typingAgent, setTypingAgent] = useState<string>('🌱 Guía Yucu');
  const [speakingMsgText, setSpeakingMsgText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const directCameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const chatAudioSessionRef = useRef<LiveRecorderSession | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Text-to-Speech function for elderly accessibility
  const handleSpeakBotMessage = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speakingMsgText === text) {
      window.speechSynthesis.cancel();
      setSpeakingMsgText(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#•]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-MX';
    utterance.rate = 0.92;
    utterance.onend = () => setSpeakingMsgText(null);
    utterance.onerror = () => setSpeakingMsgText(null);
    setSpeakingMsgText(text);
    window.speechSynthesis.speak(utterance);
  };

  // Stop TTS on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Flag to ensure initial view stays at top like WhatsApp, only scrolling when user or bot actually interacts
  const isInitialMountRef = useRef<boolean>(true);
  const userInteractedRef = useRef<boolean>(false);

  // Messages for the Bot Orchestrator & Cards Flow - WhatsApp style clean sequential start
  const [assistantMessages, setAssistantMessages] = useState<MessageItem[]>([
    {
      id: 'ast-1',
      sender: 'bot',
      agentTag: '🌱 Compañero Yucu • TecNM Tlaxiaco',
      text: '¡Buenos días paisano, bienvenido a Yucu!\n\nSoy tu compañero del Instituto Tecnológico de Tlaxiaco. Estoy aquí para acompañarte paso a paso con tus cosechas y artesanías de la Mixteca.\n\n¿En qué te podemos apoyar hoy? Toca una opción o platícame por nota de voz:',
      time: 'Ahora',
      options: [
        { id: 1, title: '🌾 Registrar Cosecha o Artesanía', subtitle: 'Café, textil, miel, palma, etc.', icon: 'add_circle', action: 'registrar_lote' },
        { id: 2, title: '📸 Evaluar Muestra con Foto', subtitle: 'Revisión de calidad con apoyo del Tec', icon: 'photo_camera', action: 'evaluar_foto' },
        { id: 3, title: '💰 Consultar Mis Pagos y Saldo', subtitle: 'Billetera comunitaria y retiros', icon: 'payments', action: 'ver_pagos' },
        { id: 4, title: '📜 Ver Dictamen de Demostración Stellar', subtitle: 'Certificado sellado en blockchain', icon: 'verified', action: 'ver_dictamen' }
      ]
    }
  ]);

  // Messages for Onboarding Registration flow - Progressive questionnaire matching user's real actions
  const [registrationMessages, setRegistrationMessages] = useState<MessageItem[]>([
    {
      id: 'm1',
      sender: 'bot',
      agentTag: '📝 Padrón Comunitario',
      text: '¡Bienvenido paisano al Padrón de Productores de la Mixteca!\n\nPara vincular sus cosechas y activar su Credencial Digital, comenzaremos con una pregunta sencilla:\n\n¿En qué municipio se encuentra su parcela, taller o centro de trabajo?',
      time: 'Ahora',
      options: [
        { id: 1, title: 'Heroica Ciudad de Tlaxiaco', subtitle: 'Cabecera de la Mixteca Alta', icon: 'location_on' },
        { id: 2, title: 'Huajuapan de León', subtitle: 'Región Mixteca Baja', icon: 'location_on' },
        { id: 3, title: 'Asunción Nochixtlán', subtitle: 'Entrada a la Mixteca', icon: 'location_on' },
        { id: 4, title: 'Otro municipio mixteco', subtitle: 'Indicar por voz o teclado', icon: 'edit' }
      ]
    }
  ]);

  // Messages for Support / Direct Conversation
  const [supportMessages, setSupportMessages] = useState<MessageItem[]>([
    {
      id: 's1',
      sender: 'bot',
      text: targetProducer
        ? `Canal seguro con ${targetProducer}. Todas las comunicaciones cuentan con traducción opcional al Tu'un Savi (Mixteco) y registro de trazabilidad.`
        : '¡Bienvenido al canal de Asistencia Técnica Comunitaria del Tec de Tlaxiaco! ¿En qué podemos ayudarte hoy? (Control de plagas, humedad de café, secado solar, precios de acopio)',
      time: '10:45 a. m.'
    }
  ]);

  // Manejador del ÚLTIMO EVENTO DEL FLUJO: Renderiza automáticamente el pedido y comprobante si el usuario acaba de pagar
  useEffect(() => {
    if (lastOrderReceipt) {
      setActiveChannel('soporte');
      userInteractedRef.current = true;
      const orderUserMsg: MessageItem = {
        id: `usr-ord-${lastOrderReceipt.id}`,
        sender: 'user',
        text: `📦 He realizado el pedido #${lastOrderReceipt.id} por un total de $${lastOrderReceipt.total.toLocaleString('es-MX')} MXN (${lastOrderReceipt.paymentMethod}). Me pongo en contacto para acordar la entrega directa contigo.`,
        time: 'Ahora',
        isCheck: true
      };

      const orderBotMsg: MessageItem = {
        id: `bot-ord-${lastOrderReceipt.id}`,
        sender: 'bot',
        agentTag: `👩‍🎨 ${lastOrderReceipt.artisanName}`,
        text: `¡Hola paisano! 🎉 Muchísimas gracias por tu compra directa y por valorar el arte y la cosecha de la Mixteca. He recibido la confirmación de tu pedido #${lastOrderReceipt.id}.\n\nTu pago está registrado al 100% (cero coyotes). Ya comencé a preparar tus piezas en mi taller.\n\n¿En qué punto te gustaría que acordemos la entrega (en nuestro taller en Tlaxiaco/Oaxaca o prefieres que lo enviemos por paquetería comercial)?`,
        time: 'Ahora',
        card: {
          type: 'recibo_ticket',
          title: `Comprobante de Demostración #${lastOrderReceipt.id}`,
          data: {
            ...lastOrderReceipt,
            summary: lastOrderReceipt.items.map((it) => `${it.quantity}x ${it.title}`).join(', ')
          }
        },
        options: [
          {
            id: 1,
            title: '🤝 Acordar entrega en taller en Tlaxiaco',
            subtitle: 'Retiro en persona en territorio',
            icon: 'storefront'
          },
          {
            id: 2,
            title: '📦 Coordinar envío por paquetería',
            subtitle: 'Estafeta / DHL / Correos de México',
            icon: 'local_shipping'
          },
          {
            id: 3,
            title: '📜 Ver Pasaporte y Certificado Stellar',
            subtitle: 'Sello notarial inmutable',
            icon: 'verified',
            action: 'ver_pasaporte'
          }
        ]
      };

      setSupportMessages((prev) => {
        if (prev.some((m) => m.id === orderUserMsg.id)) return prev;
        return [...prev, orderUserMsg, orderBotMsg];
      });

      setInputMessage('');
      if (onClearOrderReceipt) {
        onClearOrderReceipt();
      }
    }
  }, [lastOrderReceipt]);

  // Si llega un mensaje de confirmación de pedido vía URL o props sin objeto de recibo, registrarlo en el chat
  useEffect(() => {
    if (initialCustomMessage && initialCustomMessage.startsWith('Confirmación de pedido')) {
      setActiveChannel('soporte');
      userInteractedRef.current = true;
      const orderUserMsg: MessageItem = {
        id: `usr-cust-${Date.now()}`,
        sender: 'user',
        text: initialCustomMessage,
        time: 'Ahora',
        isCheck: true
      };

      const orderBotMsg: MessageItem = {
        id: `bot-cust-${Date.now()}`,
        sender: 'bot',
        agentTag: targetProducer ? `👩‍🎨 ${targetProducer}` : '🛍️ Enlace Comercial Yucu',
        text: `🎉 ¡Pedido recibido con éxito! Tu orden directa ha sido confirmada. La artesana ha recibido el aviso y comenzará a preparar tus piezas.\n\n¿En qué punto te gustaría acordar la entrega?`,
        time: 'Ahora',
        card: {
          type: 'recibo_ticket',
          data: {
            id: `REC-MIX-2024-${Math.floor(1000 + Math.random() * 9000)}`,
            artisanName: targetProducer || 'Artesanas de la Mixteca',
            location: 'Tlaxiaco, Oaxaca',
            summary: initialCustomMessage.replace('Confirmación de pedido directo: ', ''),
            total: 480,
            paymentMethod: 'Trato Directo (sin comisión)',
            stellarTxLedger: 52499210
          }
        },
        options: [
          {
            id: 1,
            title: '🤝 Acordar entrega en taller en Tlaxiaco',
            subtitle: 'Retiro en persona',
            icon: 'storefront'
          },
          {
            id: 2,
            title: '📦 Coordinar envío por paquetería',
            subtitle: 'Estafeta / DHL / Correos',
            icon: 'local_shipping'
          }
        ]
      };

      setSupportMessages((prev) => [...prev, orderUserMsg, orderBotMsg]);
      setInputMessage('');
    }
  }, [initialCustomMessage]);

  // Auto scroll to bottom ONLY when user interacts or new messages are appended after initial mount (WhatsApp behavior)
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      // Keep viewport at the top on first load so the user sees the greeting and first question
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    if (userInteractedRef.current || isBotTyping) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [assistantMessages, registrationMessages, supportMessages, isBotTyping]);

  // Audio recording simulation timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const togglePlayAudio = (msgId: string, mediaUrl?: string) => {
    if (playingAudioId === msgId) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      setPlayingAudioId(null);
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }

      setPlayingAudioId(msgId);

      if (mediaUrl) {
        const audio = new Audio(mediaUrl);
        audioElementRef.current = audio;
        audio.play().catch((e) => console.warn('No se pudo reproducir audio:', e));
        audio.onended = () => {
          setPlayingAudioId(null);
          audioElementRef.current = null;
        };
      } else {
        // Auto-stop audio simulation after 4 seconds
        setTimeout(() => {
          setPlayingAudioId(null);
        }, 4000);
      }
    }
  };

  // Ensure speech synthesis is stopped completely if anything was queued
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Función para garantizar nombres 100% humanos, comunitarios y respetuosos (sin la palabra robótica "Agente" ni "Bot")
  const humanizeAgentTag = (rawName?: string | null): string => {
    if (!rawName) return '🌱 Compañero Yucu (TecNM)';
    const clean = rawName.toLowerCase();
    if (clean.includes('tesorero') || clean.includes('pago') || clean.includes('billetera')) {
      return '💰 Tesorería y Fondos Comunitarios';
    }
    if (clean.includes('agronomo') || clean.includes('agrónomo')) {
      return '🌿 Asesoría Agronómica TecNM';
    }
    if (clean.includes('notario') || clean.includes('stellar')) {
      return '⛓️ Certificación Notarial Stellar';
    }
    if (clean.includes('logistico') || clean.includes('logístico') || clean.includes('coyote') || clean.includes('flete') || clean.includes('envio') || clean.includes('envío')) {
      return '🤝 Trato Directo (Sin Logística)';
    }
    if (clean.includes('comercial') || clean.includes('vitrina')) {
      return '🛍️ Vitrina y Enlace Comercial';
    }
    if (clean.includes('trazabilidad') || clean.includes('pasaporte')) {
      return '🏷️ Pasaporte y Origen Mixteco';
    }
    if (clean.includes('pulque') || clean.includes('tradicional')) {
      return '🏺 Tradición y Pulque Comunitario';
    }
    if (clean.includes('miel') || clean.includes('apicola') || clean.includes('apícola')) {
      return '🍯 Módulo Apícola Comunitario';
    }
    if (clean.includes('grano') || clean.includes('maiz') || clean.includes('maíz')) {
      return '🌽 Granos Nativos y Maíz Criollo';
    }
    if (clean.includes('textil') || clean.includes('regalia') || clean.includes('regalía')) {
      return '🧵 Textil y Regalías Artesanales';
    }
    if (clean.includes('artesanal') || clean.includes('palma')) {
      return '👒 Creación Artesanal de Palma';
    }
    if (clean.includes('multiproducto')) {
      return '🌾 Catálogo Rural Yucu';
    }
    if (clean.includes('orquestador') || clean.includes('bot') || clean.includes('asistente comunitario')) {
      return '🌱 Compañero Yucu (TecNM)';
    }
    // Si contiene la palabra "Agente", la limpiamos amigablemente
    return rawName.replace(/agente\s*/gi, '').trim() || '🌱 Compañero Yucu (TecNM)';
  };

  // Helper to dispatch simulated Bot responses with realistic typing delay
  const dispatchSimulatedBotReply = (
    agentName: string,
    replyText: string,
    cardData?: BotCardData,
    options?: { id: number; title: string; subtitle: string; icon?: string; action?: string }[],
    delayMs: number = 1000
  ) => {
    const friendlyName = humanizeAgentTag(agentName);
    setIsBotTyping(true);
    setTypingAgent(friendlyName);

    setTimeout(() => {
      setIsBotTyping(false);
      const newId = `bot-reply-${Date.now()}`;
      const botMsg: MessageItem = {
        id: newId,
        sender: 'bot',
        agentTag: friendlyName,
        text: replyText,
        time: 'Ahora',
        card: cardData,
        options
      };
      if (activeChannel === 'asistente') {
        setAssistantMessages((prev) => [...prev, botMsg]);
      } else if (activeChannel === 'registro') {
        setRegistrationMessages((prev) => [...prev, botMsg]);
      } else {
        setSupportMessages((prev) => [...prev, botMsg]);
      }
    }, delayMs);
  };

  // Asistente único con flujos reales (ADR-006, D4). Habla solo a través del puerto de IA (#154).
  const ASSISTANT_TAG = '🌱 Asistente Yucu';
  const BASIC_OPTIONS: NonNullable<MessageItem['options']> = [
    { id: 1, title: '📦 Registrar un lote', subtitle: 'Paso a paso', icon: 'add_box', action: 'registrar_lote' },
    { id: 2, title: '📸 Tomar foto al producto', subtitle: 'Con la cámara', icon: 'photo_camera', action: 'evaluar_foto' },
    { id: 3, title: '💰 Ver mis pagos', subtitle: 'Pantalla de pagos', icon: 'payments', action: 'ver_pagos' },
  ];
  const toAssistantHistory = (messages: MessageItem[]): AssistantMessage[] =>
    messages.slice(-6).map((m) => ({ role: m.sender === 'bot' ? 'assistant' : 'user', text: m.text }));

  // Checks if spoken/typed text contains an actionable instruction for the platform
  const processPlatformInstruction = (text: string): boolean => {
    const clean = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    // 1. Saldo / Pagos
    if (
      clean.includes('saldo') ||
      clean.includes('pago') ||
      clean.includes('billetera') ||
      clean.includes('cuanto tengo') ||
      clean.includes('retirar dinero') ||
      clean.includes('cobrar')
    ) {
      const reply =
        '🎤 Abriendo la pantalla de pagos...';
      dispatchSimulatedBotReply('💰 Tesorería y Fondos Comunitarios', reply, { type: 'billetera_pago' }, undefined, 300);
      if (onOpenPaymentsModal) setTimeout(() => onOpenPaymentsModal(), 650);
      return true;
    }

    // 2. Dictamen / Stellar
    if (
      clean.includes('dictamen') ||
      clean.includes('norma') ||
      clean.includes('stellar') ||
      clean.includes('blockchain') ||
      clean.includes('certificado') ||
      clean.includes('hash')
    ) {
      const reply =
        '🎤 Instrucción de voz ejecutada: Abriendo el Dictamen Agroecológico con verificación SHA-256 en Stellar Testnet...';
      dispatchSimulatedBotReply(
        '⛓️ Agente Notario Stellar',
        reply,
        { type: 'dictamen_stellar' },
        undefined,
        300
      );
      if (onOpenDictamenModal) setTimeout(() => onOpenDictamenModal(), 650);
      return true;
    }

    // 3. Registrar Lote / Nueva Cosecha / Producto Específico
    // 3.1 PULQUE / AGUAMIEL / TINACAL / MAGUEY
    if (
      clean.includes('pulque') ||
      clean.includes('aguamiel') ||
      clean.includes('tinacal') ||
      clean.includes('maguey')
    ) {
      const reply =
        '¡Con mucho gusto, paisano! En Yucu apoyamos con orgullo a los tlachiqueros y familias productoras de Pulque Tradicional de la Mixteca Alta sin intermediarios ("coyotes").\n\nEl registro se realiza en 3 pasos sencillos y rápidos:\n\n1. 🏺 Indique los litros o garrafas preparadas en su tinacal.\n2. 📸 Tómale una foto a su muestra en jícara o garrafa para avalar con IA que es 100% aguamiel natural sin azúcar añadida.\n3. 💰 Su lote queda registrado a precio comunal justo para venta directa.\n\nToque abajo para registrar su pulque de inmediato:';
      dispatchSimulatedBotReply(
        '🏺 Agente Tradicional Comunitario',
        reply,
        { type: 'lote_registro' },
        [
          {
            id: 1,
            title: '🏺 Registrar Lote de Pulque',
            subtitle: 'Litros, tinacal y foto con IA',
            icon: 'local_bar',
            action: 'registrar_pulque'
          },
          {
            id: 2,
            title: '🌾 Catálogo de Otros Productos',
            subtitle: 'Ver miel, maíz o artesanías',
            icon: 'inventory_2',
            action: 'registrar_lote'
          },
          {
            id: 3,
            title: '📸 Foto a Muestra de Pulque',
            subtitle: 'Evaluación de pureza con IA',
            icon: 'photo_camera',
            action: 'evaluar_foto'
          }
        ],
        400
      );
      return true;
    }

    // 3.2 MIEL DE ABEJA
    if (clean.includes('miel') || clean.includes('abeja') || clean.includes('colmena')) {
      const reply =
        '¡Con mucho gusto, paisano! En Yucu apoyamos a los apicultores de la Mixteca Alta para comercializar su Miel Pura de Abeja a precio justo sin intermediarios.\n\nToque abajo para registrar su lote de miel de inmediato:';
      dispatchSimulatedBotReply(
        '🍯 Agente Apícola Comunitario',
        reply,
        { type: 'lote_registro' },
        [
          {
            id: 1,
            title: '🍯 Registrar Lote de Miel',
            subtitle: 'Frascos o cubetas y foto con IA',
            icon: 'inventory_2',
            action: 'registrar_miel'
          },
          {
            id: 2,
            title: '🌾 Ver Catálogo Completo',
            subtitle: 'Pulque, café, granos',
            icon: 'storefront',
            action: 'registrar_lote'
          },
          {
            id: 3,
            title: '📸 Evaluar Miel con Foto',
            subtitle: 'Pureza y densidad con IA',
            icon: 'photo_camera',
            action: 'evaluar_foto'
          }
        ],
        400
      );
      return true;
    }

    // 3.3 OTRO PRODUCTO / QUE NO SEA CAFÉ
    if (
      clean.includes('otro producto') ||
      clean.includes('otros productos') ||
      clean.includes('no sea cafe')
    ) {
      const reply =
        '¡Entendido, paisano! En Yucu apoyamos a todas las cosechas y creaciones de la Mixteca: Pulque tradicional, Miel de abeja, Maíz criollo, Jitomate, Sombreros de palma y Textiles artesanales.\n\nToque abajo para abrir el catálogo y registrar su producto:';
      dispatchSimulatedBotReply(
        '🌾 Agente Multiproducto Yucu',
        reply,
        { type: 'producto_vitrina' },
        [
          {
            id: 1,
            title: '🌾 Abrir Catálogo Rural',
            subtitle: 'Pulque, miel, maíz y más',
            icon: 'storefront',
            action: 'registrar_lote'
          },
          {
            id: 2,
            title: '🏺 Registrar Pulque',
            subtitle: 'Aguamiel de maguey mixteco',
            icon: 'local_bar',
            action: 'registrar_pulque'
          },
          {
            id: 3,
            title: '🍯 Registrar Miel',
            subtitle: 'Miel virgen de la región',
            icon: 'inventory_2',
            action: 'registrar_miel'
          }
        ],
        400
      );
      return true;
    }

    // 3.4 SOMBRERO DE PALMA
    if (clean.includes('sombrero') || clean.includes('palma') || clean.includes('tenate')) {
      const reply =
        '¡Con mucho gusto, artesano! En Yucu protegemos el trabajo de los tejedores de Palma de la Mixteca con regalías y precio justo sin intermediarios.\n\nToque abajo para registrar sus piezas de palma:';
      dispatchSimulatedBotReply(
        '👒 Agente Artesanal Comunitario',
        reply,
        { type: 'lote_registro' },
        [
          {
            id: 1,
            title: '👒 Registrar Sombrero o Palma',
            subtitle: 'Piezas y foto con IA',
            icon: 'styler',
            action: 'registrar_sombrero'
          },
          {
            id: 2,
            title: '🌾 Ver Catálogo Completo',
            subtitle: 'Ver más productos comunitarios',
            icon: 'storefront',
            action: 'registrar_lote'
          }
        ],
        400
      );
      return true;
    }

    // 3.5 MAÍZ CRIOLLO O GRANOS
    if (clean.includes('maiz') || clean.includes('maíz') || clean.includes('frijol') || clean.includes('milpa')) {
      const reply =
        '¡Con mucho gusto, campesino! En Yucu apoyamos a los guardianes del Maíz Criollo y Frijol nativo de la Mixteca sin intermediarios.\n\nToque abajo para registrar su cosecha de granos:';
      dispatchSimulatedBotReply(
        '🌽 Agente de Granos Nativos',
        reply,
        { type: 'lote_registro' },
        [
          {
            id: 1,
            title: '🌽 Registrar Maíz Criollo',
            subtitle: 'Kilos y foto con IA',
            icon: 'grain',
            action: 'registrar_maiz'
          },
          {
            id: 2,
            title: '🌾 Ver Catálogo Completo',
            subtitle: 'Ver más productos comunitarios',
            icon: 'storefront',
            action: 'registrar_lote'
          }
        ],
        400
      );
      return true;
    }

    // 3.6 TEXTIL ARTESANAL
    if (clean.includes('textil') || clean.includes('huipil') || clean.includes('telar') || clean.includes('rebozo')) {
      const reply =
        '¡Con mucho gusto, artesana! En Yucu protegemos los telares y bordados tradicionales de la Mixteca con regalías garantizadas y precio justo directo.\n\nToque abajo para registrar su pieza textil:';
      dispatchSimulatedBotReply(
        '🧵 Agente Textil y Regalías',
        reply,
        { type: 'lote_registro' },
        [
          {
            id: 1,
            title: '🧵 Registrar Textil Artesanal',
            subtitle: 'Pieza, técnica y foto con IA',
            icon: 'styler',
            action: 'registrar_textil'
          },
          {
            id: 2,
            title: '🌾 Ver Catálogo Completo',
            subtitle: 'Ver más productos comunitarios',
            icon: 'storefront',
            action: 'registrar_lote'
          }
        ],
        400
      );
      return true;
    }

    // 3.7 Registro General / Café
    if (
      clean.includes('registrar') ||
      clean.includes('producto') ||
      clean.includes('cosecha') ||
      clean.includes('dar de alta') ||
      clean.includes('alta') ||
      clean.includes('vender mi') ||
      clean.includes('vender cafe') ||
      clean.includes('vender cosecha') ||
      clean.includes('subir mi') ||
      clean.includes('inscribir') ||
      clean.includes('nuevo lote') ||
      clean.includes('nueva cosecha') ||
      clean.includes('entregar cafe')
    ) {
      const reply =
        '¡Con mucho gusto, paisano! En Yucu registrar tu cosecha o artesanía es muy fácil y rápido, sin trámites complicados ni intermediarios.\n\nPuedes registrar Pulque tradicional, Café pergamino, Miel pura, Granos criollos o Artesanías.\n\nToca abajo para elegir lo que deseas registrar:';
      dispatchSimulatedBotReply(
        '🌱 TecNM Tlaxiaco • Guía de Campo',
        reply,
        { type: 'lote_registro' },
        [
          {
            id: 1,
            title: '🌾 Catálogo de Productos',
            subtitle: 'Pulque, café, miel, granos y artesanías',
            icon: 'inventory_2',
            action: 'registrar_lote'
          },
          {
            id: 2,
            title: '☕ Registrar Café Pergamino',
            subtitle: 'Indicar kilos y foto con IA',
            icon: 'add_box',
            action: 'registrar_cafe'
          },
          {
            id: 3,
            title: '🏺 Registrar Pulque / Aguamiel',
            subtitle: 'Bebida tradicional de maguey',
            icon: 'local_bar',
            action: 'registrar_pulque'
          }
        ],
        400
      );
      return true;
    }

    // 4. Ver mis Lotes
    if (
      clean.includes('mis lotes') ||
      clean.includes('ver lotes') ||
      clean.includes('mis cosechas') ||
      clean.includes('lotes registrados') ||
      clean.includes('sacos de cafe')
    ) {
      const reply =
        '🎤 Instrucción de voz ejecutada: Desplegando el inventario de tus lotes registrados en la Mixteca...';
      dispatchSimulatedBotReply('☕ Agente Agrónomo IA', reply, { type: 'lote_registro' }, undefined, 300);
      if (onOpenLotsModal) setTimeout(() => onOpenLotsModal(), 650);
      return true;
    }

    // 5. Vitrina / Tienda
    if (
      clean.includes('vitrina') ||
      clean.includes('tienda') ||
      clean.includes('catalogo') ||
      clean.includes('ver productos') ||
      clean.includes('comprar cafe') ||
      clean.includes('comprar')
    ) {
      const reply =
        '🎤 Instrucción de voz ejecutada: Llevándote a la Vitrina Comunitaria de Comercio Justo...';
      dispatchSimulatedBotReply(
        '🛍️ Agente Comercial',
        reply,
        { type: 'producto_vitrina' },
        undefined,
        300
      );
      setTimeout(() => onNavigateScreen('vitrina_productos'), 700);
      return true;
    }

    // 6. Mapa Regional
    if (
      clean.includes('mapa') ||
      clean.includes('comunidades') ||
      clean.includes('municipios') ||
      clean.includes('donde estan') ||
      clean.includes('geolocalizacion')
    ) {
      const reply =
        '🎤 Instrucción de voz ejecutada: Abriendo el Mapa Regional de la Mixteca Alta y centros de acopio...';
      dispatchSimulatedBotReply(
        '🏷️ Agente de Trazabilidad',
        reply,
        { type: 'trazabilidad_pasaporte' },
        undefined,
        300
      );
      if (onOpenMapModal) setTimeout(() => onOpenMapModal(), 650);
      return true;
    }

    // 7. Carrito / Bolsa
    if (
      clean.includes('carrito') ||
      clean.includes('bolsa') ||
      clean.includes('mi pedido') ||
      clean.includes('ver compra')
    ) {
      const reply = '🎤 Instrucción de voz ejecutada: Abriendo tu bolsa de compras y pedidos directos...';
      dispatchSimulatedBotReply('🛍️ Agente Comercial', reply, undefined, undefined, 300);
      if (onOpenCartModal) setTimeout(() => onOpenCartModal(), 650);
      return true;
    }

    // 8. Diagnóstico de micrófono
    if (
      clean.includes('probar microfono') ||
      clean.includes('diagnostico') ||
      clean.includes('calibrar micro') ||
      clean.includes('prueba de audio')
    ) {
      const reply =
        '🎤 Instrucción de voz ejecutada: Abriendo el Diagnóstico y Calibrador Físico de Micrófono...';
      dispatchSimulatedBotReply('🌱 Compañero Yucu (TecNM)', reply, undefined, undefined, 300);
      if (onOpenMicDiagnosticModal) setTimeout(() => onOpenMicDiagnosticModal(), 650);
      return true;
    }

    // 9. Menú principal
    if (
      clean.includes('menu') ||
      clean.includes('pantalla principal') ||
      clean.includes('ir al inicio')
    ) {
      const reply = '🎤 Instrucción de voz ejecutada: Regresando a la pantalla de Menú Principal...';
      dispatchSimulatedBotReply('🌱 Compañero Yucu (TecNM)', reply, undefined, undefined, 300);
      setTimeout(() => onNavigateScreen('menu_principal'), 700);
      return true;
    }

    // 10. Trato Directo / Deslinde Logístico
    if (
      clean.includes('flete') ||
      clean.includes('transporte') ||
      clean.includes('coyote') ||
      clean.includes('camioneta') ||
      clean.includes('envio') ||
      clean.includes('envío') ||
      clean.includes('logistica') ||
      clean.includes('logística')
    ) {
      const reply =
        '🎤 Instrucción de voz ejecutada: Consultando la política de trato directo y deslinde logístico de Yucu...';
      dispatchSimulatedBotReply(
        '🤝 Trato Directo',
        reply,
        { type: 'logistica_coyote' },
        undefined,
        300
      );
      return true;
    }

    // 11. Regalías / Artesanías
    if (
      clean.includes('regalia') ||
      clean.includes('artesana') ||
      clean.includes('huipil') ||
      clean.includes('reventa')
    ) {
      const reply =
        `🎤 Instrucción de voz ejecutada: Consultando contrato Soroban del ${PROTOCOL_FEES.artisanResaleRoyaltyPct}% de regalías para creadoras...`;
      dispatchSimulatedBotReply(
        '💎 Agente de Regalías',
        reply,
        { type: 'regalias_mercado' },
        undefined,
        300
      );
      return true;
    }

    return false;
  };

  // Camera stream controls
  const stopLiveCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  const startLiveCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    setCameraError(null);
    stopLiveCamera();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador o dispositivo no soporta acceso directo a cámara.');
      }
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      setIsLiveCameraActive(true);
      setCameraFacing(facing);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('No se pudo acceder a la cámara web:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Permiso denegado. Puedes habilitar la cámara en el candado del navegador o subir una foto desde tu galería.'
          : 'No se pudo iniciar la cámara web. Puedes subir una foto de tu archivo o usar las muestras de campo.'
      );
      setIsLiveCameraActive(false);
    }
  };

  const handleFlipCamera = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    startLiveCamera(nextFacing);
  };

  // Revisión de la foto a través del puerto de IA. El resultado es una sugerencia, nunca un dictamen (#154).
  const analyzePhotoWithAI = async (photoBase64: string) => {
    setIsBotTyping(true);
    setTypingAgent(`${ASSISTANT_TAG} (mirando la foto...)`);

    const result = await assistant.analyzeImage(photoBase64, 'image/jpeg');
    setIsBotTyping(false);

    const botMsg: MessageItem = result.ok
      ? {
          id: `bot-vision-${Date.now()}`,
          sender: 'bot',
          agentTag: ASSISTANT_TAG,
          text: `${result.analysis}\n\n${result.disclaimer}`,
          time: 'Ahora',
          source: result.source,
        }
      : {
          id: `bot-vision-error-${Date.now()}`,
          sender: 'bot',
          agentTag: ASSISTANT_TAG,
          text: result.error,
          time: 'Ahora',
        };
    setAssistantMessages((prev) => [...prev, botMsg]);
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

        // Stop stream & close modal
        stopLiveCamera();
        setShowCameraModal(false);

        // Add user photo
        const userPhotoMsg: MessageItem = {
          id: `usr-live-img-${Date.now()}`,
          sender: 'user',
          text: 'Fotografía capturada con la cámara del dispositivo',
          type: 'image',
          mediaUrl: photoDataUrl,
          time: 'Ahora',
          isCheck: true,
        };
        setAssistantMessages((prev) => [...prev, userPhotoMsg]);

        // Call real Gemini Multimodal Vision endpoint
        analyzePhotoWithAI(photoDataUrl);
      }
    } catch (e) {
      console.error('Error al capturar foto:', e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const photoUrl = uploadEvent.target?.result as string;
      stopLiveCamera();
      setShowCameraModal(false);

      const userPhotoMsg: MessageItem = {
        id: `usr-uploaded-img-${Date.now()}`,
        sender: 'user',
        text: `Muestra subida: ${file.name}`,
        type: 'image',
        mediaUrl: photoUrl,
        time: 'Ahora',
        isCheck: true,
      };
      setAssistantMessages((prev) => [...prev, userPhotoMsg]);

      // Call real Gemini Multimodal Vision endpoint
      analyzePhotoWithAI(photoUrl);
    };
    reader.readAsDataURL(file);
    // reset input
    e.target.value = '';
  };

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Fotos de ejemplo: solo muestran cómo se ve el flujo. No se inventa ningún diagnóstico (#154).
  const handleSimulatePhotoUpload = (photoType: 'cereza' | 'pergamino' | 'roya' | 'miel' | 'pulque') => {
    setShowCameraModal(false);

    const samples: Record<typeof photoType, { url: string; title: string }> = {
      cereza: { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', title: 'Foto de ejemplo: cerezas de café' },
      pergamino: { url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80', title: 'Foto de ejemplo: café pergamino' },
      pulque: { url: 'https://images.unsplash.com/photo-1546853020-ca4909aef454?w=600&auto=format&fit=crop&q=80', title: 'Foto de ejemplo: pulque' },
      miel: { url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8ZBROS9VsAw7NHM5L1DmOrsjS5_bgY5WUAX2CWi4t5af2aINWReGNta7MhraFl1vMglwJfhe52szbMFK3zJCSVdtzGS8Wxk4FAPcGg0ryh6r5SO--xklxpgEP7fXFnRFHhG28vL6IwUl3qW6cFysfAyubAB0o5lspYGGWJSMCYFqxBvweNm6W2qlz6HlxvvKjRiSwLsfBYXxK7Cv3WSoPy77qwwVCiEOx_s0cTXnQKPYnYNHr48piLg', title: 'Foto de ejemplo: miel' },
      roya: { url: 'https://images.unsplash.com/photo-1524350876685-274059332603?w=600&auto=format&fit=crop&q=80', title: 'Foto de ejemplo: hojas de cafeto' },
    };
    const sample = samples[photoType];

    const userPhotoMsg: MessageItem = {
      id: `usr-img-${Date.now()}`,
      sender: 'user',
      text: sample.title,
      type: 'image',
      mediaUrl: sample.url,
      time: 'Ahora',
      isCheck: true
    };
    setAssistantMessages((prev) => [...prev, userPhotoMsg]);

    dispatchSimulatedBotReply(
      ASSISTANT_TAG,
      'Esta es una foto de ejemplo, así que no la reviso. Para que la IA le diga lo que ve, tome o suba una foto de su producto. Lo que diga será una sugerencia, no un dictamen.',
      undefined,
      [{ id: 1, title: '📸 Tomar foto a mi producto', subtitle: 'Con la cámara', icon: 'photo_camera', action: 'evaluar_foto' }],
      800
    );
  };

  // Real Audio Recording with Web Speech API and Gemini Transcription
  const startVoiceRecording = async () => {
    setMicError(null);
    setLiveVoiceTranscript('');
    try {
      const session = await startAudioRecording({
        onVolumeChange: (vol) => setAudioVolume(vol),
        onInterimTranscript: (text) => setLiveVoiceTranscript(text),
        lang: 'es-MX',
      });
      chatAudioSessionRef.current = session;
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch (err: any) {
      console.warn('Micrófono denegado o no disponible:', err);
      setIsRecording(false);
      setMicError(
        'El navegador no pudo acceder al micrófono. Por favor verifica que tenga permisos habilitados o escribe tu consulta abajo.'
      );
    }
  };

  const stopVoiceRecording = async () => {
    if (!chatAudioSessionRef.current) {
      setIsRecording(false);
      return;
    }

    setIsRecording(false);
    setAudioVolume(0);

    try {
      const result = await chatAudioSessionRef.current.stop();
      chatAudioSessionRef.current = null;

      const durationSec = result.durationSeconds || Math.max(1, recordingSeconds);
      const formattedDuration = `0:${durationSec < 10 ? '0' : ''}${durationSec}`;
      const spokenText = (result.transcript || liveVoiceTranscript || '').trim();

      // Si no se entendió nada, se dice; nunca se inventa una transcripción (ADR-006, D4).
      if (!spokenText) {
        dispatchSimulatedBotReply(ASSISTANT_TAG, result.transcriptError || 'No te escuché bien. ¿Lo intentamos otra vez o lo escribes?', undefined, undefined, 300);
        setLiveVoiceTranscript('');
        return;
      }

      // Add user audio message with real recorded audio URL and real transcription
      const userAudioMsg: MessageItem = {
        id: `usr-audio-${Date.now()}`,
        sender: 'user',
        text: spokenText,
        type: 'voice',
        mediaUrl: result.audioUrl,
        audioDuration: formattedDuration,
        transcription: `🎙️ Audio en vivo capturado:\n"${spokenText}"`,
        time: 'Ahora',
        isCheck: true,
      };

      setAssistantMessages((prev) => [...prev, userAudioMsg]);

      // 1. Check if the voice note is a direct instruction for the platform
      if (processPlatformInstruction(spokenText)) {
        return;
      }

      // 2. Si no, se lo pregunta al asistente a través del puerto de IA.
      setIsBotTyping(true);
      setTypingAgent(ASSISTANT_TAG);
      const reply = await assistant.chat(spokenText, toAssistantHistory(assistantMessages));
      setIsBotTyping(false);
      const botMsg: MessageItem = reply.ok
        ? {
            id: `bot-reply-${Date.now()}`,
            sender: 'bot',
            agentTag: ASSISTANT_TAG,
            text: reply.reply,
            time: 'Ahora',
            options: reply.options.length ? reply.options : undefined,
            source: reply.source,
          }
        : {
            id: `bot-reply-error-${Date.now()}`,
            sender: 'bot',
            agentTag: ASSISTANT_TAG,
            text: reply.error,
            time: 'Ahora',
            options: BASIC_OPTIONS,
          };
      setAssistantMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      console.error('Error al finalizar grabación:', e);
      setIsRecording(false);
    }
  };

  const cancelVoiceRecording = () => {
    if (chatAudioSessionRef.current) {
      chatAudioSessionRef.current.cancel();
      chatAudioSessionRef.current = null;
    }
    setIsRecording(false);
    setAudioVolume(0);
    setLiveVoiceTranscript('');
  };

  // Sample Mixteco voice note helper
  const handleInsertSampleMixtecoAudio = () => {
    const userAudioMsg: MessageItem = {
      id: `usr-audio-${Date.now()}`,
      sender: 'user',
      text: 'Nota de voz en Tu\'un Savi (Mixteco)',
      type: 'voice',
      audioDuration: '0:12',
      transcription:
        '🎙️ Tu\'un Savi (Mixteco) / Español:\n"Kusii inii kuan, ya\'a kui bulto kafe pergamino. ¿A que hora acopio Tlaxiaco?"\n(Buenos días, aquí están los bultos de café pergamino seco. ¿A qué hora reciben en el acopio de Tlaxiaco?)',
      time: 'Ahora',
      isCheck: true,
    };

    setAssistantMessages((prev) => [...prev, userAudioMsg]);

    dispatchSimulatedBotReply(
      ASSISTANT_TAG,
      'Esta nota de voz es un ejemplo de demostración. Yucu todavía no tiene centro de acopio, horarios de recepción ni pesaje propio.',
      undefined,
      BASIC_OPTIONS,
      1000
    );
  };

  // SIMULATED FLOW: Card Invocation by Button or Keyword
  const invokeBotCard = (type: BotCardType, customPrompt?: string) => {
    setShowCardPicker(false);

    // User triggers the card invocation
    const userMsg: MessageItem = {
      id: `usr-invoke-${Date.now()}`,
      sender: 'user',
      text: customPrompt || `Consultar módulo: ${type.replace('_', ' ')}`,
      time: 'Ahora',
      isCheck: true
    };

    setAssistantMessages((prev) => [...prev, userMsg]);

    let agentTag = '🌱 Compañero Yucu (TecNM)';
    let botText = '';

    if (type === 'dictamen_stellar') {
      agentTag = '⛓️ Agente Notario Stellar';
      botText =
        'He verificado en vivo la firma en Stellar Testnet Ledger #52,491,802. El dictamen cumple al 100% con la Norma Agroecológica Regional:';
    } else if (type === 'billetera_pago') {
      agentTag = '💰 Tesorería y Fondos Comunitarios';
      botText =
        'Billetera Comunitaria sincronizada con contrato inteligente Soroban. Tienes saldo disponible por liquidación de café:';
    } else if (type === 'lote_registro') {
      agentTag = '☕ Agente Agrónomo';
      botText =
        'Aquí está la ficha de control de cosecha. Puedes registrar un nuevo lote o revisar los sacos entregados:';
    } else if (type === 'producto_vitrina') {
      agentTag = '🛍️ Agente Comercial';
      botText =
        'Tarjeta de la Vitrina Mixteca con protección de pago en custodia (Escrow) para compradores directos:';
    } else if (type === 'trazabilidad_pasaporte') {
      agentTag = '🏷️ Agente de Trazabilidad';
      botText =
        'Pasaporte Digital con trazabilidad completa de origen desde San Mateo Peñasco hasta el punto de venta:';
    } else if (type === 'logistica_coyote') {
      agentTag = '🤝 Trato Directo (Deslinde Logístico)';
      botText =
        'Política de Trato Directo: Yucu no opera paqueterías ni fletes. La entrega o retiro de la pieza se acuerda de forma 100% directa y libre entre comprador y artesano en taller o territorio:';
    } else if (type === 'regalias_mercado') {
      agentTag = '💎 Agente de Regalías';
      botText =
        `Mecanismo de protección y regalías on-chain: ${PROTOCOL_FEES.artisanResaleRoyaltyPct}% de cada reventa en galerías o el extranjero se liquida directamente a la artesana:`;
    } else {
      agentTag = '🤖 Orquestador Multiagente';
      botText =
        'Panel de control de los 4 agentes en línea que asisten a productores y compradores:';
    }

    dispatchSimulatedBotReply(agentTag, botText, { type }, undefined, 900);
  };

  // Conversational response logic for user typing with Real Gemini AI + Domain Guardrail
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = (customText || inputMessage).trim();
    if (!text) return;

    userInteractedRef.current = true;

    const userMsg: MessageItem = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      time: 'Ahora',
      isCheck: true
    };

    setInputMessage('');

    // Append user message to active channel
    if (activeChannel === 'asistente') {
      if (processPlatformInstruction(text)) {
        setAssistantMessages((prev) => [...prev, userMsg]);
        return;
      }
      setAssistantMessages((prev) => [...prev, userMsg]);
    } else if (activeChannel === 'registro') {
      setRegistrationMessages((prev) => [...prev, userMsg]);
    } else {
      setSupportMessages((prev) => [...prev, userMsg]);
    }

    const defaultAgentLabel =
      activeChannel === 'soporte'
        ? (targetProducer ? `💬 ${targetProducer}` : '💬 Asesoría Técnica del Tec')
        : activeChannel === 'registro'
        ? '📝 Padrón Comunitario'
        : '🌱 Compañero Yucu (TecNM)';

    setIsBotTyping(true);
    setTypingAgent(defaultAgentLabel);

    const activeHistory =
      activeChannel === 'asistente'
        ? assistantMessages
        : activeChannel === 'registro'
        ? registrationMessages
        : supportMessages;

    const result = await assistant.chat(text, toAssistantHistory(activeHistory));
    setIsBotTyping(false);

    // Si la IA no está o falló, se dice con honestidad y se ofrecen los botones básicos (ADR-006, D4).
    const botMsg: MessageItem = result.ok
      ? {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          agentTag: ASSISTANT_TAG,
          text: result.reply,
          time: 'Ahora',
          options: result.options.length ? result.options : undefined,
          source: result.source,
        }
      : {
          id: `bot-error-${Date.now()}`,
          sender: 'bot',
          agentTag: ASSISTANT_TAG,
          text: result.error,
          time: 'Ahora',
          options: BASIC_OPTIONS,
        };

    if (activeChannel === 'asistente') {
      setAssistantMessages((prev) => [...prev, botMsg]);
    } else if (activeChannel === 'registro') {
      setRegistrationMessages((prev) => [...prev, botMsg]);
    } else {
      setSupportMessages((prev) => [...prev, botMsg]);
    }
  };

  const handleSelectOption = (optionTitle: string, action?: string) => {
    userInteractedRef.current = true;
    // 1. Direct system actions
    if (
      action === 'evaluar_foto' ||
      optionTitle.toLowerCase().includes('evaluar') ||
      optionTitle.toLowerCase().includes('cámara') ||
      optionTitle.toLowerCase().includes('camara')
    ) {
      setShowCameraModal(true);
      return;
    }
    if (
      action === 'ver_pagos' ||
      optionTitle.toLowerCase().includes('pagos') ||
      optionTitle.toLowerCase().includes('saldo') ||
      optionTitle.toLowerCase().includes('billetera')
    ) {
      onOpenPaymentsModal?.();
      return;
    }
    if (action === 'ver_dictamen' || optionTitle.toLowerCase().includes('dictamen')) {
      onOpenDictamenModal?.();
      return;
    }
    if (
      action === 'registrar_pulque' ||
      optionTitle.toLowerCase().includes('pulque') ||
      optionTitle.toLowerCase().includes('aguamiel')
    ) {
      onNavigateScreen?.('registrar_lote_cafe', 'Pulque');
      return;
    }
    if (
      action === 'registrar_miel' ||
      (optionTitle.toLowerCase().includes('miel') && !optionTitle.toLowerCase().includes('catálogo'))
    ) {
      onNavigateScreen?.('registrar_lote_cafe', 'Miel');
      return;
    }
    if (action === 'registrar_sombrero' || optionTitle.toLowerCase().includes('sombrero')) {
      onNavigateScreen?.('registrar_lote_cafe', 'Sombrero');
      return;
    }
    if (
      action === 'registrar_maiz' ||
      optionTitle.toLowerCase().includes('maíz') ||
      optionTitle.toLowerCase().includes('maiz')
    ) {
      onNavigateScreen?.('registrar_lote_cafe', 'Maíz');
      return;
    }
    if (action === 'registrar_textil' || optionTitle.toLowerCase().includes('textil')) {
      onNavigateScreen?.('registrar_lote_cafe', 'Textil');
      return;
    }
    if (
      action === 'registrar_cafe' ||
      optionTitle.toLowerCase().includes('registrar café') ||
      optionTitle.toLowerCase().includes('registrar cafe') ||
      optionTitle.toLowerCase().includes('café pergamino') ||
      optionTitle.toLowerCase().includes('cafe pergamino')
    ) {
      onNavigateScreen?.('registrar_lote_cafe', 'Café');
      return;
    }
    if (
      action === 'registrar_lote' ||
      optionTitle.toLowerCase().includes('registrar nuevo lote') ||
      optionTitle.toLowerCase().includes('registrar cosecha') ||
      optionTitle.toLowerCase().includes('catálogo') ||
      optionTitle.toLowerCase().includes('catalogo')
    ) {
      onNavigateScreen?.('catalogo_producto');
      return;
    }

    // 2. Registration Questionnaire (if active in registration tab)
    if (activeChannel === 'registro') {
      const userMsg: MessageItem = {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: optionTitle,
        time: 'Ahora',
        isCheck: true
      };
      setRegistrationMessages((prev) => [...prev, userMsg]);

      const isMunicipality = [
        'Heroica Ciudad de Tlaxiaco',
        'Tlaxiaco',
        'Huajuapan de León',
        'Asunción Nochixtlán',
        'Nochixtlán',
        'Otro municipio mixteco'
      ].some((m) => optionTitle.includes(m) || m.includes(optionTitle));

      setIsBotTyping(true);
      setTypingAgent('📝 Padrón Comunitario');

      if (isMunicipality) {
        setTimeout(() => {
          setIsBotTyping(false);
          const botFollowUp: MessageItem = {
            id: `bot-mun-${Date.now()}`,
            sender: 'bot',
            agentTag: '📝 Padrón Comunitario',
            text: `Municipio registrado: ${optionTitle}.\n\n2. ¿A qué cooperativa, unión de ejidos o grupo pertenece? Seleccione una opción o escriba la suya:`,
            time: 'Ahora',
            options: [
              { id: 1, title: 'Cooperativa Café de las Nubes', subtitle: 'Tlaxiaco / San Juan Ñumí', icon: 'groups' },
              { id: 2, title: 'Unión Ejidal de la Mixteca Alta', subtitle: 'Red de Acopio Comunitario', icon: 'groups' },
              { id: 3, title: 'Productor Comunitario Independiente', subtitle: 'Taller o parcela familiar', icon: 'person' }
            ]
          };
          setRegistrationMessages((prev) => [...prev, botFollowUp]);
        }, 800);
      } else {
        setTimeout(() => {
          setIsBotTyping(false);
          const botSuccess: MessageItem = {
            id: `bot-done-${Date.now()}`,
            sender: 'bot',
            agentTag: '📝 Padrón Comunitario',
            text: `¡Felicidades paisano! Su registro en el Padrón Regional ha concluido con éxito.\nSu Credencial Digital ID #HUB-MIX-2026 está activa en el sistema.`,
            time: 'Ahora',
            card: {
              type: 'lote_registro'
            }
          };
          setRegistrationMessages((prev) => [...prev, botSuccess]);
        }, 800);
      }
      return;
    }

    // 3. Default: Trigger conversational AI message
    handleSendMessage(undefined, optionTitle);
  };

  const currentMessages =
    activeChannel === 'asistente'
      ? assistantMessages
      : activeChannel === 'registro'
      ? registrationMessages
      : supportMessages;

  return (
    <main className="w-full max-w-md mx-auto px-4 py-3 flex-1 flex flex-col justify-between pb-28">
      {/* Channel Switcher Tabs (Limpio y elegante estilo WhatsApp) */}
      <div className="flex items-center gap-1.5 bg-[#ebe8e2] p-1 rounded-full mb-3 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveChannel('asistente')}
          className={`flex-1 py-1.5 px-2.5 rounded-full text-[12px] font-bold transition-all ${
            activeChannel === 'asistente'
              ? 'bg-[#032517] text-white shadow-xs'
              : 'text-[#424843] hover:text-[#032517]'
          }`}
        >
          🌱 Guía Yucu
        </button>
        <button
          type="button"
          onClick={() => setActiveChannel('registro')}
          className={`flex-1 py-1.5 px-2.5 rounded-full text-[12px] font-bold transition-all ${
            activeChannel === 'registro'
              ? 'bg-[#032517] text-white shadow-xs'
              : 'text-[#424843] hover:text-[#032517]'
          }`}
        >
          📝 Mi Padrón
        </button>
        <button
          type="button"
          onClick={() => setActiveChannel('soporte')}
          className={`flex-1 py-1.5 px-2.5 rounded-full text-[12px] font-bold transition-all ${
            activeChannel === 'soporte'
              ? 'bg-[#032517] text-white shadow-xs'
              : 'text-[#424843] hover:text-[#032517]'
          }`}
        >
          {targetProducer ? `💬 Productor` : '💬 Preguntar al Tec'}
        </button>
      </div>

      {/* Chat Messages Flow */}
      <div className="flex-1 flex flex-col gap-3 justify-start">
        {currentMessages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex flex-col items-end self-end w-full max-w-[88%]">
                <div className="bg-[#1b3b2b] text-white rounded-2xl rounded-tr-xs p-3.5 shadow-xs w-full">
                  {/* Image attachment rendering */}
                  {msg.type === 'image' && msg.mediaUrl && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-white/20">
                      <img
                        src={msg.mediaUrl}
                        alt="Muestra de campo"
                        className="w-full h-36 object-cover"
                      />
                    </div>
                  )}

                  {/* Voice Note rendering */}
                  {msg.type === 'voice' ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl">
                        <button
                          type="button"
                          onClick={() => togglePlayAudio(msg.id, msg.mediaUrl)}
                          className="w-9 h-9 rounded-full bg-emerald-400 text-[#032517] flex items-center justify-center font-bold shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {playingAudioId === msg.id ? 'pause' : 'play_arrow'}
                          </span>
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            {/* Animated waveform bars */}
                            {[40, 70, 90, 60, 80, 50, 95, 65, 85, 45, 75, 55, 90, 60].map((h, i) => (
                              <span
                                key={i}
                                className={`w-1 rounded-full transition-all duration-300 ${
                                  playingAudioId === msg.id
                                    ? 'bg-emerald-300 animate-pulse'
                                    : 'bg-white/40'
                                }`}
                                style={{ height: `${(h * 18) / 100}px` }}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-emerald-200 mt-1">
                            <span>{playingAudioId === msg.id ? 'Reproduciendo...' : 'Nota de voz'}</span>
                            <span>{msg.audioDuration || '0:14'}</span>
                          </div>
                        </div>
                      </div>
                      {msg.transcription && (
                        <p className="text-[12px] text-emerald-100 italic bg-black/30 p-2 rounded-lg leading-relaxed whitespace-pre-line border border-white/10">
                          {msg.transcription}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[14px] font-medium leading-snug">{msg.text}</p>
                  )}

                  <div className="flex items-center justify-end gap-1 mt-1.5 text-[#83a590] text-[10px]">
                    <span>{msg.time}</span>
                    {msg.isCheck && (
                      <span className="material-symbols-outlined text-[13px] text-emerald-300">
                        done_all
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // Bot message
          return (
            <div key={msg.id} className="flex items-start gap-2.5 w-full max-w-[96%]">
              <div className="w-8 h-8 rounded-full bg-[#032517] flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5">
                <span className="material-symbols-outlined text-[17px]">school</span>
              </div>

              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-xs border border-[#c1c8c2]/30 w-full">
                  <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-[#c1c8c2]/20">
                    <span className="text-[12px] font-bold text-[#032517] truncate">
                      {humanizeAgentTag(msg.agentTag)}
                    </span>
                    {msg.source === 'simulated' && (
                      <DemoBadge detail="Respuesta de demostración: no viene de un proveedor de IA." />
                    )}
                    <span className="text-[10px] text-[#727973] shrink-0">{msg.time}</span>
                  </div>
                  <p className="text-[14px] text-[#1c1c18] whitespace-pre-line leading-relaxed">
                    {msg.text}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#c1c8c2]/20">
                    <button
                      type="button"
                      onClick={() => handleSpeakBotMessage(msg.text)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#032517] bg-[#f0eee8] hover:bg-[#e4e1d9] px-2.5 py-1 rounded-full border border-[#c1c8c2]/50 transition-colors cursor-pointer active:scale-95"
                      title="Escuchar mensaje en voz alta (Lectura para adultos mayores)"
                    >
                      <span className="material-symbols-outlined text-[15px] text-emerald-800">
                        {speakingMsgText === msg.text ? 'volume_off' : 'volume_up'}
                      </span>
                      <span>{speakingMsgText === msg.text ? 'Detener voz' : '🔊 Escuchar'}</span>
                    </button>
                  </div>
                </div>

              {/* RENDER DYNAMIC BOT CARD (IF ATTACHED) */}
              {msg.card && (
                <BotCardView
                  card={msg.card}
                  onNavigateScreen={onNavigateScreen}
                  onOpenDictamen={onOpenDictamenModal}
                  onOpenLots={onOpenLotsModal}
                  onOpenPayments={onOpenPaymentsModal}
                  onOpenCart={onOpenCartModal}
                  onAddToCart={onAddToCart}
                  onSendChatMessage={(txt) => handleSendMessage(undefined, txt)}
                  selectedLot={selectedLot}
                />
              )}

              {/* Optional interactive choice options */}
              {msg.options && (
                <div className="w-full space-y-1.5 pt-0.5">
                  {msg.options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        handleSelectOption(opt.title, opt.action);
                      }}
                      className="w-full bg-white hover:bg-[#f0eee8] active:scale-[0.98] transition-all rounded-xl px-3 py-2 border border-[#c1c8c2]/60 flex items-center justify-between text-left shadow-2xs group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#ffdbd1] flex items-center justify-center font-bold text-[#a73918] text-[12px] group-hover:bg-[#a73918] group-hover:text-white transition-colors">
                          {opt.id}
                        </span>
                        <div>
                          <p className="text-[13px] font-bold text-[#1c1c18] leading-tight">
                            {opt.title}
                          </p>
                          <p className="text-[11px] text-[#424843]">{opt.subtitle}</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[#727973] text-[18px]">
                        {opt.icon || 'chevron_right'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              </div>
            </div>
          );
        })}

        {/* Realistic "Escribiendo..." / Typing Indicator */}
        {isBotTyping && (
          <div className="flex items-center gap-2 bg-white rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-xs border border-[#c1c8c2]/30 w-fit animate-pulse">
            <span className="text-[11px] font-bold text-[#032517]">{typingAgent}</span>
            <span className="text-[11px] text-[#727973]">está escribiendo</span>
            <span className="flex items-center gap-1 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1b3b2b] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1b3b2b] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1b3b2b] animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        )}

        {/* Generous bottom clearance spacer so cards and option buttons are never hidden under the bottom dock */}
        <div className="h-44 shrink-0 pointer-events-none" aria-hidden="true" />
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Input Dock & Simulator Controls */}
      <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-4 pb-2 bg-gradient-to-t from-[#fcf9f3] via-[#fcf9f3] to-transparent pointer-events-auto z-30 pt-2">
        {/* Hidden file inputs for direct camera and gallery */}
        <input
          ref={directCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileUpload}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Camera Modal (Real Live Camera + Upload + Simulated Field Samples) */}
        {showCameraModal && (
          <div className="mb-2 bg-white rounded-2xl p-3.5 shadow-2xl border border-[#c1c8c2]/60 animate-fade-in flex flex-col gap-2.5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#c1c8c2]/30 pb-2">
              <span className="text-[12px] font-extrabold text-[#032517] uppercase tracking-wide flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-emerald-700">photo_camera</span>
                Cámara de Campo &amp; Análisis IA
              </span>
              <button
                type="button"
                onClick={() => {
                  stopLiveCamera();
                  setShowCameraModal(false);
                }}
                className="w-6 h-6 rounded-full bg-[#f0eee8] text-[#1c1c18] flex items-center justify-center text-[12px] hover:bg-[#ebe8e2] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* LIVE CAMERA VIEWFINDER (IF ACTIVE) */}
            {isLiveCameraActive ? (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border-2 border-emerald-500 shadow-inner">
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

                {/* Camera Overlay Guides */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between items-center text-[10px] text-white/90 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs w-fit">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-1.5" />
                    <span>En vivo • Apunta al grano o planta</span>
                  </div>

                  {/* Corner brackets guide */}
                  <div className="self-center w-36 h-28 border border-white/40 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] text-white/70 font-mono tracking-wider">Área de enfoque</span>
                  </div>

                  <div className="text-center text-[10px] text-white/80 bg-black/40 py-0.5 rounded">
                    Tec de Tlaxiaco • Visión Agroecológica
                  </div>
                </div>

                {/* Bottom Controls on Live View */}
                <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-3 px-3">
                  <button
                    type="button"
                    onClick={handleFlipCamera}
                    title="Cambiar cámara frontal/trasera"
                    className="w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 backdrop-blur-xs border border-white/20 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">flip_camera_ios</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCaptureRealPhoto}
                    className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[12px] shadow-lg flex items-center gap-1.5 border-2 border-white cursor-pointer active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">camera</span>
                    <span>Tomar Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopLiveCamera}
                    title="Cerrar cámara en vivo"
                    className="w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 backdrop-blur-xs border border-white/20 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
            ) : (
              /* PRIMARY ACTION BUTTONS: Real Camera or Upload from Device */
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    stopLiveCamera();
                    setShowCameraModal(false);
                    setTimeout(() => directCameraInputRef.current?.click(), 50);
                  }}
                  className="w-full p-3 rounded-xl bg-[#032517] hover:bg-[#1b3b2b] text-white flex items-center gap-3 shadow-md active:scale-98 transition-all cursor-pointer text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px] text-emerald-300">photo_camera</span>
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
                    className="p-2.5 rounded-xl bg-[#f0eee8] hover:bg-[#e4e1d9] text-[#032517] flex flex-col items-center justify-center gap-1 border border-[#c1c8c2]/60 active:scale-98 transition-all cursor-pointer text-center"
                  >
                    <span className="material-symbols-outlined text-[22px] text-emerald-700">videocam</span>
                    <span className="text-[11px] font-bold">Visor en Pantalla</span>
                    <span className="text-[9px] text-[#727973]">Webcam en vivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopLiveCamera();
                      setShowCameraModal(false);
                      setTimeout(() => galleryInputRef.current?.click(), 50);
                    }}
                    className="p-2.5 rounded-xl bg-[#f0eee8] hover:bg-[#e4e1d9] text-[#032517] flex flex-col items-center justify-center gap-1 border border-[#c1c8c2]/60 active:scale-98 transition-all cursor-pointer text-center"
                  >
                    <span className="material-symbols-outlined text-[22px] text-[#a73918]">photo_library</span>
                    <span className="text-[11px] font-bold">Subir de Galería</span>
                    <span className="text-[9px] text-[#727973]">Fotos guardadas</span>
                  </button>
                </div>
              </div>
            )}

            {/* Camera Error / Permission Notice (if triggered) */}
            {cameraError && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-amber-700 shrink-0 mt-0.5">info</span>
                <div className="flex-1">
                  <p className="leading-snug">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      stopLiveCamera();
                      setShowCameraModal(false);
                      setTimeout(() => directCameraInputRef.current?.click(), 50);
                    }}
                    className="mt-1 px-3 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                    <span>Abrir cámara directa</span>
                  </button>
                </div>
              </div>
            )}

            {/* PRE-LOADED FIELD SAMPLES FOR FAST TESTING / DEMOS */}
            <div className="border-t border-[#c1c8c2]/30 pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-[#424843]">
                  Muestras de campo para prueba con IA:
                </span>
                <span className="text-[9px] text-[#727973] uppercase tracking-wide">5 Muestras</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    stopLiveCamera();
                    handleSimulatePhotoUpload('cereza');
                  }}
                  className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-[#fcf9f3] hover:bg-[#ffdbd1]/40 border border-[#c1c8c2]/50 transition-all text-center cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80"
                    alt="Cereza"
                    className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[10px] font-bold text-[#1c1c18] leading-tight">
                    🍒 Cereza
                  </span>
                  <span className="text-[8px] text-[#727973]">Madurez</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopLiveCamera();
                    handleSimulatePhotoUpload('pergamino');
                  }}
                  className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-[#fcf9f3] hover:bg-emerald-50 border border-[#c1c8c2]/50 transition-all text-center cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&auto=format&fit=crop&q=80"
                    alt="Pergamino"
                    className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[10px] font-bold text-[#1c1c18] leading-tight">
                    ☀️ Café
                  </span>
                  <span className="text-[8px] text-[#727973]">Pergamino</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopLiveCamera();
                    handleSimulatePhotoUpload('pulque');
                  }}
                  className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-lime-50/70 hover:bg-lime-100 border border-lime-300 transition-all text-center cursor-pointer group"
                  title="Muestra de Pulque tradicional para avalar que la IA no lo confunde con café"
                >
                  <img
                    src="https://images.unsplash.com/photo-1546853020-ca4909aef454?w=200&auto=format&fit=crop&q=80"
                    alt="Pulque"
                    className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform border border-lime-200"
                  />
                  <span className="text-[10px] font-bold text-lime-950 leading-tight">
                    🏺 Pulque
                  </span>
                  <span className="text-[8px] text-lime-800 font-semibold">Tinacal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopLiveCamera();
                    handleSimulatePhotoUpload('miel');
                  }}
                  className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-amber-50/70 hover:bg-amber-100 border border-amber-300 transition-all text-center cursor-pointer group"
                  title="Muestra de Miel para comprobar que no la confunde con café"
                >
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8ZBROS9VsAw7NHM5L1DmOrsjS5_bgY5WUAX2CWi4t5af2aINWReGNta7MhraFl1vMglwJfhe52szbMFK3zJCSVdtzGS8Wxk4FAPcGg0ryh6r5SO--xklxpgEP7fXFnRFHhG28vL6IwUl3qW6cFysfAyubAB0o5lspYGGWJSMCYFqxBvweNm6W2qlz6HlxvvKjRiSwLsfBYXxK7Cv3WSoPy77qwwVCiEOx_s0cTXnQKPYnYNHr48piLg"
                    alt="Miel"
                    className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform border border-amber-200"
                  />
                  <span className="text-[10px] font-bold text-amber-950 leading-tight">
                    🍯 Miel
                  </span>
                  <span className="text-[8px] text-amber-800 font-semibold">Apícola</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopLiveCamera();
                    handleSimulatePhotoUpload('roya');
                  }}
                  className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-[#fcf9f3] hover:bg-blue-50 border border-[#c1c8c2]/50 transition-all text-center cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1524350876685-274059332603?w=200&auto=format&fit=crop&q=80"
                    alt="Hojas"
                    className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[10px] font-bold text-[#1c1c18] leading-tight">
                    🍂 Hoja
                  </span>
                  <span className="text-[8px] text-[#727973]">Sanidad</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Card Invoker Popover Menu */}
        {showCardPicker && (
          <div className="mb-2 bg-white rounded-2xl p-3 shadow-xl border border-[#c1c8c2]/60 animate-fade-in flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-[#c1c8c2]/30 pb-1.5">
              <span className="text-[12px] font-extrabold text-[#032517] uppercase tracking-wide flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">widgets</span>
                Desplegar Card de Módulo
              </span>
              <button
                type="button"
                onClick={() => setShowCardPicker(false)}
                className="w-6 h-6 rounded-full bg-[#f0eee8] text-[#1c1c18] flex items-center justify-center text-[12px] hover:bg-[#ebe8e2]"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[12px]">
              <button
                type="button"
                onClick={() => invokeBotCard('dictamen_stellar')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-left border border-emerald-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="text-[16px]">⛓️</span>
                <span>Dictamen Stellar</span>
              </button>
              <button
                type="button"
                onClick={() => invokeBotCard('billetera_pago')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-left border border-amber-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="text-[16px]">💳</span>
                <span>Billetera &amp; Saldo</span>
              </button>
              <button
                type="button"
                onClick={() => invokeBotCard('lote_registro')}
                className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-950 font-bold text-left border border-orange-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="text-[16px]">☕</span>
                <span>Lote Cosecha</span>
              </button>
              <button
                type="button"
                onClick={() => invokeBotCard('producto_vitrina')}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-950 font-bold text-left border border-rose-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="text-[16px]">🛍️</span>
                <span>Producto Vitrina</span>
              </button>
              <button
                type="button"
                onClick={() => invokeBotCard('trazabilidad_pasaporte')}
                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-950 font-bold text-left border border-blue-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="text-[16px]">🏷️</span>
                <span>Pasaporte Digital</span>
              </button>
              <button
                type="button"
                onClick={() => invokeBotCard('logistica_coyote')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-left border border-amber-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="text-[16px]">🤝</span>
                <span>Trato Directo Sin Intermediarios</span>
              </button>
              <button
                type="button"
                onClick={() => invokeBotCard('regalias_mercado')}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-950 font-bold text-left border border-rose-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="text-[16px]">💎</span>
                <span>{`${PROTOCOL_FEES.artisanResaleRoyaltyPct}% Regalías Soroban`}</span>
              </button>
              <button
                type="button"
                onClick={() => invokeBotCard('agente_multiagente')}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-950 font-bold text-left border border-purple-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="text-[16px]">🤖</span>
                <span>Multiagente</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCardPicker(false);
                  setShowKnowledgeBaseModal(true);
                }}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-left border border-emerald-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="text-[16px]">📖</span>
                <span>Base Notion</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCardPicker(false);
                  if (onOpenMapModal) onOpenMapModal();
                }}
                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-950 font-bold text-left border border-blue-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="text-[16px]">🗺️</span>
                <span>Mapa Parcelas</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCardPicker(false);
                  handleInsertSampleMixtecoAudio();
                }}
                className="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-900 font-bold text-left border border-stone-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="text-[16px]">🎙️</span>
                <span>Audio Mixteco</span>
              </button>
              {onOpenMicDiagnosticModal && (
                <button
                  type="button"
                  onClick={() => {
                    setShowCardPicker(false);
                    onOpenMicDiagnosticModal();
                  }}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-left border border-emerald-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="text-[16px]">🎤</span>
                  <span>Calibrar Mic</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Text, Photo and Voice Input Form - Clean WhatsApp Style Dock */}
        <form
          onSubmit={handleSendMessage}
          className="bg-white rounded-full p-1 pl-2 pr-1 flex items-center justify-between shadow-lg border border-[#c1c8c2]/50"
        >
          {/* Card Invoker Quick Icon (+) */}
          <button
            type="button"
            onClick={() => setShowCardPicker(!showCardPicker)}
            title="Abrir menú de opciones y módulos"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#032517] hover:bg-[#f0eee8] transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[22px]">add</span>
          </button>

          {/* Photo upload camera button */}
          <button
            type="button"
            onClick={() => setShowCameraModal(true)}
            title="Tomar foto de cultivo o muestra"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#424843] hover:text-[#032517] hover:bg-[#f0eee8] transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
          </button>

          <input
            className="flex-1 bg-transparent border-0 focus:ring-0 text-[14px] text-[#1c1c18] placeholder:text-[#424843]/60 px-2 py-1 outline-none"
            placeholder={
              activeChannel === 'asistente'
                ? 'Escribe tu mensaje o usa el micrófono...'
                : activeChannel === 'registro'
                ? 'Escribe tu respuesta o elige una opción...'
                : 'Escribe un mensaje al productor...'
            }
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />

          <div className="flex items-center gap-1">
            {/* Audio Voice Note Button */}
            <button
              type="button"
              onClick={() => {
                if (!isRecording) {
                  startVoiceRecording();
                } else {
                  stopVoiceRecording();
                }
              }}
              aria-label="Mensaje de voz"
              title={isRecording ? "Detener y enviar consulta de voz" : "Grabar consulta de voz con micrófono"}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                isRecording ? 'bg-red-600 text-white animate-pulse' : 'text-[#032517] hover:bg-[#f0eee8]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isRecording ? 'stop' : 'mic'}
              </span>
            </button>

            {/* Send text button */}
            {inputMessage.trim().length > 0 && (
              <button
                aria-label="Enviar mensaje"
                className="w-9 h-9 rounded-full bg-[#a73918] hover:bg-[#6c1900] text-white flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
                type="submit"
              >
                <span className="material-symbols-outlined text-[17px]">send</span>
              </button>
            )}
          </div>
        </form>

        {/* Live Audio Recording Dock */}
        {isRecording && (
          <div className="mt-2 bg-[#1b3b2b] text-white p-3 rounded-2xl shadow-md border border-[#c7ebd4]/20 flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                <span className="text-[12px] font-bold text-red-300 font-mono">
                  0:{recordingSeconds < 10 ? '0' : ''}{recordingSeconds}
                </span>
                <span className="text-[11px] text-[#c7ebd4] font-semibold">
                  🎙️ Micrófono en vivo (Español / Mixteco)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={cancelVoiceRecording}
                  className="px-2.5 py-1 text-[11px] bg-white/15 hover:bg-white/25 rounded-full text-white cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={stopVoiceRecording}
                  className="px-3 py-1 text-[11px] font-bold bg-[#a73918] hover:bg-[#8c2d12] rounded-full text-white flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="material-symbols-outlined text-[14px]">send</span>
                  <span>Enviar</span>
                </button>
              </div>
            </div>

            {/* Live Volume Level Bar */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">Nivel:</span>
              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-emerald-400 via-yellow-400 to-red-400 transition-all duration-75 rounded-full"
                  style={{ width: `${Math.max(10, audioVolume)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-emerald-200">{audioVolume}%</span>
            </div>

            {/* Live speech preview */}
            <div className="text-[12px] text-white/90 italic bg-black/30 px-2.5 py-1.5 rounded-xl border border-white/10 truncate">
              {liveVoiceTranscript ? `"${liveVoiceTranscript}"` : 'Habla claro frente a tu micrófono...'}
            </div>
          </div>
        )}

        {/* Microphone error toast */}
        {micError && (
          <div className="mt-1 text-[11px] font-medium text-red-800 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl flex items-center justify-between shadow-xs">
            <span>{micError}</span>
            <button
              type="button"
              onClick={() => setMicError(null)}
              className="text-red-900 font-bold text-[14px] ml-2 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Full Knowledge Base & Technical Blueprint Modal */}
      <KnowledgeBaseModal
        isOpen={showKnowledgeBaseModal}
        onClose={() => setShowKnowledgeBaseModal(false)}
        onOpenCard={(cardType) => invokeBotCard(cardType)}
      />
    </main>
  );
};
