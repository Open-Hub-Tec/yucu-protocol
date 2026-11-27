#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Env, String};

/// Devuelve (env, cliente, admin, certificador, productor).
fn setup<'a>() -> (
    Env,
    LotPassportContractClient<'a>,
    Address,
    Address,
    Address,
) {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register(LotPassportContract, ());
    let client = LotPassportContractClient::new(&env, &id);
    let admin = Address::generate(&env);
    let certifier = Address::generate(&env);
    let producer = Address::generate(&env);
    client.initialize(&admin, &certifier);
    (env, client, admin, certifier, producer)
}

fn registrar(
    env: &Env,
    c: &LotPassportContractClient,
    certifier: &Address,
    producer: &Address,
    code: &str,
) {
    c.register_lot(
        certifier,
        &String::from_str(env, code),
        producer,
        &String::from_str(env, "San Juan Ñumí"),
        &String::from_str(env, "Miel de abeja"),
        &String::from_str(env, "Multifloral"),
        &120,
        &BytesN::from_array(env, &[7u8; 32]),
    );
}

#[test]
fn el_lote_nace_sin_certificar_y_luego_se_certifica() {
    let (env, c, _admin, certifier, producer) = setup();
    registrar(&env, &c, &certifier, &producer, "MIEL-001");

    let lot = c.get_lot(&String::from_str(&env, "MIEL-001"));
    assert!(!lot.certified);
    assert_eq!(lot.lab_cert_hash, None);
    assert_eq!(lot.producer, producer);

    c.certify_lot(
        &certifier,
        &String::from_str(&env, "MIEL-001"),
        &BytesN::from_array(&env, &[8u8; 32]),
        &87,
    );
    let lot = c.get_lot(&String::from_str(&env, "MIEL-001"));
    assert!(lot.certified);
    assert_eq!(lot.certification_score, 87);
}

#[test]
fn solo_el_certificador_registra_y_certifica() {
    let (env, c, _admin, certifier, producer) = setup();
    let intruso = Address::generate(&env);
    let res = c.try_register_lot(
        &intruso,
        &String::from_str(&env, "X-1"),
        &producer,
        &String::from_str(&env, "Tlaxiaco"),
        &String::from_str(&env, "Textil"),
        &String::from_str(&env, "Telar"),
        &1,
        &BytesN::from_array(&env, &[1u8; 32]),
    );
    assert_eq!(res, Err(Ok(Error::Unauthorized)));

    registrar(&env, &c, &certifier, &producer, "MIEL-002");
    let res = c.try_certify_lot(
        &intruso,
        &String::from_str(&env, "MIEL-002"),
        &BytesN::from_array(&env, &[8u8; 32]),
        &99,
    );
    assert_eq!(res, Err(Ok(Error::Unauthorized)));
}

#[test]
fn no_se_duplica_ni_se_recertifica() {
    let (env, c, _admin, certifier, producer) = setup();
    registrar(&env, &c, &certifier, &producer, "MIEL-003");
    let res = c.try_register_lot(
        &certifier,
        &String::from_str(&env, "MIEL-003"),
        &producer,
        &String::from_str(&env, "San Juan Ñumí"),
        &String::from_str(&env, "Miel de abeja"),
        &String::from_str(&env, "Multifloral"),
        &1,
        &BytesN::from_array(&env, &[1u8; 32]),
    );
    assert_eq!(res, Err(Ok(Error::LotAlreadyExists)));

    c.certify_lot(
        &certifier,
        &String::from_str(&env, "MIEL-003"),
        &BytesN::from_array(&env, &[8u8; 32]),
        &80,
    );
    let res = c.try_certify_lot(
        &certifier,
        &String::from_str(&env, "MIEL-003"),
        &BytesN::from_array(&env, &[9u8; 32]),
        &95,
    );
    assert_eq!(res, Err(Ok(Error::AlreadyCertified)));
}

#[test]
fn el_admin_no_registra_lotes() {
    let (env, c, admin, _certifier, producer) = setup();
    let res = c.try_register_lot(
        &admin,
        &String::from_str(&env, "MIEL-004"),
        &producer,
        &String::from_str(&env, "San Juan Ñumí"),
        &String::from_str(&env, "Miel de abeja"),
        &String::from_str(&env, "Multifloral"),
        &1,
        &BytesN::from_array(&env, &[1u8; 32]),
    );
    assert_eq!(res, Err(Ok(Error::Unauthorized)));
}

#[test]
fn el_admin_cambia_el_certificador_y_el_anterior_ya_no_registra() {
    let (env, c, admin, certifier, producer) = setup();
    let nuevo = Address::generate(&env);
    c.set_certifier(&admin, &nuevo);
    assert_eq!(c.get_certifier(), nuevo);

    registrar(&env, &c, &nuevo, &producer, "MIEL-005");
    let res = c.try_register_lot(
        &certifier,
        &String::from_str(&env, "MIEL-006"),
        &producer,
        &String::from_str(&env, "San Juan Ñumí"),
        &String::from_str(&env, "Miel de abeja"),
        &String::from_str(&env, "Multifloral"),
        &1,
        &BytesN::from_array(&env, &[1u8; 32]),
    );
    assert_eq!(res, Err(Ok(Error::Unauthorized)));
}

#[test]
fn solo_el_admin_cambia_el_certificador() {
    let (env, c, _admin, certifier, _producer) = setup();
    let intruso = Address::generate(&env);
    let res = c.try_set_certifier(&certifier, &intruso);
    assert_eq!(res, Err(Ok(Error::Unauthorized)));
    assert_eq!(c.get_certifier(), certifier);
}

#[test]
fn certificar_o_consultar_un_lote_inexistente_devuelve_error() {
    let (env, c, _admin, certifier, _producer) = setup();
    let inexistente = String::from_str(&env, "LOTE-404");

    let res_cert = c.try_certify_lot(
        &certifier,
        &inexistente,
        &BytesN::from_array(&env, &[4u8; 32]),
        &90,
    );
    assert_eq!(res_cert, Err(Ok(Error::LotNotFound)));

    let res_get = c.try_get_lot(&inexistente);
    assert_eq!(res_get, Err(Ok(Error::LotNotFound)));
}
