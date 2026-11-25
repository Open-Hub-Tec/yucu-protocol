import pptxgen from 'pptxgenjs';
import * as path from 'path';
import * as fs from 'fs';

const pptx = new pptxgen();

// Layout Panorámico 16:9 Moderno Oficial (13.333" x 7.5")
pptx.defineLayout({ name: 'WIDESCREEN_16_9', width: 13.333, height: 7.5 });
pptx.layout = 'WIDESCREEN_16_9';

// Propiedades de la Presentación
pptx.title = 'Protocolo Yucu - Presentación en Español';
pptx.subject = 'Infraestructura de Atestaciones RWA y Pagos en Custodia en Stellar Soroban';
pptx.author = 'Prof. José Alfredo Román Cruz & Open Hub TecNM';
pptx.company = 'Instituto Tecnológico de Tlaxiaco / Open Hub TecNM';

// Paleta de Colores
const C_DARK_BG = '032517';    // Verde Bosque Profundo
const C_LIGHT_BG = 'FCF9F3';   // Fondo Crema / Papel Artesanal
const C_EMERALD = '10B981';    // Verde Esmeralda Stellar
const C_GOLD = 'D97706';       // Ámbar Dorado / Grana
const C_DARK_TEXT = '1C2421';   // Texto Carbón Legible
const C_GRAY = '6B7280';        // Gris Muted
const C_WHITE = 'FFFFFF';       // Blanco Puro
const C_CARD_BG = 'FFFFFF';    // Fondo de Tarjeta
const C_CARD_BORDER = 'E5E7EB';// Borde Suave

// SLIDE 1: Portada Institucional (Tema Oscuro)
{
  const slide = pptx.addSlide();
  slide.background = { color: C_DARK_BG };

  slide.addText('OPEN HUB TecNM · INSTITUTO TECNOLÓGICO DE TLAXIACO (OAXACA, MÉXICO)', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.4,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: C_EMERALD,
    charSpacing: 2,
  });

  slide.addText('PROTOCOLO RAÍZ', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 1.1,
    fontSize: 44,
    fontFace: 'Arial',
    bold: true,
    color: C_WHITE,
  });

  slide.addText('Infraestructura de Atestaciones RWA y Pagos en Custodia Justa en Stellar Soroban', {
    x: 0.8,
    y: 2.25,
    w: 11.5,
    h: 0.65,
    fontSize: 17,
    fontFace: 'Arial',
    color: 'A7F3D0',
  });

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8,
    y: 3.05,
    w: 11.5,
    h: 0.04,
    fill: { color: C_GOLD },
    line: { color: C_GOLD },
  });

  const pillars = [
    { title: 'LA PIEZA FALTANTE', desc: 'Registro de atestaciones RWA en Soroban (el estándar equivalente a EAS en Stellar).' },
    { title: 'IMPACTO INDÍGENA REAL', desc: 'Protegiendo a maestras artesanas y caficultores contra márgenes abusivos del 400% al 1,000%.' },
    { title: 'EXCELENCIA ACADÉMICA', desc: 'Diseñado y probado por el TecNM: el sistema de ingeniería pública más grande de México.' }
  ];

  pillars.forEach((p, idx) => {
    const cardX = 0.8 + idx * 3.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: cardX,
      y: 3.45,
      w: 3.6,
      h: 2.45,
      fill: { color: '0A3825' },
      line: { color: '1A543A', width: 1.5 },
    });

    slide.addText(p.title, {
      x: cardX + 0.3,
      y: 3.75,
      w: 3.0,
      h: 0.4,
      fontSize: 11.5,
      fontFace: 'Arial',
      bold: true,
      color: C_GOLD,
    });

    slide.addText(p.desc, {
      x: cardX + 0.3,
      y: 4.25,
      w: 3.0,
      h: 1.4,
      fontSize: 12.5,
      fontFace: 'Arial',
      color: C_WHITE,
      lineSpacing: 18,
    });
  });

  slide.addText('Presentación · Desarrollada por el Tecnológico Nacional de México Campus Tlaxiaco', {
    x: 0.8,
    y: 6.4,
    w: 11.5,
    h: 0.4,
    fontSize: 11,
    fontFace: 'Arial',
    color: '9CA3AF',
    italic: true,
  });

  slide.addNotes(
    "Buenos días. Soy José Alfredo Román Cruz, profesor de ingeniería en sistemas computacionales en el Instituto Tecnológico de Tlaxiaco, en el estado de Oaxaca. En representación de nuestra universidad y de nuestros estudiantes investigadores, presentamos el Protocolo Yucu: una pieza de infraestructura de código abierto construida en Soroban que une a las comunidades originarias con el comercio justo global a través de la red Stellar."
  );
}

// SLIDE 2: La Crisis de Extracción Rural
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('LA CRISIS DE EXTRACCIÓN DEL VALOR RURAL', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Falla Estructural de Mercado en la Base Productiva y Artesanal Indígena', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    color: C_GOLD,
    bold: true,
  });

  const problems = [
    {
      title: 'Intermediarios Depredadores ("El Coyotaje")',
      metric: '400% a 1,000% de Margen',
      desc: 'El coyote acapara hasta el 90% del valor final. Un huipil de 9 meses de tejido en telar de cintura comprado en $1,200 MXN se revende en galerías turísticas en $18,000 MXN, con 0% de retorno para la artesana.'
    },
    {
      title: 'Piratería Industrial y Pérdida de Identidad',
      metric: 'Cero Protección Criptográfica',
      desc: 'Prendas sintéticas y copias industriales fabricadas en serie compiten deslealmente contra los textiles ancestrales. Las artesanas carecen de certificados inmutables de origen para defender su patrimonio ante la ley.'
    },
    {
      title: 'La Brecha de Exclusión Financiera',
      metric: 'Más del 85% no bancarizado',
      desc: 'Los productores carecen de cuentas bancarias, historial crediticio o conectividad continua. La banca tradicional los considera inviables, forzándolos a depender de anticipos predatorios en efectivo.'
    }
  ];

  problems.forEach((item, idx) => {
    const cardY = 1.8 + idx * 1.55;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: cardY,
      w: 11.5,
      h: 1.35,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
    });

    slide.addText(item.title, {
      x: 1.1,
      y: cardY + 0.15,
      w: 6.5,
      h: 0.35,
      fontSize: 15,
      fontFace: 'Arial',
      bold: true,
      color: C_DARK_BG,
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.5,
      y: cardY + 0.15,
      w: 3.4,
      h: 0.35,
      fill: { color: 'FEE2E2' },
      line: { color: 'F87171', width: 1 },
    });

    slide.addText(item.metric, {
      x: 8.5,
      y: cardY + 0.15,
      w: 3.4,
      h: 0.35,
      fontSize: 11,
      fontFace: 'Arial',
      bold: true,
      color: '991B1B',
      align: 'center',
    });

    slide.addText(item.desc, {
      x: 1.1,
      y: cardY + 0.55,
      w: 10.9,
      h: 0.7,
      fontSize: 12,
      fontFace: 'Arial',
      color: C_DARK_TEXT,
      lineSpacing: 16,
    });
  });

  slide.addNotes(
    "Nuestros estudiantes de ingeniería no formularon este problema desde un escritorio. Viajaron a San José Xochixtlán, San Pablo Tijaltepec y Magdalena Peñasco. Documentaron que las maestras tejedoras y los caficultores realizan el 90% del trabajo físico, pero reciben menos del 10% del dinero. Yucu fue programado para romper este ciclo de intermediación abusiva mediante código."
  );
}

