/**
 * Pruebas de los puertos de src/core/chain (ADR-003).
 * Cualquier implementación real debe cumplir el mismo flujo: preparar -> firmar -> enviar.
 */
import {
  SimulatedCardWallet,
  SimulatedEscrow,
  SimulatedExternalWallet,
  SimulatedLotRegistry,
  SimulatedPayout,
  SimulatedWallet,
} from '../core/chain/SimulatedChain';
import { chain } from '../core/chain';

let failures = 0;
function check(cond: boolean, msg: string) {
  console.log(`${cond ? '  ✅ PASS' : '  ❌ FAIL'}: ${msg}`);
  if (!cond) failures++;
}

async function run() {
  console.log('\n🔗 PUERTOS DE CADENA (SimulatedChain)');
  const wallet = new SimulatedWallet();
  check(wallet.kind === 'device', 'La billetera del teléfono se identifica como device');
  check(!(await wallet.hasAccount()), 'Sin cuenta al inicio');
  const { address, recoveryCard } = await wallet.createAccount('1234');
  check(address.startsWith('G'), 'La cuenta tiene dirección pública G...');

  const newPhone = new SimulatedWallet();
  const restored = await newPhone.restoreAccount(recoveryCard, '5678');
  check(restored.address === address && (await newPhone.hasAccount()), 'La tarjeta de recuperación restaura la cuenta en otro teléfono');
  const otherPhone = new SimulatedWallet();
  const badCard = await otherPhone.restoreAccount('TARJETA EQUIVOCADA', '5678').then(() => false, () => true);
  check(badCard && !(await otherPhone.hasAccount()), 'Una tarjeta equivocada no restaura ninguna cuenta');

  const lots = new SimulatedLotRegistry();
  const lotRequest = {
    code: 'MIEL-001', producerAddress: address, location: 'San Juan Ñumí', category: 'Miel de abeja',
    variety: 'Multifloral', volumeRange: 3, photoHashHex: 'a'.repeat(64),
  };
  const tx = await lots.prepareRegisterLot(lotRequest);
  check(tx.summary.includes('MIEL-001'), 'La transacción preparada explica qué se firma');
  const receipt = await lots.submit(await wallet.sign(tx, '1234'));
  check(receipt.source === 'simulated' && receipt.explorerUrl === null, 'El comprobante se marca como simulado');
  const lot = await lots.getLot('MIEL-001');
  check(lot?.source === 'simulated' && lot.producerAddress === address && !lot.certified, 'El lote se registra sin certificar');
  check(lot?.volumeRange === 3 && lot.photoHashHex === 'a'.repeat(64), 'El lote guarda el rango de volumen y el hash de la foto');
  const badRange = await lots.prepareRegisterLot({ ...lotRequest, code: 'MIEL-002', volumeRange: 0 }).then(() => false, () => true);
  check(badRange, 'Se rechaza un rango de volumen que no es un código de la lista');

  // Tarjeta QR: la artesana sin celular firma en el celular de la promotora (#117)
  const card = new SimulatedCardWallet();
  const { address: cardAddress, cardData } = await card.createCard('123456');
  check(card.kind === 'card' && (await card.getAddress(cardData)) === cardAddress, 'La tarjeta da su dirección sin pedir el PIN');
  const cardTx = await lots.prepareRegisterLot({ ...lotRequest, code: 'MIEL-003', producerAddress: cardAddress });
  await lots.submit(await card.sign(cardTx, '123456', cardData));
  check((await lots.getLot('MIEL-003'))?.producerAddress === cardAddress, 'Con la tarjeta y su PIN, la artesana registra su lote');
  const wrongPin = await card.sign(cardTx, '654321', cardData).then(() => false, () => true);
  check(wrongPin, 'Un PIN equivocado no firma con la tarjeta');
  const otherCard = await card.sign(cardTx, '123456', 'TARJETA-AJENA').then(() => false, () => true);
  check(otherCard, 'Una tarjeta dañada o ajena no firma');
  const shortPin = await card.createCard('1234').then(() => false, () => true);
  check(shortPin, 'La tarjeta exige un PIN de 6 números');

  // Billetera propia del comprador (#115)
  const buyer = new SimulatedExternalWallet();
  const { address: buyerAddress } = await buyer.connect();
  check(buyer.kind === 'external' && (await buyer.getAddress()) === buyerAddress, 'El comprador conecta su propia billetera');
  check((await buyer.sign(tx)) === tx.xdr, 'El comprador firma con su billetera');
  const notInstalled = await new SimulatedExternalWallet({ installed: false }).connect().then(() => false, () => true);
  check(notInstalled, 'Sin billetera instalada no se conecta');
  const cancelled = new SimulatedExternalWallet({ approves: false });
  check(await cancelled.connect().then(() => false, () => true), 'Si el comprador cancela, no se conecta ni firma');
  const wrongNetwork = new SimulatedExternalWallet({ networkPassphrase: 'Public Global Stellar Network ; September 2015' });
  await wrongNetwork.connect();
  check(await wrongNetwork.sign(tx).then(() => false, () => true), 'Se rechaza firmar si la billetera está en otra red');

  const escrow = new SimulatedEscrow();
  const order = (orderId: string, percents: number[]) => ({
    orderId, buyerAddress: 'GBUYER', serviceProviderAddress: 'GGRUPO', releaseSignerAddress: address,
    platformAddress: 'GPLATAFORMA', platformFeePercent: 0, disputeResolverAddress: 'GTERCERO',
    amount: 1000, asset: { code: 'USDC', issuer: 'GEMISOR' },
    milestones: percents.map((percent, i) => ({ description: `Hito ${i + 1}`, percent, receiverAddress: address })),
  });
  const send = async (txPromise: Promise<Parameters<typeof wallet.sign>[0]>) => escrow.submit(await wallet.sign(await txPromise, '1234'));

  // Un solo hito (plantilla por defecto)
  const single = await escrow.submitCreate(await wallet.sign(await escrow.prepareCreate(order('ORD-1', [100])), '1234'));
  check(single.escrowId === 'ORD-1' && single.source === 'simulated', 'Crear el escrow devuelve su ID');
  check((await escrow.getStatus('ORD-1')).milestones.length === 1, 'Un pago protegido puede tener un solo hito');
  const releaseTooSoon = await escrow.prepareRelease('ORD-1', 0, address).then(() => false, () => true);
  check(releaseTooSoon, 'La artesana no puede recibir un hito que el comprador no ha aprobado');
  await send(escrow.prepareMarkMilestoneDone('ORD-1', 0, 'GGRUPO'));
  const done = (await escrow.getStatus('ORD-1')).milestones[0];
  check(done.status === 'done' && typeof done.doneAt === 'number', 'Marcar "enviado" guarda cuándo se envió');
  await send(escrow.prepareApproveMilestone('ORD-1', 0, 'GBUYER'));
  await send(escrow.prepareRelease('ORD-1', 0, address));
  const st = await escrow.getStatus('ORD-1');
  check(st.milestones[0].status === 'released' && st.source === 'simulated', 'El escrow simulado recorre el flujo y se marca como simulado');

  // Varios hitos (plantilla con adelanto)
  await escrow.submitCreate(await wallet.sign(await escrow.prepareCreate(order('ORD-2', [30, 70])), '1234'));
  await send(escrow.prepareApproveMilestone('ORD-2', 0, 'GBUYER'));
  await send(escrow.prepareRelease('ORD-2', 0, address));
  const two = (await escrow.getStatus('ORD-2')).milestones;
  check(two.length === 2 && two[0].status === 'released' && two[1].status === 'pending', 'Con dos hitos, cada uno avanza por separado');
  const noThird = await escrow.prepareApproveMilestone('ORD-2', 2, 'GBUYER').then(() => false, () => true);
  check(noThird, 'Se rechaza un hito que no existe');

  const badMilestones = await escrow.prepareCreate(order('ORD-3', [30, 60])).then(() => false, () => true);
  check(badMilestones, 'Se rechaza un escrow cuyos hitos no suman 100%');
  const noMilestones = await escrow.prepareCreate(order('ORD-4', [])).then(() => false, () => true);
  check(noMilestones, 'Se rechaza un escrow sin hitos');

  // Disputas
  await escrow.submitCreate(await wallet.sign(await escrow.prepareCreate(order('ORD-5', [100])), '1234'));
  await send(escrow.prepareDispute('ORD-5', 0, 'GBUYER'));
  check((await escrow.getStatus('ORD-5')).milestones[0].status === 'disputed', 'Una disputa congela el hito');
  await send(escrow.prepareResolveDispute('ORD-5', 0, 'GTERCERO', 0));
  check((await escrow.getStatus('ORD-5')).milestones[0].status === 'resolved', 'Resolver la disputa cierra el hito');
  const badPercent = await escrow.prepareResolveDispute('ORD-5', 0, 'GTERCERO', 120).then(() => false, () => true);
  check(badPercent, 'Se rechaza resolver una disputa con un porcentaje fuera de 0 a 100');

  // Salida a pesos (PayoutPort, #112)
  const payout = new SimulatedPayout();
  check(Boolean(chain.payout), 'chain expone payout (PayoutPort)');
  const quote = await payout.quote(20);
  check(quote.source === 'simulated' && quote.netAmountMxn === 370 && quote.feeMxn === 0, 'quote devuelve el monto neto en pesos y source simulated');

  const zeroQuote = await payout.quote(0).then(() => false, () => true);
  const negativeCashout = await payout.prepareCashout({
    producerAddress: address,
    amountUsdc: -10,
    storeId: 'TIENDA-TLAXIACO-01',
    walletKind: 'device',
  }).then(() => false, () => true);
  check(zeroQuote && negativeCashout, 'Un monto menor o igual a cero se rechaza en quote y prepareCashout');

  // Retiro normal: ready -> collected
  const cashoutTx = await payout.prepareCashout({
    producerAddress: address,
    amountUsdc: 20,
    storeId: 'TIENDA-TLAXIACO-01',
    walletKind: 'device',
  });
  check(cashoutTx.summary.includes('370.00') && cashoutTx.summary.includes('TIENDA-TLAXIACO-01'), 'prepareCashout explica el retiro en pesos y la tienda elegida');
  const cashoutReceipt = await payout.submit(await wallet.sign(cashoutTx, '1234'));
  check(
    cashoutReceipt.source === 'simulated' &&
      cashoutReceipt.cashoutCode.startsWith('YUCU-COBRO-') &&
      cashoutReceipt.expiresAt > Date.now(),
    'submit devuelve comprobante simulado con código de cobro y vencimiento'
  );
  const readyState = await payout.getStatus(cashoutReceipt.payoutId);
  check(readyState.status === 'ready' && readyState.source === 'simulated', 'El retiro inicia en estado ready con source simulated');
  payout.markCollected(cashoutReceipt.payoutId);
  const collectedState = await payout.getStatus(cashoutReceipt.payoutId);
  check(collectedState.status === 'collected' && collectedState.source === 'simulated', 'Un retiro recorre ready -> collected');

  // Retiro vencido -> pasa a refunded
  const expiredTx = await payout.prepareCashout({
    producerAddress: address,
    amountUsdc: 15,
    storeId: 'TIENDA-TLAXIACO-01',
    walletKind: 'device',
  });
  const expiredReceipt = await payout.submit(await wallet.sign(expiredTx, '1234'));
  payout.expire(expiredReceipt.payoutId);
  const refundedState = await payout.getStatus(expiredReceipt.payoutId);
  check(refundedState.status === 'refunded' && refundedState.source === 'simulated', 'Un retiro vencido pasa a refunded');

  // Tarjeta QR (#117 Corrección 2): con 'card', 15 minutos se acepta y 24 horas se rechaza
  const cardCashout15m = await payout.prepareCashout({
    producerAddress: cardAddress,
    amountUsdc: 10,
    storeId: 'TIENDA-TLAXIACO-01',
    walletKind: 'card',
    expiresInMinutes: 15,
  });
  const cardCashoutReceipt = await payout.submit(await card.sign(cardCashout15m, '123456', cardData));
  check(cardCashoutReceipt.source === 'simulated' && cardCashoutReceipt.netAmountMxn === 185, 'Con walletKind card, un retiro de 15 minutos se acepta');

  const cardCashout24h = await payout.prepareCashout({
    producerAddress: cardAddress,
    amountUsdc: 10,
    storeId: 'TIENDA-TLAXIACO-01',
    walletKind: 'card',
    expiresInMinutes: 24 * 60,
  }).then(() => false, () => true);
  check(cardCashout24h, 'Con walletKind card, un retiro de 24 horas se rechaza');

  if (failures > 0) {
    console.error(`\n${failures} prueba(s) fallaron`);
    process.exit(1);
  }
  console.log('\n  Puertos de cadena: 0 fallos');
}
run();
