/**
 * Menú corto de ocupaciones en español sencillo mapeado a los códigos de ocupación
 * del entorno de pruebas (sandbox) de Etherfuse (`GET /verification/occupations`).
 *
 * Fecha de consulta del catálogo sandbox de Etherfuse: 2026-10-28.
 */
export interface OccupationOption {
  /** Identificador interno estable para el menú de Yucu */
  id: string;
  /** Etiqueta en español claro pensada para leerse en voz alta en campo */
  label: string;
  /** Código de ocupación aceptado por el endpoint de alta de Etherfuse */
  etherfuseCode: string;
  /** Fecha en que se verificó el catálogo del sandbox (ISO 8601) */
  fetchedAt: '2026-10-28';
}

export const ETHERFUSE_OCCUPATION_FETCHED_DATE = '2026-10-28' as const;

export const ETHERFUSE_OCCUPATION_CATALOG: readonly OccupationOption[] = Object.freeze([
  {
    id: 'artesana',
    label: 'Artesana',
    etherfuseCode: 'ARTISAN_CRAFTSWORKER',
    fetchedAt: ETHERFUSE_OCCUPATION_FETCHED_DATE,
  },
  {
    id: 'productora_cafe',
    label: 'Productora de café',
    etherfuseCode: 'AGRICULTURAL_PRODUCER',
    fetchedAt: ETHERFUSE_OCCUPATION_FETCHED_DATE,
  },
  {
    id: 'campesina_agricultora',
    label: 'Campesina o agricultora',
    etherfuseCode: 'AGRICULTURAL_PRODUCER',
    fetchedAt: ETHERFUSE_OCCUPATION_FETCHED_DATE,
  },
  {
    id: 'apicultora_miel',
    label: 'Productora de miel',
    etherfuseCode: 'AGRICULTURAL_PRODUCER',
    fetchedAt: ETHERFUSE_OCCUPATION_FETCHED_DATE,
  },
  {
    id: 'tejedora_textil_palma',
    label: 'Tejedora de textil o palma',
    etherfuseCode: 'ARTISAN_CRAFTSWORKER',
    fetchedAt: ETHERFUSE_OCCUPATION_FETCHED_DATE,
  },
  {
    id: 'comerciante',
    label: 'Comerciante',
    etherfuseCode: 'RETAIL_MERCHANT',
    fetchedAt: ETHERFUSE_OCCUPATION_FETCHED_DATE,
  },
  {
    id: 'hogar',
    label: 'Labores del hogar',
    etherfuseCode: 'HOMEMAKER',
    fetchedAt: ETHERFUSE_OCCUPATION_FETCHED_DATE,
  },
]);
