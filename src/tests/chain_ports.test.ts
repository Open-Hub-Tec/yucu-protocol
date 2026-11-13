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

  // Salida a pesos desde la cuenta de la artesana (#112)
  let fakeNow = 1_000_000;
  const payout = new SimulatedPayout({ now: () => fakeNow });
  const quote = await payout.quote(10);
  check(quote.source === 'simulated' && quote.amountPesos > 0, 'La cotización dice cuántos pesos recibe la artesana');
  check(await payout.quote(0).then(() => false, () => true), 'Se rechaza un retiro de cero');
  check(await payout.quote(-5).then(() => false, () => true), 'Se rechaza un retiro con monto negativo');

  const cashoutRequest = {
    producerAddress: address, amountUsdc: 50, walletKind: 'device' as const,
    agentCode: 'TIENDA-01', expiresInMinutes: 15,
  };
  const cashoutTx = await payout.prepareCashout(cashoutRequest);
  check(cashoutTx.summary.includes('TIENDA-01'), 'La transacción preparada explica dónde se cobra');
  const cashout = await payout.submit(await wallet.sign(cashoutTx, '1234'));
  check(cashout.source === 'simulated' && cashout.code.length > 0 && cashout.expiresAt > fakeNow, 'El retiro devuelve su código y vencimiento');
  check((await payout.getStatus(cashout.cashoutId)).status === 'ready', 'El retiro queda listo para cobrar');
  payout.markCollected(cashout.cashoutId);
  check((await payout.getStatus(cashout.cashoutId)).status === 'collected', 'El retiro pasa de listo a cobrado');

  const expiringTx = await payout.prepareCashout({ ...cashoutRequest, agentCode: 'TIENDA-02' });
  const expiring = await payout.submit(await wallet.sign(expiringTx, '1234'));
  fakeNow = expiring.expiresAt + 1;
  check((await payout.getStatus(expiring.cashoutId)).status === 'expired', 'Un retiro vencido deja de estar listo');
  fakeNow = expiring.expiresAt + 6 * 60_000;
  check((await payout.getStatus(expiring.cashoutId)).status === 'refunded', 'El retiro vencido se devuelve a la cuenta de la artesana');
  check((await payout.getStatus(expiring.cashoutId)).source === 'simulated', 'El estado del retiro se marca como simulado');

  const cardCashout = await payout.prepareCashout({ ...cashoutRequest, walletKind: 'card', expiresInMinutes: 15 });
  check(cardCashout.summary.includes('TIENDA-01'), 'Con la tarjeta QR se acepta un código de 15 minutos');
  const longCard = await payout.prepareCashout({ ...cashoutRequest, walletKind: 'card', expiresInMinutes: 24 * 60 }).then(() => false, () => true);
  check(longCard, 'Con la tarjeta QR se rechaza un código de 24 horas');

  if (failures > 0) {
    console.error(`\n${failures} prueba(s) fallaron`);
    process.exit(1);
  }
  console.log('\n  Puertos de cadena: 0 fallos');
}
run();
