/**
 * PRUEBAS AUTOMATIZADAS:
 * 1. Arquitectura Híbrida Trilateral (Etherfuse + Polar + PIX + MicoPay)
 * 2. Motor de Identidad Soberana y Login sin Contraseñas para Yucu
 */

import {
  HybridSettlementOrchestrator,
  COUNTRY_CONFIGS,
  SupportedCountry,
} from '../core/settlement/HybridSettlementOrchestrator';
import { RaizAuthEngine, PRESET_USERS } from '../core/auth/RaizAuthEngine';

let passed = 0;
let failed = 0;

function check(assertion: boolean, name: string, detail?: string) {
  if (assertion) {
    console.log(`  ✅ [CORRECTO] ${name}`);
    passed++;
  } else {
    console.error(`  ❌ [FALLO] ${name} ${detail ? `-> ${detail}` : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('================================================================================');
  console.log('   PRUEBAS: ARQUITECTURA HÍBRIDA (MX-BO-BR) Y LOGIN INCLUSIVO RURAL DE RAIZ    ');
  console.log('================================================================================\n');

  // -------------------------------------------------------------------------
  // MÓDULO 1: ARQUITECTURA HÍBRIDA TRILATERAL
  // -------------------------------------------------------------------------
  console.log('📍 1. ORQUESTACIÓN DE PAGOS: ETHERFUSE, POLAR, PIX Y MICOPAY');

  const countries = HybridSettlementOrchestrator.getSupportedCountries();
  check(countries.length === 3, 'Soporte completo para los 3 países solicitados (MX, BO, BR)');

  // Verificación de México (Etherfuse + MicoPay)
  const mxConfig = HybridSettlementOrchestrator.getCountryConfig('MX');
  check(mxConfig.currencyCode === 'MXN', 'México: Moneda peso mexicano (MXN)');
  check(mxConfig.anchorProvider === 'Etherfuse', 'México: Etherfuse como ancla para SPEI y MXNe');
  check(mxConfig.producerFeePercent === 0, 'México: Cero comisión al campesino');

  // Verificación de Bolivia (Polar Stellar Anchor)
  const boConfig = HybridSettlementOrchestrator.getCountryConfig('BO');
  check(boConfig.currencyCode === 'BOB', 'Bolivia: Moneda bolivianos (BOB)');
  check(boConfig.anchorProvider === 'Polar', 'Bolivia: Polar como ancla nativa de Stellar para QR Simple');
  check(boConfig.producerFeePercent === 0, 'Bolivia: Cero comisión a productores de Los Yungas');

  // Verificación de Brasil (PIX Instantâneo)
  const brConfig = HybridSettlementOrchestrator.getCountryConfig('BR');
  check(brConfig.currencyCode === 'BRL', 'Brasil: Moneda Reais (BRL)');
  check(brConfig.anchorProvider === 'PIX Central', 'Brasil: PIX como riel instantáneo 24/7');
  check(brConfig.producerFeePercent === 0, 'Brasil: Cero comisión a productores');

  // Simulación de ruteo y creación de orden transfronteriza
  const simOrderMx = HybridSettlementOrchestrator.createSettlementOrder({
    lotCode: 'MX-2026-984',
    country: 'MX',
    amountMxnEquivalent: 5000,
    producerName: 'Don Aurelio Bautista',
    producerAccount: '4152 3100 8921 4012 (Banco Bienestar)',
    institution: 'Banco del Bienestar vía Etherfuse',
  });
  check(simOrderMx.amountLocal === 5000, 'Orden México: Monto 5,000 MXN preservado al 100%');
  check(simOrderMx.trackingReference.startsWith('SPEI-BANXICO'), 'Orden México: Clave de rastreo Banxico generada');
  check(simOrderMx.stellarTxHash?.startsWith('stx_hybrid_mx'), 'Orden México: Hash de Stellar emitido');

  const simOrderBo = HybridSettlementOrchestrator.createSettlementOrder({
    lotCode: 'BO-2026-112',
    country: 'BO',
    amountMxnEquivalent: 5000,
    producerName: 'Doña Esperanza Mamani',
    producerAccount: 'BO-QR-881920 Banco Unión',
    institution: 'Banco Unión vía Polar',
  });
  check(simOrderBo.currencyCode === 'BOB', 'Orden Bolivia: Conversión a BOB vía Stellar AMM');
  check(simOrderBo.trackingReference.startsWith('POLAR-BCB-QR'), 'Orden Bolivia: Referencia QR Simple ASFI');

  const simOrderBr = HybridSettlementOrchestrator.createSettlementOrder({
    lotCode: 'BR-2026-402',
    country: 'BR',
    amountMxnEquivalent: 5000,
    producerName: 'João Paulo da Silva',
    producerAccount: 'Chave PIX: 35998124021',
    institution: 'Banco Central do Brasil',
  });
  check(simOrderBr.currencyCode === 'BRL', 'Orden Brasil: Liquidación en Reais vía PIX');

  // -------------------------------------------------------------------------
  // MÓDULO 2: LOGIN E IDENTIDAD SOBERANA SIN CONTRASEÑAS
  // -------------------------------------------------------------------------
  console.log('\n📍 2. IDENTIDAD Y LOGIN SIN CONTRASEÑAS (ZERO-SEED-PHRASE)');

  // Verificación de usuarios preconfigurados multi-país y multi-rol
  check(PRESET_USERS.length >= 6, 'Perfiles listos para campesinos, artesanas, estudiantes y compradores');

  // Verificación de derivación de billetera Stellar invisible
  const derivedKey1 = RaizAuthEngine.deriveStellarPublicKey('+525500000001');
  const derivedKey2 = RaizAuthEngine.deriveStellarPublicKey('+59178841920');
  check(derivedKey1.startsWith('GBRAIZ') && derivedKey1.length === 56, 'Billetera Stellar abstracta de 56 caracteres para campesino MX');
  check(derivedKey2.startsWith('GBRAIZ') && derivedKey2.length === 56, 'Billetera Stellar abstracta para campesina BO');
  check(derivedKey1 !== derivedKey2, 'Llaves públicas distintas y unívocas por usuario');

  // Verificación de flujo OTP telefónico para campo
  const otpResult = RaizAuthEngine.sendPhoneOtp('+52 55 0000 0001', 'MX');
  check(otpResult.success && otpResult.verificationCode === '7421', 'Generación de OTP predecible para pruebas');

  const verifiedUser = RaizAuthEngine.verifyPhoneOtp('+52 55 0000 0001', '7421', 'MX');
  check(verifiedUser.role === 'productor', 'Autenticación exitosa de productor rural sin contraseñas');
  check(verifiedUser.loginMethod === 'phone_otp', 'Método registrado: phone_otp');

  // Verificación de acceso por Carnet Comunitario QR
  const carnetUser = RaizAuthEngine.authenticateWithCarnetQr('MX-OAX-4419');
  check(carnetUser.name.includes('Yolanda'), 'Acceso instantáneo con escaneo de Carnet QR físico');

  // Verificación de acceso institucional TecNM
  const studentUser = RaizAuthEngine.authenticateAsTecNMStudent('TECNM-TLX-2208194');
  check(studentUser.role === 'estudiante_tecnm', 'Acceso de Estudiante Residente Open Hub TecNM');

  // Verificación de acceso para comprador internacional
  const buyerUser = RaizAuthEngine.authenticateAsBuyer('compras@tierravivacafe.com', 'Café Tierra Viva');
  check(buyerUser.role === 'comprador', 'Acceso simplificado para compradores y tostadores');

  console.log('\n--------------------------------------------------------------------------------');
  console.log(`TOTAL PRUEBAS: ${passed + failed} | APROBADAS: ${passed} | FALLIDAS: ${failed}`);
  console.log('--------------------------------------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
