/**
 * Opciones de ocupación en español sencillo para el alta asistida de SPEI con Etherfuse (ADR-004, D9).
 *
 * Fuente de los códigos de ocupación (`etherfuseCode`):
 * - Catálogo de ocupaciones del entorno de pruebas (sandbox) de Etherfuse Ramp API v2
 *   (`GET https://api.sand.etherfuse.com/verification/occupations`).
 * - Fecha de consulta: 28 de octubre de 2026.
 */

export interface OccupationOption {
  /** Identificador corto interno de la opción en la app. */
  id: string;
  /** Etiqueta en español sencillo para leer en voz alta con la artesana o productora. */
  label: string;
  /** Descripción breve de apoyo para la promotora comunitaria. */
  description: string;
  /** Código de ocupación esperado por el endpoint de verificación de Etherfuse. */
  etherfuseCode: string;
}

export const ETHERFUSE_OCCUPATION_CONSULTED_AT = '2026-10-28';

export const ETHERFUSE_OCCUPATION_OPTIONS: readonly OccupationOption[] = [
  {
    id: 'artesana',
    label: 'Artesana',
    description: 'Tejido en telar de cintura, palma, barro, bordado u otra artesanía hecha a mano.',
    etherfuseCode: 'ARTISAN_CRAFTSWORKER',
  },
  {
    id: 'productora_cafe',
    label: 'Productora de café',
    description: 'Cultivo, cosecha o beneficio de café en parcela propia o familiar.',
    etherfuseCode: 'AGRICULTURAL_PRODUCER',
  },
  {
    id: 'apicultora',
    label: 'Productora de miel (apicultora)',
    description: 'Cuidado de colmenas y cosecha de miel o derivados.',
    etherfuseCode: 'AGRICULTURAL_PRODUCER',
  },
  {
    id: 'campesina',
    label: 'Productora del campo',
    description: 'Siembra, milpa, frutas u otros productos agrícolas de la comunidad.',
    etherfuseCode: 'AGRICULTURAL_PRODUCER',
  },
  {
    id: 'comerciante',
    label: 'Comerciante',
    description: 'Venta en plaza, mercado, tienda comunitaria o por encargo.',
    etherfuseCode: 'SELF_EMPLOYED_MERCHANT',
  },
  {
    id: 'hogar',
    label: 'Trabajo en casa y cuidado familiar',
    description: 'Labores del hogar combinadas con ventas ocasionales de temporada.',
    etherfuseCode: 'HOMEMAKER',
  },
];