// SLIDE 3: Auditoría Empírica de Campo (Lo que Encontraron los Chicos)
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('AUDITORÍA DE CAMPO: LO QUE ENCONTRARON LOS ESTUDIANTES EN OAXACA', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Resultados de 50 Auditorías en 4 Comunidades Indígenas de la Sierra (PR #1.1 e Issue #18)', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    color: C_GOLD,
    bold: true,
  });

  // Contenedor Izquierdo: Gráfico de Barras Vectoriales Limpio
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.7,
    w: 6.6,
    h: 5.0,
    fill: { color: C_CARD_BG },
    line: { color: C_CARD_BORDER, width: 1 },
  });

  slide.addText('CADENA DE VALOR: ANTES VS. DESPUÉS DE RAÍZ PROTOCOL', {
    x: 1.0,
    y: 1.85,
    w: 6.2,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  // Leyenda
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 1.0, y: 2.2, w: 0.25, h: 0.15, fill: { color: 'DC2626' } });
  slide.addText('Productor (Antes)', { x: 1.3, y: 2.15, w: 1.6, h: 0.25, fontSize: 8.5, fontFace: 'Arial', color: C_GRAY });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 3.0, y: 2.2, w: 0.25, h: 0.15, fill: { color: 'F59E0B' } });
  slide.addText('Coyote (Margen Antes)', { x: 3.3, y: 2.15, w: 1.6, h: 0.25, fontSize: 8.5, fontFace: 'Arial', color: C_GRAY });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 5.0, y: 2.2, w: 0.25, h: 0.15, fill: { color: '10B981' } });
  slide.addText('Con Yucu (Soroban)', { x: 5.3, y: 2.15, w: 1.6, h: 0.25, fontSize: 8.5, fontFace: 'Arial', color: C_GRAY });

  const commodities = [
    {
      name: '1. Huipil Tradicional de Telar (San José Xochixtlán)',
      prodPct: 7,
      coyotePct: 93,
    },
    {
      name: '2. Café Pergamino de Altura (Magdalena Peñasco)',
      prodPct: 18,
      coyotePct: 82,
    },
    {
      name: '3. Mezcal Puro Ancestral (San Carlos Yautepec)',
      prodPct: 22,
      coyotePct: 78,
    },
    {
      name: '4. Miel Virgen de Campanilla (Comité Apícola)',
      prodPct: 25,
      coyotePct: 75,
    }
  ];

  const barTotalW = 6.0;

  commodities.forEach((item, idx) => {
    const rowY = 2.5 + idx * 1.02;

    slide.addText(item.name, {
      x: 1.0,
      y: rowY,
      w: 6.2,
      h: 0.22,
      fontSize: 9.5,
      fontFace: 'Arial',
      bold: true,
      color: C_DARK_BG,
    });

    const redW = (item.prodPct / 100) * barTotalW;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y: rowY + 0.25,
      w: Math.max(redW, 0.35),
      h: 0.24,
      fill: { color: 'DC2626' },
      line: { color: 'B91C1C' },
    });
    slide.addText(`${item.prodPct}%`, {
      x: 1.0,
      y: rowY + 0.25,
      w: Math.max(redW, 0.35),
      h: 0.24,
      fontSize: 8,
      fontFace: 'Arial',
      bold: true,
      color: C_WHITE,
      align: 'center',
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0 + Math.max(redW, 0.35),
      y: rowY + 0.25,
      w: barTotalW - Math.max(redW, 0.35),
      h: 0.24,
      fill: { color: 'F59E0B' },
      line: { color: 'D97706' },
    });
    slide.addText(`Coyotaje: ${item.coyotePct}%`, {
      x: 1.0 + Math.max(redW, 0.35),
      y: rowY + 0.25,
      w: barTotalW - Math.max(redW, 0.35),
      h: 0.24,
      fontSize: 8,
      fontFace: 'Arial',
      bold: true,
      color: C_WHITE,
      align: 'center',
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y: rowY + 0.53,
      w: barTotalW * 0.98,
      h: 0.24,
      fill: { color: '10B981' },
      line: { color: '059669' },
    });
    slide.addText('Protocolo Yucu: 98% Directo al Productor', {
      x: 1.0,
      y: rowY + 0.53,
      w: barTotalW * 0.98,
      h: 0.24,
      fontSize: 8,
      fontFace: 'Arial',
      bold: true,
      color: C_WHITE,
      align: 'center',
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0 + barTotalW * 0.98,
      y: rowY + 0.53,
      w: barTotalW * 0.02 + 0.1,
      h: 0.24,
      fill: { color: C_GOLD },
      line: { color: C_GOLD },
    });
  });

  const findings = [
    {
      badge: 'EL CHOQUE DEL 93%',
      badgeColor: 'FEE2E2',
      badgeTextColor: '991B1B',
      title: 'Huipil de Telar de Cintura',
      text: 'La artesana invierte de 7 a 9 meses de tejido para recibir ~$1,200 MXN del coyote. La pieza se revende en galerías en ~$18,000 MXN: el intermediario acapara el 93% del dinero sin haber tejido un solo hilo.'
    },
    {
      badge: 'AVANCE ACÚSTICO EN MIXTECO',
      badgeColor: 'DCFCE7',
      badgeTextColor: '166534',
      title: 'Voz en Tu’un Savi vs. Teclado',
      text: 'El 88% de los adultos mayores falló en apps bancarias por miedo a picar mal. Con el botón de voz gigante de 112px en lengua mixteca de Yucu, el 96% completó el registro en <4 segundos sin ayuda.'
    },
    {
      badge: '100% DEMANDA DE IDENTIDAD',
      badgeColor: 'FEF3C7',
      badgeTextColor: '92400E',
      title: 'Etiquetas Físicas Hang-Tag QR',
      text: 'El 100% de las artesanas exigió etiquetas físicas con QR para coserlas a sus piezas y defenderse legalmente de la piratería de imitaciones chinas que invaden los tianguis de Oaxaca.'
    }
  ];

  findings.forEach((f, idx) => {
    const cardY = 1.7 + idx * 1.68;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.7,
      y: cardY,
      w: 4.8,
      h: 1.55,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.9,
      y: cardY + 0.12,
      w: 2.8,
      h: 0.28,
      fill: { color: f.badgeColor },
      line: { color: f.badgeColor },
    });

    slide.addText(f.badge, {
      x: 7.9,
      y: cardY + 0.12,
      w: 2.8,
      h: 0.28,
      fontSize: 9,
      fontFace: 'Arial',
      bold: true,
      color: f.badgeTextColor,
      align: 'center',
    });

    slide.addText(f.title, {
      x: 7.9,
      y: cardY + 0.45,
      w: 4.4,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      bold: true,
      color: C_DARK_BG,
    });

    slide.addText(f.text, {
      x: 7.9,
      y: cardY + 0.78,
      w: 4.4,
      h: 0.7,
      fontSize: 10,
      fontFace: 'Arial',
      color: C_DARK_TEXT,
      lineSpacing: 14,
    });
  });

  slide.addNotes(
    "Esta gráfica representa los datos duros que los estudiantes del TecNM recopilaron en la sierra. En rojo vemos lo que recibe el productor: apenas un 7% en un huipil de casi un año de trabajo o 18% en café de especialidad. La barra naranja es el margen del coyote. La barra verde es lo que garantiza el Protocolo Yucu: 98% neto al creador y 2% al fondo comunal de obras."
  );
}

