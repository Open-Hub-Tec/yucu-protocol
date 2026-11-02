export type NavigationTab = 'landing' | 'chat' | 'menu' | 'productos';

export type AppLanguage = 'es' | 'mix';

export type ScreenView =
  | 'menu_principal'
  | 'registro_productor'
  | 'catalogo_producto'
  | 'registrar_lote_cafe'
  | 'pasaporte_digital'
  | 'vitrina_productos'
  | 'landing_page';

export interface ProductItem {
  id: string;
  title: string;
  category: string;
  badge?: string;
  craftType: string;
  description: string;
  price: number;
  artisanName: string;
  artisanInitials: string;
  location: string;
  stock: string;
  imageUrl: string;
  imageAlt: string;
  isCustomOrder?: boolean;
}

export interface LotTimelineEvent {
  title: string;
  dateAndLocation: string;
  color: string;
}

export interface ProcessStage {
  id?: string;
  name: string;
  timestamp?: string;
  notes?: string;
  completed?: boolean;
  category?: string;
  metricValue?: string | number;
  [key: string]: any;
}

export interface DynamicSpec {
  id?: string;
  key?: string;
  label: string;
  value: string;
  [key: string]: any;
}

export type ArtisanVisibilityLevel = 'nombre_completo' | 'nombre_comunidad' | 'cooperativa';

export interface InformedConsentRecord {
  granted: boolean;
  visibilityLevel: ArtisanVisibilityLevel;
  customDisplayName?: string;
  cooperativeName?: string;
  communityName?: string;
  voiceConsentRecorded?: boolean;
  voiceConsentLanguage?: 'mix' | 'es';
  consentTimestamp: string;
  isPubliclyVisible: boolean; // Control soberano: puede pausarse con "Dejar de mostrarme"
  revocationTimestamp?: string;
  zeroPiiBlockchainProof?: {
    ledgerSequence: number;
    sha256Digest: string;
    verified: boolean;
    note: string;
  };
}

export interface DigitalPassportLot {
  id: string;
  code: string;
  title: string;
  productType: string;
  imageUrl: string;
  imageAlt: string;
  producerName: string;
  producerInitials: string;
  location: string;
  volumeKg: number;
  verifiedStatus: string;
  evaluatorOrg: string;
  tags: string[];
  timeline: LotTimelineEvent[];
  pricePerKg: number;
  hash: string;
  variety?: string;
  altitude?: string;
  process?: string;
  notes?: string;
  producer?: string;
  community?: string;
  processStages?: ProcessStage[];
  customSpecs?: DynamicSpec[] | Record<string, any>;
  informedConsent?: InformedConsentRecord;
  [key: string]: any;
  // Normative Compliance Evidence (NMX-F-083 / NOM-255-SCFI)
  nomCompliance?: {
    standard: string;
    humidity: string;
    humidityCompliant: boolean;
    defectPercentage: number;
    defectClassification: string;
    altitudeMeters: number;
    strictAltitude: boolean;
    botanicalPurity: string;
    agroecologicalFreePesticides: boolean;
    evidencePhotos?: {
      grainGridSampleUrl?: string;
      humidityGaugeUrl?: string;
      foliarHealthUrl?: string;
    };
    stellarTxLedger?: number;
    stellarTxHash?: string;
    stellarTimestamp?: string;
    immutableSealStatus?: 'Sellado Inmutable' | 'Pendiente';
  };
  royaltyClause?: {
    percentage: number;
    beneficiary: string;
    smartContractPolicy: string;
    accumulatedRoyaltiesMxn?: number;
    secondarySalesCount?: number;
  };
}

export interface PaymentRecord {
  id: string;
  date: string;
  concept: string;
  lotCode: string;
  amount: number;
  status: 'Completado' | 'En proceso' | 'Disponible';
  buyer: string;
  paymentType?: 'Venta Directa' | 'Regalía Perpetua' | 'Anticipo';
  royaltyRate?: string;
  resaleOrigin?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  audioDuration?: string;
  badge?: string;
  options?: { id: number | string; label: string; sublabel?: string }[];
  isRead?: boolean;
  card?: BotCardData;
}

export type BotCardType =
  | 'lote_registro'
  | 'dictamen_stellar'
  | 'billetera_pago'
  | 'producto_vitrina'
  | 'trazabilidad_pasaporte'
  | 'agente_multiagente'
  | 'logistica_coyote'
  | 'regalias_mercado'
  | 'recibo_ticket';

export interface BotCardData {
  type: BotCardType;
  title?: string;
  subtitle?: string;
  agentName?: string;
  badge?: string;
  data?: Record<string, any>;
}

export interface OrderReceipt {
  id: string;
  date: string;
  items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    artisanName: string;
    location: string;
  }>;
  total: number;
  paymentMethod: 'SPEI Directo a Artesano' | 'Efectivo Contra Entrega' | 'Custodia Escrow Stellar' | string;
  artisanName: string;
  location: string;
  status: 'Pago Confirmado' | 'En preparación en taller';
  stellarTxLedger?: number;
  stellarTxHash?: string;
  trackingStep?: 1 | 2 | 3;
}

/**
 * Interface for Issue #1.1: Modo Parcela Offline
 * Used by students to persist harvest data locally in IndexedDB before syncing to Stellar
 */
export interface PendingOfflineLot {
  tempId: string;
  producerName: string;
  community: string;
  cropType: 'cafe' | 'miel' | 'pulque' | 'artesania';
  variety: string;
  weightKgOrUnits: number;
  priceExpectedMxn: number;
  photoDataUrl: string;
  voiceAudioBlob?: Blob;
  recordedAt: number;
  syncStatus: 'pending' | 'syncing' | 'synced';
}

/**
 * Interface for Field Buyer Validation & Early-Adopter Phone Registry
 * Used by TecNM students to save buyer contacts for future launch notification
 */
export interface BuyerLeadRecord {
  id: string;
  timestamp: string;
  studentName?: string;
  studentGroup?: string;
  buyerCity: string;
  buyerSegment: string;
  interestedProducts: string;
  willingnessToPayExtraMxn?: number;
  susScore?: number;
  consentForFutureContact: boolean;
  notes?: string;
  createdVia: 'field_interview' | 'showcase_optin';
}
