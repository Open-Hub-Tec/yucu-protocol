> **Presentación histórica (octubre de 2026). Algunas diapositivas describen un diseño anterior.** La arquitectura vigente está en [ADR-005](./adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md) (atestaciones sobre Attest Protocol; `attestation_registry` es solo material de práctica) y [ADR-007](./adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md) (motor de voz: la IA prepara, la persona firma; ningún oráculo emite ni certifica). Donde este documento los contradiga, mandan los ADR.

# 📽️ Diapositivas Oficiales: Protocolo Yucu & Brigadas de Investigación TecNM
### *Infraestructura Descentralizada de Atestaciones RWA, Oráculos de IA y Escrow en Stellar Soroban*

* **Institución:** Instituto Tecnológico de Tlaxiaco (TecNM - Oaxaca, México)
* **Carrera:** Ingeniería en Sistemas Computacionales | Materias: Fundamentos de Ing. de Software & Gestión de Proyectos
* **Archivos PowerPoint Generados:**  
  * 🇪🇸 [`public/Raiz_Protocol_Presentacion_Oficial.pptx`](../public/Raiz_Protocol_Presentacion_Oficial.pptx)
  * 🇬🇧 [`public/Raiz_Protocol_Stellar_PitchDeck.pptx`](../public/Raiz_Protocol_Stellar_PitchDeck.pptx)

---

## 📑 Índice de Diapositivas (14 Láminas en Relación Panorámica 16:9)

