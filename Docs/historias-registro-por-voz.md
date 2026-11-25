# User Stories: Registering a Batch by Voice or Text

These stories describe how a producer registers a batch (lote) by talking to the Yucu chat or by typing, from the first word to the signature on the phone.

**Who are the users?** Artisans and producers of the Mixteca. Many are older adults with little digital experience. Some cannot see small text in the sun. They use WhatsApp voice notes, but not forms (`FRONTEND.md`, intro). The stories below are written for them: short steps, big buttons, no technical words.

**Sources.** Each story says which source backs it:

- `ADR-007`: `docs/adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md` (status: accepted on 29 October 2026, to be built on testnet)
- `FRONTEND.md`: `docs/arquitectura/FRONTEND.md`
- `ChatScreen.tsx`: `src/components/ChatScreen.tsx`

**Status of each story.**

| Label | Meaning |
|---|---|
| **Built** | The behavior exists today in `ChatScreen.tsx`. |
| **Partly built** | Part of it exists in `ChatScreen.tsx`; the rest is **Future**. |
| **Future** | Described in `ADR-007` or `FRONTEND.md` but not built yet. |

> **Note.** Registering a batch by voice is not working end to end today. `FRONTEND.md` (section 10) says "the voice does not register". The registration-by-voice flow is planned in issue #155 and the manifest-driven extractor in `ADR-007` (D1, D2).

---

## US-01: Register a batch by speaking