// SLIDE 3B: Brigadas de Investigación Estudiantil y Casos de Dolor en Campo
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('BRIGADAS ESTUDIANTILES: CASOS DE DOLOR REAL EN LA MIXTECA', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Estudiantes de Ing. en Sistemas del TecNM Tlaxiaco Levantando Datos en Territorio (Hito 1.1 · PRs #31, #38, #41)', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    color: C_GOLD,
    bold: true,
  });

  const studentCases = [
    {
      community: 'SAN JUAN MIXTEPEC',
      team: 'Jazlynn Barrios, Isaías López, Rafael Ayala, Alex Victoria (7º Semestre)',
      activity: 'Artesanías de Palma (Brahea dulcis)',
      pain: '15 hrs de trabajo por pieza. El coyote paga $15 a $30 MXN ($1.00 a $2.00 MXN/hora).',
      market: 'Reventa urbana en $150-$300 MXN (+1000% markup). Pérdida de vista y deformación articular.',
      quote: '“Te dicen: Te la tomo a 20 pesos, si no, ahí se queda... al menos es para el kilo de tortilla.”',
      tagColor: 'FEE2E2',
      tagText: '991B1B'
    },
    {
      community: 'SAN JOSÉ XOCHIXTLÁN',
      team: 'Charlie Jared Castro, Dulce Maetzy Reyes, Brayan Pérez, José Manuel Hernández (5º Sem.)',
      activity: 'Huipil Ceremonial en Telar de Cintura',
      pain: '6 a 9 meses de tejido (180 hrs). La artesana invierte $2,500 MXN de hilos de su bolsillo.',
      market: 'Retrasos de meses en cobro, regateo a $8,000 MXN y plagio masivo de maquilas industriales.',
      quote: '“El cliente me encarga el huipil y tengo que esperar semanas o meses para recibir mi dinero.”',
      tagColor: 'FEF3C7',
      tagText: '92400E'
    },
    {
      community: 'SAN JUAN ÑUMÍ',
      team: 'Luis Alexis Morales & Equipo eduScrum / UMIZOOMI (Residencia TecNM)',
      activity: 'Miel Virgen de Campanilla (Unión Flor de la Mixteca)',
      pain: 'Registros a mano en libretas viejas y hojas sueltas. 3 días para transcribir listas a mano.',
      market: 'Pérdida de hojas de cosecha; miel vendida 2 veces a clientes por falta de inventario digital.',
      quote: 'el presidente de la Unión: “A veces se ofrece miel y resulta que ya se había vendido a otro.”',
      tagColor: 'DCFCE7',
      tagText: '166534'
    },
    {
      community: 'TIJALTEPEC Y YUCUHITI',
      team: 'Nallely López García (Líder Estudiantil de Investigación)',
      activity: 'Café de Altura (1,800 msnm) y Bordados Tradicionales',
      pain: 'Coyotes en carretera capturan 82% del café; falsificación de bordados con ropa industrial china.',
      market: 'Falta total de trazabilidad en parcela sin señal. Demanda urgente de blindaje de autenticidad.',
      quote: 'Bordadora de San Pablo Tijaltepec: “Si le colgamos el QR al huipil, ya no lo confundirán con ropa china barata.”',
      tagColor: 'E0E7FF',
      tagText: '3730A3'
    }
  ];

  studentCases.forEach((c, idx) => {
    const cardX = 0.8 + idx * 2.95;
    const cardY = 1.7;
    const cardW = 2.8;
    const cardH = 5.1;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: cardX,
      y: cardY,
      w: cardW,
      h: cardH,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: cardX + 0.15,
      y: cardY + 0.15,
      w: cardW - 0.3,
      h: 0.3,
      fill: { color: c.tagColor },
      line: { color: c.tagColor },
    });

    slide.addText(c.community, {
      x: cardX + 0.15,
      y: cardY + 0.15,
      w: cardW - 0.3,
      h: 0.3,
      fontSize: 9.5,
      fontFace: 'Arial',
      bold: true,
      color: c.tagText,
      align: 'center',
    });

    slide.addText(c.activity, {
      x: cardX + 0.15,
      y: cardY + 0.55,
      w: cardW - 0.3,
      h: 0.45,
      fontSize: 11,
      fontFace: 'Arial',
      bold: true,
      color: C_DARK_BG,
    });

    slide.addText(`Equipo: ${c.team}`, {
      x: cardX + 0.15,
      y: cardY + 1.05,
      w: cardW - 0.3,
      h: 0.55,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: C_GRAY,
      lineSpacing: 11,
    });

    slide.addShape(pptx.shapes.LINE, {
      x: cardX + 0.15,
      y: cardY + 1.65,
      w: cardW - 0.3,
      h: 0,
      line: { color: C_CARD_BORDER, width: 1 },
    });

    slide.addText('🔴 El Abuso:', {
      x: cardX + 0.15,
      y: cardY + 1.75,
      w: cardW - 0.3,
      h: 0.22,
      fontSize: 9,
      fontFace: 'Arial',
      bold: true,
      color: '991B1B',
    });

    slide.addText(c.pain, {
      x: cardX + 0.15,
      y: cardY + 2.0,
      w: cardW - 0.3,
      h: 0.75,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: C_DARK_TEXT,
      lineSpacing: 11,
    });

    slide.addText('⚠️ Mercado / Salud:', {
      x: cardX + 0.15,
      y: cardY + 2.8,
      w: cardW - 0.3,
      h: 0.22,
      fontSize: 9,
      fontFace: 'Arial',
      bold: true,
      color: 'D97706',
    });

    slide.addText(c.market, {
      x: cardX + 0.15,
      y: cardY + 3.05,
      w: cardW - 0.3,
      h: 0.75,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: C_DARK_TEXT,
      lineSpacing: 11,
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: cardX + 0.15,
      y: cardY + 3.9,
      w: cardW - 0.3,
      h: 1.05,
      fill: { color: 'F9FAFB' },
      line: { color: C_CARD_BORDER, width: 1 },
    });

    slide.addText(c.quote, {
      x: cardX + 0.2,
      y: cardY + 3.95,
      w: cardW - 0.4,
      h: 0.95,
      fontSize: 8,
      fontFace: 'Arial',
      italic: true,
      color: C_DARK_TEXT,
      lineSpacing: 11,
    });
  });

  slide.addNotes(
    "Estas son las 4 brigadas reales de estudiantes del TecNM Tlaxiaco que fueron a la sierra. En San Juan Mixtepec documentaron que las artesanas ganan entre 1 y 2 pesos la hora mientras el coyote revende con 1000% de margen. En San José Xochixtlán un huipil tarda 9 meses. En San Juan Ñumí pierden cosechas en libretas viejas. Yucu fue diseñada a partir de estos testimonios reales."
  );
}

