
// Audio Recording and Speech-to-Text Utility for Yucu
// Grabación local y transcripción con consentimiento explícito.

import {
  puedeEnviarAIA,
  type ConsentimientoIA,
} from './consentimientoIA';

export interface AudioRecordingResult {
  audioBlob: Blob;
  audioUrl: string;
  base64Audio: string;
  transcript: string;
  durationSeconds: number;
}

export interface StartRecordingOptions {
  onVolumeChange?: (volume: number) => void;
  onInterimTranscript?: (text: string) => void;
  lang?: string;
}

export interface LiveRecorderSession {
  stop: () => Promise<AudioRecordingResult>;
  cancel: () => void;
}

type SpeechRecognitionResultEvent = {
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionErrorEvent = {
  error: string;
  message?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type WindowWithSpeechRecognition = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type WindowWithAudioContext = Window & {
  webkitAudioContext?: typeof AudioContext;
};

/**
 * Comprueba las capacidades del micrófono.
 */
export async function getMicrophoneCapabilities() {
  const hasGetUserMedia = Boolean(
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices?.getUserMedia
  );

  const browserWindow =
    typeof window !== 'undefined'
      ? (window as WindowWithSpeechRecognition)
      : null;

  const SpeechRecognitionClass =
    browserWindow?.SpeechRecognition ||
    browserWindow?.webkitSpeechRecognition ||
    null;

  let permissionState:
    | 'granted'
    | 'denied'
    | 'prompt'
    | 'unknown' = 'unknown';

  if (
    typeof navigator !== 'undefined' &&
    navigator.permissions?.query
  ) {
    try {
      const status = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      });

      permissionState = status.state as
        | 'granted'
        | 'denied'
        | 'prompt';
    } catch {
      permissionState = 'unknown';
    }
  }

  return {
    hasGetUserMedia,
    hasSpeechRecognition: Boolean(SpeechRecognitionClass),
    permissionState,
  };
}

/**
 * Convierte un Blob a Base64.
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('No se pudo convertir el audio.'));
        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error('Error leyendo el audio grabado.'));
    };

    reader.readAsDataURL(blob);
  });
}

/**
 * Transcripción mediante Gemini.
 * Solo permite enviar audio con consentimiento explícito.
 */
export async function transcribeAudioWithAI(
  audioBase64: string,
  mimeType: string,
  consentimiento: ConsentimientoIA
): Promise<string | null> {
  if (!puedeEnviarAIA(consentimiento, 'audio')) {
    return null;
  }

  if (!audioBase64 || audioBase64.length < 100) {
    throw new Error('No hay audio válido para transcribir.');
  }

  const response = await fetch('/api/transcribe-audio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audioBase64,
      mimeType: mimeType || 'audio/webm',
    }),
  });

  if (!response.ok) {
    throw new Error('El servidor no pudo procesar la transcripción.');
  }

  const data = await response.json();

  return typeof data.transcript === 'string'
    ? data.transcript.trim()
    : '';
}

/**
 * Inicia una grabación local.
 *
 * No envía audio a Gemini.
 * No realiza peticiones HTTP.
 */
