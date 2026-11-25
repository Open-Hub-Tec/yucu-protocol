import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ShadingType, BorderStyle } from 'docx';
import * as fs from 'fs';
import * as path from 'path';

async function generateWordDocEs() {
  const doc = new Document({
    title: 'Protocolo Yucu - Documento Ejecutivo Oficial en Español',
    description: 'Dossier Ejecutivo del Protocolo Yucu: Atestaciones RWA y Smart Escrows en Stellar Soroban',
    creator: 'Prof. José Alfredo Román Cruz & Open Hub TecNM',
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'OPEN HUB TecNM · INSTITUTO TECNOLÓGICO DE TLAXIACO (OAXACA, MÉXICO)',
                bold: true,
                size: 20,
                color: '10B981',
                font: 'Arial',
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: 'PROTOCOLO RAÍZ',
                bold: true,
                size: 44,
                color: '032517',
                font: 'Arial',
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: 'Infraestructura de Atestaciones RWA y Pagos en Custodia Justa en Stellar Soroban',
                italics: true,
                size: 24,
                color: 'D97706',
                font: 'Arial',
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: 'Presentación y Dossier de Campo para Autoridades, Red TecNM y Aliados Estratégicos',
                bold: true,
                size: 18,
                color: '4B5563',
                font: 'Arial',
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 300 },
            border: { bottom: { color: '10B981', space: 1, value: BorderStyle.SINGLE, size: 6 } },
            children: [],
          }),

          // Diapositiva 1
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'DIAPOSITIVA 1: Portada Institucional y Visión de Impacto', bold: true, color: '032517', font: 'Arial', size: 28 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Misión: ', bold: true, color: '032517' }),
              new TextRun({ text: 'Estándar de código abierto para atestar activos del mundo real (RWA) y custodias programables, otorgando soberanía financiera a familias productoras y artesanas indígenas sin cuenta bancaria.' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Tesis Central: ', bold: true, color: '032517' }),
              new TextRun({ text: 'Demostrar la misión fundacional de Stellar uniendo a las comunidades originarias de Oaxaca con el comercio justo global sin barreras técnicas ni frases semilla.' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 100, after: 200 },
            shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
            children: [
              new TextRun({ text: 'Guión del Orador: ', bold: true, italics: true, color: 'D97706' }),
              new TextRun({ text: '"Buenos días. Soy José Alfredo Román Cruz, profesor de ingeniería en sistemas computacionales en el Instituto Tecnológico de Tlaxiaco, en el estado de Oaxaca. En representación de nuestra universidad y de nuestros estudiantes investigadores, presentamos el Protocolo Yucu: una pieza de infraestructura de código abierto construida en Soroban que une a las comunidades originarias con el comercio justo global a través de la red Stellar."', italics: true }),
            ],
          }),

          // Diapositiva 2
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'DIAPOSITIVA 2: La Crisis de Extracción del Valor Rural', bold: true, color: '032517', font: 'Arial', size: 28 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '1. El Coyotaje Depredador: ', bold: true }),
              new TextRun({ text: 'El intermediario captura entre el 400% y el 1,000% de margen. Un huipil de 9 meses de tejido en telar de cintura comprado en $1,200 MXN se revende en galerías en $18,000 MXN sin retorno para la creadora.' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '2. Piratería Industrial y Copias Chinas: ', bold: true }),
              new TextRun({ text: 'Prendas sintéticas y copias industriales compiten deslealmente. Las artesanas carecen de certificados inmutables de origen para defender su patrimonio ante la Ley de Protección al Patrimonio Indígena.' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3. Exclusión Financiera Rural: ', bold: true }),
              new TextRun({ text: 'Más del 85% de los campesinos y artesanos no tiene cuenta bancaria, historial crediticio ni conectividad fija, forzándolos a depender de préstamos abusivos en efectivo.' }),
            ],
          }),

          // Diapositiva 3
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'DIAPOSITIVA 3: Auditoría Empírica de Campo (Lo que Encontraron los Chicos)', bold: true, color: '032517', font: 'Arial', size: 28 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Brigada de Investigación Estudiantil del TecNM (PR #1.1 e Issue #18):', bold: true, color: 'D97706' }),
              new TextRun({ text: ' 50 auditorías en San José Xochixtlán, San Cristóbal Amoltepec, Cuquila y Magdalena Peñasco.' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({ text: '• 1. El Choque del 93%: ', bold: true, color: 'DC2626' }),
              new TextRun({ text: 'En huipiles tradicionales, la artesana invierte 7 a 9 meses de tejido para recibir ~$1,200 MXN ($60 USD). La pieza se revende en galerías en ~$18,000 MXN ($900 USD): el intermediario acapara el 93% del dinero sin haber tejido un solo hilo.' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• 2. Avance Acústico en Mixteco: ', bold: true, color: '15803D' }),
              new TextRun({ text: 'El 88% de los adultos mayores falló en apps bancarias por miedo a picar mal. Con el botón de voz gigante de 112px en lengua mixteca (Tu’un Savi) de Yucu, el 96% completó el registro en <4 segundos sin ayuda.' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• 3. 100% Demanda de Identidad Física: ', bold: true, color: 'D97706' }),
              new TextRun({ text: 'El 100% de las artesanas exigió etiquetas físicas con QR para coserlas a sus piezas y defenderse legalmente de la piratería de imitaciones chinas que invaden los tianguis de Oaxaca.' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 100, after: 200 },
            shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
            children: [
              new TextRun({ text: 'Matriz Comparativa de Extracción:\n', bold: true, color: '032517' }),
              new TextRun({ text: '• Huipil de Telar: Productor recibe 7% | Coyote acapara 93% | Garantizado con Yucu: 98%\n' }),
              new TextRun({ text: '• Café de Especialidad: Productor recibe 18% | Coyote acapara 82% | Garantizado con Yucu: 98%\n' }),
              new TextRun({ text: '• Mezcal Puro Ancestral: Productor recibe 22% | Coyote acapara 78% | Garantizado con Yucu: 98%\n' }),
              new TextRun({ text: '• Miel Virgen de Campanilla: Productor recibe 25% | Coyote acapara 75% | Garantizado con Yucu: 98%' }),
            ],
          }),

          // Diapositiva 4
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'DIAPOSITIVA 4: La Infraestructura que le Faltaba a Stellar', bold: true, color: '032517', font: 'Arial', size: 28 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• El Estándar SEP-RWA: ', bold: true }),
              new TextRun({ text: 'Un registro canónico en Rust sobre Soroban Protocolo 22 que certifica origen, calidad y cero deforestación por microcentavos ($0.00001 USD) con finalidad en 5 segundos.' }),
            ],
          }),

          // Diapositiva 5
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'DIAPOSITIVA 5: Arquitectura de Smart Contracts en Rust', bold: true, color: '032517', font: 'Arial', size: 28 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '1. AttestationRegistry.rs: ', bold: true, color: '10B981' }),
              new TextRun({ text: 'Notaría digital inmutable con extensión de renta TTL en Soroban (100k a 500k bloques).' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '2. FairEscrow.rs: ', bold: true, color: '10B981' }),
              new TextRun({ text: 'Custodia condicional en USDC/MXNe que solo libera pagos al verificar atestaciones físicas, con precios piso anti-coyote.' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3. PerpetualRoyalties.rs: ', bold: true, color: '10B981' }),
              new TextRun({ text: '10% de regalías automáticas en reventas secundarias a la artesana + 2% al Fondo Comunal de Tequio.' }),
            ],
          }),

          // Diapositiva 6
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'DIAPOSITIVA 6: El Modelo Centauro: Oráculos de IA y Usos y Costumbres', bold: true, color: '032517', font: 'Arial', size: 28 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Doble Candado Criptográfico: ', bold: true }),
              new TextRun({ text: 'La IA hace el análisis satelital Copernicus para la norma europea EUDR y la visión artificial SCAA (+85 pts), pero el sello final lo pone la Maestra Tejedora o Maestro Palenquero con su firma Ed25519.' }),
            ],
          }),

          // Diapositiva 7
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'DIAPOSITIVA 7: El Ancla Física: Pasaporte Digital y Hang-Tag QR', bold: true, color: '032517', font: 'Arial', size: 28 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Etiqueta Kraft ISO/IEC 18004: ', bold: true }),
              new TextRun({ text: 'Colgada a la prenda o costal. Al escanearla en <2 segundos, el comprador escucha el audio de la artesana en mixteco, ve las coordenadas GPS y la prueba de pago en Stellar.' }),
            ],
          }),

          // Diapositiva 8
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'DIAPOSITIVA 8: Web3 Invisible: Cero Frases Semilla y Efectivo en Parcela', bold: true, color: '032517', font: 'Arial', size: 28 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Inclusión Rural Total: ', bold: true }),
              new TextRun({ text: 'Voz en Tu’un Savi, Carnet físico con QR (sin contraseñas en inglés), dispersión a tarjetas Banco del Bienestar por SPEI (Etherfuse), red de efectivo en campo (MicoPay) y 100% de tarifas de gas patrocinadas con Fee-Bumps (CAP-0015).' }),
            ],
          }),

          // Diapositiva 9
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'DIAPOSITIVA 9: Modelo de Negocio (Marco Tech Rebel B2B2C)', bold: true, color: '032517', font: 'Arial', size: 28 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Cero cobro al campesino: ', bold: true }),
              new TextRun({ text: 'Monetización B2B a tostadurías de café y boutiques de moda ética (1.5% - 2.5%) que requieren certificados de cumplimiento para evitar multas de hasta 4% en Europa.' }),
            ],
          }),

          // Diapositiva 10
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'DIAPOSITIVA 10: Tracción en Producción y Respaldo Universitario', bold: true, color: '032517', font: 'Arial', size: 28 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• 52/52 pruebas automatizadas pasando al 100% en CI: ', bold: true }),
              new TextRun({ text: 'Repositorio abierto en github.com/Open-Hub-Tec/yucu respaldado por la red de más de 600,000 estudiantes del Tecnológico Nacional de México.' }),
            ],
          }),

          // Diapositiva 11
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'DIAPOSITIVA 11: Propuesta Estratégica para el Ecosistema', bold: true, color: '032517', font: 'Arial', size: 28 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• 3 Ejes de Acción: ', bold: true }),
              new TextRun({ text: '1. Ratificación del estándar SEP-RWA. 2. Proyecto ancla en Meridian Lisboa. 3. Apoyo a la residencia de desarrolladores de Open Hub TecNM.' }),
            ],
          }),

          // Diapositiva 12
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'DIAPOSITIVA 12: Cierre Institucional', bold: true, color: '032517', font: 'Arial', size: 28 }),
            ],
          }),
          new Paragraph({
            spacing: { before: 100, after: 200 },
            children: [
              new TextRun({
                text: '“Los activos del mundo real no son solo bonos del tesoro en bóvedas financieras; son el patrimonio, las cosechas y las manos de las comunidades que sostienen a nuestro mundo.”',
                italics: true,
                bold: true,
                size: 24,
                color: '032517',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Repositorio: ', bold: true }),
              new TextRun({ text: 'https://github.com/Open-Hub-Tec/yucu\n' }),
              new TextRun({ text: '• Investigador Responsable: ', bold: true }),
              new TextRun({ text: 'Prof. José Alfredo Román Cruz · tecnologicotlaxiaco@gmail.com\n' }),
              new TextRun({ text: '• Institución: ', bold: true }),
              new TextRun({ text: 'Open Hub TecNM · Instituto Tecnológico de Tlaxiaco, Oaxaca, México' }),
            ],
          }),
        ],
      },
    ],
  });

  const outputPath = path.join(process.cwd(), 'public', 'Raiz_Protocol_Presentacion_Oficial.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Documento Word en Español (.docx) generado con éxito en: ${outputPath}`);
}

generateWordDocEs().catch((err) => {
  console.error('❌ Error al generar documento Word en español:', err);
  process.exit(1);
});
