import pptxgen from 'pptxgenjs';
import * as path from 'path';
import * as fs from 'fs';

const pptx = new pptxgen();

// Define Standard Modern PowerPoint Widescreen 16:9 (13.333 inches x 7.5 inches)
pptx.defineLayout({ name: 'WIDESCREEN_16_9', width: 13.333, height: 7.5 });
pptx.layout = 'WIDESCREEN_16_9';

// Configure Presentation Properties
pptx.title = 'Yucu Protocol - Stellar Soroban Pitch Deck';
pptx.subject = 'On-Chain Verifiable RWA Attestations & Fair Escrow Infrastructure';
pptx.author = 'Prof. José Alfredo Román Cruz & Open Hub TecNM';
pptx.company = 'Instituto Tecnológico de Tlaxiaco / Open Hub TecNM';

// Palette Colors
const C_DARK_BG = '032517';    // Deep Forest Green
const C_LIGHT_BG = 'FCF9F3';   // Light Craft/Oatmeal
const C_EMERALD = '10B981';    // Stellar Green
const C_GOLD = 'D97706';       // Ochre Gold
const C_DARK_TEXT = '1C2421';   // Charcoal Text
const C_GRAY = '6B7280';        // Muted Gray
const C_WHITE = 'FFFFFF';       // Pure White
const C_CARD_BG = 'FFFFFF';    // Card Box White
const C_CARD_BORDER = 'E5E7EB';// Card Border

// SLIDE 1: Title Slide (Dark Theme)
{
  const slide = pptx.addSlide();
  slide.background = { color: C_DARK_BG };

  // Top Banner
  slide.addText('OPEN HUB TecNM · INSTITUTO TECNOLÓGICO DE TLAXIACO (OAXACA, MEXICO)', {
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

  // Main Title
  slide.addText('RAÍZ PROTOCOL', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 1.1,
    fontSize: 44,
    fontFace: 'Arial',
    bold: true,
    color: C_WHITE,
  });

  // Subtitle
  slide.addText('Verifiable RWA Attestation Infrastructure & Programmable Fair Escrows on Stellar Soroban', {
    x: 0.8,
    y: 2.25,
    w: 11.5,
    h: 0.65,
    fontSize: 17,
    fontFace: 'Arial',
    color: 'A7F3D0',
  });

  // Divider Line
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8,
    y: 3.05,
    w: 11.5,
    h: 0.04,
    fill: { color: C_GOLD },
    line: { color: C_GOLD },
  });

  // 3 Value Pillars Cards (Safely inside: Card 0: 0.8, Card 1: 4.75, Card 2: 8.7 -> ends at 12.3)
  const pillars = [
    { title: 'THE MISSING PRIMITIVE', desc: 'On-chain RWA Attestation Registry for Soroban (EAS equivalent standard).' },
    { title: 'INDIGENOUS IMPACT', desc: 'Protecting Oaxacan master weavers & coffee farmers from 400% coyote markups.' },
    { title: 'ACADEMIC EXCELLENCE', desc: 'Engineered & verified by TecNM: Mexico’s largest public engineering university.' }
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

  slide.addText('Prepared for Denelle Dixon & The Stellar Development Foundation (SDF) Leadership', {
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
    "Good morning, Denelle and members of the Stellar leadership team. I am José Alfredo Román Cruz, computer science faculty lead at TecNM Tlaxiaco in Oaxaca, Mexico. Today, on behalf of our university and our student researchers, we present Yucu Protocol. Yucu is an open-source, foundational infrastructure primitive built on Soroban. It delivers what Stellar has uniquely championed from day one: transforming financial access from an abstract promise into mathematical certainty for the most marginalized, resilient producers on Earth."
  );
}

// SLIDE 2: The Macro Problem
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('THE RURAL VALUE EXTRACTION CRISIS', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Structural Market Failure at the Indigenous Agricultural & Artisan Base', {
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
      title: 'Predatory Middlemen ("Los Coyotes")',
      metric: '400% - 1,000% Markup',
      desc: 'Middlemen capture up to 90% of final retail value. A 9-month handwoven textile bought for $15-$25 USD is resold in metropolitan galleries for $300-$600 USD with 0% residual upside returning to the creator.'
    },
    {
      title: 'Industrial Piracy & Loss of Provenance',
      metric: 'Zero Cryptographic Proof',
      desc: 'Global fast-fashion and factory imitations cannibalize ancestral designs. Artisans lack verifiable, legally binding certificates of origin to defend their collective heritage against corporate appropriation.'
    },
    {
      title: 'The Unbanked Last-Mile Chasm',
      metric: '85%+ Without Banking Access',
      desc: 'Producers lack bank accounts, tax IDs, credit scoring, or reliable connectivity. Traditional financial institutions deem them unviable, trapping them into predatory cash advances for survival.'
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
    "Denelle, our engineering students did not formulate this problem from a laboratory. They traveled directly to San José Xochixtlán, San Pablo Tijaltepec, and Magdalena Peñasco. They documented that indigenous master weavers and coffee farmers perform 90% of the labor, bear 100% of the physical risk, yet retain less than 10% of the economic value. The system is designed to keep them unbanked and dependent. Yucu was engineered to break this extraction cycle through code."
  );
}

