#![cfg(test)]
use super::*;
use soroban_sdk::{
    contract, contractimpl,
    testutils::{Address as _, Ledger},
    token::{Client as TokenClient, StellarAssetClient},
    Env,
};

/// Registro de atestaciones simulado solo para pruebas.
#[contract]
pub struct MockRegistry;

#[contractimpl]
impl MockRegistry {
    pub fn set_valid(env: Env, uid: BytesN<32>, valid: bool) {
        env.storage().persistent().set(&uid, &valid);
    }
    pub fn verify_attestation(env: Env, attestation_uid: BytesN<32>) -> bool {
        env.storage()
            .persistent()
            .get(&attestation_uid)
            .unwrap_or(false)
    }
}

struct Setup<'a> {
    env: Env,
    client: FairEscrowContractClient<'a>,
    registry: MockRegistryClient<'a>,
    token: Address,
    admin: Address,
    micopay: Address,
    treasury: Address,
    buyer: Address,
    producer: Address,
}

fn setup<'a>() -> Setup<'a> {
    let env = Env::default();
    env.mock_all_auths();

    let registry_id = env.register(MockRegistry, ());
    let registry = MockRegistryClient::new(&env, &registry_id);

    let contract_id = env.register(FairEscrowContract, ());
    let client = FairEscrowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let micopay = Address::generate(&env);
    let treasury = Address::generate(&env);
    client.initialize(&admin, &registry_id, &micopay, &treasury);

    let token_admin = Address::generate(&env);
    let token = env
        .register_stellar_asset_contract_v2(token_admin)
        .address();
    let buyer = Address::generate(&env);
    let producer = Address::generate(&env);
    StellarAssetClient::new(&env, &token).mint(&buyer, &10_000);

    Setup {
        env,
        client,
        registry,
        token,
        admin,
        micopay,
        treasury,
        buyer,
        producer,
    }
}

fn uid(env: &Env, n: u8) -> BytesN<32> {
    BytesN::from_array(env, &[n; 32])
}

#[test]
fn compra_y_liberacion_con_atestacion_valida() {
    let s = setup();
    let order = uid(&s.env, 1);
    s.client.create_and_fund_order(
        &order,
        &s.buyer,
        &s.producer,
        &s.token,
        &5_000,
        &1_000,
        &PayoutRail::EtherfuseSpeiBanxico,
    );
    assert_eq!(s.client.get_order(&order).status, OrderStatus::Funded);

    let delivery = uid(&s.env, 9);
    s.registry.set_valid(&delivery, &true);
    s.client
        .release_with_attestation(&order, &delivery, &s.buyer);

    let tk = TokenClient::new(&s.env, &s.token);
    assert_eq!(tk.balance(&s.producer), 4_900); // 98%
    assert_eq!(tk.balance(&s.treasury), 100); // 2% Tequio
    assert_eq!(s.client.get_order(&order).status, OrderStatus::Settled);
}

#[test]
fn rail_micopay_paga_a_la_autoridad_micopay() {
    let s = setup();
    let order = uid(&s.env, 1);
    s.client.create_and_fund_order(
        &order,
        &s.buyer,
        &s.producer,
        &s.token,
        &5_000,
        &1_000,
        &PayoutRail::MicoPayScaleCash,
    );
    let delivery = uid(&s.env, 9);
    s.registry.set_valid(&delivery, &true);
    s.client
        .release_with_attestation(&order, &delivery, &s.admin);
    assert_eq!(
        TokenClient::new(&s.env, &s.token).balance(&s.micopay),
        4_900
    );
}

#[test]
fn un_tercero_no_puede_liberar() {
    let s = setup();
    let order = uid(&s.env, 1);
    s.client.create_and_fund_order(
        &order,
        &s.buyer,
        &s.producer,
        &s.token,
        &5_000,
        &1_000,
        &PayoutRail::EtherfuseSpeiBanxico,
    );
    let delivery = uid(&s.env, 9);
    s.registry.set_valid(&delivery, &true);

    let intruso = Address::generate(&s.env);
    let res = s
        .client
        .try_release_with_attestation(&order, &delivery, &intruso);
    assert_eq!(res, Err(Ok(EscrowError::Unauthorized)));
    // Ni siquiera el productor puede liberarse a sí mismo
    let res = s
        .client
        .try_release_with_attestation(&order, &delivery, &s.producer);
    assert_eq!(res, Err(Ok(EscrowError::Unauthorized)));
}

#[test]
fn atestacion_invalida_no_libera() {
    let s = setup();
    let order = uid(&s.env, 1);
    s.client.create_and_fund_order(
        &order,
        &s.buyer,
        &s.producer,
        &s.token,
        &5_000,
        &1_000,
        &PayoutRail::EtherfuseSpeiBanxico,
    );
    let res = s
        .client
        .try_release_with_attestation(&order, &uid(&s.env, 77), &s.buyer);
    assert_eq!(res, Err(Ok(EscrowError::DeliveryAttestationInvalid)));
}

