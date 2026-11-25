/**
 * Yucu Core - Orquestador de Liquidaciones y Pagos Híbridos Multilaterales
 * 
 * Arquitectura Híbrida Trilateral:
 * 1. MÉXICO:
 *    - Etherfuse (MXNe tokenizado, CETES de rendimiento para cooperativas, SPEI directo Banxico)
 *    - MicoPay (Micro-pagos en parcela, liquidación en efectivo con transportistas y comercios aliados)
 * 2. BOLIVIA:
 *    - Polar (Ancla nativa de Stellar en Bolivia, conexión con QR Simple ASFI / Banco Central de Bolivia, BOB <-> USDC)
 * 3. BRASIL:
 *    - PIX Rails (Banco Central do Brasil, llaves CPF/CNPJ/Email, liquidación instantánea 24/7 conectada a Stellar BRL)
 * 4. STELLAR & SOROBAN CORE:
 *    - Path Payments y AMM para conversión automática de divisas sin pérdida cambiaria
 *    - Contrato Soroban FairEscrow para custodia y liberación automática
 *    - Regalías perpetuas para artesanas según PROTOCOL_FEES
 */

import { PROTOCOL_FEES } from '../../config/protocolFees';

export type SupportedCountry = 'MX' | 'BO' | 'BR';

export type SettlementRail = 
  | 'etherfuse_spei'      // México - SPEI / Etherfuse MXNe
  | 'micopay_parcela'     // México/LatAm - Cajero Móvil en Parcela / Efectivo
  | 'polar_qr_simple'     // Bolivia - QR Simple ASFI / Polar Stellar Anchor
  | 'pix_instant'         // Brasil - PIX Banco Central do Brasil
  | 'stellar_usdc';       // Global - Dólar Digital USDC / Soroban Escrow

export interface CountrySettlementConfig {
  countryCode: SupportedCountry;
  countryName: string;
  flag: string;
  currencyCode: string;
  currencySymbol: string;
  localRailName: string;
  anchorProvider: 'Etherfuse' | 'Polar' | 'PIX Central' | 'MicoPay';
  features: string[];
  settlementTimeSec: number;
  producerFeePercent: number; // sin costo para el campesino
}

export const COUNTRY_CONFIGS: Record<SupportedCountry, CountrySettlementConfig> = {
  MX: {
    countryCode: 'MX',
    countryName: 'México',
    flag: '🇲🇽',
    currencyCode: 'MXN',
    currencySymbol: '$',
    localRailName: 'SPEI Interbancario & Tarjeta Bienestar',
    anchorProvider: 'Etherfuse',
    features: [
      'Etherfuse MXNe: Peso mexicano tokenizado sobre Stellar con reservas declaradas',
      'Liquidación directa SPEI a Banco del Bienestar, BBVA, Banorte y Azteca',
      'MicoPay: Red de transportistas como cajeros móviles en parcelas de la Mixteca',
      'Rendimiento seguro en CETES tokenizados para fondos de ahorro comunitario'
    ],
    settlementTimeSec: 3,
    producerFeePercent: PROTOCOL_FEES.producerFeePct,
  },
  BO: {
    countryCode: 'BO',
    countryName: 'Bolivia',
    flag: '🇧🇴',
    currencyCode: 'BOB',
    currencySymbol: 'Bs.',
    localRailName: 'QR Simple Interbancario (ASFI / BCB)',
    anchorProvider: 'Polar',
    features: [
      'Polar Stellar Anchor: Conexión directa entre el sistema bancario boliviano y Stellar',
      'Cobros y pagos con QR Simple interoperable (Banco Unión, BCP, Bisa, Mercantil)',
      'Protección contra escasez de divisas: Conversión directa BOB <-> USDC en Stellar DEX',
      'Ideal para café de Los Yungas, quinua real de Oruro y tejidos andinos de La Paz'
    ],
    settlementTimeSec: 5,
    producerFeePercent: PROTOCOL_FEES.producerFeePct,
  },
  BR: {
    countryCode: 'BR',
    countryName: 'Brasil',
    flag: '🇧🇷',
    currencyCode: 'BRL',
    currencySymbol: 'R$',
    localRailName: 'PIX Instantâneo (Banco Central)',
    anchorProvider: 'PIX Central',
    features: [
      'Liquidación instantánea 24/7/365 mediante llaves PIX (CPF, Celular, Email)',
      'Ancla Stellar BRL: Entrada y salida transparente entre Reais brasileños y stablecoins',
      'Integración con compradores y tostadores de especialidad en São Paulo y Minas Gerais',
      'Cero contracargos y confirmación criptográfica en menos de 2 segundos'
    ],
    settlementTimeSec: 2,
    producerFeePercent: PROTOCOL_FEES.producerFeePct,
  },
};

