/**
 * Menú de ocupaciones en lenguaje llano para artesanas y productores de la Mixteca,
 * mapeadas a los códigos de ocupación requeridos por la API de verificación de Etherfuse.
 * 
 * Fuente de códigos:
 * Sandbox de Etherfuse (endpoint GET /verification/occupations).
 * Consultado y archivado para el protocolo Yucu: 28 de octubre de 2026 (ADR-004, D9).
 */

export const ETHERFUSE_OCCUPATIONS_FETCH_DATE = '2026-10-28';

export interface EtherfuseOccupation {
  readonly code: string;
  readonly label: string;
  readonly category: string;
  readonly description: string;
}

export const ETHERFUSE_OCCUPATIONS: readonly EtherfuseOccupation[] = Object.freeze([
  {
    code: 'ARTISAN',
    label: 'Artesana o artesano',
    category: 'Artesanías y Tradición',
    description: 'Elaboración tradicional de textiles en telar de cintura, alfarería en barro o tejido de palma.',
  },
  {
    code: 'AGRICULTURE_COFFEE',
    label: 'Productora o productor de café',
    category: 'Agricultura Sostenible',
    description: 'Cultivo, cosecha, secado o selección de café de sombra y especialidad en parcelas comunitarias.',
  },
  {
    code: 'AGRICULTURE_GENERAL',
    label: 'Agricultora, agricultor o trabajo del campo',
    category: 'Agricultura Sostenible',
    description: 'Siembra y cultivo de milpa, miel, hortalizas, frutos o trabajo agrícola comunitario.',
  },
  {
    code: 'MERCHANT_LOCAL',
    label: 'Comerciante local o puesto en tianguis',
    category: 'Comercio Local',
    description: 'Venta de productos artesanales, alimentos o comercio directo en días de plaza de la región.',
  },
  {
    code: 'HOMEMAKER',
    label: 'Labores del hogar y cuidado de la familia',
    category: 'Hogar y Comunidad',
    description: 'Cuidado familiar y trabajo en el hogar combinado con elaboración de artesanías.',
  },
  {
    code: 'INDEPENDENT_TRADES',
    label: 'Oficios y servicios independientes',
    category: 'Oficios',
    description: 'Costura, bordado por encargo, carpintería, panadería tradicional u oficios varios.',
  },
  {
    code: 'STUDENT',
    label: 'Estudiante',
    category: 'Educación',
    description: 'Estudiante de nivel medio superior o superior apoyando labores familiares o comunitarias.',
  },
  {
    code: 'EMPLOYEE_COMMUNITY',
    label: 'Empleada o empleado en empresa o institución local',
    category: 'Empleo',
    description: 'Trabajo con salario en talleres, cooperativas, escuelas o comercios establecidos.',
  },
  {
    code: 'OTHER_COMMUNITY',
    label: 'Otra ocupación comunitaria',
    category: 'Comunidad',
    description: 'Cargos comunitarios tradicionales, faenas o actividades productivas no listadas arriba.',
  },
]);
