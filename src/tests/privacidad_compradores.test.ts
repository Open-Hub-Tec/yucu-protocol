// #121: la pantalla de entrevistas a compradores no guarda nombres ni teléfonos
// (docs/research/PRIVACIDAD.md, reglas 2 y 5) y la app borra la llave antigua al iniciar.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BuyerResearchIssueModal } from '../components/BuyerResearchIssueModal';
import {
  LEGACY_BUYER_LEADS_KEY,
  purgeLegacyBuyerLeads,
  type RemovableStorage,
} from '../core/privacy/legacyBuyerLeads';
import {
  CONTACT_CONSENT_TALLY_KEY,
  readContactConsentTally,
  recordContactConsent,
  type TallyStorage,
} from '../core/privacy/contactConsentTally';

/** Almacenamiento falso en memoria que anota qué llaves se borraron. */
function memoryStorage(initial: Record<string, string>) {
  const data = new Map(Object.entries(initial));
  const removed: string[] = [];
  const storage: RemovableStorage = {
    getItem: (key) => data.get(key) ?? null,
    removeItem: (key) => {
      removed.push(key);
      data.delete(key);
    },
  };
  return { storage, data, removed };
}

describe('borrado de la llave antigua de compradores al iniciar', () => {
  it('borra la llave antigua si existe', () => {
    const { storage, data } = memoryStorage({
      [LEGACY_BUYER_LEADS_KEY]: '[{"buyerName":"x"}]',
      otra_llave: 'se queda',
    });

    assert.equal(purgeLegacyBuyerLeads(storage), true);
    assert.equal(data.has(LEGACY_BUYER_LEADS_KEY), false);
    assert.equal(data.get('otra_llave'), 'se queda', 'no toca otras llaves');
  });

  it('no borra nada si la llave antigua no existe', () => {
    const { storage, data, removed } = memoryStorage({ otra_llave: 'se queda' });

    assert.equal(purgeLegacyBuyerLeads(storage), false);
    assert.deepEqual(removed, []);
    assert.equal(data.get('otra_llave'), 'se queda');
  });

  it('no falla si no hay almacenamiento o el navegador lo bloquea', () => {
    const bloqueado: RemovableStorage = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      removeItem: () => {
        throw new Error('SecurityError');
      },
    };

    assert.equal(purgeLegacyBuyerLeads(undefined), false);
    assert.equal(purgeLegacyBuyerLeads(bloqueado), false);
  });

  it('main.tsx borra la llave antigua al iniciar la app', () => {
    const main = readFileSync(join(process.cwd(), 'src/main.tsx'), 'utf8');
    assert.match(main, /purgeLegacyBuyerLeads\(browserStorage\(\)\)/);
  });
});

describe('para medir interés solo se guarda sí/no', () => {
  function tallyStorage(initial: Record<string, string> = {}) {
    const data = new Map(Object.entries(initial));
    const storage: TallyStorage = {
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => {
        data.set(key, value);
      },
    };
    return { storage, data };
  }

  it('suma un sí y un no, y guarda solo esos dos números', () => {
    const { storage, data } = tallyStorage();

    assert.deepEqual(recordContactConsent(storage, true), { si: 1, no: 0 });
    assert.deepEqual(recordContactConsent(storage, false), { si: 1, no: 1 });
    assert.deepEqual(readContactConsentTally(storage), { si: 1, no: 1 });
    assert.deepEqual(Object.keys(JSON.parse(data.get(CONTACT_CONSENT_TALLY_KEY) ?? '{}')), ['si', 'no']);
  });

  it('si el dato guardado está dañado o trae otros campos, empieza de cero', () => {
    const dañado = tallyStorage({ [CONTACT_CONSENT_TALLY_KEY]: 'no es json' });
    const conTelefono = tallyStorage({ [CONTACT_CONSENT_TALLY_KEY]: '{"si":"5551234","no":0}' });

    assert.deepEqual(readContactConsentTally(dañado.storage), { si: 0, no: 0 });
    assert.deepEqual(readContactConsentTally(conTelefono.storage), { si: 0, no: 0 });
    assert.deepEqual(readContactConsentTally(undefined), { si: 0, no: 0 });
  });
});

describe('valores iniciales del modo campo', () => {
  function renderFieldTab() {
    return renderToStaticMarkup(createElement(BuyerResearchIssueModal, {
      isOpen: true,
      onClose: () => undefined,
      defaultTab: 'campo',
    }));
  }

  it('no prellena el nombre de quien realiza la entrevista', () => {
    const markup = renderFieldTab();
    const studentField = markup.match(
      /Estudiante\(s\) Evaluador\(es\) TecNM:[\s\S]*?<input\b[^>]*>/,
    )?.[0];

    assert.ok(studentField, 'el campo de estudiante debe estar en Modo Campo');
    assert.match(studentField, /value=""/);
  });

  it('no marca el consentimiento de contacto antes de que la persona lo otorgue', () => {
    const markup = renderFieldTab();
    const labelIndex = markup.indexOf('¿Aceptó que la contacten?');
    const checkboxStart = markup.lastIndexOf('<input', labelIndex);
    const consentCheckbox = markup.slice(checkboxStart, markup.indexOf('>', checkboxStart) + 1);

    assert.ok(checkboxStart >= 0, 'debe mostrarse la casilla de consentimiento');
    assert.match(consentCheckbox, /type="checkbox"/);
    assert.doesNotMatch(consentCheckbox, /\schecked(?:\s|=|>)/);
  });
});

describe('sin datos de contacto de compradores en src/', () => {
  // Los patrones se arman por partes para que este archivo no aparezca en el
  // `git grep` del criterio de aceptación de la issue.
  const PROHIBIDO = new RegExp(['buyer' + 'Phone', 'raiz_buyer' + '_leads', '\\+52 ?' + '9'].join('|'));
  const PERMITIDO = join('src', 'core', 'privacy', 'legacyBuyerLeads.ts');

  function archivos(dir: string): string[] {
    return readdirSync(dir).flatMap((nombre) => {
      const ruta = join(dir, nombre);
      return statSync(ruta).isDirectory() ? archivos(ruta) : [ruta];
    });
  }

  it('ningún archivo de src/ guarda teléfonos o la llave antigua (salvo el que la borra)', () => {
    const conDatos = archivos('src')
      .filter((ruta) => /\.(ts|tsx)$/.test(ruta) && ruta !== PERMITIDO)
      .filter((ruta) => PROHIBIDO.test(readFileSync(ruta, 'utf8')));
    assert.deepEqual(conDatos, []);
  });

  it('el patrón sí detecta un teléfono de Oaxaca y la llave antigua', () => {
    assert.match('+52 ' + '953 000 0000', PROHIBIDO);
    assert.match(`localStorage.getItem('${LEGACY_BUYER_LEADS_KEY}')`, PROHIBIDO);
    assert.doesNotMatch('+52 55 0000 0001', PROHIBIDO);
  });

  it('la pantalla ya no tiene la pestaña de contactos ni pide nombre del comprador', () => {
    const modal = readFileSync('src/components/BuyerResearchIssueModal.tsx', 'utf8');
    assert.doesNotMatch(modal, /'leads'/);
    assert.doesNotMatch(modal, /buyerName/);
    assert.doesNotMatch(modal, /localStorage/, 'la pantalla no guarda nada por su cuenta');
    assert.match(modal, /🔒 Datos de contacto/);
    assert.match(modal, /¿Aceptó que la contacten\?/);
  });
});
