// W53 #182: los textos de campo explican el sello sin prometer de más (regla 8, #108)
// y sin palabras técnicas (ADR-004 D1, FRONTEND.md sección 6).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  TEXTOS_ACCIONES,
  TEXTOS_ESCUCHAR,
  TEXTOS_MICROFONO,
  TEXTOS_NAVEGACION,
  TEXTOS_SELLO,
} from '../textos/campo';

const todosLosTextos = [
  ...Object.values(TEXTOS_SELLO),
  ...Object.values(TEXTOS_NAVEGACION),
  ...Object.values(TEXTOS_MICROFONO),
  ...Object.values(TEXTOS_ESCUCHAR),
  TEXTOS_ACCIONES.antesDeGuardar('Café'),
];

const PROHIBIDAS = /oficial|certificad|blockchain|billetera|wallet|token|cripto|hash|ledger|stellar|usdc|xlm/i;

describe('textos de campo', () => {
  it('el sello dice que tú lo hiciste y que no cobra nada', () => {
    assert.equal(TEXTOS_SELLO.explicacion, 'Este sello dice que tú lo hiciste. No cobra nada.');
  });

  it('ningún texto usa "oficial", "certificado" ni palabras técnicas', () => {
    for (const texto of todosLosTextos) {
      assert.doesNotMatch(texto, PROHIBIDAS, `Texto con palabra prohibida: "${texto}"`);
    }
  });

  it('la regla de palabras prohibidas sí detecta un texto que promete de más', () => {
    assert.match('Sello oficial certificado en Stellar', PROHIBIDAS);
  });

  it('antes de guardar, una frase dice lo que va a pasar', () => {
    assert.equal(TEXTOS_ACCIONES.antesDeGuardar('Café'), 'Vas a guardar tu café. Puedes cambiarlo después.');
    assert.equal(TEXTOS_ACCIONES.antesDeGuardar('   '), 'Vas a guardar tu producto. Puedes cambiarlo después.');
  });
});

describe('código nuevo sin tamaños de letra en píxeles (FRONTEND.md, sección 4)', () => {
  const carpeta = join(process.cwd(), 'src', 'components', 'accesibilidad');
  const archivos = readdirSync(carpeta).filter((f) => f.endsWith('.tsx'));
  const PIXELES = /text-\[\d+(\.\d+)?px\]|font-?size:\s*\d+(\.\d+)?px|fontSize:\s*['"]?\d/;

  it('hay componentes nuevos que revisar', () => {
    assert.ok(archivos.length >= 5, `Se esperaban los componentes de accesibilidad, hay ${archivos.length}`);
  });

  for (const archivo of archivos) {
    it(`${archivo} no usa tamaños de letra en píxeles`, () => {
      const codigo = readFileSync(join(carpeta, archivo), 'utf8');
      assert.doesNotMatch(codigo, PIXELES);
    });
  }

  it('la revisión sí detecta un tamaño en píxeles', () => {
    assert.match('className="text-[11px] font-bold"', PIXELES);
  });
});
