import React, { useState, useEffect } from 'react';
import { BuyerLeadRecord } from '../types';

/**
 * Borra la llave heredada de contactos de compradores en localStorage (#121, PRIVACIDAD.md).
 */
export function purgeLegacyBuyerLeads(
  storage: Pick<Storage, 'removeItem'> | undefined = typeof localStorage !== 'undefined' ? localStorage : undefined
): void {
  try {
    storage?.removeItem('raiz_buyer_leads');
  } catch {
    // Sin acceso a localStorage en este entorno
  }
}

export type BuyerResearchModalTab = 'template' | 'campo' | 'guide' | 'example';

interface BuyerResearchIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: BuyerResearchModalTab;
}

export const BuyerResearchIssueModal: React.FC<BuyerResearchIssueModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'template',
}) => {
  const [activeTab, setActiveTab] = useState<BuyerResearchModalTab>(defaultTab);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [copied, setCopied] = useState<boolean>(false);

  // Estados del formulario de entrevista en campo (sin nombre ni teléfono del comprador, #121)
  const [studentName, setStudentName] = useState('Equipo de Investigación TecNM');
  const [studentGroup, setStudentGroup] = useState('5º Semestre Grupo B - Ing. en Sistemas Computacionales');
  const [buyerCity, setBuyerCity] = useState('Tlaxiaco, Oaxaca');
  const [buyerSegment, setBuyerSegment] = useState('Barista / Cafetería de especialidad');
  const [interestedProducts, setInterestedProducts] = useState('Café de especialidad (2kg), Textil de telar de cintura');
  const [willingnessToPayExtra, setWillingnessToPayExtra] = useState('120');
  const [consentForFutureContact, setConsentForFutureContact] = useState(false);
  const [susScore, setSusScore] = useState(85);
  const [painsObserved, setPainsObserved] = useState<string[]>([
    'Duda de autenticidad frente a copias industriales',
    'Rechazo a comisiones abusivas de intermediarios',
  ]);
  const [buyerQuote, setBuyerQuote] = useState('');
  const [records, setRecords] = useState<BuyerLeadRecord[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    purgeLegacyBuyerLeads();
  }, []);

  if (!isOpen) return null;

  // ENGLISH OFFICIAL TEMPLATE (Aligned with .github/ISSUE_TEMPLATE/buyer_interview_and_usability.md)
  const rawEnglishTemplate = `---
name: 🛍️ Buyer Research Interview & Usability Evaluation (TecNM)
about: Official template in English for TecNM engineering students to report buyer discovery interviews and usability tests on Yucu Digital Passport
title: "[UX-RESEARCH]: Buyer Interview & Usability Test - [Profile/Location]"
labels: ["user-research", "usability-testing", "buyer-interviews", "ux-evaluation"]
assignees: ''
---

<!-- 
================================================================================
🎓 TECNM STUDENT INSTRUCTIONS (READ CAREFULLY BEFORE SUBMITTING):
1. Purpose: Validate buyer willingness-to-pay, perception of verifiable authenticity 
   vs. commercial plagiarism, understanding of Yucu's direct logistics model (NO middleman fees),
   and usability of the Digital Passport (QR scanning, Stellar zero-PII stamp, and direct contact).
2. Ethical Conduct: Introduce yourself as a Computer Systems Engineering student from 
   Instituto Tecnológico de Tlaxiaco. Request verbal consent before taking notes.
3. Zero-Bias Principle: Never "sell" or explain where to click. Let the buyer explore the screen 
   using the "Think Aloud Protocol". Every hesitation or doubt is a valuable software insight.
4. Language: Submit this report in English for the open-source evaluation committee.
================================================================================
-->

# 🛍️ Buyer Research & UX Usability Evaluation Report
**Project:** Yucu Mixteca Open Hub (\`Open-Hub-Tec/yucu\`)  
**Institution:** Instituto Tecnológico de Tlaxiaco (TecNM) – Computer Systems Engineering  
**Course / Advisor:** Software Engineering Fundamentals / Professional Residency  
**Milestone / Grant:** Open Source Milestone – Buyer Validation & Usability Testing  

---

## 👥 1. Field Research Team (TecNM Students)
- **Student Researcher(s):** <!-- Full names or GitHub usernames of student evaluators -->
- **Semester & Group:** <!-- e.g., 5th Semester, Group B – B.S. Computer Systems Engineering -->
- **Date of Test:** <!-- YYYY-MM-DD -->
- **Location / Test Context:** <!-- e.g., Specialty coffee shop in Tlaxiaco / Organic market in Oaxaca / Remote video session -->
- **Participant's Device:** <!-- e.g., Xiaomi Redmi Note 11 (6.4" Android, Chrome browser) / iPhone 13 (Safari) -->

---

## 👤 2. Buyer Profile & Demographics
- **Identifier / Alias:** <!-- e.g., Buyer-01 (barista & cultural collector). No name or exact age. -->
- **Age & Occupation:** 
- **City of Residence:** <!-- e.g., Tlaxiaco, Oaxaca / Mexico City / International tourist -->
- **Buyer Segment:**
  - [ ] Ethical end-consumer / Cultural tourist
  - [ ] Specialty coffee shop owner / Professional barista
  - [ ] Fashion designer / Traditional backstrap-loom textile collector
  - [ ] Fair-trade store owner / Agroecological distributor
  - [ ] Other: <!-- specify -->
- **Purchase Frequency (Crafts & Origin Agro-products):** <!-- e.g., Weekly / Bi-weekly / Monthly / Travel-only -->
- **Current Purchase Channels:** <!-- e.g., Street markets, craft boutiques, Instagram, middlemen resellers -->

---

## 🔒 2.1 Contact details
> **Do not publish them here.** This issue is public. If the buyer agrees to be contacted at launch, store the contact in the team's private folder (\`.investigacion_privada/\`), never in an issue ([\`docs/research/PRIVACIDAD.md\`](../../docs/research/PRIVACIDAD.md), rules 2 and 5).

- **Agreed to be contacted?** [ ] Yes (stored in the private folder) · [ ] No

---

## 🎙️ 3. Qualitative Discovery Interview (Value & Trust)

### 3.1 Motivations & Plagiarism Pain Points
* **What motivates you to buy authentic Mixtec handicrafts (backstrap-loom, palm, pottery) or high-altitude specialty coffee instead of industrial alternatives?**
  > *Buyer Response:* 

* **Have you ever doubted whether an artisanal piece or coffee lot is 100% authentic versus an industrial imitation or reseller blend? How do you verify it today?**
  > *Buyer Response:*

* **How does it affect your purchasing decisions knowing that commercial brands have plagiarized Mixtec embroidery designs without community consent?**
  > *Buyer Response:*

### 3.2 Perception of Traceability & Stellar Zero-PII Stamp
* **When you scan a QR code on a physical garment hang-tag or coffee bag, what specific information do you expect to see?**
  > *Buyer Response:*

* **Explanation given to buyer:**  
  *"Yucu records an immutable cryptographic fingerprint on the public Stellar blockchain certifying the piece originated from a verified indigenous community, but it stores ZERO Personally Identifiable Information (no full names, IDs, or home coordinates on-chain) to protect artisan privacy and sovereignty."*  
  *How does this cryptographic verification affect your trust compared to a standard printed label?*
  > *Buyer Response:*

* **Willingness to Pay (Fair Trade Premium):** Would you pay a fair-trade premium (e.g., 20% to 40% more) if you have verifiable proof that 100% of the payment goes directly to the artisan family?
  - [ ] Yes, definitely (Estimated premium: +$____ MXN)
  - [ ] Depends on the product
  - [ ] No, seeking lowest price possible
  > *Buyer Comments:*

### 3.3 Perception of Yucu's Direct Logistics Disclaimer
* **Explanation given to buyer:**  
  *"Yucu is NOT a delivery company or an e-commerce platform like Amazon: it charges ZERO middleman commissions and operates NO logistics trucks. Instead, Yucu provides the verified digital certificate and an assisted direct contact button so buyer and cooperative agree on local pick-up or shipping directly."*  
  *How do you evaluate dealing directly with the craft maker versus paying markups to a commercial delivery app?*
  > *Buyer Response:*

---

## 🧪 4. UX Usability Testing Protocol (Observed Tasks)

| # | Task Description | Time (sec) | Result | Needed Help? | Observations & Friction Points |
|---|---|:---:|:---:|:---:|---|
| **T1** | **Scan physical QR hang-tag & load Digital Passport** | ___ s | [ ] Pass<br>[ ] Struggle<br>[ ] Fail | [ ] No<br>[ ] Yes | *Did the page load promptly? Was the product clear immediately?* |
| **T2** | **Identify cultural origin, artisan, & ancestral technique** | ___ s | [ ] Pass<br>[ ] Struggle<br>[ ] Fail | [ ] No<br>[ ] Yes | *Did they read community story & work hours? Was typography readable?* |
| **T3** | **Inspect authenticity verification & Stellar Blockchain stamp** | ___ s | [ ] Pass<br>[ ] Struggle<br>[ ] Fail | [ ] No<br>[ ] Yes | *Did they understand the certificate? Any technical jargon confusion?* |
| **T4** | **Locate logistics disclaimer & Direct Contact action** | ___ s | [ ] Pass<br>[ ] Struggle<br>[ ] Fail | [ ] No<br>[ ] Yes | *Did they look for a traditional cart or understand direct negotiation?* |
| **T5** | **Explore community showcase & filter by product type / town** | ___ s | [ ] Pass<br>[ ] Struggle<br>[ ] Fail | [ ] No<br>[ ] Yes | *Were filters (loom, coffee, honey, clay, palm) and towns intuitive?* |

---

## 📊 5. Standardized System Usability Scale (SUS)

- **Calculated SUS Score:** \`_____ / 100\` *(SUS > 68 is Acceptable; > 80 is Grade A Excellent)*
- **Authenticity Confidence Level (1 to 10):** \`[ /10 ]\`
`;

  // SPANISH OFFICIAL TEMPLATE (Aligned with .github/ISSUE_TEMPLATE/entrevista_compradores_usabilidad.md)
  const rawSpanishTemplate = `---
name: 🛍️ Entrevista a Compradores y Evaluación de Usabilidad UX
about: Plantilla oficial para que los estudiantes del TecNM registren entrevistas de validación con compradores y pruebas de usabilidad del Pasaporte Digital Yucu
title: "[UX-RESEARCH]: Entrevista a Comprador y Prueba de Usabilidad - [Perfil/Ubicación]"
labels: ["user-research", "usability-testing", "buyer-interviews", "ux-evaluation"]
assignees: ''
---

# 🛍️ Reporte de Entrevista a Comprador y Prueba de Usabilidad UX
**Proyecto:** Yucu Mixteca Open Hub (\`Open-Hub-Tec/yucu\`)  
**Institución:** Instituto Tecnológico de Tlaxiaco (TecNM) – Depto. de Sistemas y Computación  
**Materia / Asesor:** Fundamentos de Ingeniería de Software / Residencia Profesional  
**Hito:** Milestone UX Compradores & Trazabilidad Soberana  

---

## 👥 Datos del Equipo Evaluador (Estudiantes TecNM)
- **Investigador(es):** <!-- Nombre o usuario de GitHub de los estudiantes -->
- **Semestre y Grupo:** <!-- Ej. 5º Semestre Grupo B -->
- **Fecha de Aplicación:** <!-- AAAA-MM-DD -->
- **Lugar / Contexto de la Prueba:** <!-- Ej. Cafetería de especialidad en Tlaxiaco / Mercado Orgánico en Oaxaca -->
- **Dispositivo Usado por el Comprador:** <!-- Ej. Android Chrome / iPhone Safari -->

---

## 👤 Perfil del Comprador Entrevistado
- **Identificador / Alias:** <!-- Ej. Comprador-01 (diseñadora y coleccionista textil). Sin nombre ni edad exacta. -->
- **Ocupación / Rol:** 
- **Lugar de Residencia:** <!-- Ej. Oaxaca de Juárez / CDMX / Extranjero -->
- **Segmento de Comprador:**
  - [ ] Consumidor final ético / Turista nacional o internacional
  - [ ] Propietario / Barista de cafetería de especialidad
  - [ ] Diseñador(a) de moda / Coleccionista de textiles de telar
  - [ ] Tienda de comercio justo / Distribuidor agroecológico
  - [ ] Otro: <!-- Especificar -->
- **Frecuencia de compra de productos artesanales / agroecológicos:** 
- **Canales donde suele comprar actualmente:** 

---

## 🔒 Datos de contacto
> **No se publican aquí.** Esta issue es pública. Si la persona acepta que la contacten cuando se abran pedidos, guarda su contacto en la carpeta privada del equipo (\`.investigacion_privada/\`), nunca en una issue ([\`docs/research/PRIVACIDAD.md\`](../../docs/research/PRIVACIDAD.md), reglas 2 y 5).

- **¿Aceptó que la contacten?** [ ] Sí (contacto guardado en la carpeta privada) · [ ] No

---

## 🎙️ Parte 1: Guion de Entrevista Cualitativa (Descubrimiento y Valor)
### 1.1 Motivación y Problema de Autenticidad
* **¿Qué te motiva a buscar artesanías o café de especialidad de origen mixteco?**
  > *Respuesta:* 
* **¿Alguna vez has dudado si una pieza es 100% auténtica o reventa/copia industrial?**
  > *Respuesta:* 
* **¿Cómo te impacta saber que marcas comerciales plagian bordados sin permiso comunitario?**
  > *Respuesta:* 

### 1.2 Trazabilidad y Sello Stellar Zero-PII
* **¿Qué esperas ver al escanear el QR físico en una etiqueta?**
  > *Respuesta:* 
* **Sobreprecio Ético:** ¿Pagarías un sobreprecio justo (+20% a +40%) si sabes que el 100% llega a la artesana?
  - [ ] Sí, con certeza (Estimado: +$____ MXN)
  - [ ] Depende del producto
  - [ ] No, busco el menor precio posible

---

## 🧪 Parte 2: Pruebas de Usabilidad UX (Tareas T1 - T5)
| # | Tarea | Tiempo (seg) | Resultado | Observaciones |
|---|---|:---:|:---:|---|
| **T1** | Escanear QR y ver pasaporte | ___ s | [ ] Éxito [ ] Dificultad | |
| **T2** | Identificar origen cultural y técnica | ___ s | [ ] Éxito [ ] Dificultad | |
| **T3** | Verificar sello inmutable Stellar | ___ s | [ ] Éxito [ ] Dificultad | |
| **T4** | Localizar botón de contacto directo | ___ s | [ ] Éxito [ ] Dificultad | |
| **T5** | Filtrar vitrina comunitaria | ___ s | [ ] Éxito [ ] Dificultad | |

---

## 📊 Parte 3: Evaluación de Usabilidad Estandarizada (SUS Adaptado)
- **Puntaje SUS Calculado:** \`_____ / 100\` *(Meta > 80 pts)*
- **Nivel de Confianza en Autenticidad (1 a 10):** \`[ /10 ]\`
`;

  const activeTemplateText = language === 'en' ? rawEnglishTemplate : rawSpanishTemplate;

  const handleCopy = (textToCopy = activeTemplateText) => {
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const filename =
      language === 'en' ? 'BUYER_RESEARCH_AND_UX_ISSUE_TEMPLATE.md' : 'ISSUE_ENTREVISTA_COMPRADORES_UX.md';
    const blob = new Blob([activeTemplateText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Registrar entrevista anónima en memoria (sin nombre ni teléfono del comprador)
  const handleSaveFieldInterview = (e: React.FormEvent) => {
    e.preventDefault();

    const newRecord: BuyerLeadRecord = {
      id: `interview-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      studentName: studentName.trim() || 'Equipo TecNM',
      studentGroup: studentGroup.trim() || 'Ing. Sistemas',
      buyerCity: buyerCity.trim() || 'Tlaxiaco, Oaxaca',
      buyerSegment,
      interestedProducts: interestedProducts.trim(),
      willingnessToPayExtraMxn: Number(willingnessToPayExtra) || 0,
      susScore: Number(susScore) || 85,
      consentForFutureContact,
      notes: buyerQuote.trim(),
      createdVia: 'field_interview',
    };

    setRecords([newRecord, ...records]);
    setSaveSuccessMsg('Resumen anónimo de entrevista listo (sin nombre ni teléfono del comprador).');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
    setBuyerQuote('');
  };

  const generateAnonymousIssueMarkdown = (rec: BuyerLeadRecord, index: number) => {
    const alias = `Comprador-${String(index + 1).padStart(2, '0')} (${rec.buyerSegment})`;
    const acceptedCheck = rec.consentForFutureContact ? '[x] Sí (contacto guardado en la carpeta privada) · [ ] No' : '[ ] Sí · [x] No';
    return `---
name: 🛍️ Entrevista a Compradores y Evaluación de Usabilidad UX
title: "[UX-RESEARCH]: Entrevista a Comprador y Prueba de Usabilidad - [${rec.buyerSegment} / ${rec.buyerCity}]"
labels: ["user-research", "usability-testing", "buyer-interviews", "ux-evaluation"]
---

# 🛍️ Reporte de Entrevista a Comprador y Prueba de Usabilidad UX
**Proyecto:** Yucu Mixteca Open Hub (\`Open-Hub-Tec/yucu\`)  
**Institución:** Instituto Tecnológico de Tlaxiaco (TecNM) – Depto. de Sistemas y Computación  
**Estudiante(s):** ${rec.studentName} (${rec.studentGroup})  
**Fecha:** ${rec.timestamp}  

---

## 👤 Perfil del Comprador Entrevistado
- **Identificador / Alias:** ${alias}
- **Lugar de Residencia:** ${rec.buyerCity}
- **Segmento de Comprador:** ${rec.buyerSegment}
- **Productos de Interés:** ${rec.interestedProducts}
- **Disposición a Pagar Sobreprecio Ético:** +$${rec.willingnessToPayExtraMxn ?? 0} MXN
- **Puntuación SUS Reportada:** ${rec.susScore ?? 85} / 100
- **Cita Textual del Comprador:** "${rec.notes || 'Interés en trato directo y trazabilidad verificable.'}"

---

## 🔒 Datos de contacto
> **No se publican aquí.** Esta issue es pública. Si la persona acepta que la contacten cuando se abran pedidos, guarda su contacto en la carpeta privada del equipo (\`.investigacion_privada/\`), nunca en una issue ([\`docs/research/PRIVACIDAD.md\`](../../docs/research/PRIVACIDAD.md), reglas 2 y 5).

- **¿Aceptó que la contacten?** ${acceptedCheck}
`;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#fcfaf6] text-[#1c241f] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-300 w-full max-w-5xl max-h-[94vh]">
        {/* HEADER */}
        <div className="bg-[#032517] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-emerald-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/80 text-amber-300 flex items-center justify-center font-bold text-lg shadow-xs">
              🛍️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-700/50">
                  TecNM Tlaxiaco · Open Hub Milestone
                </span>
                <span className="text-[11px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-600/40 font-bold">
                  Privacidad Zero-PII (PRIVACIDAD.md)
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
                Validación de Compradores y Pruebas de Usabilidad UX
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'template' && (
              <div className="bg-emerald-950 p-0.5 rounded-lg border border-emerald-700/60 flex items-center text-xs">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-amber-400 text-stone-950 font-black shadow-2xs'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  EN (Official)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('es')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    language === 'es'
                      ? 'bg-amber-400 text-stone-950 font-black shadow-2xs'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  ES
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-rose-900 text-stone-200 hover:text-white transition-colors cursor-pointer"
              title="Cerrar modal"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* TABS SELECTOR (sin pestaña de leads, #121) */}
        <div className="bg-stone-100 px-3 sm:px-6 pt-3 pb-0 border-b border-stone-200 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('campo')}
              className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition-all cursor-pointer border-t border-x flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'campo'
                  ? 'bg-[#fcfaf6] text-[#032517] border-stone-300 shadow-2xs font-black'
                  : 'text-stone-600 hover:text-stone-900 border-transparent hover:bg-stone-200/60'
              }`}
            >
              <span>📝</span>
              <span>Modo Campo (Sin Datos Personales)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('template')}
              className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition-all cursor-pointer border-t border-x flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'template'
                  ? 'bg-[#fcfaf6] text-[#032517] border-stone-300 shadow-2xs font-black'
                  : 'text-stone-600 hover:text-stone-900 border-transparent hover:bg-stone-200/60'
              }`}
            >
              <span>📋</span>
              <span>Plantilla Issue GitHub</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition-all cursor-pointer border-t border-x flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'bg-[#fcfaf6] text-[#032517] border-stone-300 shadow-2xs font-black'
                  : 'text-stone-600 hover:text-stone-900 border-transparent hover:bg-stone-200/60'
              }`}
            >
              <span>🧭</span>
              <span>Protocolo de Campo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('example')}
              className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition-all cursor-pointer border-t border-x flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'example'
                  ? 'bg-[#fcfaf6] text-[#032517] border-stone-300 shadow-2xs font-black'
                  : 'text-stone-600 hover:text-stone-900 border-transparent hover:bg-stone-200/60'
              }`}
            >
              <span>⭐</span>
              <span>Ejemplo Anónimo</span>
            </button>
          </div>

          {activeTab === 'template' && (
            <div className="flex items-center gap-2 pb-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCopy(activeTemplateText)}
                className="px-3 py-1.5 bg-[#032517] hover:bg-emerald-950 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Copiar texto markdown al portapapeles"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? '¡Copiado!' : 'Copiar Plantilla'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="p-1.5 bg-white hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-lg text-xs font-bold flex items-center transition-all cursor-pointer"
                title="Descargar archivo .md"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
              </button>
            </div>
          )}
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-sm">
          {/* TAB 1: MODO CAMPO ANÓNIMO */}
          {activeTab === 'campo' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl text-amber-950 space-y-1.5">
                <h4 className="font-black text-sm text-amber-900 flex items-center gap-2">
                  <span>🔒</span>
                  <span>Datos de contacto (docs/research/PRIVACIDAD.md, reglas 2 y 5)</span>
                </h4>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  <strong>No se publican aquí.</strong> Esta issue es pública. Si la persona acepta que la contacten cuando se abran pedidos, guarda su contacto en la carpeta privada del equipo (<code>.investigacion_privada/</code>), nunca en una issue ni en el navegador. Aquí solo se registra si aceptó o no ser contactada.
                </p>
              </div>

              {saveSuccessMsg && (
                <div className="bg-emerald-600 text-white p-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 animate-fadeIn shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveFieldInterview} className="bg-white p-5 rounded-2xl border border-stone-300 shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Estudiante(s) Evaluador(es) TecNM:
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 outline-none"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Usuario de GitHub o equipo evaluador"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Semestre y Materia:
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 outline-none"
                      value={studentGroup}
                      onChange={(e) => setStudentGroup(e.target.value)}
                      placeholder="Ej. 5º Semestre Grupo B - Residencia"
                    />
                  </div>
                </div>

                <div className="border-t border-stone-200 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Ciudad / Ubicación de la Prueba:
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 outline-none"
                      value={buyerCity}
                      onChange={(e) => setBuyerCity(e.target.value)}
                      placeholder="Ej. Tlaxiaco / Oaxaca / CDMX"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Perfil o Segmento de Comprador:
                    </label>
                    <select
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-emerald-700 outline-none bg-white font-medium"
                      value={buyerSegment}
                      onChange={(e) => setBuyerSegment(e.target.value)}
                    >
                      <option value="Barista / Cafetería de especialidad">Barista / Cafetería de especialidad</option>
                      <option value="Turista cultural / Consumidor ético">Turista cultural / Consumidor ético</option>
                      <option value="Diseñador(a) / Coleccionista textil">Diseñador(a) / Coleccionista textil</option>
                      <option value="Tienda de comercio justo / Distribuidor">Tienda de comercio justo / Distribuidor</option>
                      <option value="Comprador local en la Mixteca">Comprador local en la Mixteca</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Productos / Ramos de Interés:
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-emerald-700 outline-none"
                      value={interestedProducts}
                      onChange={(e) => setInterestedProducts(e.target.value)}
                      placeholder="Ej. Café de altura, Rebozo telar, Miel"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Sobreprecio Ético Dispuesto (MXN):
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-stone-500 font-bold">$</span>
                      <input
                        type="number"
                        className="w-full pl-6 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-emerald-700 outline-none font-bold"
                        value={willingnessToPayExtra}
                        onChange={(e) => setWillingnessToPayExtra(e.target.value)}
                        placeholder="120"
                      />
                    </div>
                  </div>
                </div>

                {/* Dolores Observados y SUS */}
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-3">
                  <div>
                    <span className="block text-xs font-bold text-stone-800 mb-1.5">
                      Dolores y Factores Críticos Validados en la Entrevista:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                      {[
                        'Duda de autenticidad frente a copias industriales',
                        'Rechazo a comisiones abusivas de intermediarios',
                        'Valora que el 100% del pago vaya a la artesana',
                        'Entendió y apreció el sello Stellar Zero-PII sin invasión de datos',
                      ].map((pain) => (
                        <label key={pain} className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={painsObserved.includes(pain)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPainsObserved([...painsObserved, pain]);
                              } else {
                                setPainsObserved(painsObserved.filter((p) => p !== pain));
                              }
                            }}
                            className="rounded text-emerald-800 focus:ring-emerald-700"
                          />
                          <span>{pain}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-200">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-stone-800">Evaluación SUS Rápida:</span>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="5"
                        value={susScore}
                        onChange={(e) => setSusScore(Number(e.target.value))}
                        className="w-32 accent-emerald-800 cursor-pointer"
                      />
                      <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-mono">
                        {susScore} / 100 ({susScore >= 80 ? 'Excelente A' : 'Aceptable'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* ¿Aceptó que la contacten? sí/no (sin guardar nombre ni teléfono) */}
                <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={consentForFutureContact}
                      onChange={(e) => setConsentForFutureContact(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                    />
                    <div className="text-xs text-emerald-950">
                      <strong className="block font-black text-emerald-900">
                        🔒 ¿Aceptó que la contacten? ({consentForFutureContact ? 'Sí' : 'No'})
                      </strong>
                      <span>
                        No se guarda ni publica ningún nombre ni teléfono aquí. Si la persona aceptó, su contacto se resguarda únicamente en la carpeta privada del equipo (<code>.investigacion_privada/</code>).
                      </span>
                    </div>
                  </label>
                </div>

                {/* Cita Textual */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Cita Textual Anónima del Comprador (sin nombres propios):
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-emerald-700 outline-none"
                    placeholder="Ej. 'Me interesa tratar directo con la cooperativa sin que un intermediario se quede con el margen del trabajo artesanal...'"
                    value={buyerQuote}
                    onChange={(e) => setBuyerQuote(e.target.value)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-stone-500">
                    Genera el borrador anónimo en Markdown listo para copiar a una issue de GitHub.
                  </span>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#032517] hover:bg-emerald-950 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">note_add</span>
                    <span>Generar Resumen Anónimo</span>
                  </button>
                </div>
              </form>

              {records.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-stone-600">
                    Borradores Anónimos de la Sesión ({records.length})
                  </h5>
                  {records.map((rec, idx) => (
                    <div key={rec.id} className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#032517]">
                          Comprador-{String(idx + 1).padStart(2, '0')} · {rec.buyerSegment} ({rec.buyerCity})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(generateAnonymousIssueMarkdown(rec, idx))}
                          className="px-3 py-1 rounded-lg bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                        >
                          Copiar Markdown Anónimo
                        </button>
                      </div>
                      <p className="text-xs text-stone-600">
                        ¿Aceptó que la contacten?: <strong>{rec.consentForFutureContact ? 'Sí (en carpeta privada)' : 'No'}</strong> · SUS: <strong>{rec.susScore}/100</strong>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PLANTILLA MARKDOWN DE ISSUE GITHUB */}
          {activeTab === 'template' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl text-xs sm:text-sm text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">💡</span>
                  <div>
                    <strong>Instrucción para el Alumno:</strong> Copia esta plantilla oficial o abre directamente la nueva issue en GitHub:
                    <div className="mt-0.5">
                      <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-mono font-bold text-xs">
                        github.com/Open-Hub-Tec/yucu/issues/new?template=buyer_interview_and_usability.md
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <a
                    href="https://github.com/Open-Hub-Tec/yucu/issues/new?title=%5BUX-RESEARCH%5D%3A+Buyer+Interview+%26+Usability+Test+-+TecNM&labels=user-research%2Cusability-testing%2Cbuyer-interviews%2Cux-evaluation&template=buyer_interview_and_usability.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Abrir Issue en GitHub</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                </div>
              </div>

              <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-stone-700 shadow-inner max-h-[55vh]">
                <pre className="whitespace-pre-wrap">{activeTemplateText}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: GUÍA Y PROTOCOLO DE CAMPO */}
          {activeTab === 'guide' && (
            <div className="space-y-5 text-stone-800">
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl text-amber-950 text-xs sm:text-sm space-y-1">
                <h4 className="font-bold flex items-center gap-2 text-amber-900 text-sm">
                  <span className="material-symbols-outlined text-base">school</span>
                  Protocolo del Estudiante del Tec de Tlaxiaco en Campo
                </h4>
                <p>
                  Tu función es validar la experiencia del comprador sin vender el producto ni indicarle dónde hacer clic. Aplica el <strong>Think-Aloud Protocol</strong> (pensar en voz alta) y respeta estrictamente <code>docs/research/PRIVACIDAD.md</code>: nunca publiques nombres ni teléfonos en las issues.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-2">
                  <h5 className="font-black text-stone-900 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs">1</span>
                    Presentación Ética y Consentimiento
                  </h5>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Preséntate como estudiante de Ingeniería en Sistemas Computacionales del Instituto Tecnológico de Tlaxiaco. Registra al participante únicamente por rol y municipio (por ejemplo, <em>Comprador-01, cafetería de especialidad en Tlaxiaco</em>).
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-2">
                  <h5 className="font-black text-stone-900 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs">2</span>
                    🔒 Datos de contacto
                  </h5>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    <strong>No se publican aquí.</strong> Esta issue es pública. Si la persona acepta que la contacten cuando se abran pedidos, guarda su contacto en la carpeta privada del equipo (<code>.investigacion_privada/</code>), nunca en una issue.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EJEMPLO DE REFERENCIA ANÓNIMO */}
          {activeTab === 'example' && (
            <div className="space-y-4">
              <div className="bg-stone-50 border border-stone-300 p-4 rounded-xl text-stone-800 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <div>
                    <span className="font-black text-[#032517] text-sm sm:text-base block">
                      Ejemplo de Referencia: Comprador-01 (Barista en cafetería de especialidad, Tlaxiaco)
                    </span>
                    <span className="text-xs text-stone-500">
                      Evaluado por: Brigada de Ingeniería en Sistemas Computacionales (TecNM Tlaxiaco)
                    </span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-300 font-mono">
                    SUS: 95.0 / 100 (Grado A+)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-stone-200">
                    <strong className="block text-stone-900 mb-0.5">Perfil Anónimo:</strong>
                    Barista de cafetería de especialidad en Tlaxiaco (sin nombre ni edad exacta).
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-stone-200">
                    <strong className="block text-stone-900 mb-0.5">🔒 ¿Aceptó que la contacten?:</strong>
                    Sí (contacto guardado en la carpeta privada <code>.investigacion_privada/</code>).
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-stone-200">
                    <strong className="block text-stone-900 mb-0.5">Sobreprecio Ético:</strong>
                    +$150 MXN/kg de café trazable.
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-stone-200 text-xs space-y-2">
                  <p className="italic text-stone-700">
                    &ldquo;Me parece muy bien que la cadena no guarde datos personales ni de la artesana ni del comprador, y que el trato se acuerde directamente con el grupo productor sin intermediarios.&rdquo;
                  </p>
                  <p className="font-bold text-emerald-800 text-right">
                    — Comprador-01, cafetería de especialidad en Tlaxiaco, Oaxaca
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-stone-100 px-4 sm:px-6 py-3 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 font-medium hidden sm:inline">
              Yucu Open Hub · Instituto Tecnológico de Tlaxiaco (TecNM)
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#032517] hover:bg-emerald-950 text-white transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