// SLIDE 3C: Auditoría de Usabilidad UX en Adultos Mayores (Hito 1.2)
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('AUDITORÍA DE USABILIDAD UX: ACCESIBILIDAD EN ADULTOS MAYORES', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Pruebas de Fricción Cognitiva en Campo con una tejedora triqui (56) y una bordadora de Tijaltepec en Patios Rurales (Hito 1.2)', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    color: C_GOLD,
    bold: true,
  });

  const uxColumns = [
    {
      title: '1. Los 3 Dolores de Fricción UX',
      subtitle: 'Detectados por los alumnos en campo',
      items: [
        { label: 'Tecnofobia / Miedo al Error:', desc: 'Vacilación de >10 seg ante la pantalla: “¿Se va a desconfigurar el teléfono si le pico?”. Miedo a borrar fotos familiares.' },
        { label: 'Brillo y Reflejo Exterior:', desc: 'En patios de la sierra la luz solar hace ilegibles textos delgados en gris o botones pequeños (<48px).' },
        { label: 'Desconfianza Institucional:', desc: 'Sellos gubernamentales asustan: “¿Esto es para pagar impuestos en Hacienda?”. Requieren sellos de protección cultural.' }
      ],
      cardColor: 'FFFFFF',
      headerBg: 'FEE2E2',
      headerColor: '991B1B'
    },
    {
      title: '2. Arquitectura de Solución Yucu',
      subtitle: 'El "Modo Abuelo" táctil y por voz',
      items: [
        { label: 'Botones Táctiles Gigantes 112px:', desc: 'Touch-targets ampliados de fácil toque para dedos con callosidad agrícola o artritis artesanal.' },
        { label: 'Voz Nativa en Tu’un Savi (Mixteco):', desc: 'Grabación a 24kbps Opus con Web Audio API. Cero teclado ni contraseñas escritas (Principio Zero-Typing).' },
        { label: 'Buffer Offline-First IndexedDB:', desc: 'Garantía del 100% de datos guardados en la parcela aunque no exista cobertura celular ni señal 3G.' }
      ],
      cardColor: 'FFFFFF',
      headerBg: 'DCFCE7',
      headerColor: '166534'
    },
    {
      title: '3. Resultados Validados en Campo',
      subtitle: '100% tareas completadas sin ayuda',
      items: [
        { label: 'Adopción del QR en 6-9 Segundos:', desc: 'Una bordadora de Tijaltepec entendió el Hang-Tag al instante: “Para que nadie confunda la blusa de venados con ropa china”.' },
        { label: 'Registro Completo en <3 Minutos:', desc: 'Campesinos completan el registro oral de café o textil en menos de 180 segundos.' },
        { label: 'Cero Fugas Criptográficas:', desc: 'Generación canónica SHA-256 local y firma Ed25519 automática sin exponer llaves privadas al usuario.' }
      ],
      cardColor: 'FFFFFF',
      headerBg: 'FEF3C7',
      headerColor: '92400E'
    }
  ];

  uxColumns.forEach((col, idx) => {
    const cardX = 0.8 + idx * 3.95;
    const cardY = 1.7;
    const cardW = 3.8;
    const cardH = 5.1;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: cardX,
      y: cardY,
      w: cardW,
      h: cardH,
      fill: { color: col.cardColor },
      line: { color: C_CARD_BORDER, width: 1 },
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: cardX + 0.15,
      y: cardY + 0.15,
      w: cardW - 0.3,
      h: 0.65,
      fill: { color: col.headerBg },
      line: { color: col.headerBg },
    });

    slide.addText(col.title, {
      x: cardX + 0.2,
      y: cardY + 0.18,
      w: cardW - 0.4,
      h: 0.32,
      fontSize: 11,
      fontFace: 'Arial',
      bold: true,
      color: col.headerColor,
      align: 'center',
    });

    slide.addText(col.subtitle, {
      x: cardX + 0.2,
      y: cardY + 0.48,
      w: cardW - 0.4,
      h: 0.25,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: col.headerColor,
      align: 'center',
    });

    col.items.forEach((item, itemIdx) => {
      const itemY = cardY + 0.95 + itemIdx * 1.35;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: cardX + 0.15,
        y: itemY,
        w: cardW - 0.3,
        h: 1.25,
        fill: { color: 'F9FAFB' },
        line: { color: C_CARD_BORDER, width: 1 },
      });

      slide.addText(item.label, {
        x: cardX + 0.25,
        y: itemY + 0.08,
        w: cardW - 0.5,
        h: 0.25,
        fontSize: 9.5,
        fontFace: 'Arial',
        bold: true,
        color: C_DARK_BG,
      });

      slide.addText(item.desc, {
        x: cardX + 0.25,
        y: itemY + 0.33,
        w: cardW - 0.5,
        h: 0.85,
        fontSize: 8.5,
        fontFace: 'Arial',
        color: C_DARK_TEXT,
        lineSpacing: 12,
      });
    });
  });

  slide.addNotes(
    "Esta lámina demuestra que la ingeniería de Yucu no es teórica. Los estudiantes llevaron celulares a las comunidades, midieron tiempos con cronómetro e identificaron el miedo al error de una tejedora triqui y una bordadora de Tijaltepec. Gracias a ello se creó el Modo Abuelo de 112px, con voz en Mixteco y etiquetas QR físicas que reducen la fricción cognitiva a cero."
  );
}

// SLIDE 4: La Pieza de Infraestructura que le Faltaba a Stellar
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('LA INFRAESTRUCTURA QUE LE FALTABA A STELLAR', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Por qué los Activos del Mundo Real (RWA) Necesitan Atestaciones en Cadena', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    color: C_GOLD,
    bold: true,
  });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.8,
    w: 5.5,
    h: 4.8,
    fill: { color: C_CARD_BG },
    line: { color: C_CARD_BORDER, width: 1 },
  });

  slide.addText('LA BRECHA EN EL ECOSISTEMA HOY', {
    x: 1.1,
    y: 2.1,
    w: 4.9,
    h: 0.4,
    fontSize: 14,
    fontFace: 'Arial',
    bold: true,
    color: '991B1B',
  });

  slide.addText(
    [
      { text: '• El referente de Ethereum (EAS): ', options: { bold: true } },
      { text: 'Ethereum demostró el valor de las atestaciones con EAS, pero tarifas de gas de $5 a $25 USD hacen imposible su uso en micro-cosechas campesinas.\n\n' },
      { text: '• Estándares clásicos de Stellar: ', options: { bold: true } },
      { text: 'SEP-10 (auth) y SEP-12 (KYC) son servicios web tradicionales fuera de la cadena; no operan como contratos inteligentes en Soroban.\n\n' },
      { text: '• Soluciones RWA fragmentadas: ', options: { bold: true } },
      { text: 'Sin un estándar abierto de atestaciones, cada proyecto agrícola o comercial se ve obligado a inventar contratos cerrados e incompatibles.' }
    ],
    {
      x: 1.1,
      y: 2.6,
      w: 4.9,
      h: 3.7,
      fontSize: 12,
      fontFace: 'Arial',
      color: C_DARK_TEXT,
      lineSpacing: 18,
    }
  );

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8,
    y: 1.8,
    w: 5.5,
    h: 4.8,
    fill: { color: 'F0FDF4' },
    line: { color: '86EFAC', width: 1.5 },
  });

  slide.addText('NUESTRA APORTACIÓN ABIERTA (SEP-RWA)', {
    x: 7.1,
    y: 2.1,
    w: 4.9,
    h: 0.4,
    fontSize: 14,
    fontFace: 'Arial',
    bold: true,
    color: '166534',
  });

  slide.addText(
    [
      { text: '• El "EAS de Stellar": ', options: { bold: true } },
      { text: 'Un registro canónico abierto de esquemas en Rust ejecutándose en Soroban Protocolo 22.\n\n' },
      { text: '• Costos de Microcentavos: ', options: { bold: true } },
      { text: 'Finalidad en ~5 segundos y costo de $0.00001 USD por atestación, haciendo viables millones de registros rurales.\n\n' },
      { text: '• Gestión Nativa de Renta TTL: ', options: { bold: true } },
      { text: 'Almacenamiento persistente en Soroban con extensión automática de vida útil por décadas.\n\n' },
      { text: '• Propuesta Formal SEP: ', options: { bold: true } },
      { text: 'Especificación abierta lista para revisión del ecosistema en docs/SEP_RWA_ATTESTATION_DRAFT.md.' }
    ],
    {
      x: 7.1,
      y: 2.6,
      w: 4.9,
      h: 3.7,
      fontSize: 12,
      fontFace: 'Arial',
      color: '14532D',
      lineSpacing: 18,
    }
  );

  slide.addNotes(
    "Para que Stellar lidere la tokenización de activos del mundo real, se requiere una forma inmutable y estándar de certificar la verdad física. Construimos el estándar de atestaciones en Soroban para que cualquier empresa o cooperativa pueda certificar calidad y origen antes de liberar pagos."
  );
}

