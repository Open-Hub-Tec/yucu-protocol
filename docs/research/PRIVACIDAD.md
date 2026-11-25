# 🔒 Privacidad de las personas entrevistadas

> **English summary.**
>
> **Purpose:**  
> This document protects the privacy of artisans, producers and speakers who take part in field research for the Yucu Protocol. The repository is public. Everything uploaded can be read, copied and archived by anyone, and it remains in the git history even after deletion. People who give their time never agreed to appear on the internet just because they talked to the team.
>
> **Main rules:**  
> 1. Written consent is required before publishing any name, voice or image. A verbal permission to record is not enough. The signed consent must clearly say the person accepts publication on the internet.  
> 2. People are described only by role and community (for example “rebozo artisan, Amoltepec” or “tomato producer, San Antonio Nduaxico”). Never use personal names, and never put names in file or branch names.  
> 3. If someone asks not to be identified, their age and any other detail that could identify them when combined with community and occupation must also be omitted.  
> 4. Evidence (audio, video, photos of people, signed forms, PDFs) must stay in the private folder `.investigacion_privada/` (listed in `.gitignore`) or in the team’s shared folder. The public repository only receives Markdown summaries that contain no personal data.  
> 5. Student or participant control numbers, CURP, phone numbers and addresses must never appear in public documents. Credit to a student is given only with their name or GitHub username.  
> 6. GitHub attachments (files dragged into issues or pull requests) are forbidden because they create permanent public links that cannot be removed from the repository.
>
> **Where it applies:**  
> These rules apply to every contribution that touches field research material, especially files under `docs/research/`, `docs/ux-testing/` and `public/videos/`. Continuous Integration automatically rejects pull requests that add audio, video, images or PDFs in those locations. Before opening a pull request, contributors must check that the document contains no names of interviewed people, no media files with personal data, no control numbers or contact details, and that written consent exists for any personal data that is published.  
> If something is published by mistake, repository maintainers must be notified at once. Simply deleting the file in a new commit is not enough, because it remains in the history. True removal requires rewriting history with `git filter-repo` and coordinating with the whole team so everyone re-clones the repository.

Este repositorio es **público**: todo lo que se sube aquí lo puede leer, copiar y archivar cualquier persona, y queda en el historial de git aunque después se borre. Las artesanas, productores y hablantes que nos dan su tiempo no aceptaron aparecer en internet por el solo hecho de conversar con nosotros.



## Reglas

1. **Consentimiento por escrito antes de publicar nombre, voz o imagen.** Sin un consentimiento firmado que diga explícitamente "acepto que se publique en internet", no se publica. Un permiso verbal para grabar **no** es permiso para publicar.
2. **Se publica por rol y comunidad, nunca por nombre.** Escribe *"artesana de rebozo, Amoltepec"* o *"productor de jitomate, San Antonio Nduaxico"*, no *"Doña Rosa"*. Tampoco pongas nombre en los nombres de archivo ni de rama.
3. **Si alguien pide no ser identificada, tampoco se publica su edad** ni ningún dato que, junto con la comunidad y el oficio, permita reconocerla.
4. **Las evidencias van en la carpeta privada.** Audios, videos, fotos de personas, fichas firmadas y PDF de entrega se guardan en `.investigacion_privada/` (está en `.gitignore`) o en la carpeta compartida del equipo. En el repo solo va el resumen en Markdown, ya sin datos personales.
5. **Nada de números de control, CURP, teléfonos ni direcciones** de estudiantes o participantes en documentos públicos. Para dar crédito a un estudiante basta su nombre o su usuario de GitHub.
6. **Tampoco uses adjuntos de GitHub** (arrastrar un archivo a una issue o PR): generan un enlace público `github.com/user-attachments/...` que no se puede borrar desde el repo.

## Antes de abrir tu PR

- [ ] Mi documento no tiene nombres de personas entrevistadas, solo rol y comunidad.
- [ ] No subí audio, video, fotos de personas ni PDF con datos personales.
- [ ] No hay números de control ni datos de contacto.
- [ ] Tengo el consentimiento por escrito de cualquier dato personal que sí publico.

El CI rechaza automáticamente los PR que agregan audio, video, imágenes o PDF dentro de `docs/research/`, `docs/ux-testing/` o `public/videos/`.

## ¿Ya se publicó algo por error?

Avisa de inmediato a los responsables del repositorio. Quitar el archivo en un commit nuevo **no basta**: sigue en el historial. Para borrarlo de verdad hay que reescribir el historial (`git filter-repo`) y coordinarlo con todo el equipo, porque cada quien debe volver a clonar el repositorio.
