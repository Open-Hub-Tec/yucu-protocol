/**
 * Catálogo de los primeros 3 dígitos de la CLABE interbancaria (prefijo de institución).
 *
 * Fuente pública:
 * - Asociación de Bancos de México (ABM) y Banco de México (Banxico),
 *   Catálogo de Instituciones Participantes en el Sistema de Pagos Electrónicos
 *   Interbancarios (SPEI) / Estándar CLABE (3 primeros dígitos de los 5 dígitos CASFIM).
 * - Consultado el 28 de octubre de 2026.
 */
export const CLABE_BANKS_BY_PREFIX: Readonly<Record<string, string>> = Object.freeze({
  '002': 'Banamex (Citibanamex)',
  '006': 'Bancomext',
  '009': 'Banobras',
  '012': 'BBVA México',
  '014': 'Santander',
  '019': 'Banjercito',
  '021': 'HSBC',
  '030': 'Bajío (BanBajío)',
  '032': 'IXE',
  '036': 'Inbursa',
  '037': 'Interacciones',
  '042': 'Mifel',
  '044': 'Scotiabank',
  '058': 'Banregio',
  '059': 'Invex',
  '060': 'Bansi',
  '062': 'Afirme',
  '072': 'Banorte',
  '106': 'Bank of America',
  '112': 'BMonex',
  '113': 'Ve por Más (BX+)',
  '126': 'Credit Suisse',
  '127': 'Banco Azteca',
  '128': 'Autofin',
  '130': 'Compartamos Banco',
  '132': 'Multiva',
  '133': 'Actinver',
  '135': 'Nafin',
  '136': 'Intercam Banco',
  '137': 'BanCoppel',
  '138': 'ABC Capital (Ualá)',
  '140': 'Consubanco',
  '143': 'CIBanco',
  '145': 'BBase',
  '147': 'Bankaool',
  '148': 'Pagatodo',
  '150': 'Inmobiliario Mexicano',
  '151': 'Dondé Banco',
  '152': 'Bancrea',
  '154': 'Banco Covalto',
  '156': 'Sabadell',
  '158': 'Mizuho Bank',
  '160': 'Banco S3',
  '166': 'Banco del Bienestar',
  '168': 'Hipotecaria Federal',
  '600': 'Monexcb',
  '601': 'GBM',
  '602': 'Masari',
  '606': 'Merca (Base)',
  '616': 'Finamex',
  '638': 'Nu México',
  '646': 'STP (Sistema de Transferencias y Pagos)',
  '659': 'Opciones Empresariales del Noreste (ASP)',
  '661': 'Klar',
  '684': 'Transfer (Oxxo / Spin)',
  '699': 'Fondeadora',
  '706': 'Arcus',
  '710': 'NVIO',
  '722': 'Mercado Pago W',
  '723': 'Cuenca',
  '728': 'Spin by Oxxo',
});

/**
 * Busca el nombre del banco o institución SPEI a partir de los 3 primeros dígitos de la CLABE.
 */
export function lookupBankByClabePrefix(prefix: string): string | undefined {
  return CLABE_BANKS_BY_PREFIX[prefix.trim()];
}