// SLIDE 5: Arquitectura de Contratos Inteligentes
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('ARQUITECTURA DE SMART CONTRACTS EN RUST', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Tres Contratos Modulares e Interconectados sobre Soroban Protocolo 22', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    color: C_GOLD,
    bold: true,
  });

  const contracts = [
    {
      name: '1. AttestationRegistry.rs',
      subtitle: 'El Notario Digital en Cadena',
      points: [
        'Almacena esquemas inmutables (AttestationSchema).',
        'Registra actas notariales digitales verificadas.',
        'Firmas criptográficas Ed25519 y digests SHA-256.',
        'Extensión de renta TTL en Soroban (100k a 500k bloques).'
      ]
    },
    {
      name: '2. FairEscrow.rs',
      subtitle: 'Custodia Condicional Justa',
      points: [
        'Bloquea fondos en stablecoins (USDC / MXNe).',
        'Libera el pago ÚNICAMENTE con atestación física válida.',
        'Guardarraíles de precio: Rechaza compras por debajo del costo.',
        'Cero comisiones abusivas para el campesino.'
      ]
    },
    {
      name: '3. PerpetualRoyalties.rs',
      subtitle: 'Regalías Perpetuas por Reventa',
      points: [
        'Cobra 10% automático en reventas secundarias en galerías.',
        'Transfiere el dinero directo a la billetera de la artesana.',
        'Destina 2% al Fondo Comunal de Obras (Tequio).',
        'Protege el patrimonio cultural contra el plagio.'
      ]
    }
  ];

  contracts.forEach((c, idx) => {
    const cardX = 0.8 + idx * 3.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: cardX,
      y: 1.8,
      w: 3.6,
      h: 4.8,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
    });

    slide.addText(c.name, {
      x: cardX + 0.3,
      y: 2.1,
      w: 3.0,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: C_DARK_BG,
    });

    slide.addText(c.subtitle, {
      x: cardX + 0.3,
      y: 2.5,
      w: 3.0,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      bold: true,
      color: C_GOLD,
    });

    slide.addText(
      c.points.map(p => `• ${p}`).join('\n\n'),
      {
        x: cardX + 0.3,
        y: 2.95,
        w: 3.0,
        h: 3.3,
        fontSize: 11,
        fontFace: 'Arial',
        color: C_DARK_TEXT,
        lineSpacing: 16,
      }
    );
  });

  slide.addNotes(
    "Nuestra arquitectura en Soroban cuenta con 3 contratos programados en Rust. En FairEscrow.rs el dinero del comprador queda bloqueado y protegido, y solo se libera cuando el lote llega con la calidad atestada. Si la pieza se revende meses después en una galería internacional, PerpetualRoyalties.rs le cobra el 10% al nuevo comprador y se lo manda a la artesana original."
  );
}

// SLIDE 6: El Modelo Centauro
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('EL MODELO CENTAURO: ORÁCULOS DE IA Y USOS Y COSTUMBRES', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Conciliando el Derecho Consuetudinario Indígena con la Inteligencia de Máquina', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    color: C_GOLD,
    bold: true,
  });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.8,
    w: 5.5,
    h: 3.4,
    fill: { color: C_CARD_BG },
    line: { color: C_CARD_BORDER, width: 1 },
  });

  slide.addText('1. ORÁCULOS DE IA AUTÓNOMOS (Rigor Técnico)', {
    x: 1.1,
    y: 2.1,
    w: 4.9,
    h: 0.35,
    fontSize: 13,
    fontFace: 'Arial',
    bold: true,
    color: '1E40AF',
  });

  slide.addText(
    [
      { text: '• AIEUDRSatelliteOracle: ', options: { bold: true } },
      { text: 'Audita 5 años de imágenes satelitales Copernicus Sentinel-2 para certificar que el café cumple la ley de Cero Deforestación de la Unión Europea.\n\n' },
      { text: '• AIQualityOracle: ', options: { bold: true } },
      { text: 'Evalúa la densidad de urdimbre en textiles y el conteo de defectos de café SCAA (+85 pts) mediante visión artificial.\n\n' },
      { text: '• AIVoiceOracle: ', options: { bold: true } },
      { text: 'Traductor acústico que convierte notas de voz en lengua mixteca (Tu’un Savi) en registros técnicos canónicos.' }
    ],
    {
      x: 1.1,
      y: 2.5,
      w: 4.9,
      h: 2.5,
      fontSize: 11,
      fontFace: 'Arial',
      color: C_DARK_TEXT,
      lineSpacing: 15,
    }
  );

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8,
    y: 1.8,
    w: 5.5,
    h: 3.4,
    fill: { color: C_CARD_BG },
    line: { color: C_CARD_BORDER, width: 1 },
  });

  slide.addText('2. AUTORIDAD TRADICIONAL (Soberanía Humana)', {
    x: 7.1,
    y: 2.1,
    w: 4.9,
    h: 0.35,
    fontSize: 13,
    fontFace: 'Arial',
    bold: true,
    color: 'B45309',
  });

  slide.addText(
    [
      { text: '• Maestras Tejedoras (triquis, Xochixtlán): ', options: { bold: true } },
      { text: 'Inspeccionan la tensión del telar, la autenticidad de tintes naturales (grana/añil) y los motivos sagrados.\n\n' },
      { text: '• Maestros Palenqueros (David Mendoza / Celso): ', options: { bold: true } },
      { text: 'Realizan el perlado tradicional con venencia para certificar pureza 100% de maguey.\n\n' },
      { text: '• Autoridades del Tequio y Comisariados: ', options: { bold: true } },
      { text: 'Firman con su llave Ed25519 bajo el amparo del Artículo 2º Constitucional y la Ley de Patrimonio Indígena.' }
    ],
    {
      x: 7.1,
      y: 2.5,
      w: 4.9,
      h: 2.5,
      fontSize: 11,
      fontFace: 'Arial',
      color: C_DARK_TEXT,
      lineSpacing: 15,
    }
  );

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 5.45,
    w: 11.5,
    h: 1.25,
    fill: { color: '0A3825' },
    line: { color: C_EMERALD, width: 1.5 },
  });

  slide.addText('LA GARANTÍA DE DOBLE CANDADO EN SOROBAN', {
    x: 1.1,
    y: 5.6,
    w: 10.9,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Arial',
    bold: true,
    color: C_GOLD,
  });

  slide.addText(
    'Ni la Inteligencia Artificial por sí sola ni el humano aislado pueden liberar los pagos en custodia. El contrato exige la firma conjunta de la máquina (análisis técnico) y la autoridad comunitaria (palabra de honor), erradicando fraudes y arbitrariedades.',
    {
      x: 1.1,
      y: 5.9,
      w: 10.9,
      h: 0.65,
      fontSize: 11,
      fontFace: 'Arial',
      color: C_WHITE,
      lineSpacing: 16,
    }
  );

  slide.addNotes(
    "En México, los Usos y Costumbres indígenas tienen rango constitucional. La tecnología no viene a desplazar al maestro artesano ni a la asamblea comunal; la IA hace el trabajo pesado de satélites y estándares europeos, pero el sello final lo pone la autoridad comunitaria con su firma criptográfica."
  );
}