#[test]
fn precio_minimo_lo_fija_el_productor() {
    let s = setup();
    s.client.set_min_price(&s.producer, &s.token, &4_500);
    let res = s.client.try_create_and_fund_order(
        &uid(&s.env, 1),
        &s.buyer,
        &s.producer,
        &s.token,
        &3_000,
        &1_000,
        &PayoutRail::EtherfuseSpeiBanxico,
    );
    assert_eq!(res, Err(Ok(EscrowError::PriceBelowAntiCoyoteGuardrail)));
    s.client.create_and_fund_order(
        &uid(&s.env, 2),
        &s.buyer,
        &s.producer,
        &s.token,
        &4_500,
        &1_000,
        &PayoutRail::EtherfuseSpeiBanxico,
    );
}

#[test]
fn reembolso_del_comprador_solo_despues_de_la_fecha_limite() {
    let s = setup();
    let order = uid(&s.env, 1);
    s.client.create_and_fund_order(
        &order,
        &s.buyer,
        &s.producer,
        &s.token,
        &5_000,
        &1_000,
        &PayoutRail::EtherfuseSpeiBanxico,
    );

    let res = s.client.try_refund(&order, &s.buyer);
    assert_eq!(res, Err(Ok(EscrowError::DeadlineNotReached)));

    s.env.ledger().with_mut(|l| l.timestamp = 1_001);
    s.client.refund(&order, &s.buyer);
    assert_eq!(TokenClient::new(&s.env, &s.token).balance(&s.buyer), 10_000);
    assert_eq!(s.client.get_order(&order).status, OrderStatus::Refunded);

    // Una orden reembolsada ya no se puede liberar
    let delivery = uid(&s.env, 9);
    s.registry.set_valid(&delivery, &true);
    let res = s
        .client
        .try_release_with_attestation(&order, &delivery, &s.buyer);
    assert_eq!(res, Err(Ok(EscrowError::InvalidOrderStatus)));
}

#[test]
fn el_arbitro_puede_reembolsar_antes_de_la_fecha() {
    let s = setup();
    let order = uid(&s.env, 1);
    s.client.create_and_fund_order(
        &order,
        &s.buyer,
        &s.producer,
        &s.token,
        &5_000,
        &1_000,
        &PayoutRail::EtherfuseSpeiBanxico,
    );
    s.client.refund(&order, &s.admin);
    assert_eq!(TokenClient::new(&s.env, &s.token).balance(&s.buyer), 10_000);
}

#[test]
fn rechaza_ordenes_con_monto_invalido_duplicadas_o_al_mismo_productor() {
    let s = setup();
    let res_min = s.client.try_set_min_price(&s.producer, &s.token, &-100);
    assert_eq!(res_min, Err(Ok(EscrowError::InvalidAmount)));

    let res_cero = s.client.try_create_and_fund_order(
        &uid(&s.env, 10),
        &s.buyer,
        &s.producer,
        &s.token,
        &0,
        &1_000,
        &PayoutRail::EtherfuseSpeiBanxico,
    );
    assert_eq!(res_cero, Err(Ok(EscrowError::InvalidAmount)));

    let res_mismo = s.client.try_create_and_fund_order(
        &uid(&s.env, 11),
        &s.buyer,
        &s.buyer,
        &s.token,
        &1_000,
        &1_000,
        &PayoutRail::EtherfuseSpeiBanxico,
    );
    assert_eq!(res_mismo, Err(Ok(EscrowError::InvalidAmount)));

    let order = uid(&s.env, 12);
    s.client.create_and_fund_order(
        &order,
        &s.buyer,
        &s.producer,
        &s.token,
        &2_000,
        &1_000,
        &PayoutRail::EtherfuseSpeiBanxico,
    );
    let res_dup = s.client.try_create_and_fund_order(
        &order,
        &s.buyer,
        &s.producer,
        &s.token,
        &2_000,
        &1_000,
        &PayoutRail::EtherfuseSpeiBanxico,
    );
    assert_eq!(res_dup, Err(Ok(EscrowError::OrderAlreadyExists)));
}

#[test]
fn operaciones_sobre_orden_inexistente_o_ya_liquidada_devuelven_error() {
    let s = setup();
    let inexistente = uid(&s.env, 44);
    assert_eq!(
        s.client.try_get_order(&inexistente),
        Err(Ok(EscrowError::OrderNotFound))
    );
    assert_eq!(
        s.client.try_refund(&inexistente, &s.admin),
        Err(Ok(EscrowError::OrderNotFound))
    );
    assert_eq!(
        s.client
            .try_release_with_attestation(&inexistente, &uid(&s.env, 9), &s.buyer),
        Err(Ok(EscrowError::OrderNotFound))
    );

    let order = uid(&s.env, 45);
    s.client.create_and_fund_order(
        &order,
        &s.buyer,
        &s.producer,
        &s.token,
        &3_000,
        &1_000,
        &PayoutRail::EtherfuseSpeiBanxico,
    );
    let delivery = uid(&s.env, 9);
    s.registry.set_valid(&delivery, &true);
    s.client
        .release_with_attestation(&order, &delivery, &s.buyer);

    let res_refund = s.client.try_refund(&order, &s.admin);
    assert_eq!(res_refund, Err(Ok(EscrowError::InvalidOrderStatus)));
}