1. [Diapositiva 1: Portada Institucional](#diapositiva-1-portada-institucional)
2. [Diapositiva 2: La Crisis de Extracción Rural en la Mixteca Alta](#diapositiva-2-la-crisis-de-extracción-rural-en-la-mixteca-alta)
3. [Diapositiva 3: Auditoría Empírica de Campo (Cadena de Valor: Antes vs. Después)](#diapositiva-3-auditoría-empírica-de-campo-cadena-de-valor)
4. [Diapositiva 3B: Brigadas Estudiantiles: Casos de Dolor Real en la Mixteca](#diapositiva-3b-brigadas-estudiantiles-casos-de-dolor-real)
5. [Diapositiva 3C: Auditoría de Usabilidad UX en Adultos Mayores (Hito 1.2)](#diapositiva-3c-auditoría-de-usabilidad-ux-en-adultos-mayores)
6. [Diapositiva 4: La Infraestructura que le Faltaba a Stellar](#diapositiva-4-la-infraestructura-que-le-faltaba-a-stellar)
7. [Diapositiva 5: Arquitectura de Smart Contracts en Soroban](#diapositiva-5-arquitectura-de-smart-contracts-en-soroban)
8. [Diapositiva 6: El Modelo Centauro (IA Multimodal + Validador Comunitario)](#diapositiva-6-el-modelo-centauro)
9. [Diapositiva 7: El Ancla Física: Pasaporte Digital y Hang-Tag QR](#diapositiva-7-el-ancla-física-pasaporte-digital-y-hang-tag-qr)
10. [Diapositiva 8: Web3 Invisible y Liquidación en Parcela](#diapositiva-8-web3-invisible-y-liquidación-en-parcela)
11. [Diapositiva 9: Modelo de Negocio Sostenible B2B2C](#diapositiva-9-modelo-de-negocio-sostenible-b2b2c)
12. [Diapositiva 10: Tracción en Producción: Código, Pruebas y Respaldo TecNM](#diapositiva-10-tracción-en-producción)
13. [Diapositiva 10B: El Equipo Humano: Talento Indígena e Ingeniería TecNM](#diapositiva-10b-el-equipo-humano-talento-indígena-e-ingeniería-tecnm)
14. [Diapositiva 11: Propuesta Estratégica para Drips y Stellar Community Fund](#diapositiva-11-propuesta-estratégica-para-drips-y-stellar)

---

### Diapositiva 1: Portada Institucional
* **Título:** PROTOCOLO RAÍZ
* **Subtítulo:** *Infraestructura de Atestaciones RWA y Pagos en Custodia Justa en Stellar Soroban*
* **Institución:** Open Hub TecNM · Instituto Tecnológico de Tlaxiaco (Oaxaca, México)
* **Liderazgo:** Asesoría Docente: Ing. José Alfredo Román Cruz · Líder Estudiantil: Nallely López García
* **Ecosistema:** Stellar Development Foundation / Soroban / Drips Network / Tech Rebel

---

### Diapositiva 2: La Crisis de Extracción Rural en la Mixteca Alta
* **El Problema Estructural:**
  1. **Monopolio de Intermediarios ("Coyotaje"):** Los intermediarios capturan hasta el 93% del margen de reventa aprovechando la falta de transporte y acceso bancario.
  2. **Cero Conectividad en la Parcela:** Las comunidades cafetaleras y artesanas (Yucuhiti, Mixtepec, Tijaltepec) carecen de señal 3G/4G. Las apps convencionales quedan inutilizadas.
  3. **Falsificación y Pérdida de Procedencia:** Maquilas foráneas y mezcales adulterados con alcohol de caña usurpan la identidad cultural indígena sin dejar un solo peso en las comunidades.

---

### Diapositiva 3: Auditoría Empírica de Campo (Cadena de Valor)
* **Resultados de 50 Auditorías en 4 Comunidades:**
  * **Huipil Triqui de Telar (San José Xochixtlán):** Productor recibe 7% ($1,200-$1,500 MXN) tras 9 meses de tejido. Coyote acapara el 93% revendiendo a $18,000 MXN en galerías.
  * **Café Pergamino de Altura (Yucuhiti / Tlaxiaco):** Productor recibe 18% en báscula de carretera ($35 MXN/kg). Coyote revende a $180-$250 MXN/kg como café de especialidad.
  * **Mezcal Puro Ancestral (Yautepec / Tlaxiaco):** Mezcal genuino a $340 MXN/L compite deslealmente contra mezcal adulterado a $50 MXN/L vendido con fotos de "campesinos con sombrero".
  * **Artesanías de Palma (San Juan Mixtepec):** La artesana percibe $1.00 a $2.00 MXN por hora trabajada ($15 a $30 MXN por pieza de 15 horas). Coyote revende a $150-$300 MXN (+1000% markup).
* **Solución de Yucu Protocol:** 98% del valor directo a la familia productora y 2% al fondo comunal de obras (Tequio).

---

### Diapositiva 3B: Brigadas Estudiantiles: Casos de Dolor Real
* **Brigada 1 – San Juan Mixtepec (Palma de Cinta):**
  * **Alumnos Investigadores:** Jazlynn Barrios Velasco, Isaías Brayan López Domínguez, Rafael Ayala Coronel, Alex Antonio Victoria Vásquez – 7º Semestre Grupo 7US.
  * **Hallazgo Crítico:** 15 horas de labor por sombrero fino. El coyote paga $15 a $30 MXN. Si no se acepta, no hay dinero para la comida del día. Desgaste visual severo (cataratas tempranas) y deformaciones articulares en dedos.
  * **Cita Testimonial:** *“Te dicen: 'Te la tomo a 20 pesos, si no, ahí se queda'... uno se la tiene que dar porque al menos es para el kilo de tortilla.”*
* **Brigada 2 – San José Xochixtlán (Huipil Triqui):**
  * **Alumnos Investigadores:** Charlie Jared Castro Rodríguez, Dulce Maetzy Reyes Hernández, Brayan Armando Pérez González, José Manuel Hernández Paz – 5º Semestre Grupo B.
  * **Hallazgo Crítico:** Una tejedora triqui de Xochixtlán (56 años) invierte 6 a 9 meses continuos (~180 hrs) y $2,500 MXN de hilos de su bolsillo. Clientes retrasan pagos meses o regatean a $8,000 MXN.
  * **Cita Testimonial:** *“Yo termino mi trabajo y tengo que esperar semanas o meses para recibir mi dinero... quieren descontarme por cualquier detalle.”*
* **Brigada 3 – San Juan Ñumí (Miel Virgen Flor de la Mixteca):**
  * **Alumnos Investigadores:** Luis Alexis Morales & Equipo UMIZOOMI (eduScrum / Residencia TecNM).
  * **Hallazgo Crítico:** Entrevista con C. Rogelio Martínez Cruz (Presidente): Toda la producción de colmenas se anota en libretas viejas. Se requieren 3 días para transcribir listas para asambleas; hojas sueltas de cosecha se extravían; se han vendido lotes de miel dos veces a clientes por falta de inventario digital en tiempo real.
* **Brigada 4 – San Pablo Tijaltepec y Santa María Yucuhiti (Café y Bordado):**
  * **Líder Estudiantil:** Nallely López García.
  * **Hallazgo Crítico:** Una bordadora de San Pablo Tijaltepec identificó de inmediato el valor de la etiqueta QR física para coserla a su blusa bordada de venados y blindarla legalmente contra copias industriales chinas.

---

### Diapositiva 3C: Auditoría de Usabilidad UX en Adultos Mayores
* **Diagnóstico de Campo (Pruebas con una tejedora triqui y una bordadora de San Pablo Tijaltepec):**
  1. **Tecnofobia Rural:** Vacilación inicial superior a 10 segundos ante pantallas táctiles: *“¿Se va a desconfigurar el teléfono si le pico?”*.
  2. **Reflejo Solar Extremo:** Textos delgados y grises son invisibles en patios abiertos bajo el sol de la Mixteca.
  3. **Desconfianza Institucional:** Sellos con tipografía fiscal asustan a los productores.
* **La Respuesta de Ingeniería de Yucu ("Modo Abuelo"):**
  * Botones táctiles gigantes de **112px** ergonómicos para dedos con callosidad o artritis.
  * **Voz en Tu'un Savi (Mixteco)** y español comprimida a 24kbps Opus con Web Audio API (Cero teclado ni contraseñas).
  * Persistencia 100% Offline con **IndexedDB**, garantizando cero pérdida de datos en montaña.
* **Resultado Comprobado:** 100% de tareas completadas sin ayuda y adopción del código QR en 6 a 9 segundos.

---

### Diapositiva 4: La Infraestructura que le Faltaba a Stellar
* **El Eslabón Perdido del Ecosistema:** Stellar cuenta con pagos rápidos y Soroban, pero carecía de una capa descentralizada de **atestaciones de activos del mundo real (RWA)** que certifique el origen de cosechas antes de emitir tokens.
* **Los 4 Oráculos Autónomos de Yucu:**
  1. `AIVoiceOracle`: Normalización fonética y semántica de lenguas indígenas (*Tu'un Savi* / Zapoteco / Triqui).
  2. `AIQualityOracle`: Evaluación de calidad exportable SCAA (>85 pts) y autenticidad artesanal.
  3. `AIEUDRSatelliteOracle`: Geocercado Sentinel-2 para cumplimiento anti-deforestación de la Unión Europea.
  4. `TrustlessWorkEscrowAdapter`: Orquestación de custodia y pagos por hitos sobre contratos auditados de Trustless Work.

---

### Diapositiva 5: Arquitectura de Smart Contracts en Soroban
* Monorepo en Rust compilado para Soroban Protocol 22:
  * `attestation_registry.rs`: Registro de esquemas y atestaciones criptográficas inmutables.
  * `lot_passport.rs`: Pasaporte digital del lote con metadata comunitaria, fotos y geolocalización.
  * `perpetual_royalties.rs`: Regalías perpetuas del 8% a artesanas en cada reventa en el mercado secundario.
  * `TrustlessWorkEscrowAdapter.ts`: Integración formal con **Trustless Work** para liberación de fondos (30% anticipo por atestación de origen y 70% por recepción física en cooperativa).

---

### Diapositiva 6: El Modelo Centauro (IA + Validación Comunitaria)
* **Oráculo de IA + Árbitro Humano Local:** La IA evalúa fotos satelitales y audio en segundos, pero la firma final de entrega física la realiza la cooperativa municipal o el promotor del TecNM.
* **Prevención de Fraude:** Ningún agente centralizado puede alterar un registro una vez anclado el hash SHA-256 canónico en la blockchain de Stellar.

---

### Diapositiva 7: El Ancla Física: Pasaporte Digital y Hang-Tag QR
* **Etiquetas Hang-Tag ISO/IEC 18004:** Generadas como vectores SVG ligeros listos para imprimir en papel kraft resistente o tela.
* **Cero Apps Requeridas para el Comprador:** El tostador en Europa o el cliente en CDMX escanea el QR con cualquier teléfono estándar y visualiza la ficha técnica, foto del productor, audio en lengua materna y verificación en Stellar Horizon.

---

### Diapositiva 8: Web3 Invisible y Liquidación en Parcela
* **Web3 Invisible:** El campesino nunca ve llaves privadas de 24 palabras en inglés ni paga gas fees (patrocinados vía Fee-Bump SEP-0015).
* **Rampa Fiat Etherfuse:** Conversión atómica USDC -> MXNe -> Transferencias SPEI Banxico directas a tarjetas del Banco del Bienestar, Finabien y cajas populares locales.

---

### Diapositiva 9: Modelo de Negocio Sostenible B2B2C
* **Cobro a Compradores Institucionales:** Tarifas B2B a importadores y tostadurías por pasaportes de trazabilidad y certificados de cumplimiento EUDR (0% costo para el productor).
* **Sostenibilidad Comunitaria:** Cada lote financia el 2% para el fondo de Tequio Comunal y el mantenimiento del nodo estudiantil del TecNM.

---

### Diapositiva 10: Tracción en Producción: Código, Pruebas y Respaldo TecNM
* **34+ Pruebas Automatizadas en Verde (100% Pass):** Criptografía, contratos Soroban, oráculos de IA y adaptador de Trustless Work.
* **100% Código Abierto con Licencia MIT:** Repositorio público activo en [github.com/Open-Hub-Tec/yucu](https://github.com/Open-Hub-Tec/yucu).
* **Respaldo Institucional del TecNM:** La red universitaria más grande de México (más de 600,000 estudiantes e ingenieros).

---

### Diapositiva 10B: El Equipo Humano: Talento Indígena e Ingeniería TecNM
* **Asesoría y Coordinación:**
  * Ing. José Alfredo Román Cruz (Asesor Principal y Coordinador Open Hub TecNM).
  * Nallely López García (Líder Estudiantil del Proyecto y Residencia Profesional).
* **Brigadas de Campo e Investigación:**
  * **Palma (San Juan Mixtepec):** Jazlynn Barrios Velasco, Isaías Brayan López Domínguez, Rafael Ayala Coronel, Alex Antonio Victoria Vásquez – 7º Semestre.
  * **Textil Triqui (San José Xochixtlán):** Charlie Jared Castro Rodríguez, Dulce Maetzy Reyes Hernández, Brayan Armando Pérez González, José Manuel Hernández Paz – 5º Semestre.
  * **Miel Virgen (San Juan Ñumí):** Luis Alexis Morales & Equipo UMIZOOMI (eduScrum).
  * **Mezcal Artesanal (Yavi Tech):** Lewis Noé Hernández Mendoza, Nelson Macario Martínez Hernández, Luis Ángel García Santiago – 5º Semestre.

---

### Diapositiva 11: Propuesta Estratégica para Drips y Stellar
* **Fondos de Investigación y Residencia Estudiantil:** Los fondos de Drips Wave y Stellar Community Fund (SCF) se dispersan directamente a los estudiantes investigadores mediante el sistema de splits de `drips.config.json`.
* **Impacto Comprobado:** Construcción de infraestructura de software libre con identidad comunitaria desde la Mixteca Oaxaqueña para el mundo.
