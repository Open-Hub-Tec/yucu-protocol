/**
 * Pruebas de la billetera del comprador Freighter como WalletPort (Issue #115, ADR-003, ADR-004 D7).
 *
 * Criterios de aceptación verificados:
 * 1. No custodial: ninguna llave privada pasa por la app ni por el servidor.
 * 2. Si la billetera no está instalada o el comprador cancela, se lanza un error explicativo y no se envía nada.
 * 3. Solo testnet: se rechaza firmar si la billetera está en otra red.
 * 4. Pruebas con billetera simulada/mockeada: firma aceptada, cancelada, red incorrecta, no instalada.
 * 5. Selección de billetera del comprador en src/core/chain/index.ts.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { chain, setBuyerWallet, useFreighterBuyerWallet } from '../core/chain';
import { FreighterWallet, type FreighterApi } from '../core/chain/wallet/FreighterWallet';
import type { UnsignedTransaction } from '../core/chain/ports';

const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';
const MAINNET_PASSPHRASE = 'Public Global Stellar Network ; September 2015';
const DEMO_BUYER_ADDR = 'GBUYERDEMO12345678901234567890123456789012345678901234';

const sampleTx: UnsignedTransaction = {
  xdr: 'AAAAIGSampleUnsignedTransactionPayload123456789==',
  networkPassphrase: TESTNET_PASSPHRASE,
  summary: 'Pago de 50 USDC por lote de café artesanal',
};

function createMockFreighterApi(overrides: Partial<FreighterApi> = {}): FreighterApi {
  return {
    async isConnected() {
      return { isConnected: true };
    },
    async requestAccess() {
      return { address: DEMO_BUYER_ADDR };
    },
    async getAddress() {
      return { address: DEMO_BUYER_ADDR };
    },
    async getNetworkDetails() {
      return { networkPassphrase: TESTNET_PASSPHRASE, network: 'TESTNET', networkUrl: 'https://horizon-testnet.stellar.org' };
    },
    async getNetwork() {
      return 'TESTNET';
    },
    async signTransaction(xdr: string) {
      return { signedTxXdr: `SIGNED_${xdr}`, signerAddress: DEMO_BUYER_ADDR };
    },
    ...overrides,
  };
}

describe("FreighterWallet como ExternalWalletPort (#115)", () => {
  test("identifica el puerto como external y no maneja llaves privadas", async () => {
    const wallet = new FreighterWallet(createMockFreighterApi());
    assert.equal(wallet.kind, 'external');
    assert.equal(await wallet.getAddress(), null, 'Sin dirección antes de conectar');
    // Verificar que no existen métodos de custodia de llaves (createAccount / restoreAccount)
    assert.equal('createAccount' in wallet, false);
    assert.equal('restoreAccount' in wallet, false);
  });

  test("isAvailable devuelve false cuando la extensión Freighter no está instalada", async () => {
    const wallet = new FreighterWallet(
      createMockFreighterApi({
        async isConnected() {
          return { isConnected: false };
        },
      })
    );
    assert.equal(await wallet.isAvailable(), false);
  });

  test("isAvailable maneja respuesta booleana directa", async () => {
    const wallet = new FreighterWallet(
      createMockFreighterApi({
        async isConnected() {
          return true;
        },
      })
    );
    assert.equal(await wallet.isAvailable(), true);
  });

  test("connect falla con mensaje explicativo si Freighter no está instalado", async () => {
    const wallet = new FreighterWallet(
      createMockFreighterApi({
        async isConnected() {
          return false;
        },
      })
    );
    await assert.rejects(
      async () => wallet.connect(),
      /No encontramos tu billetera\. Instálala y vuelve a intentar\./
    );
  });

  test("connect falla con mensaje explicativo si el comprador cancela la conexión", async () => {
    const wallet = new FreighterWallet(
      createMockFreighterApi({
        async requestAccess() {
          return { address: '', error: 'User declined' };
        },
      })
    );
    await assert.rejects(
      async () => wallet.connect(),
      /Cancelaste la conexión con tu billetera\./
    );
  });

  test("connect solicita autorización y almacena la dirección pública al aceptar", async () => {
    const wallet = new FreighterWallet(createMockFreighterApi());
    const result = await wallet.connect();
    assert.equal(result.address, DEMO_BUYER_ADDR);
    assert.equal(await wallet.getAddress(), DEMO_BUYER_ADDR);
  });

  test("connect recurre a getAddress si requestAccess no está disponible", async () => {
    const api = createMockFreighterApi();
    delete api.requestAccess;
    const wallet = new FreighterWallet(api);
    const result = await wallet.connect();
    assert.equal(result.address, DEMO_BUYER_ADDR);
  });

  test("sign falla si se invoca antes de conectar la billetera", async () => {
    const wallet = new FreighterWallet(createMockFreighterApi());
    await assert.rejects(
      async () => wallet.sign(sampleTx),
      /Primero conecta tu billetera\./
    );
  });

  test("sign rechaza la firma si la billetera está en otra red (mainnet vs testnet)", async () => {
    const wallet = new FreighterWallet(
      createMockFreighterApi({
        async getNetworkDetails() {
          return { networkPassphrase: MAINNET_PASSPHRASE, network: 'PUBLIC', networkUrl: 'https://horizon.stellar.org' };
        },
        async getNetwork() {
          return 'PUBLIC';
        },
      })
    );
    await wallet.connect();
    await assert.rejects(
      async () => wallet.sign(sampleTx),
      /Tu billetera está en otra red\. Cámbiala a la red de pruebas\./
    );
  });

  test("sign rechaza si getNetwork reporta red distinta a TESTNET", async () => {
    const api = createMockFreighterApi({
      async getNetwork() {
        return 'PUBLIC';
      },
    });
    delete api.getNetworkDetails;
    const wallet = new FreighterWallet(api);
    await wallet.connect();
    await assert.rejects(
      async () => wallet.sign(sampleTx),
      /Tu billetera está en otra red\. Cámbiala a la red de pruebas\./
    );
  });

  test("sign falla con mensaje claro si el comprador cancela la firma en Freighter", async () => {
    const wallet = new FreighterWallet(
      createMockFreighterApi({
        async signTransaction() {
          return { signedTxXdr: '', error: 'User rejected transaction' };
        },
      })
    );
    await wallet.connect();
    await assert.rejects(
      async () => wallet.sign(sampleTx),
      /Cancelaste la firma\. No se envió nada\./
    );
  });

  test("sign retorna el XDR firmado cuando el comprador aprueba la transacción", async () => {
    const wallet = new FreighterWallet(createMockFreighterApi());
    await wallet.connect();
    const signedXdr = await wallet.sign(sampleTx);
    assert.equal(signedXdr, `SIGNED_${sampleTx.xdr}`);
  });
});

describe("Selección de billetera del comprador en chain (#115)", () => {
  test("permite cambiar la billetera del comprador con setBuyerWallet", () => {
    const initialWallet = chain.wallets.external;
    const customWallet = new FreighterWallet(createMockFreighterApi());

    setBuyerWallet(customWallet);
    assert.equal(chain.wallets.external, customWallet);
    assert.equal(chain.wallets.external.kind, 'external');

    // Restaurar billetera inicial
    setBuyerWallet(initialWallet);
    assert.equal(chain.wallets.external, initialWallet);
  });

  test("useFreighterBuyerWallet asigna FreighterWallet en chain.wallets.external", () => {
    const initialWallet = chain.wallets.external;
    const mockApi = createMockFreighterApi();

    const freighter = useFreighterBuyerWallet(mockApi);
    assert.equal(chain.wallets.external, freighter);
    assert.equal(chain.wallets.external.kind, 'external');

    // Restaurar billetera inicial
    setBuyerWallet(initialWallet);
    assert.equal(chain.wallets.external, initialWallet);
  });
});