**Status:** Partly built. Recording and live transcript exist in `ChatScreen.tsx`; turning the words into a batch is **Future** (`ADR-007` D2, #155).

**Story.** As a producer, I want to say what I have ("I have 20 kilos of coffee") in a voice note, so that I can register my batch without filling in a form.

**Acceptance criteria**

1. **Given** I am in the chat, **when** I tap the microphone button, **then** the app starts recording and shows a timer, a volume bar and a Cancel button. *(Built, `ChatScreen.tsx`)*
2. **Given** I am recording, **when** I tap the button again to send, **then** my voice note appears in the chat with its transcription. *(Built, `ChatScreen.tsx`)*
3. **Given** my voice note was transcribed, **when** the app reads it, **then** it fills in only the fields of the schema manifest and leaves empty the ones I did not say clearly. *(Future, `ADR-007` D2)*

---

## US-02: Register a batch by typing

**Status:** Partly built. The text box exists; the batch extraction is **Future** (`ADR-007` D2, #155).

**Story.** As a producer, I want to type what I have instead of speaking, so that I can register my batch when I cannot or do not want to use my voice.

**Acceptance criteria**

1. **Given** I am in the chat, **when** I look at the bottom of the screen, **then** I see a text box next to the microphone button, so I can always choose voice or text. *(Built, `ChatScreen.tsx`; rule "voice or text, always" in `FRONTEND.md` section 2)*
2. **Given** I typed my message, **when** I send it, **then** it goes through the same steps as a voice note: the app prepares a draft with only the manifest fields, and then asks me to confirm. *(Future, `ADR-007` D2)*

---

## US-03: Hear what the app understood and say Yes or No

**Status:** Future (`ADR-007` D2; `FRONTEND.md` sections 2 and 3).

**Story.** As a producer, I want the app to read aloud what it understood before anything is saved, so that I can check it is right without reading small text.

**Acceptance criteria**

1. **Given** the app prepared a draft from my voice or text, **when** it is ready, **then** it reads the confirmation text of the manifest aloud (for example: "I understood: coffee, 20 kg, from Tlaxiaco. Is it correct?"). *(`ADR-007` D1, D2)*
2. **Given** the app read the draft, **when** I look at the screen, **then** I see big Yes and No buttons. *(`ADR-007` D2)*
3. **Given** I did not answer Yes, **when** time passes, **then** nothing is signed or sent. *(`FRONTEND.md` section 3: "asking is not doing")*

---

## US-04: Fix one wrong field

**Status:** Future (`ADR-007` D2).

**Story.** As a producer, I want to fix a single wrong detail with my voice or my finger, so that I do not have to start the whole registration again.

**Acceptance criteria**

1. **Given** the app read a wrong value (for example, the wrong amount), **when** I say No, **then** I can correct that field by voice or by touch. *(`ADR-007` D2)*
2. **Given** I corrected a field, **when** the draft is updated, **then** the app reads the confirmation again before I sign. *(`ADR-007` D2; `FRONTEND.md` section 3)*

---

## US-05: Sign on my own phone, not the AI

**Status:** Future (`ADR-007` D2, D3; `FRONTEND.md` sections 2 and 10, #97).

**Story.** As a producer, I want to confirm with my own PIN on my own phone, so that I know that only I can make a statement in my name and the AI cannot.

**Acceptance criteria**

1. **Given** I said Yes to the confirmation, **when** it is time to sign, **then** the app opens the accessible signing screen, and the signature is never done from a chat bubble. *(`FRONTEND.md` section 2, #97)*
2. **Given** I am on the signing screen, **when** I read it, **then** it says "Confirm with your PIN" and it does not use words like wallet, hash or transaction. *(`FRONTEND.md` section 6)*
3. **Given** the AI prepared something that I did not sign, **when** I see it in the app, **then** it is shown as a suggestion and not as a fact. *(`ADR-007` D3)*

---

## US-06: Start and stop recording in the way that is easy for me

**Status:** Partly built. Tap to start and tap to stop exist; press-and-hold is **Future** (`FRONTEND.md` sections 1 and 5).

**Story.** As a producer who is used to WhatsApp, I want to record by tapping once or by holding the button, so that I do not get lost if I press the wrong way.

**Acceptance criteria**

1. **Given** I am not recording, **when** I tap the microphone once, **then** recording starts, and when I tap it again it stops and sends. *(Built, `ChatScreen.tsx`)*
2. **Given** I am not recording, **when** I hold the microphone button and then let go, **then** the recording is sent. *(Future, `FRONTEND.md` sections 1 and 5)*
3. **Given** I am recording, **when** I change my mind, **then** I can tap Cancel and nothing is sent. *(Built, `ChatScreen.tsx`)*

---

## US-07: Listen to the app's messages

**Status:** Partly built. A "Listen" button exists in the chat; confirmations that read themselves are **Future** (`FRONTEND.md` sections 2 and 5; `ADR-007` D2).

**Story.** As an older producer with poor eyesight, I want the app to read its messages aloud, so that I can understand each step without reading.

**Acceptance criteria**

1. **Given** a message from the app, **when** I tap "Escuchar" (Listen), **then** the app reads it aloud, and I can tap the same button to stop it. *(Built, `ChatScreen.tsx`)*
2. **Given** the app asks me to confirm something, **when** the message appears, **then** it is read aloud by itself, without me tapping Listen. *(Future, `FRONTEND.md` section 2)*

---

## US-08 (error case): The microphone does not work

**Status:** Built (`ChatScreen.tsx`); wording follows `FRONTEND.md` as **Future**.

**Story.** As a producer, I want a clear message when the microphone is blocked, so that I know I can type instead.

**Acceptance criteria**

1. **Given** the browser cannot use the microphone (no permission or no device), **when** I tap the microphone button, **then** the app shows a message that says it could not access the microphone and that I can check the permissions or write my message below. *(Built, `ChatScreen.tsx`)*
2. **Given** I see that message, **when** I want to continue, **then** I can close it and use the text box. *(Built, `ChatScreen.tsx`)*

---

## US-09 (error case): There is no signal

**Status:** Future (`FRONTEND.md` sections 3 and 7). `ChatScreen.tsx` has no offline handling today.

**Story.** As a producer in a community with weak or no signal, I want the app to tell me what I can still do, so that I do not think I broke something.

**Acceptance criteria**

1. **Given** I have no signal, **when** I use the chat, **then** the app says: "No signal. You can use the menu or try again when there is signal." *(`FRONTEND.md` section 3)*
2. **Given** I have no signal, **when** I want to register a batch, **then** I can still use the menu and save a draft on my phone, and the app says "Saved on your phone". *(`FRONTEND.md` section 7)*
3. **Given** I saved a draft without signal, **when** I want to prepare and send it, **then** the app tells me that this needs signal and that it "will be sent when there is signal". *(`FRONTEND.md` sections 6 and 7)*
4. **Given** I recorded a voice note without signal, **when** it is transcribed, **then** the audio is deleted from my phone. *(`FRONTEND.md` section 5; `ADR-006` D5, referenced by `ADR-007` D2)*

---

## US-10 (error case): The AI did not understand me

**Status:** Future (`FRONTEND.md` section 5; `ADR-007` D2).

**Story.** As a producer, I want the app to say honestly when it did not understand me, so that it never registers something I did not say.

**Acceptance criteria**

1. **Given** the transcription failed or was unclear, **when** the app answers, **then** it says: "I did not hear you well. Do we try again, or do you write it?" and it does not show an invented text. *(`FRONTEND.md` section 5)*
2. **Given** I said something that is not clear for a field, **when** the draft is prepared, **then** that field stays empty and the app asks for it; it never guesses. *(`ADR-007` D2)*
3. **Given** I say something that is forbidden for the schema (for example, my name in a batch record), **when** the draft is prepared, **then** the app discards it. *(`ADR-007` D1, D2; `FRONTEND.md` section 3)*

> **Known gap today.** In `ChatScreen.tsx`, when a voice note comes back without a transcript, the app uses a default sentence instead of telling the person it did not understand. This is the opposite of criterion 1. It is not part of this issue, but a contributor who works on #155 should know about it.

---

## Source map

| Story | `ADR-007` | `FRONTEND.md` | `ChatScreen.tsx` |
|---|---|---|---|
| US-01 | D1, D2 | sections 1, 2 | recording, timer, transcription |
| US-02 | D2 | section 2 | text box |
| US-03 | D1, D2 | sections 2, 3 | not built |
| US-04 | D2 | section 3 | not built |
| US-05 | D2, D3 | sections 2, 6, 10 | not built |
| US-06 | | sections 1, 5 | tap to start/stop, Cancel |
| US-07 | D2 | sections 2, 5 | "Escuchar" button |
| US-08 | | section 5 | microphone error message |
| US-09 | | sections 3, 5, 7 | no offline handling |
| US-10 | D1, D2 | sections 3, 5 | default sentence (gap) |

## Not covered

- **Payment failures.** The sources describe voice registration and signing, not payments, so no payment story is written here (payments are in `ADR-004` and `FRONTEND.md`, functions `recibir_pago` and `cobrar_*`).
- **Mixteco.** Voice in Mixteco is "under evaluation" (#158). No story promises it (`ADR-007` D8; `FRONTEND.md` section 5).