export interface HybridPaymentIntent {
  intentId: string;
  lotCode: string;
  country: SupportedCountry;
  amountLocal: number;
  amountUsdc: number;
  currencyCode: string;
  rail: SettlementRail;
  provider: string;
  producerDestination: {
    name: string;
    accountIdentifier: string; // CLABE/Tarjeta, Chave PIX, o Cuenta QR Simple
    institution: string;
  };
  escrowStatus: 'created' | 'funded' | 'released_to_producer' | 'refunded';
  stellarTxHash?: string;
  trackingReference: string;
  timestamp: number;
}

export class HybridSettlementOrchestrator {
  /**
   * Obtiene la configuración del país seleccionado
   */
  public static getCountryConfig(country: SupportedCountry): CountrySettlementConfig {
    return COUNTRY_CONFIGS[country];
  }

  /**
   * Lista todos los países soportados en la arquitectura híbrida
   */
  public static getSupportedCountries(): CountrySettlementConfig[] {
    return Object.values(COUNTRY_CONFIGS);
  }

  /**
   * Calcula el ruteo óptimo de liquidación según país y monto
   */
  public static routePayment(params: {
    country: SupportedCountry;
    amountMxnEquivalent: number;
    preferredRail?: SettlementRail;
  }): {
    recommendedRail: SettlementRail;
    provider: string;
    exchangeRate: number;
    amountInLocalCurrency: number;
    estimatedTime: string;
    zeroFeeGuaranteed: boolean;
  } {
    const { country, amountMxnEquivalent, preferredRail } = params;

    // Tasas de cambio estimadas de referencia para la demostración
    const fxRates = {
      MX: { rate: 1.0, currency: 'MXN' },
      BO: { rate: 0.38, currency: 'BOB' }, // 1 MXN ≈ 0.38 BOB (o ~7 BOB/USD vs 18 MXN/USD)
      BR: { rate: 0.28, currency: 'BRL' }, // 1 MXN ≈ 0.28 BRL
    };

    const targetFx = fxRates[country];
    const amountInLocal = Math.round(amountMxnEquivalent * targetFx.rate * 100) / 100;

    let recommendedRail: SettlementRail = 'etherfuse_spei';
    let provider = 'Etherfuse';

    if (country === 'BO') {
      recommendedRail = 'polar_qr_simple';
      provider = 'Polar (Stellar Anchor Bolivia)';
    } else if (country === 'BR') {
      recommendedRail = 'pix_instant';
      provider = 'PIX / Stellar BRL Anchor';
    } else {
      if (preferredRail === 'micopay_parcela') {
        recommendedRail = 'micopay_parcela';
        provider = 'MicoPay (Cajero Parcela Mixteca)';
      } else {
        recommendedRail = 'etherfuse_spei';
        provider = 'Etherfuse (SPEI / MXNe)';
      }
    }

    return {
      recommendedRail,
      provider,
      exchangeRate: targetFx.rate,
      amountInLocalCurrency: amountInLocal,
      estimatedTime: country === 'BR' ? 'Inmediato (<2 seg)' : country === 'BO' ? '3-5 seg (QR Simple)' : 'Instantáneo (SPEI)',
      zeroFeeGuaranteed: true,
    };
  }

  /**
   * Genera una orden de liquidación híbrida lista para ejecución
   */
  public static createSettlementOrder(params: {
    lotCode: string;
    country: SupportedCountry;
    amountMxnEquivalent: number;
    producerName: string;
    producerAccount: string;
    institution: string;
    rail?: SettlementRail;
  }): HybridPaymentIntent {
    const routing = this.routePayment({
      country: params.country,
      amountMxnEquivalent: params.amountMxnEquivalent,
      preferredRail: params.rail,
    });

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const tracking = params.country === 'MX'
      ? `SPEI-BANXICO-2026-${randomSuffix}`
      : params.country === 'BO'
      ? `POLAR-BCB-QR-${randomSuffix}`
      : `PIX-BACEN-E2E-${randomSuffix}`;

    return {
      intentId: `intent_${params.country.toLowerCase()}_${Date.now()}`,
      lotCode: params.lotCode,
      country: params.country,
      amountLocal: routing.amountInLocalCurrency,
      amountUsdc: Math.round((params.amountMxnEquivalent / 18.5) * 100) / 100,
      currencyCode: COUNTRY_CONFIGS[params.country].currencyCode,
      rail: routing.recommendedRail,
      provider: routing.provider,
      producerDestination: {
        name: params.producerName,
        accountIdentifier: params.producerAccount,
        institution: params.institution,
      },
      escrowStatus: 'funded',
      stellarTxHash: `stx_hybrid_${params.country.toLowerCase()}_${Math.random().toString(16).slice(2, 18)}`,
      trackingReference: tracking,
      timestamp: Date.now(),
    };
  }
}
