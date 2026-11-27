/**
 * Issue #108: textos honestos y porcentajes centralizados.
 * La comparación con Rust usa las constantes del contrato de reventas; el
 * contrato didáctico fair_escrow no se usa desde la aplicación.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import { PROTOCOL_FEES } from '../config/protocolFees';
import { FairTradeEngine } from '../core/policy/FairTradeEngine';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SOURCE_ROOT = join(ROOT, 'src');
const BPS_PER_PERCENT = 100;
const royaltyContract = readFileSync(
  join(ROOT, 'contracts', 'perpetual_royalties', 'src', 'lib.rs'),
  'utf8'
);

function bpsToPercent(constantName: string): number {
  const match = royaltyContract.match(new RegExp(`${constantName}:\\s*i128\\s*=\\s*([\\d_]+)`));
  assert.ok(match, `Falta ${constantName} en el contrato de regalías`);
  return Number(match[1].replace(/_/g, '')) / BPS_PER_PERCENT;
}

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(fullPath);
    return entry.isFile() && /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });
}

const SELF = fileURLToPath(import.meta.url);
const OBSOLETE_FEE = ['escrow', 'Tequio', 'Pct'].join('');
const SOURCE_FILES = [...listSourceFiles(SOURCE_ROOT), join(ROOT, 'server.ts')].filter(
  (file) => file !== SELF
);

test('positiva: PROTOCOL_FEES coincide con el contrato y alimenta el motor de regalías', () => {
  assert.equal(PROTOCOL_FEES.artisanResaleRoyaltyPct, bpsToPercent('ARTISAN_ROYALTY_BPS'));
  assert.equal(PROTOCOL_FEES.resaleTequioPct, bpsToPercent('TEQUIO_COMMUNAL_BPS'));

  const sampleSale = 10_000;
  const split = FairTradeEngine.calculateSecondaryRoyalty(sampleSale);
  const expectedRoyalty = (sampleSale * PROTOCOL_FEES.artisanResaleRoyaltyPct) / BPS_PER_PERCENT;
  const expectedTequio = (sampleSale * PROTOCOL_FEES.resaleTequioPct) / BPS_PER_PERCENT;

  assert.equal(split.artisanRoyaltyMxn, expectedRoyalty);
  assert.equal(split.cooperativeFundMxn, expectedTequio);
  assert.equal(split.sellerNetMxn, sampleSale - expectedRoyalty - expectedTequio);
});

test('negativa: la compra directa ya no descuenta Tequio', () => {
  for (const file of SOURCE_FILES) {
    const content = readFileSync(file, 'utf8');
    assert.ok(
      !content.includes(OBSOLETE_FEE),
      `${relative(ROOT, file)} todavía usa ${OBSOLETE_FEE}`
    );
  }

  const landingPage = readFileSync(join(SOURCE_ROOT, 'components', 'RaizLandingPage.tsx'), 'utf8');
  assert.ok(!landingPage.includes('tequioFund'), 'La landing todavía calcula un fondo de Tequio');
});

test('negativa: no hay porcentajes de comisión o regalía escritos a mano', () => {
  const configured = Array.from(new Set(Object.values(PROTOCOL_FEES))).join('|');
  const hardcoded = new RegExp(
    `\\b(?:${configured})\\s*%[^\\n]{0,60}(?:comisi|regal|royalt|tequio|fee)` +
      `|(?:comisi|regal|royalt|tequio|fee)[^\\n]{0,60}\\b(?:${configured})\\s*%`,
    'i'
  );

  for (const file of SOURCE_FILES) {
    const match = readFileSync(file, 'utf8').match(hardcoded);
    assert.equal(
      match?.[0],
      undefined,
      `${relative(ROOT, file)} repite un porcentaje del protocolo: ${match?.[0] ?? ''}`
    );
  }
});