// SLIDE 7: El Ancla Física: Pasaporte Digital y Hang-Tag QR
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('EL ANCLA FÍSICA: PASAPORTE DIGITAL Y HANG-TAG QR', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Conectando el Huipil y el Café con la Blockchain de Stellar en Menos de 2 Segundos', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    color: C_GOLD,
    bold: true,
  });

  const steps = [
    {
      num: '01',
      title: 'ETIQUETA FÍSICA KRAFT',
      desc: 'Códigos QR vectoriales bajo norma ISO/IEC 18004 impresos en papel kraft y colgados con mecahilo de yute al bulto, prenda o botella.'
    },
    {
      num: '02',
      title: 'ESCANEO INSTANTÁNEO',
      desc: 'Cualquier teléfono inteligente en Lisboa, Zúrich o Ciudad de México escanea el código sin instalar aplicaciones ni crear cuentas cripto.'
    },
    {
      num: '03',
      title: 'VOZ Y TESTIMONIO',
      desc: 'El comprador escucha a la tejedora hablar en su lengua materna Tu’un Savi, conociendo el significado ancestral de cada bordado.'
    },
    {
      num: '04',
      title: 'PRUEBA INMUTABLE',
      desc: 'Muestra el folio en Stellar, coordenadas satelitales GPS, certificado de cero deforestación y prueba de pago directo del 98% a la creadora.'
    }
  ];

  steps.forEach((s, idx) => {
    const cardX = 0.8 + idx * 2.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: cardX,
      y: 1.8,
      w: 2.7,
      h: 4.8,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
    });

    slide.addText(s.num, {
      x: cardX + 0.2,
      y: 2.1,
      w: 2.3,
      h: 0.5,
      fontSize: 28,
      fontFace: 'Arial',
      bold: true,
      color: C_GOLD,
    });

    slide.addText(s.title, {
      x: cardX + 0.2,
      y: 2.7,
      w: 2.3,
      h: 0.4,
      fontSize: 12,
      fontFace: 'Arial',
      bold: true,
      color: C_DARK_BG,
    });

    slide.addText(s.desc, {
      x: cardX + 0.2,
      y: 3.2,
      w: 2.3,
      h: 3.2,
      fontSize: 11,
      fontFace: 'Arial',
      color: C_DARK_TEXT,
      lineSpacing: 16,
    });
  });

  slide.addNotes(
    "Para el cliente que compra una prenda o una taza de café en Europa, la experiencia es mágica. Escanea la etiqueta y escucha la voz de la creadora en mixteco, comprobando en la blockchain que no se trata de una copia industrial."
  );
}

// SLIDE 8: Web3 Invisible y Liquidación en Parcela
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('WEB3 INVISIBLE: CERO FRASES SEMILLA Y LIQUIDACIÓN EN PARCELA', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Cómo Opera un Productor Rural Sin Cuenta Bancaria y Sin Conexión a Internet', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    color: C_GOLD,
    bold: true,
  });

  const rails = [
    {
      title: 'Interfaz por Voz (Zero-Typing)',
      desc: 'Los adultos mayores hablan con naturalidad en mixteco (Tu’un Savi) o español. El motor de IA extrae los kilos, la técnica y la comunidad sin tocar un teclado.'
    },
    {
      title: 'Identidad sin Contraseñas (DID)',
      desc: 'Carnet físico laminado con QR o código numérico por mensaje de texto. Cero frases semilla de 24 palabras en inglés que memorizar o perder.'
    },
    {
      title: 'Riel Bancario SPEI (Etherfuse)',
      desc: 'Los dólares digitales (USDC) del comprador internacional se convierten a pesos mexicanos (MXNe) y se dispersan a tarjetas del Banco del Bienestar por SPEI.'
    },
    {
      title: 'Riel de Efectivo Móvil (MicoPay)',
      desc: 'Transportistas y comercios locales aliados actúan como cajeros móviles de acopio, entregando efectivo en mano contra código QR sin necesidad de bancos.'
    },
    {
      title: 'Patrocinio Total del Gas (CAP-0015)',
      desc: 'El protocolo patrocina el 100% de las comisiones de red con Fee-Bumps de Stellar. El productor nunca compra, administra ni gasta XLM.'
    }
  ];

  rails.forEach((r, idx) => {
    const cardY = 1.8 + idx * 0.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: cardY,
      w: 11.5,
      h: 0.85,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
    });

    slide.addText(r.title, {
      x: 1.1,
      y: cardY + 0.15,
      w: 3.5,
      h: 0.55,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: C_DARK_BG,
    });

    slide.addText(r.desc, {
      x: 4.7,
      y: cardY + 0.12,
      w: 7.3,
      h: 0.6,
      fontSize: 11,
      fontFace: 'Arial',
      color: C_DARK_TEXT,
      lineSpacing: 15,
    });
  });

  slide.addNotes(
    "Si un sistema tecnológico le pide a un campesino de 70 años escribir una contraseña en inglés de 24 palabras, está diseñado para excluirlo. Yucu hace que Stellar sea invisible: el productor habla en mixteco, usa un carnet QR físico y cobra sus pesos sin comisiones."
  );
}

