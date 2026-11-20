#![cfg(test)]
extern crate std;
use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{Client as TokenClient, StellarAssetClient},
    Env, String,
};

struct Setup<'a> {
    env: Env,
    client: PerpetualRoyaltiesContractClient<'a>,
    token: Address,
    treasury: Address,
    artisan: Address,
    item_id: BytesN<32>,
}

fn setup<'a>() -> Setup<'a> {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(PerpetualRoyaltiesContract, ());
    let client = PerpetualRoyaltiesContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    client.initialize(&admin, &treasury);

    let artisan = Address::generate(&env);
    let community = Address::generate(&env);
    let item_id = BytesN::from_array(&env, &[5u8; 32]);
    client.register_heritage_item(
        &item_id,
        &artisan,
        &community,
        &BytesN::from_array(&env, &[6u8; 32]),
        &String::from_str(&env, "Pieza de prueba"),
    );

    let token_admin = Address::generate(&env);
    let token = env
        .register_stellar_asset_contract_v2(token_admin)
        .address();

    Setup {
        env,
        client,
        token,
        treasury,
        artisan,
        item_id,
    }
}

#[test]
fn registro_exige_firma_de_artesana_y_comunidad() {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register(PerpetualRoyaltiesContract, ());
    let c = PerpetualRoyaltiesContractClient::new(&env, &id);
    c.initialize(&Address::generate(&env), &Address::generate(&env));
    let artisan = Address::generate(&env);
    let community = Address::generate(&env);
    c.register_heritage_item(
        &BytesN::from_array(&env, &[1u8; 32]),
        &artisan,
        &community,
        &BytesN::from_array(&env, &[2u8; 32]),
        &String::from_str(&env, "Pieza"),
    );
    let firmantes: std::vec::Vec<Address> = env.auths().iter().map(|(a, _)| a.clone()).collect();
    assert!(firmantes.contains(&artisan));
    assert!(firmantes.contains(&community));
}

#[test]
fn reventa_reparte_regalia_y_tequio() {
    let s = setup();
    let buyer = Address::generate(&s.env);
    StellarAssetClient::new(&s.env, &s.token).mint(&buyer, &10_000);

    // Primera venta: la artesana es la dueña actual, así que recibe regalía + venta.
    s.client
        .execute_secondary_sale(&s.item_id, &buyer, &s.token, &10_000);

    let tk = TokenClient::new(&s.env, &s.token);
    assert_eq!(tk.balance(&s.artisan), 1_000 + 8_800);
    assert_eq!(tk.balance(&s.treasury), 200);
    assert_eq!(s.client.get_item(&s.item_id).current_owner, buyer);
}

#[test]
fn la_reventa_exige_la_firma_del_dueno_actual() {
    let s = setup();
    let buyer = Address::generate(&s.env);
    StellarAssetClient::new(&s.env, &s.token).mint(&buyer, &10_000);
    s.client
        .execute_secondary_sale(&s.item_id, &buyer, &s.token, &10_000);

    let firmantes: std::vec::Vec<Address> = s.env.auths().iter().map(|(a, _)| a.clone()).collect();
    assert!(firmantes.contains(&buyer));
    assert!(
        firmantes.contains(&s.artisan),
        "el dueño actual debe firmar la venta"
    );
}

#[test]
fn rechaza_precios_que_borran_la_regalia() {
    let s = setup();
    let buyer = Address::generate(&s.env);
    StellarAssetClient::new(&s.env, &s.token).mint(&buyer, &10_000);
    let res = s
        .client
        .try_execute_secondary_sale(&s.item_id, &buyer, &s.token, &1);
    assert_eq!(res, Err(Ok(RoyaltyError::InvalidResalePrice)));
    let res = s
        .client
        .try_execute_secondary_sale(&s.item_id, &buyer, &s.token, &0);
    assert_eq!(res, Err(Ok(RoyaltyError::InvalidResalePrice)));
}

#[test]
fn el_dueno_no_se_vende_a_si_mismo() {
    let s = setup();
    let res = s
        .client
        .try_execute_secondary_sale(&s.item_id, &s.artisan, &s.token, &10_000);
    assert_eq!(res, Err(Ok(RoyaltyError::Unauthorized)));
}

#[test]
fn no_permite_registrar_la_misma_pieza_dos_veces() {
    let s = setup();
    let otra_artesana = Address::generate(&s.env);
    let otra_comunidad = Address::generate(&s.env);
    let res = s.client.try_register_heritage_item(
        &s.item_id,
        &otra_artesana,
        &otra_comunidad,
        &BytesN::from_array(&s.env, &[9u8; 32]),
        &String::from_str(&s.env, "Pieza duplicada"),
    );
    assert_eq!(res, Err(Ok(RoyaltyError::ItemAlreadyRegistered)));
}

#[test]
fn reventa_o_consulta_de_pieza_inexistente_devuelve_error() {
    let s = setup();
    let buyer = Address::generate(&s.env);
    let inexistente = BytesN::from_array(&s.env, &[99u8; 32]);

    let res_get = s.client.try_get_item(&inexistente);
    assert_eq!(res_get, Err(Ok(RoyaltyError::ItemNotFound)));

    let res_sale = s
        .client
        .try_execute_secondary_sale(&inexistente, &buyer, &s.token, &10_000);
    assert_eq!(res_sale, Err(Ok(RoyaltyError::ItemNotFound)));
}

#[test]
fn reventa_falla_si_el_comprador_no_tiene_saldo() {
    let s = setup();
    let comprador_sin_fondos = Address::generate(&s.env);
    let res = s.client.try_execute_secondary_sale(
        &s.item_id,
        &comprador_sin_fondos,
        &s.token,
        &10_000,
    );
    assert!(res.is_err());
    assert_eq!(s.client.get_item(&s.item_id).current_owner, s.artisan);
}