export async function startAudioRecording(
  options: StartRecordingOptions = {}
): Promise<LiveRecorderSession> {
  const {
    onVolumeChange,
    onInterimTranscript,
    lang = 'es-MX',
  } = options;

  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    throw new Error(
      'Tu navegador no permite acceder al micrófono. Verifica que uses HTTPS.'
    );
  }

  if (typeof MediaRecorder === 'undefined') {
    throw new Error(
      'Tu navegador no es compatible con la grabación de audio.'
    );
  }

  // 1. Solicitar acceso al micrófono.
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  const startTime = Date.now();
  const audioChunks: Blob[] = [];

  // 2. Detectar formato compatible.
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/wav',
  ];

  let selectedMimeType = '';

  if (typeof MediaRecorder.isTypeSupported === 'function') {
    for (const candidate of candidates) {
      if (MediaRecorder.isTypeSupported(candidate)) {
        selectedMimeType = candidate;
        break;
      }
    }
  }

  let mediaRecorder: MediaRecorder;

  try {
    const recorderOptions: MediaRecorderOptions =
      selectedMimeType
        ? { mimeType: selectedMimeType }
        : {};

    mediaRecorder = new MediaRecorder(
      stream,
      recorderOptions
    );
  } catch (error) {
    stream.getTracks().forEach((track) => track.stop());
    throw error;
  }

  const actualMimeType =
    mediaRecorder.mimeType ||
    selectedMimeType ||
    'audio/webm';

  mediaRecorder.ondataavailable = (event: BlobEvent) => {
    if (event.data && event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  // 3. Visualizador de volumen.
  let audioContext: AudioContext | null = null;
  let animFrameId: number | null = null;

  try {
    const audioWindow = window as WindowWithAudioContext;

    const AudioContextClass =
      window.AudioContext ||
      audioWindow.webkitAudioContext;

    if (AudioContextClass) {
      audioContext = new AudioContextClass();

      if (audioContext.state === 'suspended') {
        await audioContext.resume().catch(() => {});
      }

      const sourceNode =
        audioContext.createMediaStreamSource(stream);

      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;

      sourceNode.connect(analyser);

      const dataArray = new Uint8Array(
        analyser.frequencyBinCount
      );

      const checkVolume = () => {
        if (
          !audioContext ||
          audioContext.state === 'closed'
        ) {
          return;
        }

        analyser.getByteFrequencyData(dataArray);

        let sum = 0;

        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }

        const average = sum / dataArray.length;

        const volumeLevel = Math.min(
          100,
          Math.round((average / 60) * 100)
        );

        onVolumeChange?.(volumeLevel);

        animFrameId = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    }
  } catch (error) {
    console.warn(
      'AudioContext no disponible:',
      error
    );
  }

  // 4. Reconocimiento de voz.
  let speechTranscript = '';
  let interimTranscript = '';
  let recognitionInstance: SpeechRecognitionLike | null = null;

  try {
    const speechWindow =
      window as WindowWithSpeechRecognition;

    const SpeechRecognitionClass =
      speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      recognitionInstance = new SpeechRecognitionClass();

      recognitionInstance.lang = lang;
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onresult = (event) => {
        let finalText = '';
        let interimText = '';

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];

          if (result.isFinal) {
            finalText += result[0].transcript + ' ';
          } else {
            interimText += result[0].transcript + ' ';
          }
        }

        if (finalText.trim()) {
          speechTranscript = finalText.trim();
        }

        interimTranscript = interimText.trim();

        const currentText = [
          speechTranscript,
          interimTranscript,
        ]
          .filter(Boolean)
          .join(' ')
          .trim();

        if (currentText) {
          onInterimTranscript?.(currentText);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.warn(
          'SpeechRecognition warning:',
          event.error
        );
      };

      try {
        recognitionInstance.start();
      } catch (error) {
        console.warn(
          'No se pudo iniciar SpeechRecognition:',
          error
        );
      }
    }
  } catch (error) {
    console.warn(
      'SpeechRecognition no disponible:',
      error
    );
  }

  // 5. Iniciar grabación.
  try {
    mediaRecorder.start(250);
  } catch (error) {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
    }

    try {
      recognitionInstance?.abort();
    } catch {}

    audioContext?.close().catch(() => {});

    stream.getTracks().forEach((track) => track.stop());

    throw error;
  }

  let finished = false;

  // 6. Liberar recursos.
  const cleanup = () => {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }

    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch(() => {});
      audioContext = null;
    }

    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch {}
    }

    stream.getTracks().forEach((track) => track.stop());

    onVolumeChange?.(0);
  };

  // 7. Devolver controles.
  return {
    stop: (): Promise<AudioRecordingResult> => {
      return new Promise((resolve, reject) => {
        if (finished) {
          reject(
            new Error('La grabación ya terminó.')
          );
          return;
        }

        finished = true;

        mediaRecorder.onerror = () => {
          cleanup();

          reject(
            new Error('Error durante la grabación.')
          );
        };

        mediaRecorder.onstop = async () => {
          cleanup();

          try {
            const durationSeconds = Math.max(
              1,
              Math.round(
                (Date.now() - startTime) / 1000
              )
            );

            const audioBlob = new Blob(audioChunks, {
              type: actualMimeType,
            });

            const audioUrl = URL.createObjectURL(audioBlob);

            const base64Audio =
              await blobToBase64(audioBlob);

            const transcript = [
              speechTranscript,
              interimTranscript,
            ]
              .filter(Boolean)
              .join(' ')
              .trim();

            // No se llama a Gemini aquí.
            // El envío requiere consentimiento explícito.

            resolve({
              audioBlob,
              audioUrl,
              base64Audio,
              transcript,
              durationSeconds,
            });
          } catch (error) {
            reject(error);
          }
        };

        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        } else {
          cleanup();

          resolve({
            audioBlob: new Blob([], {
              type: actualMimeType,
            }),
            audioUrl: '',
            base64Audio: '',
            transcript: speechTranscript || interimTranscript,
            durationSeconds: 0,
          });
        }
      });
    },

    cancel: () => {
      if (finished) return;

      finished = true;

      cleanup();

      mediaRecorder.ondataavailable = null;
      mediaRecorder.onstop = null;
      mediaRecorder.onerror = null;

      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }

      // Cancelar nunca envía información a la IA.
    },
  };
}