// SLIDE 9: Modelo de Negocio (Tech Rebel B2B2C)
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('MODELO DE NEGOCIO Y MERCADO (MARCO TECH REBEL B2B2C)', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Monetizando la Demanda Institucional mientras se Protege al Productor', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    color: C_GOLD,
    bold: true,
  });

  const columns = [
    {
      role: 'LA OFERTA PROTEGIDA',
      title: 'Comunidades Indígenas',
      cost: '0% Comisión de Plataforma',
      details: [
        '50+ productores piloto en Oaxaca.',
        'Retienen el 98% del precio de mayoreo directo.',
        '10% de regalías perpetuas por reventa en galerías.',
        '2% destinado a obras comunitarias (Tequio).'
      ]
    },
    {
      role: 'CLIENTES QUE PAGAN (B2B)',
      title: 'Compradores Institucionales (PyMEs)',
      cost: '1.5% a 2.5% Tarifa de Cumplimiento',
      details: [
        'Tostadurías de café de especialidad en Europa y EE.UU.',
        'Boutiques de moda ética y galerías de diseño.',
        'Necesidad urgente de cumplir con la ley europea EUDR (multas de hasta el 4% de facturación).',
        'Inmunidad legal contra demandas por apropiación cultural.'
      ]
    },
    {
      role: 'CONSUMIDOR FINAL (B2C)',
      title: 'Verificadores Conscientes',
      cost: 'Sobreprecio por Autenticidad',
      details: [
        'Consumidores conscientes de alta gama en Lisboa, Zúrich, Nueva York y CDMX.',
        'Pagan entre 30% y 50% de sobreprecio por piezas éticas y auténticas.',
        'Escanean el QR para verificar el origen real.'
      ]
    }
  ];

  columns.forEach((col, idx) => {
    const cardX = 0.8 + idx * 3.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: cardX,
      y: 1.8,
      w: 3.6,
      h: 4.8,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
    });

    slide.addText(col.role, {
      x: cardX + 0.3,
      y: 2.1,
      w: 3.0,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Arial',
      bold: true,
      color: C_GOLD,
    });

    slide.addText(col.title, {
      x: cardX + 0.3,
      y: 2.35,
      w: 3.0,
      h: 0.4,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: C_DARK_BG,
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: cardX + 0.3,
      y: 2.8,
      w: 3.0,
      h: 0.35,
      fill: { color: 'F3F4F6' },
      line: { color: 'D1D5DB', width: 1 },
    });

    slide.addText(col.cost, {
      x: cardX + 0.3,
      y: 2.8,
      w: 3.0,
      h: 0.35,
      fontSize: 11,
      fontFace: 'Arial',
      bold: true,
      color: C_DARK_BG,
      align: 'center',
    });

    slide.addText(
      col.details.map(d => `• ${d}`).join('\n\n'),
      {
        x: cardX + 0.3,
        y: 3.25,
        w: 3.0,
        h: 3.1,
        fontSize: 11,
        fontFace: 'Arial',
        color: C_DARK_TEXT,
        lineSpacing: 15,
      }
    );
  });

  slide.addNotes(
    "Siguiendo la metodología de Tech Rebel, nunca le cobramos al productor vulnerable. Nuestro cliente que paga es el importador europeo o la boutique de diseño que necesita certificar que sus productos no tienen deforestación ni plagio para evitar multas severas."
  );
}

// SLIDE 10: Tracción de Ingeniería y Respaldo Universitario
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('TRACCIÓN EN PRODUCCIÓN: CÓDIGO, PRUEBAS Y RESPALDO TECNM', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Desarrollado por Open Hub TecNM: El Motor de Ingeniería Más Grande de México', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    color: C_GOLD,
    bold: true,
  });

  const metrics = [
    { num: '52 / 52', label: 'Pruebas Automatizadas en Verde', sub: 'Suite completa de pruebas de CI en criptografía, oráculos de IA, ruteo fiduciario y contratos en Rust (0 fallos).' },
    { num: 'Protocolo 22', label: 'SDK de Soroban Oficial', sub: '3 contratos inteligentes en Rust compilados para la versión más reciente de la blockchain de Stellar.' },
    { num: '100% MIT', label: 'Bien Público de Código Abierto', sub: 'Repositorio público y activo en github.com/Open-Hub-Tec/yucu con contribuciones diarias de alumnos residentes.' },
    { num: '600k+', label: 'Red Nacional del TecNM', sub: 'El sistema universitario que forma al 40% de los ingenieros de México, garantizando continuidad y talento local.' }
  ];

  metrics.forEach((m, idx) => {
    const cardX = 0.8 + (idx % 2) * 5.9;
    const cardY = 1.8 + Math.floor(idx / 2) * 2.45;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: cardX,
      y: cardY,
      w: 5.6,
      h: 2.25,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
    });

    slide.addText(m.num, {
      x: cardX + 0.3,
      y: cardY + 0.2,
      w: 5.0,
      h: 0.5,
      fontSize: 26,
      fontFace: 'Arial',
      bold: true,
      color: '15803D',
    });

    slide.addText(m.label, {
      x: cardX + 0.3,
      y: cardY + 0.75,
      w: 5.0,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: C_DARK_BG,
    });

    slide.addText(m.sub, {
      x: cardX + 0.3,
      y: cardY + 1.15,
      w: 5.0,
      h: 0.95,
      fontSize: 11,
      fontFace: 'Arial',
      color: C_DARK_TEXT,
      lineSpacing: 15,
    });
  });

  slide.addNotes(
    "No nos presentamos con una promesa teórica; tenemos código en producción y 52 pruebas automatizadas pasando al 100%. Además, al estar respaldados por el TecNM, aseguramos la formación permanente de talento joven en Rust y blockchain en el sur de México."
  );
}

// SLIDE 10B: El Equipo Humano: Investigadores y Desarrolladores Estudiantiles
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('EL EQUIPO HUMANO: TALENTO INDÍGENA E INGENIERÍA TECNM', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Estudiantes de Ing. en Sistemas del TecNM Tlaxiaco Construyendo Bienes Públicos Web3 (Drips Wave & SCF)', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    color: C_GOLD,
    bold: true,
  });

  const teamBlocks = [
    {
      title: 'Liderazgo y Coordinación Académica',
      color: '032517',
      bg: 'DCFCE7',
      members: [
        { role: 'Asesor Principal & Coordinador:', name: 'Ing. José Alfredo Román Cruz (TecNM)' },
        { role: 'Líder Estudiantil del Proyecto:', name: 'Nallely López García (Residencia Profesional)' },
        { role: 'Institución Sede:', name: 'Instituto Tecnológico de Tlaxiaco (Oaxaca, Mex.)' },
        { role: 'Materia / Programa:', name: 'Gestión de Proyectos & Fundamentos de Ing. de Software' }
      ]
    },
    {
      title: 'Brigadas de Campo: Palma y Miel',
      color: '991B1B',
      bg: 'FEE2E2',
      members: [
        { role: 'Equipo Palma (San Juan Mixtepec):', name: 'Jazlynn Barrios Velasco' },
        { role: 'Investigador de Campo:', name: 'Isaías Brayan López Domínguez' },
        { role: 'Investigadores Asociados:', name: 'Rafael Ayala Coronel, Alex Victoria' },
        { role: 'Equipo Miel (San Juan Ñumí):', name: 'Luis Alexis Morales & Equipo UMIZOOMI (eduScrum)' }
      ]
    },
    {
      title: 'Brigadas de Campo: Textil y Mezcal',
      color: '92400E',
      bg: 'FEF3C7',
      members: [
        { role: 'Equipo Textil (San José Xochixtlán):', name: 'Charlie Jared Castro Rodríguez (5º Semestre)' },
        { role: 'Equipo UX Accesibilidad:', name: 'Dulce Maetzy Reyes Hernández, Brayan Pérez González' },
        { role: 'Investigador de Fricción:', name: 'José Manuel Hernández Paz (5º Semestre)' },
        { role: 'Equipo Mezcal (Yavi Tech):', name: 'Lewis Noé Hernández, Nelson Macario Martínez, Luis García' }
      ]
    },
    {
      title: 'Desarrollo Core & Smart Contracts',
      color: '3730A3',
      bg: 'E0E7FF',
      members: [
        { role: 'Rust / Soroban & Escrow:', name: 'Integración Trustless Work Escrow & LotPassport' },
        { role: 'Frontend & PWA Offline:', name: 'React 19, IndexedDB Outbox y Modo Abuelo 112px' },
        { role: 'Oráculos de IA Multimodales:', name: 'Normalización Tu’un Savi, Calidad SCAA y Satélite EUDR' },
        { role: 'Gobernanza:', name: 'Open Hub TecNM – 100% Código Abierto con Licencia MIT' }
      ]
    }
  ];

  teamBlocks.forEach((tb, idx) => {
    const cardX = 0.8 + (idx % 2) * 5.9;
    const cardY = 1.7 + Math.floor(idx / 2) * 2.55;
    const cardW = 5.6;
    const cardH = 2.35;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: cardX,
      y: cardY,
      w: cardW,
      h: cardH,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: cardX + 0.15,
      y: cardY + 0.15,
      w: cardW - 0.3,
      h: 0.32,
      fill: { color: tb.bg },
      line: { color: tb.bg },
    });

    slide.addText(tb.title, {
      x: cardX + 0.2,
      y: cardY + 0.17,
      w: cardW - 0.4,
      h: 0.28,
      fontSize: 11,
      fontFace: 'Arial',
      bold: true,
      color: tb.color,
    });

    tb.members.forEach((m, mIdx) => {
      const lineY = cardY + 0.6 + mIdx * 0.42;

      slide.addText(m.role, {
        x: cardX + 0.2,
        y: lineY,
        w: 2.3,
        h: 0.35,
        fontSize: 9,
        fontFace: 'Arial',
        bold: true,
        color: C_DARK_BG,
      });

      slide.addText(m.name, {
        x: cardX + 2.5,
        y: lineY,
        w: cardW - 2.7,
        h: 0.35,
        fontSize: 9,
        fontFace: 'Arial',
        color: C_DARK_TEXT,
      });
    });
  });

  slide.addNotes(
    "Este proyecto no es anónimo ni tercerizado: es el trabajo de más de 12 estudiantes de ingeniería en sistemas del TecNM Campus Tlaxiaco. Ellos fueron a las comunidades, levantaron los requerimientos, entrevistaron a los presidentes de las cooperativas y están programando los smart contracts en Soroban. Financiar a Yucu a través de Drips y Stellar es financiar directamente a la próxima generación de ingenieros indígenas de México."
  );
}

