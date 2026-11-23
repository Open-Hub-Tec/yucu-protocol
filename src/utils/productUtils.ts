import { PROTOCOL_FEES } from '../config/protocolFees';

export function sanitizeProductName(raw: string): string {
  if (!raw) return 'Café';
  let cleaned = raw.trim();

  // Strip common voice/intent prefixes in Spanish
  cleaned = cleaned.replace(
    /^(quiero\s+registrar(\s+un|\s+una|\s+el|\s+la|\s+mi|\s+mis)?|registrar(\s+un|\s+una|\s+el|\s+la|\s+mi|\s+mis)?|dar\s+de\s+alta(\s+un|\s+una|\s+el|\s+la|\s+mi|\s+mis)?|vender(\s+un|\s+una|\s+el|\s+la|\s+mi|\s+mis)?|subir(\s+un|\s+una|\s+el|\s+la|\s+mi|\s+mis)?|inscribir(\s+un|\s+una|\s+el|\s+la|\s+mi|\s+mis)?)\s+/i,
    ''
  );
  cleaned = cleaned.replace(/^(el|la|los|las|mi|mis|un|una|unos|unas)\s+/i, '');
  cleaned = cleaned.trim();

  const lower = cleaned.toLowerCase();

  // Check specific categories
  if (lower.includes('pulque') || lower.includes('aguamiel') || lower.includes('tinacal')) {
    return 'Pulque';
  }
  if (lower.includes('mezcal') || lower.includes('espadin') || lower.includes('tobala')) {
    return 'Mezcal';
  }
  if (lower.includes('cafe') || lower.includes('café') || lower.includes('pergamino') || lower.includes('cereza')) {
    return 'Café';
  }
  if (lower.includes('miel') || lower.includes('abeja') || lower.includes('panal')) {
    return 'Miel';
  }
  if (lower.includes('maiz') || lower.includes('maíz') || lower.includes('frijol') || lower.includes('granos') || lower.includes('milpa')) {
    return 'Maíz';
  }
  if (lower.includes('jitomate') || lower.includes('tomate') || lower.includes('saladette')) {
    return 'Jitomate';
  }
  if (lower.includes('tenate') || lower.includes('tanate')) {
    return 'Tenate';
  }
  if (lower.includes('sombrero')) {
    return 'Sombrero';
  }
  if (lower.includes('canasto')) {
    return 'Canasto';
  }
  if (lower.includes('palma')) {
    return 'Palma';
  }
  if (lower.includes('textil') || lower.includes('huipil') || lower.includes('telar') || lower.includes('rebozo') || lower.includes('artesania')) {
    return 'Textil';
  }

  // Fallback: capitalize properly
  if (cleaned.length > 0) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return 'Producto Comunitario';
}

export interface ProductProfile {
  key: 'pulque' | 'mezcal' | 'cafe' | 'miel' | 'maiz' | 'jitomate' | 'sombrero' | 'textil' | 'otro';
  displayName: string;
  categoryTag: string;
  defaultPhotoOne: string;
  defaultPhotoTwo: string;
  sampleChips: { emoji: string; label: string; title: string; url: string }[];
  field1Label: string;
  field1Default: string;
  field2Label: string;
  field2Default: string;
  field3Label: string;
  field3Default: string;
  unitLabel: string;
  defaultVolume: number;
  defaultPrice: number;
  assistiveGuideText: string;
  assistantPromptText: string;
  verificationBadge: string;
  verificationSubtitle: string;
  defectCheckText: string;
  aiEvaluatingText: string;
  aiEvaluatingSubtitle: string;
  lotTags: string[];
}

