/**
 * Porcentajes del protocolo. Fuente única para UI, motores y documentación.
 * Deben coincidir con las constantes de los contratos Soroban:
 *   - contracts/perpetual_royalties/src/lib.rs  (ARTISAN_ROYALTY_BPS = 1000, TEQUIO_COMMUNAL_BPS = 200)
 * El Tequio solo existe en reventas (ADR-004 D10): el escrow de compra directa
 * no descuenta nada del pago de la artesana.
 * Si cambias un valor aquí, cámbialo también en los contratos y en el README.
 */
export const PROTOCOL_FEES = {
  /** Regalía a la artesana original en cada reventa que pasa por el contrato. */
  artisanResaleRoyaltyPct: 10,
  /** Fondo comunitario Tequio en cada reventa. */
  resaleTequioPct: 2,
  /** La artesana nunca paga comisión en la compra protegida (ADR-004 D11). */
  producerFeePct: 0,
  /** Comisión de plataforma: todavía no se cobra en el prototipo (ADR-004 D11). */
  platformFeePct: 0,
} as const;