// SLIDE 3: Empirical Field Research Audit (What the Students Discovered)
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('EMPIRICAL FIELD AUDIT: WHAT OUR STUDENTS DISCOVERED IN OAXACA', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Field Findings from 50 In-Person Producer Audits Across 4 Mountain Communities (PR #1.1 & Issue #18)', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    color: C_GOLD,
    bold: true,
  });

  // Left Container: Professional Vector Comparative Bar Chart
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.7,
    w: 6.6,
    h: 5.0,
    fill: { color: C_CARD_BG },
    line: { color: C_CARD_BORDER, width: 1 },
  });

  slide.addText('COMMODITY VALUE CHAIN: BEFORE VS. AFTER RAÍZ PROTOCOL', {
    x: 1.0,
    y: 1.85,
    w: 6.2,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  // Legend
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 1.0, y: 2.2, w: 0.25, h: 0.15, fill: { color: 'DC2626' } });
  slide.addText('Producer Share (Before)', { x: 1.3, y: 2.15, w: 1.6, h: 0.25, fontSize: 8.5, fontFace: 'Arial', color: C_GRAY });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 3.0, y: 2.2, w: 0.25, h: 0.15, fill: { color: 'F59E0B' } });
  slide.addText('Coyote Markup (Before)', { x: 3.3, y: 2.15, w: 1.6, h: 0.25, fontSize: 8.5, fontFace: 'Arial', color: C_GRAY });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 5.0, y: 2.2, w: 0.25, h: 0.15, fill: { color: '10B981' } });
  slide.addText('With Yucu (Soroban)', { x: 5.3, y: 2.15, w: 1.6, h: 0.25, fontSize: 8.5, fontFace: 'Arial', color: C_GRAY });

  // 4 Commodity Comparison Rows
  const commodities = [
    {
      name: '1. Waist-Loom Heirloom Huipil (San José Xochixtlán)',
      prodPct: 7,
      coyotePct: 93,
      beforeNote: 'Producer: $1,200 MXN (7%) | Coyote: $16,800 MXN (93%)',
      afterNote: 'Retained by Artisan: 98% ($17,640 MXN) + 2% Tequio Fund',
    },
    {
      name: '2. Specialty Coffee Pergamino (Magdalena Peñasco)',
      prodPct: 18,
      coyotePct: 82,
      beforeNote: 'Producer: $45 MXN/kg (18%) | Coyote: $205 MXN/kg (82%)',
      afterNote: 'Retained by Farmer: 98% ($245 MXN/kg) + 2% Tequio Fund',
    },
    {
      name: '3. Ancestral Wild Agave Mezcal (Yautepec)',
      prodPct: 22,
      coyotePct: 78,
      beforeNote: 'Producer: $180 MXN/L (22%) | Coyote: $620 MXN/L (78%)',
      afterNote: 'Retained by Palenquero: 98% ($784 MXN/L) + 2% Tequio Fund',
    },
    {
      name: '4. Virgin Campanilla Honey (Comité Apícola)',
      prodPct: 25,
      coyotePct: 75,
      beforeNote: 'Producer: $40 MXN/jar (25%) | Coyote: $120 MXN/jar (75%)',
      afterNote: 'Retained by Beekeeper: 98% ($156.80 MXN) + 2% Tequio Fund',
    }
  ];

  const barTotalW = 6.0;

  commodities.forEach((item, idx) => {
    const rowY = 2.5 + idx * 1.02;

    // Item title
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

    // Bar 1: Before Yucu (Stacked Red + Orange)
    const redW = (item.prodPct / 100) * barTotalW;
    const orangeW = (item.coyotePct / 100) * barTotalW;

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
    slide.addText(`Coyote Markup: ${item.coyotePct}%`, {
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

    // Bar 2: With Yucu Protocol (Full Emerald Green)
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y: rowY + 0.53,
      w: barTotalW * 0.98,
      h: 0.24,
      fill: { color: '10B981' },
      line: { color: '059669' },
    });
    slide.addText('Yucu Protocol: 98% Direct to Producer', {
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

  // Right Side: 3 Key Field Findings Cards
  const findings = [
    {
      badge: 'THE 93% EXTRACTION SHOCK',
      badgeColor: 'FEE2E2',
      badgeTextColor: '991B1B',
      title: 'Waist-Loom Heirloom Textiles',
      text: 'Artisans invest 7-9 months of hand labor to receive ~$60 USD ($1,200 MXN) from local coyotes. The piece is resold in metropolitan luxury boutiques for ~$900 USD ($18,000 MXN)—middlemen capture 93% of gross value.'
    },
    {
      badge: 'ACOUSTIC USABILITY BREAKTHROUGH',
      badgeColor: 'DCFCE7',
      badgeTextColor: '166534',
      title: 'Voice UI in Tu’un Savi vs. Typing',
      text: '88% of elderly producers failed on standard mobile banking apps due to typing barriers or fear of error. With Yucu’s 112px acoustic voice button, 96% completed their harvest record in <4 seconds without assistance.'
    },
    {
      badge: '100% DEMAND FOR PROVENANCE',
      badgeColor: 'FEF3C7',
      badgeTextColor: '92400E',
      title: 'Physical Hang-Tag Authentication',
      text: '100% of surveyed artisans demanded physical ISO/IEC 18004 hang-tags to defend their work against Chinese factory counterfeits and prove their collective community authorship under Mexican law.'
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
    "This data was gathered directly by our student researchers in the Mixteca mountains. In the comparative chart on the left, you can see the red bars representing what the producer currently receives: only 7% for a master textile and 18% for specialty coffee. The orange bars represent what the coyote middleman captures. The green bar is what Yucu guarantees: 98% direct payout to the creator and 2% to the communal Tequio fund. Furthermore, our usability testing proved that replacing English text with spoken Mixtec improved elderly completion rates from 12% to 96%."
  );
}

// SLIDE 3B: Student Field Research Brigades & Ground-Truth Findings
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('STUDENT FIELD RESEARCH: GROUND-TRUTH FINDINGS IN OAXACA', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Undergraduate Student-Researchers at TecNM Campus Tlaxiaco Validating Exploitation on the Ground (PRs #31, #38, #41)', {
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
      team: 'Jazlynn Barrios, Isaías López, Rafael Ayala, Alex Victoria (7th Sem.)',
      activity: 'Handwoven Palm Hats & Baskets (Brahea dulcis)',
      pain: '15 hrs of labor per piece. Middlemen pay $15 to $30 MXN ($1.00 to $2.00 MXN / hour).',
      market: 'Urban retail resells at $150-$300 MXN (+1000% markup). Severe joint deformity & vision loss.',
      quote: '“They tell us: ‘Take $20 pesos or leave it’... we take it just to buy tortillas for today.”',
      tagColor: 'FEE2E2',
      tagText: '991B1B'
    },
    {
      community: 'SAN JOSÉ XOCHIXTLÁN',
      team: 'Charlie Jared Castro, Dulce Maetzy Reyes, Brayan Pérez, José Manuel Hernández (5th Sem.)',
      activity: 'Ancestral Triqui Huipil on Backstrap Loom',
      pain: '6 to 9 months of continuous weaving (~180 hrs). Artisan finances $2,500 MXN of materials.',
      market: 'Months of delayed payments, haggling down to $8,000 MXN, and industrial counterfeiting.',
      quote: '“Clients commission huipiles and force me to wait weeks or months to receive my money.”',
      tagColor: 'FEF3C7',
      tagText: '92400E'
    },
    {
      community: 'SAN JUAN ÑUMÍ',
      team: 'Luis Alexis Morales & eduScrum / UMIZOOMI Team (TecNM Residency)',
      activity: 'Wild Campanilla Honey (Flor de la Mixteca Union)',
      pain: 'Written on loose sheets and old paper notebooks. 3 days needed to transcribe member lists.',
      market: 'Lost harvest records; honey batches committed twice to buyers due to lack of real-time inventory.',
      quote: 'el presidente de la Unión: “Sometimes honey is offered, and later we find it was already sold.”',
      tagColor: 'DCFCE7',
      tagText: '166534'
    },
    {
      community: 'TIJALTEPEC & YUCUHITI',
      team: 'Nallely López García (Student Research Lead)',
      activity: 'High-Altitude Specialty Coffee (1,800 MASL) & Textiles',
      pain: 'Roadside middlemen capture 82% of value; factory counterfeit shirts flood local markets.',
      market: 'Zero digital connectivity in mountain valleys. Urgent demand for tamper-proof origin seals.',
      quote: 'Embroiderer, San Pablo Tijaltepec: “With this QR tag, people will no longer confuse our blouses with cheap knockoffs.”',
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

    slide.addText(`Team: ${c.team}`, {
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

    slide.addText('🔴 The Exploitation:', {
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

    slide.addText('⚠️ Market & Health:', {
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
    "These are the four undergraduate student research teams from TecNM Campus Tlaxiaco. In San Juan Mixtepec, they uncovered that elderly palm weavers earn barely $1.00 MXN per hour while urban retailers mark up the products by +1000%. In San José Xochixtlán, an authentic huipil takes 9 months of labor. In San Juan Ñumí, honey harvest records were being lost in old paper notebooks. Yucu was engineered specifically around these empirical field realities."
  );
}

// SLIDE 3C: Elder-Accessibility UX Field Usability Audit (Milestone 1.2)
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('ELDER ACCESSIBILITY UX AUDIT: FIELD RESULTS (MILESTONE 1.2)', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Cognitive Friction Testing with a Triqui weaver (56) and an embroiderer from Tijaltepec in Rural Outdoor Patios (PR #30 & Issue #2)', {
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
      title: '1. The 3 UX Friction Points',
      subtitle: 'Discovered by students in outdoor field audits',
      items: [
        { label: 'Technophobia & Fear of Error:', desc: 'Hesitation exceeding 10 seconds: “Will the phone break if I tap this?”. Anxiety regarding deleting family photos.' },
        { label: 'Outdoor Glare & Tiny Typography:', desc: 'Under strong mountain sunlight, thin gray typography and small buttons (<48px) become completely illegible.' },
        { label: 'Institutional Badge Skepticism:', desc: 'Official government seals caused suspicion: “Is this to pay taxes to Hacienda?”. Required cultural authenticity marks.' }
      ],
      cardColor: 'FFFFFF',
      headerBg: 'FEE2E2',
      headerColor: '991B1B'
    },
    {
      title: '2. The Yucu Architectural Fix',
      subtitle: 'Elder Mode: Tactile & Spoken Voice',
      items: [
        { label: '112px Giant Tactile Touch-Targets:', desc: 'Oversized buttons designed for farmers with manual calluses and artisans suffering from osteoarticular strain.' },
        { label: 'Native Spoken Mixtec (*Tu’un Savi*):', desc: 'Opus 24kbps Web Audio API streaming. Zero typing or passwords required (Zero-Typing Principle).' },
        { label: 'Offline-First IndexedDB Buffer:', desc: '100% data persistence guarantee on mountain parcels even with zero cellular signal or 3G connectivity.' }
      ],
      cardColor: 'FFFFFF',
      headerBg: 'DCFCE7',
      headerColor: '166534'
    },
    {
      title: '3. Field-Validated Outcomes',
      subtitle: '100% task completion without assistance',
      items: [
        { label: 'QR Adoption in 6-9 Seconds:', desc: 'An embroiderer from Tijaltepec grasped the Hang-Tag instantly: “So nobody confuses our deer blouses with cheap factory knockoffs”.' },
        { label: 'Full Harvest Registration < 3 Mins:', desc: 'Smallholders complete oral lot declarations in under 180 seconds via speech-to-text.' },
        { label: 'Zero Seed-Phrase Friction:', desc: 'Deterministic key derivation and canonical SHA-256 digest creation without exposing private keys to elderly users.' }
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
    "This slide demonstrates that Yucu is deeply grounded in human-centered design. Our students brought mobile devices to mountain workshops, timed user tasks with stopwatches, and diagnosed the fear of breaking the phone in a Triqui weaver and an embroiderer from Tijaltepec. That directly drove our 112px tactile design, spoken Mixtec interface, and physical Hang-Tag QR codes that reduce cognitive friction to zero."
  );
}

// SLIDE 4: The Missing Primitive in Stellar
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('THE MISSING INFRASTRUCTURE PRIMITIVE IN STELLAR', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Why Real-World Asset (RWA) Tokenization Demands On-Chain Attestations', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    color: C_GOLD,
    bold: true,
  });

  // Left Card: The Gap
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.8,
    w: 5.5,
    h: 4.8,
    fill: { color: C_CARD_BG },
    line: { color: C_CARD_BORDER, width: 1 },
  });

  slide.addText('THE ECOSYSTEM GAP TODAY', {
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
      { text: '• Ethereum EAS Benchmark: ', options: { bold: true } },
      { text: 'Ethereum pioneered verifiable claims with EAS, but L1 gas spikes ($5-$25 USD) disqualify it from rural micro-settlements.\n\n' },
      { text: '• Stellar Classic Legacy: ', options: { bold: true } },
      { text: 'SEP-10 (auth) and SEP-12 (KYC) are client-server REST APIs. They do not live on-chain as Turing-complete smart contracts.\n\n' },
      { text: '• Fragmented RWA Solutions: ', options: { bold: true } },
      { text: 'Without a standardized attestation interface, every commodity or supply chain project on Soroban must build bespoke, non-interoperable smart contracts.' }
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

  // Right Card: Yucu Solution
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8,
    y: 1.8,
    w: 5.5,
    h: 4.8,
    fill: { color: 'F0FDF4' },
    line: { color: '86EFAC', width: 1.5 },
  });

  slide.addText('OUR OPEN CONTRIBUTION (SEP-RWA)', {
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
      { text: '• The "EAS of Stellar": ', options: { bold: true } },
      { text: 'An open, composable Schema Registry in Rust on Soroban Protocol 22.\n\n' },
      { text: '• Micro-Cent Verifications: ', options: { bold: true } },
      { text: 'Finality in ~5 seconds at $0.00001 USD per attestation, enabling millions of micro-agricultural claims.\n\n' },
      { text: '• Native State TTL Management: ', options: { bold: true } },
      { text: 'Full utilization of Soroban persistent storage with automated extend_ttl for decades-long ledger durability.\n\n' },
      { text: '• Formal Draft Proposal: ', options: { bold: true } },
      { text: 'Complete open specification ready for SDF review in docs/SEP_RWA_ATTESTATION_DRAFT.md.' }
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
    "Stellar has mastered payments and fiat anchors. But to become the global hub for Real-World Assets, the network requires a composable way to attest to physical truth on-chain. Without an attestation registry, every RWA project is forced to reinvent private, fragmented smart contracts. We built the 'EAS of Stellar' on Soroban: an open schema registry that allows any enterprise, cooperative, or audit firm to issue cryptographic attestations that directly govern conditional escrows."
  );
}

// SLIDE 4: The Smart Contract Trinomial
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('THE CORE SMART CONTRACT ARCHITECTURE', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Three Modular, Interconnected Rust Contracts on Soroban Protocol 22', {
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
      subtitle: 'The On-Chain Notarial Ledger',
      points: [
        'Stores immutable AttestationSchema structs.',
        'Registers deterministic AttestationRecord entries.',
        'Canonical SHA-256 digests & Ed25519 signatures.',
        'Soroban State Rent TTL extensions (100k - 500k ledgers).'
      ]
    },
    {
      name: '2. FairEscrow.rs',
      subtitle: 'Conditional Payment Gateway',
      points: [
        'Locks buyer stablecoin liquidity (USDC / MXNe).',
        'Releases funds ONLY upon valid delivery_attestation_uid.',
        'Anti-Coyote Guardrails: Programmatic price floors.',
        'Zero platform take-rate for primary producers.'
      ]
    },
    {
      name: '3. PerpetualRoyalties.rs',
      subtitle: 'Automated Secondary Resale Engine',
      points: [
        'Enforces 10% perpetual royalties on gallery resales.',
        'Routes funds directly to original artisan public key.',
        'Allocates 2% to Communal Assembly Treasury (Tequio).',
        'Protects collective indigenous cultural heritage.'
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
    "Our architecture consists of three modular, audited Rust contracts. In FairEscrow.rs, international buyer funds are locked in stablecoins. The contract is cryptographically blind to human pressure: it cannot release payment until AttestationRegistry.rs verifies that the harvest or textile has passed sensory quality and physical reception standards. When secondary resale occurs in a luxury market, PerpetualRoyalties.rs automatically routes 10% back to the original indigenous artisan."
  );
}

// SLIDE 5: The Centaur Model
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('THE CENTAUR MODEL: AI ORACLES & INDIGENOUS GOVERNANCE', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Reconciling Customary Law (Usos y Costumbres) with Machine Intelligence', {
    x: 0.8,
    y: 1.15,
    w: 11.5,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    color: C_GOLD,
    bold: true,
  });

  // Left Box: AI Oracles
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.8,
    w: 5.5,
    h: 3.4,
    fill: { color: C_CARD_BG },
    line: { color: C_CARD_BORDER, width: 1 },
  });

  slide.addText('1. AUTONOMOUS AI ORACLES (Technical Rigor)', {
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
      { text: 'Analyzes 5 years of Copernicus Sentinel-2 satellite imagery to certify EU Deforestation Regulation (EUDR) zero-deforestation.\n\n' },
      { text: '• AIQualityOracle: ', options: { bold: true } },
      { text: 'Evaluates SCAA physical bean defect ratios and textile warp/weft density via computer vision models.\n\n' },
      { text: '• AIVoiceOracle: ', options: { bold: true } },
      { text: 'Acoustic parser translating spoken indigenous Mixtec (Tu’un Savi) directly into canonical JSON payloads.' }
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

  // Right Box: Human Community Authority
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8,
    y: 1.8,
    w: 5.5,
    h: 3.4,
    fill: { color: C_CARD_BG },
    line: { color: C_CARD_BORDER, width: 1 },
  });

  slide.addText('2. COMMUNITY ELDER (Sovereign Authority)', {
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
      { text: '• Master Weavers (Triqui, Xochixtlán): ', options: { bold: true } },
      { text: 'Inspects tactile backstrap loom tension, natural dye purity (cochineal/indigo), and sacred iconography.\n\n' },
      { text: '• Master Palenqueros (Don Celso / David Mendoza): ', options: { bold: true } },
      { text: 'Performs bubble bead testing (perlita) and sensory distillation purity checks.\n\n' },
      { text: '• Agrarian Elders & Tequio Assembly: ', options: { bold: true } },
      { text: 'Signs physical batch acceptance using registered Ed25519 keypairs under Mexican Indigenous Protection Law.' }
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

  // Bottom Box: Dual Lock Consensus Banner
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 5.45,
    w: 11.5,
    h: 1.25,
    fill: { color: '0A3825' },
    line: { color: C_EMERALD, width: 1.5 },
  });

  slide.addText('THE DUAL-LOCK ON-CHAIN GUARANTEE', {
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
    'Neither the AI Oracle nor the human elder can unlock FairEscrow alone. Funds are disbursed ONLY when both cryptographic signatures concur on Soroban, eliminating both algorithmic bias and local corruption.',
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
    "In Oaxaca, indigenous communal governance is protected by Article 2 of the Mexican Constitution. We reject the idea that an artificial intelligence model or a smart contract should overrule a community elder. Under our Centaur Model, AI handles technical verification—such as satellite non-deforestation compliance required by the EU—while the master weaver or agricultural elder maintains sovereign authority with their cryptographic signature. Technology honors tradition, rather than displacing it."
  );
}

// SLIDE 6: The Physical Anchor: Digital Passport
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('THE PHYSICAL ANCHOR: DIGITAL PASSPORT & ISO/IEC 18004 QR', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Connecting the Physical Asset to the Stellar Ledger in Under 2 Seconds', {
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
      title: 'PHYSICAL HANG-TAG',
      desc: 'Vector-rendered ISO/IEC 18004 QR codes printed on biodegradable kraft paper and affixed to textiles, coffee sacks, or bottles.'
    },
    {
      num: '02',
      title: 'INSTANT SCAN',
      desc: 'Any smartphone camera in Lisbon, NYC, or Tokyo scans the tag without installing third-party apps or creating crypto accounts.'
    },
    {
      num: '03',
      title: 'ORAL TESTIMONY',
      desc: 'The consumer listens to the weaver speak in her native Tu’un Savi language, validating the cultural meaning behind every motif.'
    },
    {
      num: '04',
      title: 'ON-CHAIN PROOF',
      desc: 'Displays the immutable Stellar block sequence, GPS parcel polygon, SCAA/EUDR badges, and proof of 98% direct payment.'
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
    "For the consumer in Lisbon or Tokyo, the experience is instant. They scan the garment tag and listen to the weaver speak in her mother tongue, with the immutable Stellar hash proving this huipil took 9 months of genuine craftsmanship."
  );
}

// SLIDE 7: Invisible Web3 & Last-Mile Cash
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('INVISIBLE WEB3: ZERO-SEED-PHRASE LAST-MILE LIQUIDITY', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('How Rural Producers Transact Without Bank Accounts or Internet Friction', {
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
      title: 'Acoustic Zero-Typing UI',
      desc: 'Elderly producers speak naturally in Mixtec (Tu’un Savi) or Spanish. The AI parser extracts batch kilos, technique, and parcel without touching a keyboard.'
    },
    {
      title: 'Keyless Identity (DID)',
      desc: 'Laminated physical QR Identity Cards (Carnet de Productor) or SMS OTPs. Zero English seed phrases to memorize or lose.'
    },
    {
      title: 'Etherfuse Banxico SPEI Rail',
      desc: 'International buyer USDC is routed through Stellar Path Payments to MXNe and deposited via SPEI into government Banco del Bienestar debit cards.'
    },
    {
      title: 'MicoPay Mobile Cash Rail',
      desc: 'Trusted local carriers and cooperative merchants act as cash disbursement nodes, delivering physical pesos in mountain hamlets upon QR scan.'
    },
    {
      title: 'Fee-Bump Relayer (CAP-0015)',
      desc: 'The Yucu relayer engine sponsors 100% of network transaction fees. Rural producers never purchase, hold, or calculate gas in XLM.'
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
    "If a financial system requires a 70-year-old indigenous farmer to write down a 24-word English seed phrase, it is exclusionary by design. Yucu makes Web3 completely invisible: the producer speaks in Mixtec, and the funds arrive in pesos without friction."
  );
}

// SLIDE 8: Business Model
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('BUSINESS MODEL & MARKET VALIDATION (TECH REBEL B2B2C)', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Monetizing Institutional Demand While Protecting Primary Producers', {
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
      role: 'SUPPLY MOAT',
      title: 'Indigenous Producers',
      cost: '0% Platform Fee',
      details: [
        '50+ pilot producers in Oaxaca.',
        'Retain 98% of direct wholesale price.',
        'Guaranteed 10% perpetual secondary resale royalty.',
        '2% allocated to community Tequio public works.'
      ]
    },
    {
      role: 'PAYING B2B CLIENTS',
      title: 'Institutional Buyers (SMBs)',
      cost: '1.5% - 2.5% Compliance Fee',
      details: [
        'Specialty coffee micro-roasters in EU/US.',
        'Ethical fashion boutiques & luxury galleries.',
        'Urgent need for EUDR zero-deforestation compliance (fines up to 4% EU turnover).',
        'Immunity against cultural appropriation lawsuits.'
      ]
    },
    {
      role: 'END CONSUMER',
      title: 'Conscious Verifiers',
      cost: 'Direct Retail Premium',
      details: [
        'High-net-worth conscious consumers in Lisbon, Zurich, NYC, CDMX.',
        'Willing to pay 30%-50% premium for verified ethical heritage.',
        'Scan QR hang-tag for proof of origin.'
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
    "Our commercial engine follows the Tech Rebel product methodology. We do not charge the artisans. Our paying clients are European coffee importers and luxury boutiques who face severe regulatory penalties and brand crises if their supply chains lack verifiable proof. Yucu turns compliance into a seamless one-click Soroban transaction, generating sustainable revenue while protecting primary producers."
  );
}

// SLIDE 9: Engineering Traction
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('PRODUCTION TRACTION: CODE, TESTS & ACADEMIC BACKING', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Engineered by Open Hub TecNM: Mexico’s National Technological Engine', {
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
    { num: '52 / 52', label: 'Automated CI Tests Passing', sub: 'End-to-end tests across cryptography, Soroban contracts, and payment oracles (0 failures).' },
    { num: 'Protocol 22', label: 'Soroban SDK Compliance', sub: '3 modular Rust contracts compiled for Stellar Protocol 22 with state rent TTL management.' },
    { num: '100% MIT', label: 'Open-Source Public Good', sub: 'Active public repo at github.com/Open-Hub-Tec/yucu with daily commits from engineering residents.' },
    { num: '600k+', label: 'TecNM National Network', sub: 'Latin America’s largest public engineering system, training a permanent pipeline of Stellar builders.' }
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
    "We come before you today with working, tested code. Our test suite executes 52 automated end-to-end tests across cryptography, Soroban contracts, and payment oracles with zero failures. TecNM educates over 40% of all engineers in Mexico. By anchoring this initiative in our university, we are training a permanent cohort of Mexican Rust and Soroban developers dedicated to building public infrastructure for the Stellar ecosystem."
  );
}

// SLIDE 10B: The Human Team: Indigenous Student Researchers & Faculty
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('THE HUMAN TEAM: INDIGENOUS TALENT & TECNM ENGINEERING', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Undergraduate Student-Engineers at TecNM Campus Tlaxiaco Building Web3 Public Goods (Drips Wave & SCF)', {
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
      title: 'Academic Leadership & Faculty Advisors',
      color: '032517',
      bg: 'DCFCE7',
      members: [
        { role: 'Faculty Advisor & Tech Lead:', name: 'Prof. José Alfredo Román Cruz (TecNM)' },
        { role: 'Student Project Lead:', name: 'Nallely López García (Professional Residency)' },
        { role: 'Host Academic Institution:', name: 'Instituto Tecnológico de Tlaxiaco (Oaxaca, Mex.)' },
        { role: 'Curriculum Program:', name: 'Software Project Management & Software Eng. Fundamentals' }
      ]
    },
    {
      title: 'Field Research: Palm Weavers & Honey',
      color: '991B1B',
      bg: 'FEE2E2',
      members: [
        { role: 'Palm Brigade (San Juan Mixtepec):', name: 'Jazlynn Barrios Velasco' },
        { role: 'Field Researcher:', name: 'Isaías Brayan López Domínguez' },
        { role: 'Co-Researchers:', name: 'Rafael Ayala Coronel, Alex Victoria' },
        { role: 'Honey Brigade (San Juan Ñumí):', name: 'Luis Alexis Morales & eduScrum / UMIZOOMI Team' }
      ]
    },
    {
      title: 'Field Research: Master Textiles & Mezcal',
      color: '92400E',
      bg: 'FEF3C7',
      members: [
        { role: 'Textile Brigade (San José Xochixtlán):', name: 'Charlie Jared Castro Rodríguez (5th Sem.)' },
        { role: 'Elder UX Usability Team:', name: 'Dulce Maetzy Reyes Hernández, Brayan Pérez González' },
        { role: 'Cognitive Friction Researcher:', name: 'José Manuel Hernández Paz (5th Sem.)' },
        { role: 'Mezcal Team (Yavi Tech):', name: 'Lewis Noé Hernández, Nelson Macario Martínez, Luis García' }
      ]
    },
    {
      title: 'Core Protocol & Smart Contract Engineering',
      color: '3730A3',
      bg: 'E0E7FF',
      members: [
        { role: 'Rust / Soroban & Escrow:', name: 'Trustless Work Escrow Adapter & LotPassport' },
        { role: 'Frontend & Offline PWA:', name: 'React 19, IndexedDB Outbox & 112px Elder Mode' },
        { role: 'Autonomous AI Oracles:', name: 'Tu’un Savi Voice STT, SCAA Quality & EUDR Geofence' },
        { role: 'Governance:', name: 'Open Hub TecNM – 100% MIT Open Source Public Good' }
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
    "This project is neither outsourced nor speculative: it is the direct creation of over 12 undergraduate computer engineering students from TecNM Campus Tlaxiaco. They traveled to mountain villages, interviewed cooperative leaders, and are writing Soroban smart contracts in Rust. Funding Yucu via Drips and Stellar directly seeds Latin America's next generation of indigenous Web3 developers."
  );
}

// SLIDE 11: Proposal to Stellar Leadership
{
  const slide = pptx.addSlide();
  slide.background = { color: C_LIGHT_BG };

  slide.addText('STRATEGIC PROPOSAL TO THE STELLAR DEVELOPMENT FOUNDATION', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.55,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  });

  slide.addText('Co-Creating the Global RWA Standard on Soroban Ahead of HackMeridian Lisbon', {
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
      title: 'Formal Ratification of SEP-RWA Standard',
      desc: 'Collaborate with the SDF Standards Committee to refine and adopt our draft specification (docs/SEP_RWA_ATTESTATION_DRAFT.md) as the canonical RWA attestation standard for Soroban.'
    },
    {
      num: '02',
      title: 'HackMeridian & Meridian Lisbon Anchor Showcase',
      desc: 'Feature Yucu at Meridian Lisbon as an exemplar of Protocol 22 utility, showcasing live cross-border purchases between European buyers and Oaxacan indigenous producers.'
    },
    {
      num: '03',
      title: 'University Hub Developer Grant Support',
      desc: 'Capitalize the Open Hub TecNM residency program to fund ongoing student developer bounties and scale our on-chain pilot from 50 to 500 indigenous cooperatives across southern Mexico.'
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
    "Denelle, we are traveling to Lisbon for HackMeridian with our heads held high. We ask the Stellar Development Foundation to partner with Open Hub TecNM: help us ratify the SEP-RWA standard, feature this project as proof of Soroban's real-world dominance, and support our university engineering hub. Together, let us demonstrate that Stellar is the premier blockchain infrastructure for human dignity, real-world assets, and inclusive global trade. Thank you."
  );
}

// SLIDE 11: Closing Slide (Dark Theme)
{
  const slide = pptx.addSlide();
  slide.background = { color: C_DARK_BG };

  slide.addText('THE TRUE PROMISE OF STELLAR', {
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
    '“Real-world assets are not just treasury bills in institutional vaults; they are the heritage, harvests, and hands of the communities that sustain our world.”',
    {
      x: 0.8,
      y: 1.8,
      w: 11.5,
      h: 1.8,
      fontSize: 24,
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

  // Coordinates
  const contact = [
    { label: 'OPEN-SOURCE REPOSITORY', value: 'https://github.com/Open-Hub-Tec/yucu' },
    { label: 'ACADEMIC INSTITUTION', value: 'Open Hub TecNM · Instituto Tecnológico de Tlaxiaco, Oaxaca, Mexico' },
    { label: 'LEAD RESEARCHER', value: 'Prof. José Alfredo Román Cruz · tecnologicotlaxiaco@gmail.com' }
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
    "Denelle, thank you for building an ecosystem that makes this possible. We invite the Stellar Development Foundation to partner with Open Hub TecNM to make Yucu the global standard for RWA attestations on Soroban. Thank you."
  );
}

// Generate the PPTX File
const outputPath = path.join(process.cwd(), 'public', 'Raiz_Protocol_Stellar_PitchDeck.pptx');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`✅ PowerPoint Widescreen 16:9 Presentation generated successfully at: ${outputPath}`);
  })
  .catch((err) => {
    console.error('❌ Failed to generate PowerPoint presentation:', err);
    process.exit(1);
  });