// SLIDE 11: Propuesta Estratégica para el Ecosistema
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('PROPUESTA ESTRATÉGICA PARA EL ECOSISTEMA STELLAR', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Co-Creando el Estándar Global de RWA en Soroban Rumbo a HackMeridian Lisboa', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    color: C_GOLD,
    bold: true,
  });

  const asks = [
    {
      num: '01',
      title: 'Ratificación Formal del Estándar SEP-RWA',
      desc: 'Colaborar con el Comité de Estándares de la SDF para formalizar nuestra propuesta abierta (docs/SEP_RWA_ATTESTATION_DRAFT.md) como el estándar oficial de atestaciones RWA para Soroban.'
    },
    {
      num: '02',
      title: 'Proyecto Ancla en HackMeridian y Meridian Lisboa',
      desc: 'Presentar a Yucu en Lisboa como demostración insignia de la utilidad de Soroban en la economía real, con compras transfronterizas en vivo entre Europa y comunidades oaxaqueñas.'
    },
    {
      num: '03',
      title: 'Apoyo al Semillero de Desarrolladores del Open Hub TecNM',
      desc: 'Consolidar el programa de residencia profesional estudiantil para escalar el piloto comunitario de 50 a 500 cooperativas indígenas en el sur de México.'
    }
  ];

  asks.forEach((a, idx) => {
    const cardY = 1.8 + idx * 1.6;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: cardY,
      w: 11.5,
      h: 1.4,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
    });

    slide.addText(a.num, {
      x: 1.1,
      y: cardY + 0.2,
      w: 0.8,
      h: 0.9,
      fontSize: 24,
      fontFace: 'Arial',
      bold: true,
      color: C_GOLD,
    });

    slide.addText(a.title, {
      x: 2.0,
      y: cardY + 0.2,
      w: 10.0,
      h: 0.35,
      fontSize: 14,
      fontFace: 'Arial',
      bold: true,
      color: C_DARK_BG,
    });

    slide.addText(a.desc, {
      x: 2.0,
      y: cardY + 0.55,
      w: 10.0,
      h: 0.75,
      fontSize: 11,
      fontFace: 'Arial',
      color: C_DARK_TEXT,
      lineSpacing: 16,
    });
  });

  slide.addNotes(
    "Viajamos a Lisboa con la frente en alto. Invitamos a la Fundación Stellar a trabajar de la mano con el TecNM para ratificar el estándar SEP-RWA y demostrar que Stellar es la red líder para la dignidad humana y el comercio justo global."
  );
}

// SLIDE 12: Cierre y Coordenadas Institucionales
{
  const slide = pptx.addSlide();
  slide.background = { color: C_DARK_BG };

  slide.addText('LA VERDADERA PROMESA DE STELLAR', {
    x: 0.8,
    y: 1.0,
    w: 11.5,
    h: 0.5,
    fontSize: 16,
    fontFace: 'Arial',
    bold: true,
    color: C_GOLD,
    charSpacing: 2,
  });

  slide.addText(
    '“Los activos del mundo real no son solo bonos del tesoro en bóvedas financieras; son el patrimonio, las cosechas y las manos de las comunidades que sostienen a nuestro mundo.”',
    {
      x: 0.8,
      y: 1.8,
      w: 11.5,
      h: 1.8,
      fontSize: 23,
      fontFace: 'Georgia',
      italic: true,
      color: C_WHITE,
      lineSpacing: 34,
    }
  );

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8,
    y: 3.9,
    w: 11.5,
    h: 0.04,
    fill: { color: C_GOLD },
    line: { color: C_GOLD },
  });

  const contact = [
    { label: 'REPOSITORIO DE CÓDIGO ABIERTO', value: 'https://github.com/Open-Hub-Tec/yucu' },
    { label: 'INSTITUCIÓN EDUCATIVA', value: 'Open Hub TecNM · Instituto Tecnológico de Tlaxiaco, Oaxaca, México' },
    { label: 'INVESTIGADOR RESPONSABLE', value: 'Prof. José Alfredo Román Cruz · tecnologicotlaxiaco@gmail.com' }
  ];

  contact.forEach((c, idx) => {
    const rowY = 4.3 + idx * 0.7;
    slide.addText(c.label, {
      x: 0.8,
      y: rowY,
      w: 3.5,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      bold: true,
      color: C_EMERALD,
    });

    slide.addText(c.value, {
      x: 4.5,
      y: rowY,
      w: 7.8,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      color: C_WHITE,
    });
  });

  slide.addNotes(
    "Muchas gracias a todos por su atención y apoyo. Construyamos juntos el futuro de la inclusión financiera real."
  );
}

// Generar el Archivo PPTX en Español
const outputPath = path.join(process.cwd(), 'public', 'Raiz_Protocol_Presentacion_Oficial.pptx');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`✅ Presentación en Español (.pptx) generada con éxito en: ${outputPath}`);
  })
  .catch((err) => {
    console.error('❌ Error al generar la presentación en español:', err);
    process.exit(1);
  });
