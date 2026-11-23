// Audio Recording and Speech-to-Text Utility for Yucu
// Supports MediaRecorder, Web Speech API (webkitSpeechRecognition) and transcription through the AI port (#154)
import { assistant } from '../core/ai';

export interface AudioRecordingResult {
  audioBlob: Blob;
  audioUrl: string;
  base64Audio: string;
  transcript: string;
  /** Mensaje para la persona si la transcripción falló o no se entendió. */
  transcriptError?: string;
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

/**
 * Check browser support for audio capture and speech recognition
 */
export async function getMicrophoneCapabilities() {
  const hasGetUserMedia = Boolean(
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );

  const SpeechRecognitionClass =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  const hasSpeechRecognition = Boolean(SpeechRecognitionClass);

  let permissionState: 'granted' | 'denied' | 'prompt' | 'unknown' = 'unknown';

  if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
    try {
      const status = await navigator.permissions.query({ name: 'microphone' as any });
      permissionState = status.state as any;
    } catch {
      permissionState = 'unknown';
    }
  }

  return {
    hasGetUserMedia,
    hasSpeechRecognition,
    permissionState,
  };
}

/**
 * Convert Blob to Base64 string
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Start live recording with audio stream, volume meter and optional speech recognition
 */
export async function startAudioRecording(
  options: StartRecordingOptions = {}
): Promise<LiveRecorderSession> {
  const { onVolumeChange, onInterimTranscript, lang = 'es-MX' } = options;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Tu navegador no permite acceso al micrófono o la conexión no es segura (HTTPS).');
  }

  // 1. Request microphone access with enhancement flags
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  const startTime = Date.now();
  const audioChunks: Blob[] = [];

  // Determine supported mime type across Chrome, Firefox, Safari iOS
  let selectedMimeType = '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/wav',
  ];

  if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
    for (const cand of candidates) {
      if (MediaRecorder.isTypeSupported(cand)) {
        selectedMimeType = cand;
        break;
      }
    }
  }

  const recorderOptions: MediaRecorderOptions = selectedMimeType ? { mimeType: selectedMimeType } : {};
  const mediaRecorder = new MediaRecorder(stream, recorderOptions);
  const actualMimeType = mediaRecorder.mimeType || selectedMimeType || 'audio/webm';

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  // 2. AudioContext volume visualizer
  let audioContext: AudioContext | null = null;
  let animFrameId: number | null = null;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }
      const sourceNode = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
      sourceNode.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume().catch(() => {});
        }
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Perceptually scaled volume level (0 to 100)
        const volumeLevel = Math.min(100, Math.round((average / 60) * 100));
        if (onVolumeChange) {
          onVolumeChange(volumeLevel);
        }
        animFrameId = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    }
  } catch (err) {
    console.warn('AudioContext no disponible para visualizador de volumen:', err);
  }

  // 3. Web Speech Recognition (client-side real-time transcription)
  let speechTranscript = '';
  let recognitionInstance: any = null;

  try {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      recognitionInstance = new SpeechRecognitionClass();
      recognitionInstance.lang = lang;
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = (final + ' ' + interim).trim();
        speechTranscript = (final || interim).trim();

        if (onInterimTranscript && currentText) {
          onInterimTranscript(currentText);
        }
      };

      recognitionInstance.onerror = (e: any) => {
        console.warn('SpeechRecognition warning:', e?.error);
      };

      try {
        recognitionInstance.start();
      } catch (startErr) {
        console.warn('No se pudo iniciar SpeechRecognition:', startErr);
      }
    }
  } catch (e) {
    console.warn('SpeechRecognition no disponible:', e);
  }

  // Start recording with 250ms timeslices for stream stability
  mediaRecorder.start(250);

  // Controller
  return {
    stop: (): Promise<AudioRecordingResult> => {
      return new Promise((resolve) => {
        const cleanup = () => {
          if (animFrameId) cancelAnimationFrame(animFrameId);
          if (audioContext && audioContext.state !== 'closed') {
            audioContext.close().catch(() => {});
          }
          if (recognitionInstance) {
            try {
              recognitionInstance.stop();
            } catch {}
          }
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.onstop = async () => {
          cleanup();
          const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
          const audioBlob = new Blob(audioChunks, { type: actualMimeType });
          const audioUrl = URL.createObjectURL(audioBlob);
          const base64Audio = await blobToBase64(audioBlob);

          let finalTranscript = speechTranscript;

          let transcriptError: string | undefined;

          // Si el navegador no captó texto, se transcribe a través del puerto de IA (#154).
          // Si falla o no entendió, se guarda el mensaje honesto; nunca se inventa el texto.
          if (!finalTranscript.trim() && base64Audio && base64Audio.length > 100) {
            const result = await assistant.transcribe(base64Audio, actualMimeType);
            if (result.ok) finalTranscript = result.transcript;
            else transcriptError = result.error;
          }

          resolve({
            audioBlob,
            audioUrl,
            base64Audio,
            transcript: finalTranscript,
            transcriptError,
            durationSeconds,
          });
        };

        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        } else {
          cleanup();
          resolve({
            audioBlob: new Blob(),
            audioUrl: '',
            base64Audio: '',
            transcript: speechTranscript,
            durationSeconds: 0,
          });
        }
      });
    },
    cancel: () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
      if (recognitionInstance) {
        try {
          recognitionInstance.abort();
        } catch {}
      }
      stream.getTracks().forEach((track) => track.stop());
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    },
  };
}