export function getProductProfile(rawType?: string): ProductProfile {
  const sanitized = sanitizeProductName(rawType || '');
  const lower = (rawType || '').toLowerCase() + ' ' + sanitized.toLowerCase();

  // 1. Pulque / Aguamiel
  if (lower.includes('pulque') || lower.includes('aguamiel') || lower.includes('tinacal')) {
    return {
      key: 'pulque',
      displayName: 'Pulque Tradicional',
      categoryTag: 'Bebidas Tradicionales & Fermentos',
      defaultPhotoOne:
        'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80',
      defaultPhotoTwo:
        'https://images.unsplash.com/photo-1584285418504-0051b3d377d6?w=800&auto=format&fit=crop&q=80',
      sampleChips: [
        {
          emoji: '🏺',
          label: 'Tinacal',
          title: 'Pulque Blanco en Jícara',
          url: 'https://images.unsplash.com/photo-1584285418504-0051b3d377d6?w=800&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🌱',
          label: 'Maguey',
          title: 'Maguey Pulquero Mixteco',
          url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80'
        }
      ],
      field1Label: 'Variedad de Maguey',
      field1Default: 'Maguey Manso / Salmiana Mixteco',
      field2Label: 'Método de Elaboración',
      field2Default: 'Raspado de Aguamiel y Tinacal Artesanal',
      field3Label: 'Presentación y Envase',
      field3Default: 'Garrafas de 5L y 20L de Grado Alimenticio',
      unitLabel: 'Litros',
      defaultVolume: 60,
      defaultPrice: 35,
      assistiveGuideText:
        'No se preocupe por datos técnicos ni por escribir. Toque los botones grandes para tomar fotos de su pulque o tinacal y la computadora del Tec de Tlaxiaco evaluará la pureza, textura y fermentación natural al momento.',
      assistantPromptText:
        'Para registrar tu pulque tradicional, toma 1 o 2 fotos claras del tinacal o de una jícara con la muestra para certificar su color blanco lechoso, consistencia natural y pureza de aguamiel sin químicos ni adulteración.',
      verificationBadge: '100% Aguamiel Puro',
      verificationSubtitle: 'Tinacal Mixteco',
      defectCheckText:
        'Verifica que el pulque mantenga su color blanco homogéneo, consistencia sedosa y aroma fresco sin notas agrias anómalas. 100% fermentación natural de maguey.',
      aiEvaluatingText: 'Evaluando muestra de pulque tradicional con Inteligencia Artificial...',
      aiEvaluatingSubtitle: 'Revisando coloración blanco lechoso, consistencia, densidad y pureza de aguamiel',
      lotTags: ['100% Aguamiel', 'Tinacal Artesanal', 'Sin Adulterar', 'Maguey Manso', 'Mixteca Alta']
    };
  }

  // 2. Miel
  if (lower.includes('miel') || lower.includes('abeja')) {
    return {
      key: 'miel',
      displayName: 'Miel Virgen de Abeja',
      categoryTag: 'Miel Pura & Productos Apícolas',
      defaultPhotoOne:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA8ZBROS9VsAw7NHM5L1DmOrsjS5_bgY5WUAX2CWi4t5af2aINWReGNta7MhraFl1vMglwJfhe52szbMFK3zJCSVdtzGS8Wxk4FAPcGg0ryh6r5SO--xklxpgEP7fXFnRFHhG28vL6IwUl3qW6cFysfAyubAB0o5lspYGGWJSMCYFqxBvweNm6W2qlz6HlxvvKjRiSwLsfBYXxK7Cv3WSoPy77qwwVCiEOx_s0cTXnQKPYnYNHr48piLg',
      defaultPhotoTwo:
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80',
      sampleChips: [
        {
          emoji: '🍯',
          label: 'Frasco',
          title: 'Frasco Miel Pura de Campanilla',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8ZBROS9VsAw7NHM5L1DmOrsjS5_bgY5WUAX2CWi4t5af2aINWReGNta7MhraFl1vMglwJfhe52szbMFK3zJCSVdtzGS8Wxk4FAPcGg0ryh6r5SO--xklxpgEP7fXFnRFHhG28vL6IwUl3qW6cFysfAyubAB0o5lspYGGWJSMCYFqxBvweNm6W2qlz6HlxvvKjRiSwLsfBYXxK7Cv3WSoPy77qwwVCiEOx_s0cTXnQKPYnYNHr48piLg'
        },
        {
          emoji: '🐝',
          label: 'Panal',
          title: 'Panal de Colmena Silvestre',
          url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80'
        }
      ],
      field1Label: 'Tipo de Abeja / Floración',
      field1Default: 'Melipona nativa y Apis mellifera (Flor de campanilla)',
      field2Label: 'Origen del Apiario',
      field2Default: 'Bosque de encino y cafetal de sombra (1,800 msnm)',
      field3Label: 'Presentación de Cosecha',
      field3Default: 'Frascos de vidrio de 500g y 1kg sellados al vacío',
      unitLabel: 'Kilos / Frascos',
      defaultVolume: 35,
      defaultPrice: 190,
      assistiveGuideText:
        'No se preocupe por datos técnicos ni por escribir. Toque los botones grandes para tomar fotos de sus frascos o panal y la computadora del Tec de Tlaxiaco evaluará la pureza, color y densidad al momento.',
      assistantPromptText:
        'Para registrar tu miel virgen, toma fotos del envase a contraluz para evaluar pureza, coloración ámbar y densidad natural sin azúcar agregada.',
      verificationBadge: '100% Miel Virgen',
      verificationSubtitle: 'Apiario Comunitario',
      defectCheckText:
        'Verifica que la muestra sea miel virgen sin adulteración ni azúcares comerciales añadidos. 100% floración silvestre de la Mixteca.',
      aiEvaluatingText: 'Evaluando muestra de miel pura con Inteligencia Artificial...',
      aiEvaluatingSubtitle: 'Revisando pureza botánica, densidad apícola y transparencia ámbar',
      lotTags: ['Sin adulteración', 'Floración silvestre', 'Pura de abeja', 'Mixteca Alta']
    };
  }

  // 3. Maíz y Granos
  if (lower.includes('maiz') || lower.includes('maíz') || lower.includes('frijol') || lower.includes('grano')) {
    return {
      key: 'maiz',
      displayName: 'Maíz Criollo Nativo',
      categoryTag: 'Granos y Semillas Criollas',
      defaultPhotoOne:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAx4jUpQopozBH8CYGA3m-Tfhex_UjwxY-4UKei8h4QhxSSmzObP9OdoONSXqi0XITG11whMMoDAOmA4bw0hSNWommPAh4F1D5ffA86lEaxrdfmf3kJ11rzljgIJllTeHX25OBP5QgRG79YiKsHHOLHgZPBf6D-AEEoGtbjiemIcHXuuXj7ZM1cyu0e6F19V9rkEX4nPjc7Dsc2w4tfJ_eHgPoPJzpuWKstIg6jmmd_4HM4ixO1PrSK4Q',
      defaultPhotoTwo:
        'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80',
      sampleChips: [
        {
          emoji: '🌽',
          label: 'Mazorca',
          title: 'Maíz Azul y Frijol Criollo',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAx4jUpQopozBH8CYGA3m-Tfhex_UjwxY-4UKei8h4QhxSSmzObP9OdoONSXqi0XITG11whMMoDAOmA4bw0hSNWommPAh4F1D5ffA86lEaxrdfmf3kJ11rzljgIJllTeHX25OBP5QgRG79YiKsHHOLHgZPBf6D-AEEoGtbjiemIcHXuuXj7ZM1cyu0e6F19V9rkEX4nPjc7Dsc2w4tfJ_eHgPoPJzpuWKstIg6jmmd_4HM4ixO1PrSK4Q'
        },
        {
          emoji: '🧺',
          label: 'Costal',
          title: 'Grano Seco Desgranado',
          url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80'
        }
      ],
      field1Label: 'Variedad Criolla',
      field1Default: 'Maíz Azul Criollo y Frijol Negro Nativo',
      field2Label: 'Sistema de Cultivo',
      field2Default: 'Milpa Tradicional de Temporal (Sin Agroquímicos)',
      field3Label: 'Cosecha y Secado',
      field3Default: 'Secado solar en petates y costales de 50kg',
      unitLabel: 'Kilos',
      defaultVolume: 350,
      defaultPrice: 22,
      assistiveGuideText:
        'No se preocupe por datos técnicos ni por escribir. Toque los botones grandes para tomar fotos de sus mazorcas o granos y la computadora del Tec de Tlaxiaco evaluará la calidad al momento.',
      assistantPromptText:
        'Para registrar tu maíz criollo, toma fotos de la mazorca y grano limpio sin plagas ni gorgojo.',
      verificationBadge: 'Nativo Libre de OGM',
      verificationSubtitle: 'Milpa Tradicional',
      defectCheckText:
        'Verifica grano limpio sin gorgojo ni exceso de humedad. 100% autóctono libre de semillas transgénicas.',
      aiEvaluatingText: 'Evaluando muestra de maíz y granos con Inteligencia Artificial...',
      aiEvaluatingSubtitle: 'Revisando pureza de grano nativo, sanidad y secado solar',
      lotTags: ['Libre de OGM', 'Milpa comunitaria', 'Grano nativo', 'Mixteca']
    };
  }

  // 4. Tenate de Palma (Cestería Tradicional Mixteca)
  if (lower.includes('tenate') || lower.includes('tanate') || (lower.includes('canasto') && lower.includes('palma'))) {
    return {
      key: 'otro',
      displayName: 'Tenate de Palma Dulce',
      categoryTag: 'Cestería Ancestral & Palma Mixteca',
      defaultPhotoOne:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuADMzysc8buYnt4_J6N6fK3aJOpQwIXmK6rDrxaTI_kI2QHwPZaveZN-R-YpdSXJl83jv428Yd5_IFDtytjOVkkte6-yB6pXskpvxdiTLt3gQ4EoFSAS1SzELEaKKIDGkkY-oWJOM68851O2vaSsz92iubLVZ69vQp19ZYBqh38PsSqvSJ-_I0vXR4ZpTDTgoRrmCS2f5HnSOLlMZWIdp0uyeXZVn1fkdUzQelGLAyhj_tOsM-t8ikpbQ',
      defaultPhotoTwo:
        'https://upload.wikimedia.org/wikipedia/commons/d/d4/Small_chapulines_basket.JPG',
      sampleChips: [
        {
          emoji: '🧺',
          label: 'Tenate',
          title: 'Tenate ceremonial de palma dulce tejido a mano',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADMzysc8buYnt4_J6N6fK3aJOpQwIXmK6rDrxaTI_kI2QHwPZaveZN-R-YpdSXJl83jv428Yd5_IFDtytjOVkkte6-yB6pXskpvxdiTLt3gQ4EoFSAS1SzELEaKKIDGkkY-oWJOM68851O2vaSsz92iubLVZ69vQp19ZYBqh38PsSqvSJ-_I0vXR4ZpTDTgoRrmCS2f5HnSOLlMZWIdp0uyeXZVn1fkdUzQelGLAyhj_tOsM-t8ikpbQ'
        },
        {
          emoji: '🧺',
          label: 'Tortillero',
          title: 'Tenate tradicional para tortillas o semillas',
          url: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Small_chapulines_basket.JPG'
        }
      ],
      field1Label: 'Tipo de Palma',
      field1Default: 'Palma dulce de cueva (Brahea dulcis) con tintes vegetales',
      field2Label: 'Trama y Puntada',
      field2Default: 'Tejido fino de doble nudo tradicional',
      field3Label: 'Medida y Uso',
      field3Default: 'Diámetro 22 cm · Con tapa tradicional tejida',
      unitLabel: 'Piezas',
      defaultVolume: 3,
      defaultPrice: 380,
      assistiveGuideText:
        'Tome 1 o 2 fotos del tenate mostrando el fondo, las paredes y la tapa. La computadora evaluará la firmeza y finura del tejido.',
      assistantPromptText:
        'Para registrar tu tenate, toma 1 o 2 fotos donde se aprecie la finura de la puntada de palma dulce y el remate tradicional.',
      verificationBadge: 'Cestería Mixteca Auténtica',
      verificationSubtitle: 'Hecho a Mano',
      defectCheckText:
        'Verifica que el fondo esté firme y no presente fisuras en la palma. La finura del tejido define el precio justo directo.',
      aiEvaluatingText: 'Evaluando tenate de palma artesanal con Inteligencia Artificial...',
      aiEvaluatingSubtitle: 'Analizando puntada de doble nudo, remate de orilla y pureza de fibra',
      lotTags: ['Tenate mixteco', 'Palma dulce', 'Doble nudo', 'Artesanía Certificada', 'Mixteca Alta']
    };
  }

  // 5. Sombrero y Palma
  if (lower.includes('sombrero') || lower.includes('palma')) {
    return {
      key: 'sombrero',
      displayName: 'Sombrero de Palma Fina',
      categoryTag: 'Tejido de Palma & Cestería',
      defaultPhotoOne:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDkQ_T-4HkMOGbUXCEL4WB3G-nckbk4y8MBXaW8RROxSTNJ7CpRum4bbwbnLCoYIsiGQouYyMcMM8EHk1DzR9XrOLMdVSb-RqJUa1aBk1p6JnwmWpKfFndzgY1CS6A1wg_wb_ZV0zrKj5zVgEEMN7Z3_m97Xx-9YigQ14ZAHHNVhaRXXI0nBiVqxjMXJ8MLMVi_gKnPRfs1qzravdO-6Uv0M8q2gl5pOM-K5nYvOyXYJ1GfD99czI_Ltw',
      defaultPhotoTwo:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuADMzysc8buYnt4_J6N6fK3aJOpQwIXmK6rDrxaTI_kI2QHwPZaveZN-R-YpdSXJl83jv428Yd5_IFDtytjOVkkte6-yB6pXskpvxdiTLt3gQ4EoFSAS1SzELEaKKIDGkkY-oWJOM68851O2vaSsz92iubLVZ69vQp19ZYBqh38PsSqvSJ-_I0vXR4ZpTDTgoRrmCS2f5HnSOLlMZWIdp0uyeXZVn1fkdUzQelGLAyhj_tOsM-t8ikpbQ',
      sampleChips: [
        {
          emoji: '🤠',
          label: 'Sombrero',
          title: 'Sombrero Calentano Mixteco',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkQ_T-4HkMOGbUXCEL4WB3G-nckbk4y8MBXaW8RROxSTNJ7CpRum4bbwbnLCoYIsiGQouYyMcMM8EHk1DzR9XrOLMdVSb-RqJUa1aBk1p6JnwmWpKfFndzgY1CS6A1wg_wb_ZV0zrKj5zVgEEMN7Z3_m97Xx-9YigQ14ZAHHNVhaRXXI0nBiVqxjMXJ8MLMVi_gKnPRfs1qzravdO-6Uv0M8q2gl5pOM-K5nYvOyXYJ1GfD99czI_Ltw'
        },
        {
          emoji: '🧺',
          label: 'Tenate',
          title: 'Tenate de Palma Dulce',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADMzysc8buYnt4_J6N6fK3aJOpQwIXmK6rDrxaTI_kI2QHwPZaveZN-R-YpdSXJl83jv428Yd5_IFDtytjOVkkte6-yB6pXskpvxdiTLt3gQ4EoFSAS1SzELEaKKIDGkkY-oWJOM68851O2vaSsz92iubLVZ69vQp19ZYBqh38PsSqvSJ-_I0vXR4ZpTDTgoRrmCS2f5HnSOLlMZWIdp0uyeXZVn1fkdUzQelGLAyhj_tOsM-t8ikpbQ'
        }
      ],
      field1Label: 'Tipo de Palma',
      field1Default: 'Palma dulce de cueva de la Mixteca',
      field2Label: 'Calidad del Tejido',
      field2Default: 'Tejido fino de 4 hilos a mano',
      field3Label: 'Medida y Acabado',
      field3Default: 'Talla 57–59 cm con ribete cosido resistente',
      unitLabel: 'Piezas',
      defaultVolume: 6,
      defaultPrice: 450,
      assistiveGuideText:
        'No se preocupe por datos técnicos ni por escribir. Toque los botones grandes para tomar fotos de su sombrero o tenate y la computadora evaluará el tejido.',
      assistantPromptText:
        'Para registrar tu sombrero, toma 1 o 2 fotos de la copa y del ribete para mostrar la finura y uniformidad del tejido de palma mixteca.',
      verificationBadge: 'Palma Mixteca Auténtica',
      verificationSubtitle: 'Hecho a Mano',
      defectCheckText:
        'Verifica que no haya hebras quebradizas en la palma dulce. La finura del tejido define el precio justo directo.',
      aiEvaluatingText: 'Evaluando pieza de palma artesanal con Inteligencia Artificial...',
      aiEvaluatingSubtitle: 'Analizando densidad de puntada, trama de palma y acabado',
      lotTags: ['Palma dulce', 'Hecho a mano', 'Artesanía Certificada', 'Mixteca']
    };
  }

  // 5. Textil / Telar
  if (lower.includes('textil') || lower.includes('huipil') || lower.includes('telar') || lower.includes('rebozo')) {
    return {
      key: 'textil',
      displayName: 'Textil en Telar de Cintura',
      categoryTag: 'Textiles Ancestrales & Bordados',
      defaultPhotoOne:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB5Ch3EnTKfOPzLhJvKhO3lCcPIUAE3hVVkfX5Im0s-WO1vCixJXClxdVdruWiPRqr3ZuxAzdlH3yAof7r8gqeX3gu9Ib76kDaeSl6pOyNhXt8PsFUfn2Jc7_xqUysoYwZ8H3nJ1yfgy2pOSZt3H-5XCr1VJuyIa-sigPM_rzR4gUCUs1ekNF4IJND5FqstPVswevuKVBQzWO0uds-_-hVuY5mZRW5VnjA9Ovw00rmRFDxpZZ5yIbtMBA',
      defaultPhotoTwo:
        'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&auto=format&fit=crop&q=80',
      sampleChips: [
        {
          emoji: '🧵',
          label: 'Huipil',
          title: 'Huipil Tacuate en Telar',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5Ch3EnTKfOPzLhJvKhO3lCcPIUAE3hVVkfX5Im0s-WO1vCixJXClxdVdruWiPRqr3ZuxAzdlH3yAof7r8gqeX3gu9Ib76kDaeSl6pOyNhXt8PsFUfn2Jc7_xqUysoYwZ8H3nJ1yfgy2pOSZt3H-5XCr1VJuyIa-sigPM_rzR4gUCUs1ekNF4IJND5FqstPVswevuKVBQzWO0uds-_-hVuY5mZRW5VnjA9Ovw00rmRFDxpZZ5yIbtMBA'
        },
        {
          emoji: '🪡',
          label: 'Telar',
          title: 'Urdido en Telar de Cintura',
          url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&auto=format&fit=crop&q=80'
        }
      ],
      field1Label: 'Técnica de Tejido',
      field1Default: 'Telar de cintura prehispánico con urdimbre fina',
      field2Label: 'Materiales e Hilado',
      field2Default: 'Algodón nativo coyuchi y tintes de grana cochinilla',
      field3Label: 'Tiempo de Elaboración',
      field3Default: '3 semanas (Pieza única ceremonial de autor)',
      unitLabel: 'Piezas',
      defaultVolume: 2,
      defaultPrice: 1850,
      assistiveGuideText:
        'No se preocupe por escribir. Toque los botones grandes para fotografiar el telar y los bordados de su pieza textil.',
      assistantPromptText:
        'Para registrar tu pieza textil, toma 1 o 2 fotos claras donde se aprecie la trama del telar, los bordados y los acabados para certificar su origen.',
      verificationBadge: 'Autenticidad Tacuate',
      verificationSubtitle: 'Telar de Cintura',
      defectCheckText:
        'Verifica que la trama esté uniforme y los bordados firmes. El sello de origen protege tus regalías contra el plagio.',
      aiEvaluatingText: 'Evaluando pieza textil artesanal con Inteligencia Artificial...',
      aiEvaluatingSubtitle: 'Analizando urdimbre, tinte natural y motivos iconográficos',
      lotTags: ['Telar de cintura', 'Grana cochinilla', 'Artesanía Certificada', 'Mixteca Alta']
    };
  }

  // 6. Jitomate / Hortalizas
  if (lower.includes('jitomate') || lower.includes('tomate')) {
    return {
      key: 'jitomate',
      displayName: 'Jitomate Agroecológico',
      categoryTag: 'Hortalizas Agroecológicas Frescas',
      defaultPhotoOne:
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
      defaultPhotoTwo:
        'https://images.unsplash.com/photo-1546470427-227c7369a9b2?w=800&auto=format&fit=crop&q=80',
      sampleChips: [
        {
          emoji: '🍅',
          label: 'Campo',
          title: 'Jitomate en Mata Agroecológico',
          url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
        },
        {
          emoji: '📦',
          label: 'Caja',
          title: 'Caja de Jitomate Saladette',
          url: 'https://images.unsplash.com/photo-1546470427-227c7369a9b2?w=800&auto=format&fit=crop&q=80'
        }
      ],
      field1Label: 'Variedad de Jitomate',
      field1Default: 'Saladette Criollo de Altura',
      field2Label: 'Tipo de Cultivo',
      field2Default: 'Invernadero agroecológico con riego limpio',
      field3Label: 'Presentación',
      field3Default: 'Cajas de 20 kg seleccionadas y limpias',
      unitLabel: 'Kilos',
      defaultVolume: 180,
      defaultPrice: 32,
      assistiveGuideText:
        'No se preocupe por datos técnicos. Toque los botones grandes para tomar fotos de sus cajas o matas de jitomate.',
      assistantPromptText:
        'Para registrar tu jitomate, toma fotos de los frutos limpios y con coloración uniforme para verificar su frescura y sanidad.',
      verificationBadge: 'Libre de Pesticidas',
      verificationSubtitle: 'Agroecológico Mixteco',
      defectCheckText:
        'Verifica que los frutos estén firmes, sin picaduras ni manchas. 100% fresco de invernadero campesino.',
      aiEvaluatingText: 'Evaluando muestra hortícola con Inteligencia Artificial...',
      aiEvaluatingSubtitle: 'Revisando firmeza, maduración y sanidad vegetal',
      lotTags: ['Libre de pesticidas', 'Cosecha fresca', 'Riego limpio', 'Mixteca Alta']
    };
  }

  // 7. Default for Custom / Other Products (Opción 8 u otros productos comunitarios)
  const isCustomProduct =
    lower.length > 0 &&
    !lower.includes('cafe') &&
    !lower.includes('café') &&
    !lower.includes('pergamino') &&
    !lower.includes('cereza');

  if (isCustomProduct) {
    const customTitle = sanitized && sanitized !== 'Otro producto' ? sanitized : 'Producto Comunitario';

    // Intelligent image & asset matching for custom products based on keywords
    let defaultPhotoOne = 'https://upload.wikimedia.org/wikipedia/commons/1/17/Tlacolula_Market_230122_1.jpg'; // Authentic Oaxaca indigenous market & harvest
    let defaultPhotoTwo = 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop&q=80';
    let sampleChips = [
      {
        emoji: '🌱',
        label: customTitle,
        title: `Muestra de ${customTitle}`,
        url: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Tlacolula_Market_230122_1.jpg'
      },
      {
        emoji: '🧺',
        label: 'Cosecha Oaxaqueña',
        title: 'Cosecha y elaboración comunitaria de la Mixteca y Oaxaca',
        url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop&q=80'
      }
    ];
    let unitLabel = 'Kilos / Unidades';
    let defaultVolume = 50;
    let defaultPrice = 100;
    let categoryTag = 'Cosecha & Gastronomía Oaxaqueña';

    // 1. Chapulines e Insectos Comestibles Ancestrales de Oaxaca
    if (
      lower.includes('chapulin') ||
      lower.includes('chapulines') ||
      lower.includes('chicatana') ||
      lower.includes('chicatanas') ||
      lower.includes('gusano') ||
      lower.includes('chinicuil') ||
      lower.includes('insecto') ||
      lower.includes('sal de gusano')
    ) {
      categoryTag = 'Gastronomía Ancestral & Insectos de Oaxaca';
      defaultPhotoOne = 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Chapulines_de_Oaxaca.jpg'; // Authentic toasted chapulines
      defaultPhotoTwo = 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Chapulines_Oaxaca.jpg'; // Market basket
      sampleChips = [
        {
          emoji: '🦗',
          label: 'Chapulín Tostado',
          title: 'Chapulines de milpa tostados al comal con ajo, chile y limón',
          url: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Chapulines_de_Oaxaca.jpg'
        },
        {
          emoji: '🧺',
          label: 'Canasto Tradicional',
          title: 'Canasto artesanal de chapulines limpios de mercado',
          url: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Chapulines_Oaxaca.jpg'
        },
        {
          emoji: '🪨',
          label: 'Cosecha de Milpa',
          title: 'Muestra seleccionada en jícara tradicional',
          url: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Small_chapulines_basket.JPG'
        }
      ];
      unitLabel = 'Kilos / Medidas';
      defaultVolume = 15;
      defaultPrice = 280;
    }
    // 2. Mole Negro y Moles Tradicionales de Oaxaca
    else if (
      lower.includes('mole') ||
      lower.includes('coloradito') ||
      lower.includes('chichilo') ||
      lower.includes('manchamanteles') ||
      lower.includes('pipian') ||
      lower.includes('pipían') ||
      lower.includes('adobo')
    ) {
      categoryTag = 'Moles Tradicionales & Pastas Ancestrales';
      defaultPhotoOne = 'https://upload.wikimedia.org/wikipedia/commons/5/59/Mole_negro_de_Oaxaca_con_arroz.jpg'; // Mole negro oaxaqueño
      defaultPhotoTwo = 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Mole_negro_mexicano.jpg';
      sampleChips = [
        {
          emoji: '🍲',
          label: 'Mole Negro',
          title: 'Pasta y platillo tradicional de mole negro oaxaqueño',
          url: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Mole_negro_de_Oaxaca_con_arroz.jpg'
        },
        {
          emoji: '🏺',
          label: 'Pasta en Cazuela',
          title: 'Pasta artesanal molida en cazuela de barro',
          url: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Mole_negro_mexicano.jpg'
        }
      ];
      unitLabel = 'Kilos / Pastas';
      defaultVolume = 20;
      defaultPrice = 250;
    }
    // 3. Tlayudas, Totopos, Masas y Antojitos del Comal
    else if (
      lower.includes('tlayuda') ||
      lower.includes('tlayudas') ||
      lower.includes('totopo') ||
      lower.includes('totopos') ||
      lower.includes('memela') ||
      lower.includes('memelas') ||
      lower.includes('tamal') ||
      lower.includes('tamales') ||
      lower.includes('nicuatole') ||
      lower.includes('zapalote')
    ) {
      categoryTag = 'Maíz Criollo, Tlayudas & Gastronomía del Comal';
      defaultPhotoOne = 'https://upload.wikimedia.org/wikipedia/commons/5/52/Tlayuda_con_Quesillo%2C_Oaxaca.jpg'; // Tlayuda tradicional
      defaultPhotoTwo = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAx4jUpQopozBH8CYGA3m-Tfhex_UjwxY-4UKei8h4QhxSSmzObP9OdoONSXqi0XITG11whMMoDAOmA4bw0hSNWommPAh4F1D5ffA86lEaxrdfmf3kJ11rzljgIJllTeHX25OBP5QgRG79YiKsHHOLHgZPBf6D-AEEoGtbjiemIcHXuuXj7ZM1cyu0e6F19V9rkEX4nPjc7Dsc2w4tfJ_eHgPoPJzpuWKstIg6jmmd_4HM4ixO1PrSK4Q';
      sampleChips = [
        {
          emoji: '🫓',
          label: 'Tlayuda de Maíz',
          title: 'Tlayuda tradicional de maíz criollo cocida en comal',
          url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Tlayuda_con_Quesillo%2C_Oaxaca.jpg'
        },
        {
          emoji: '🌽',
          label: 'Maíz de Temporal',
          title: 'Maíz nativo seleccionado para nixtamalización',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAx4jUpQopozBH8CYGA3m-Tfhex_UjwxY-4UKei8h4QhxSSmzObP9OdoONSXqi0XITG11whMMoDAOmA4bw0hSNWommPAh4F1D5ffA86lEaxrdfmf3kJ11rzljgIJllTeHX25OBP5QgRG79YiKsHHOLHgZPBf6D-AEEoGtbjiemIcHXuuXj7ZM1cyu0e6F19V9rkEX4nPjc7Dsc2w4tfJ_eHgPoPJzpuWKstIg6jmmd_4HM4ixO1PrSK4Q'
        }
      ];
      unitLabel = 'Docenas / Piezas';
      defaultVolume = 100;
      defaultPrice = 80;
    }
    // 4. Tejate y Bebidas Rituales Ancestrales
    else if (
      lower.includes('tejate') ||
      lower.includes('pozontle') ||
      lower.includes('chocolateatole') ||
      lower.includes('tascalate') ||
      lower.includes('bupu') ||
      lower.includes('tepache')
    ) {
      categoryTag = 'Bebidas Rituales & Espumas Ancestrales';
      defaultPhotoOne = 'https://upload.wikimedia.org/wikipedia/commons/4/41/Tejate_drink.JPG'; // Tejate en jícara
      defaultPhotoTwo = 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Tejate_%26_Ma%C3%ADz_Criollo.jpg';
      sampleChips = [
        {
          emoji: '🥣',
          label: 'Tejate en Jícara',
          title: 'Bebida de cacao, hueso de mamey, maíz y flor de rosita de cacao',
          url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Tejate_drink.JPG'
        },
        {
          emoji: '🌺',
          label: 'Ingredientes Nativos',
          title: 'Flor de cacao y maíz criollo tostado',
          url: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Tejate_%26_Ma%C3%ADz_Criollo.jpg'
        }
      ];
      unitLabel = 'Litros / Porciones';
      defaultVolume = 40;
      defaultPrice = 35;
    }
    // 5. Mezcal Artesanal y Agaves Silvestres
    else if (
      lower.includes('mezcal') ||
      lower.includes('espadin') ||
      lower.includes('espadín') ||
      lower.includes('tobala') ||
      lower.includes('tobalá') ||
      lower.includes('tepeztate') ||
      lower.includes('arroqueño') ||
      lower.includes('cuixe') ||
      lower.includes('maguey') ||
      lower.includes('destilado')
    ) {
      categoryTag = 'Mezcal Artesanal & Agaves Silvestres de Oaxaca';
      defaultPhotoOne = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc_N5Gd6_M6-7lQHNQn3u3CXOjDBgtsRYAkGv11YJL-psCvs1aTaRhU5f87szXd3mIEG0cKutzbMwwdbRrF_2uVkNRE51yH_5m7V97JQlVfin1PVYlfKXAD8xqCNnOtz9-53IwaTy4vm7Rhw-VC1ubJBS9tPv3w35YBbxOOVS4PMaLZd-D6s8ADZvyM4HnAKAiFGs76_3veillGYNT7ewqhgIa9lTXbg2p96qV9xt4PwYJJTrJab2oBw';
      defaultPhotoTwo = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80';
      sampleChips = [
        {
          emoji: '🥃',
          label: 'Mezcal Artesanal',
          title: 'Mezcal destilado en alambique de cobre o barro',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc_N5Gd6_M6-7lQHNQn3u3CXOjDBgtsRYAkGv11YJL-psCvs1aTaRhU5f87szXd3mIEG0cKutzbMwwdbRrF_2uVkNRE51yH_5m7V97JQlVfin1PVYlfKXAD8xqCNnOtz9-53IwaTy4vm7Rhw-VC1ubJBS9tPv3w35YBbxOOVS4PMaLZd-D6s8ADZvyM4HnAKAiFGs76_3veillGYNT7ewqhgIa9lTXbg2p96qV9xt4PwYJJTrJab2oBw'
        },
        {
          emoji: '🌱',
          label: 'Maguey Silvestre',
          title: 'Piña de agave maduro cosechado en monte alto',
          url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80'
        }
      ];
      unitLabel = 'Litros / Botellas';
      defaultVolume = 30;
      defaultPrice = 450;
    }
    // 6. Queso / Quesillo / Lácteos tradicionales
    else if (lower.includes('queso') || lower.includes('quesillo') || lower.includes('lacteo') || lower.includes('lacteos') || lower.includes('cuajada') || lower.includes('requeson')) {
      categoryTag = 'Lácteos Tradicionales & Quesería Campesina';
      defaultPhotoOne = 'https://upload.wikimedia.org/wikipedia/commons/5/52/Tlayuda_con_Quesillo%2C_Oaxaca.jpg'; // Authentic Oaxaca quesillo
      defaultPhotoTwo = 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&auto=format&fit=crop&q=80'; // Cheese making / dairy
      sampleChips = [
        {
          emoji: '🥛',
          label: 'Quesillo de Hebra',
          title: 'Quesillo de hebra tradicional oaxaqueño trenzado a mano',
          url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Tlayuda_con_Quesillo%2C_Oaxaca.jpg'
        },
        {
          emoji: '🧀',
          label: 'Queso de Rancho',
          title: 'Queso fresco artesanal de rancho mixteco',
          url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&auto=format&fit=crop&q=80'
        }
      ];
      unitLabel = 'Kilos / Piezas';
      defaultVolume = 25;
      defaultPrice = 140;
    }
    // 7. Hierbas de Olor, Quelites y Especias de la Milpa
    else if (
      lower.includes('hoja santa') ||
      lower.includes('acuyo') ||
      lower.includes('chepiche') ||
      lower.includes('pitiona') ||
      lower.includes('poleo') ||
      lower.includes('guaje') ||
      lower.includes('guajes') ||
      lower.includes('quelite') ||
      lower.includes('quelites') ||
      lower.includes('yerba') ||
      lower.includes('hierba') ||
      lower.includes('epazote') ||
      lower.includes('verdolaga')
    ) {
      categoryTag = 'Hierbas Nativas, Quelites & Aromáticas de Milpa';
      defaultPhotoOne = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80';
      defaultPhotoTwo = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80';
      sampleChips = [
        {
          emoji: '🌿',
          label: 'Manojo Fresco',
          title: 'Hierbas aromáticas y quelites frescos recolectados en milpa',
          url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🧺',
          label: 'Cosecha de Campo',
          title: 'Canasto de quelites de temporal sin pesticidas',
          url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80'
        }
      ];
      unitLabel = 'Manojos / Kilos';
      defaultVolume = 30;
      defaultPrice = 25;
    }
    // 8. Frutas Criollas, Pitayas y Huertos Familiares
    else if (
      lower.includes('pitaya') ||
      lower.includes('pitahaya') ||
      lower.includes('nanche') ||
      lower.includes('mamey') ||
      lower.includes('zapote') ||
      lower.includes('chicozapote') ||
      lower.includes('chirimoya') ||
      lower.includes('tuna') ||
      lower.includes('tejocote') ||
      lower.includes('ciruela') ||
      lower.includes('jicama') ||
      lower.includes('jícama')
    ) {
      categoryTag = 'Frutos Nativos, Cactáceas & Huertos de la Mixteca';
      defaultPhotoOne = 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&auto=format&fit=crop&q=80';
      defaultPhotoTwo = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=80';
      sampleChips = [
        {
          emoji: '🌵',
          label: 'Fruto Nativo',
          title: 'Fruta criolla recolectada en su punto dulce de madurez',
          url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🧺',
          label: 'Canasto Cosecha',
          title: 'Canasto de cosecha fresca de huerto familiar',
          url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=80'
        }
      ];
      unitLabel = 'Kilos / Canastos';
      defaultVolume = 50;
      defaultPrice = 45;
    }
    // 9. Aguacate / Frutales
    else if (lower.includes('aguacate') || lower.includes('palta')) {
      categoryTag = 'Frutales de Altura & Huertos Familiares';
      defaultPhotoOne = 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&auto=format&fit=crop&q=80'; // Fresh avocados
      defaultPhotoTwo = 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=800&auto=format&fit=crop&q=80';
      sampleChips = [
        {
          emoji: '🥑',
          label: 'Aguacate Hass',
          title: 'Aguacate Hass criollo de huerto mixteco',
          url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🌳',
          label: 'Caja Cosecha',
          title: 'Caja de aguacates recién cortados',
          url: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=800&auto=format&fit=crop&q=80'
        }
      ];
      unitLabel = 'Kilos';
      defaultVolume = 60;
      defaultPrice = 55;
    }
    // C. Cacao / Chocolate tradicional
    else if (lower.includes('cacao') || lower.includes('chocolate')) {
      categoryTag = 'Cacao Criollo & Molienda Ancestral';
      const isMetateChocolate = lower.includes('chocolate');
      defaultPhotoOne = isMetateChocolate
        ? 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Chocolate_mayordomo_oaxaca_%28cropped%29.jpg' // Authentic Oaxaca chocolate tablets & paste
        : 'https://upload.wikimedia.org/wikipedia/commons/7/76/Cocoa_beans.jpg'; // Cacao criollo beans
      defaultPhotoTwo = 'https://upload.wikimedia.org/wikipedia/commons/0/01/Cacao-pod-k4636-14.jpg'; // Fresh cacao pod
      sampleChips = [
        {
          emoji: '🍫',
          label: 'Chocolate Metate',
          title: 'Pasta y tablilla de chocolate tradicional oaxaqueño',
          url: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Chocolate_mayordomo_oaxaca_%28cropped%29.jpg'
        },
        {
          emoji: '🫘',
          label: 'Semilla Cacao',
          title: 'Semillas fermentadas y secas de cacao criollo',
          url: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Cocoa_beans.jpg'
        },
        {
          emoji: '🌿',
          label: 'Mazorca Cacao',
          title: 'Mazorca fresca de cacao nativo abierta',
          url: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Cacao-pod-k4636-14.jpg'
        }
      ];
      unitLabel = 'Kilos / Tablillas';
      defaultVolume = 40;
      defaultPrice = 180;
    }
    // D. Amaranto / Alegría / Semillas
    else if (lower.includes('amaranto') || lower.includes('alegria') || lower.includes('chía') || lower.includes('chia')) {
      categoryTag = 'Semillas Nativas & Granos Andinos-Mixtecos';
      defaultPhotoOne = 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80'; // Healthy grains / seeds
      defaultPhotoTwo = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80';
      sampleChips = [
        {
          emoji: '🌾',
          label: 'Amaranto Panoja',
          title: 'Amaranto dorado limpio de cosecha',
          url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🥣',
          label: 'Grano Seleccionado',
          title: 'Grano reventado o seleccionado limpio',
          url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80'
        }
      ];
      unitLabel = 'Kilos';
      defaultVolume = 80;
      defaultPrice = 65;
    }
    // E. Pan artesanal / Pan de pulque / Pan de yema
    else if (lower.includes('pan') || lower.includes('reposteria') || lower.includes('panaderia') || lower.includes('horno')) {
      categoryTag = 'Panadería Tradicional & Hornos de Leña';
      defaultPhotoOne = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80'; // Rustic bread
      defaultPhotoTwo = 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&auto=format&fit=crop&q=80';
      sampleChips = [
        {
          emoji: '🥖',
          label: 'Pan de Leña',
          title: 'Pan artesanal horneado en bóveda de barro',
          url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🍞',
          label: 'Pan de Pulque',
          title: 'Pan tradicional fermentado con aguamiel',
          url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&auto=format&fit=crop&q=80'
        }
      ];
      unitLabel = 'Piezas / Canastos';
      defaultVolume = 100;
      defaultPrice = 15;
    }
    // F. Chiles / Chilhuacle / Chile pasilla / Especias
    else if (lower.includes('chile') || lower.includes('chilhuacle') || lower.includes('pasilla') || lower.includes('costeno') || lower.includes('chiles')) {
      categoryTag = 'Chiles Nativos & Especias Mixtecas';
      defaultPhotoOne = 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80'; // Dried / fresh artisan chilies
      defaultPhotoTwo = 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop&q=80';
      sampleChips = [
        {
          emoji: '🌶️',
          label: 'Chile Criollo',
          title: 'Chile nativo secado al sol en petates',
          url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🔥',
          label: 'Muestra Seca',
          title: 'Chiles secos seleccionados sin impurezas',
          url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop&q=80'
        }
      ];
      unitLabel = 'Kilos';
      defaultVolume = 30;
      defaultPrice = 220;
    }
    // G. Calabaza / Calabacita / Flor de calabaza
    else if (lower.includes('calabaza') || lower.includes('calabacita') || lower.includes('flor')) {
      categoryTag = 'Hortalizas de Milpa & Huerto Campesino';
      defaultPhotoOne = 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=800&auto=format&fit=crop&q=80'; // Pumpkin / Squash
      defaultPhotoTwo = 'https://images.unsplash.com/photo-1506917728037-b9bf01ac7876?w=800&auto=format&fit=crop&q=80';
      sampleChips = [
        {
          emoji: '🎃',
          label: 'Calabaza Criolla',
          title: 'Calabaza criolla de milpa tradicional',
          url: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=800&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🌱',
          label: 'Cosecha Tierna',
          title: 'Calabacita tierna recién cosechada',
          url: 'https://images.unsplash.com/photo-1506917728037-b9bf01ac7876?w=800&auto=format&fit=crop&q=80'
        }
      ];
      unitLabel = 'Kilos / Piezas';
      defaultVolume = 70;
      defaultPrice = 25;
    }
    // H. Hongos silvestres / Champiñón / Setas
    else if (lower.includes('hongo') || lower.includes('hongos') || lower.includes('seta') || lower.includes('setas')) {
      categoryTag = 'Recolección Silvestre & Hongos del Bosque Mixteco';
      defaultPhotoOne = 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=800&auto=format&fit=crop&q=80'; // Wild mushrooms
      defaultPhotoTwo = 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80';
      sampleChips = [
        {
          emoji: '🍄',
          label: 'Hongo Silvestre',
          title: 'Hongos comestibles recolectados en bosque de encino y pino',
          url: 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=800&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🌲',
          label: 'Canasto Cosecha',
          title: 'Canasto de hongos frescos seleccionados',
          url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80'
        }
      ];
      unitLabel = 'Kilos / Canastos';
      defaultVolume = 20;
      defaultPrice = 120;
    }
    // I. Barro / Alfarería
    else if (lower.includes('barro') || lower.includes('olla') || lower.includes('cazuela') || lower.includes('ceramica') || lower.includes('alfareria')) {
      categoryTag = 'Barro Rojo Tradicional & Bruñido a Mano';
      defaultPhotoOne = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc_N5Gd6_M6-7lQHNQn3u3CXOjDBgtsRYAkGv11YJL-psCvs1aTaRhU5f87szXd3mIEG0cKutzbMwwdbRrF_2uVkNRE51yH_5m7V97JQlVfin1PVYlfKXAD8xqCNnOtz9-53IwaTy4vm7Rhw-VC1ubJBS9tPv3w35YBbxOOVS4PMaLZd-D6s8ADZvyM4HnAKAiFGs76_3veillGYNT7ewqhgIa9lTXbg2p96qV9xt4PwYJJTrJab2oBw';
      defaultPhotoTwo = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80';
      sampleChips = [
        {
          emoji: '🏺',
          label: 'Pieza de Barro',
          title: 'Pieza de barro rojo bruñido con cuarzo de río',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc_N5Gd6_M6-7lQHNQn3u3CXOjDBgtsRYAkGv11YJL-psCvs1aTaRhU5f87szXd3mIEG0cKutzbMwwdbRrF_2uVkNRE51yH_5m7V97JQlVfin1PVYlfKXAD8xqCNnOtz9-53IwaTy4vm7Rhw-VC1ubJBS9tPv3w35YBbxOOVS4PMaLZd-D6s8ADZvyM4HnAKAiFGs76_3veillGYNT7ewqhgIa9lTXbg2p96qV9xt4PwYJJTrJab2oBw'
        },
        {
          emoji: '🔥',
          label: 'Cocción Leña',
          title: 'Horneado a cielo abierto con leña de encino',
          url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80'
        }
      ];
      unitLabel = 'Piezas';
      defaultVolume = 15;
      defaultPrice = 280;
    }
    // J. Frutas / Manzana / Durazno / Naranja / Limón
    else if (lower.includes('manzana') || lower.includes('durazno') || lower.includes('pera') || lower.includes('fruta') || lower.includes('naranja') || lower.includes('limon')) {
      categoryTag = 'Fruta Dulce de la Sierra Mixteca';
      defaultPhotoOne = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=80'; // Fresh mountain fruit
      defaultPhotoTwo = 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80';
      sampleChips = [
        {
          emoji: '🍎',
          label: 'Fruta Criolla',
          title: 'Fruta dulce criolla de huerto familiar',
          url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=80'
        },
        {
          emoji: '🧺',
          label: 'Cosecha Fresca',
          title: 'Frutas cosechadas en su punto de madurez',
          url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80'
        }
      ];
      unitLabel = 'Kilos / Cajas';
      defaultVolume = 80;
      defaultPrice = 45;
    }

    const isPlural = customTitle.toLowerCase().endsWith('s') || customTitle.toLowerCase().includes('granos');
    const isFeminine = customTitle.toLowerCase().endsWith('a') || customTitle.toLowerCase().endsWith('as') || customTitle.toLowerCase().includes('miel') || customTitle.toLowerCase().includes('tlayuda');
    const articleDef = isPlural ? (isFeminine ? 'las' : 'los') : (isFeminine ? 'la' : 'el');
    const articlePoss = isPlural ? 'sus' : 'su';
    const adjClean = isPlural ? (isFeminine ? 'limpias, sanas' : 'limpios, sanos') : (isFeminine ? 'limpia, sana' : 'limpio, sano');
    const verbBe = isPlural ? 'estén' : 'esté';

    return {
      key: 'otro',
      displayName: customTitle,
      categoryTag,
      defaultPhotoOne,
      defaultPhotoTwo,
      sampleChips,
      field1Label: `Variedad o Tipo de ${customTitle}`,
      field1Default: `${customTitle} Criollo de la Mixteca`,
      field2Label: 'Origen y Comunidad',
      field2Default: 'Mixteca Alta Oaxaqueña',
      field3Label: 'Presentación de Entrega',
      field3Default: `${unitLabel} seleccionados artesanalmente`,
      unitLabel,
      defaultVolume,
      defaultPrice,
      assistiveGuideText:
        `No se preocupe por datos técnicos ni por escribir. Toque los botones grandes para tomar fotos de ${articlePoss} ${customTitle.toLowerCase()} y la computadora del Tec evaluará la muestra al momento.`,
      assistantPromptText:
        `Para registrar ${articlePoss} ${customTitle.toLowerCase()}, toma 1 o 2 fotos claras del producto cosechado o elaborado para verificar su autenticidad y condición.`,
      verificationBadge: 'Producción Mixteca Auténtica',
      verificationSubtitle: 'Comercio Directo Comunal',
      defectCheckText:
        `Verifica que ${articleDef} ${customTitle.toLowerCase()} ${verbBe} ${adjClean} y en óptimas condiciones para su comercialización directa.`,
      aiEvaluatingText: `Evaluando muestra de ${customTitle.toLowerCase()} con Inteligencia Artificial...`,
      aiEvaluatingSubtitle: 'Verificando sanidad, origen regional y estándares comunitarios',
      lotTags: [customTitle, 'Mixteca Alta', 'Comercio Justo', '100% Auténtico']
    };
  }

  // 8. Default: Café Pergamino / Especialidad (Solo cuando explícitamente es Café)
  return {
    key: 'cafe',
    displayName: 'Café Pergamino de Altura',
    categoryTag: 'Café de Especialidad & Altura',
    defaultPhotoOne:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDVqal830zp_JFXZ3K1_Rr7bbte3jwc_lJwXPf-TxcAcEg2raHlxCK89btRwH4uwzhF2fLfO_VmIZsA4gTepWeTnnrV6vLEcToMhwFBkbarbh5uwCol3bpetHUY8kzwnxJxVdtmqGOZThqZnec77V9oKnLql4l29d8XAJan9Acm66pPUlaO6eAOQymtE0KneK_qV0L0sOeux4_wReZWm6lmbXiAdjKdpv5FSyJqzx_42kMz_U4T3L2q_g',
    defaultPhotoTwo:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    sampleChips: [
      {
        emoji: '☕',
        label: 'Pergamino',
        title: 'Café Pergamino Seco de Altura',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVqal830zp_JFXZ3K1_Rr7bbte3jwc_lJwXPf-TxcAcEg2raHlxCK89btRwH4uwzhF2fLfO_VmIZsA4gTepWeTnnrV6vLEcToMhwFBkbarbh5uwCol3bpetHUY8kzwnxJxVdtmqGOZThqZnec77V9oKnLql4l29d8XAJan9Acm66pPUlaO6eAOQymtE0KneK_qV0L0sOeux4_wReZWm6lmbXiAdjKdpv5FSyJqzx_42kMz_U4T3L2q_g'
      },
      {
        emoji: '🌱',
        label: 'Cereza',
        title: 'Cerezas Maduras de Cafetal',
        url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'
      }
    ],
    field1Label: 'Variedad de Café',
    field1Default: 'Pluma Hidalgo / Typica Arábica',
    field2Label: 'Altitud de Parcela',
    field2Default: '1,650 msnm (Estricta Altura)',
    field3Label: 'Proceso de Beneficiado',
    field3Default: 'Lavado Tradicional y Secado Solar en Zarandas',
    unitLabel: 'Kilos',
    defaultVolume: 60,
    defaultPrice: 85,
    assistiveGuideText:
      'No se preocupe por datos técnicos ni por escribir. Toque los botones grandes para tomar fotos de sus granos y la computadora del Tec de Tlaxiaco evaluará la calidad al momento.',
    assistantPromptText:
      'Para registrar tu café, sube 1 o 2 fotos claras del grano verde pergamino después del beneficio, antes de tueste, para revisar defectos (grano negro, agrio, broca).',
    verificationBadge: 'Calidad Comunitaria',
    verificationSubtitle: 'NMX-F-083 Conforme',
    defectCheckText:
      'Verifica que no haya grano agrio, negro o broca visible. Esto acelera el cálculo del precio base comunal.',
    aiEvaluatingText: 'Evaluando muestra de café con Inteligencia Artificial...',
    aiEvaluatingSubtitle: 'Revisando coloración de grano, porcentaje de humedad y presencia de broca',
    lotTags: ['Cero broca', 'Grano parejo', 'Fermentación en frío', 'NMX-F-083']
  };
}
