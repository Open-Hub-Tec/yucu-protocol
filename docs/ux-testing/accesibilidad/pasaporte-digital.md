# Pasaporte digital del lote MX-2024-884

El 24 de noviembre de 2026 revisé la vista de comprador en español, con letra Normal, del lote «Frijol Negro Criollo & Maíz Azul». Usé Chrome Headless 158.0.8127.0 con un teléfono emulado de 412 × 823 píxeles CSS y densidad 1,75. Abrí el enlace directo y esperé a que cargaran Plus Jakarta Sans y Material Symbols. [Abrir el pasaporte de ejemplo](https://yucu-protocol.vercel.app/?cert=lot-884)

## Lighthouse móvil

**88/100** en accesibilidad con Lighthouse 13.6.0, en modo instantánea sobre el pasaporte abierto. El navegador recibió los recursos públicos del sitio a través de un intermediario de red. La prueba cubre esta pantalla y este tamaño.

| Comprobación fallida | Elemento | Qué ocurre | WCAG 2.2 |
| --- | --- | --- | --- |
| color-contrast | Mi Cosecha (Productor) | El gris sobre el fondo claro da 3,85:1. El texto de 13 px necesita 4,5:1. | 1.4.3 Contraste mínimo |
| color-contrast | Pactar por WhatsApp | El texto blanco sobre verde da 1,98:1. El texto de 15 px necesita 4,5:1. | 1.4.3 Contraste mínimo |
| label-content-name-mismatch | Español, Normal y Chat en la navegación inferior | Los nombres accesibles omiten la etiqueta visible. Por ejemplo, Chat se anuncia como «Compañero TecNM». Una orden de voz que diga «Chat» puede no encontrar el botón. | 2.5.3 Etiqueta en el nombre |
| meta-viewport | meta[name="viewport"] | maximum-scale=1.0 y user-scalable=no restringen el gesto de ampliación en navegadores que respetan esos valores. | 1.4.4 Cambio de tamaño del texto |

## Comprobaciones directas

| Prueba | Resultado | Evidencia |
| --- | --- | --- |
| Texto al 200 % | No pasa | Al duplicar los tamaños de fuente calculados, el documento pasó a ocupar 790 px en una vista de 412 px. El icono de volver necesitaba 44 px dentro de un botón de 40 px. |
| Contraste | No pasa | Blanco (#ffffff) sobre el verde de WhatsApp (#25d366) da 1,98:1. El gris de Mi Cosecha (#727973) sobre #f0eee8 da 3,85:1. |
| Botones de 56 × 56 px | No pasa | Ver Modelo de Consentimiento mide aproximadamente 189 × 33 px y el botón de compra 346 × 48 px. Escuchar sí alcanza 148 × 56 px. El umbral de 56 px es el objetivo de diseño de Yucu. |
| Tab y foco | Pasa | Sin activar controles, Tab recorrió los 16 botones y el enlace de WhatsApp antes de volver al documento. Cada control enfocado tenía un contorno automático de 1 o 3 px. |

## Tres cambios prioritarios

1. Permitir la ampliación y ajustar el encabezado y la navegación al 200 %. Quien depende del texto grande necesita leer y recorrer toda la ficha sin perder controles.
2. Aumentar el contraste del enlace de WhatsApp y del selector Mi Cosecha. Son acciones difíciles de distinguir antes incluso de tocar la pantalla, especialmente al aire libre.
3. Ampliar las áreas táctiles de consentimiento y compra hasta al menos 56 × 56 px. La ficha ofrece varias acciones contiguas y la altura actual deja poco margen para pulsar la correcta.
