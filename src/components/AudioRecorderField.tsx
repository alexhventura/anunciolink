import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2 } from "lucide-react";
import type { AudioRecorderError } from "../types/ad";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import {
  MAX_AUDIO_DURATION_MS,
  blobToDataUrl,
  getPreferredAudioMime,
  isAudioRecordingSupported,
  mapRecordingError,
  validateRecordedAudio,
} from "../lib/audioRecorder";
import { FieldLabelWithHint } from "./HelpTooltip";

interface AudioRecorderFieldProps {
  audioDataUrl: string;
  onAudioChange: (dataUrl: string) => void;
  onError: (error: AudioRecorderError | null) => void;
}

type RecordState = "idle" | "recording" | "processing";

export function AudioRecorderField({ audioDataUrl, onAudioChange, onError }: AudioRecorderFieldProps) {
  const [state, setState] = useState<RecordState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const supported = isAudioRecordingSupported();

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanupStream(), [cleanupStream]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  const startRecording = async () => {
    if (!supported) {
      onError({
        code: "NOT_SUPPORTED",
        message: "Gravação de áudio não disponível neste navegador.",
      });
      return;
    }

    onError(null);
    chunksRef.current = [];
    setElapsed(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      });
      streamRef.current = stream;

      const mimeType = getPreferredAudioMime();
      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 12_000,
      });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        cleanupStream();
        setState("processing");
        try {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const validation = validateRecordedAudio(blob);
          if (validation) {
            onError(validation);
            setState("idle");
            return;
          }
          const dataUrl = await blobToDataUrl(blob);
          onAudioChange(dataUrl);
          onError(null);
        } catch (err) {
          onError(mapRecordingError(err));
        } finally {
          setState("idle");
          setElapsed(0);
        }
      };

      recorder.onerror = () => {
        onError({ code: "RECORD_FAILED", message: "Erro durante a gravação. Tente novamente." });
        cleanupStream();
        setState("idle");
      };

      recorder.start(250);
      setState("recording");

      const startedAt = Date.now();
      timerRef.current = window.setInterval(() => {
        const ms = Date.now() - startedAt;
        setElapsed(Math.min(ms, MAX_AUDIO_DURATION_MS));
        if (ms >= MAX_AUDIO_DURATION_MS) stopRecording();
      }, 100);
    } catch (err) {
      cleanupStream();
      setState("idle");
      onError(mapRecordingError(err));
    }
  };

  const handleRemove = () => {
    onAudioChange("");
    onError(null);
  };

  const progress = Math.round((elapsed / MAX_AUDIO_DURATION_MS) * 100);

  return (
    <div className="space-y-3">
      <FieldLabelWithHint hint={TOOLTIP_COPY.audio}>
        Áudio do produto (opcional)
      </FieldLabelWithHint>

      {!supported && (
        <p className="text-xs font-medium text-zinc-500">
          Gravação disponível em navegadores modernos com microfone.
        </p>
      )}

      {audioDataUrl ? (
        <div className="rounded-lg border-2 border-zinc-900 bg-white p-4 shadow-[3px_3px_0_0_#18181b] space-y-3">
          <audio src={audioDataUrl} controls className="ad-audio-native w-full" preload="metadata" />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              id="btn-re-record-audio"
              onClick={() => void startRecording()}
              disabled={state !== "idle"}
              className="btn-accent !min-h-[44px] !text-xs !px-4"
            >
              <Mic className="h-4 w-4 shrink-0" aria-hidden="true" />
              Gravar de novo
            </button>
            <button
              type="button"
              id="btn-remove-audio"
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-zinc-900 bg-white px-3 py-2 text-xs font-bold uppercase shadow-[2px_2px_0_0_#18181b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#18181b] transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Remover
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-zinc-900 bg-amber-50 p-5 text-center shadow-[3px_3px_0_0_#18181b]">
          {state === "recording" ? (
            <div className="space-y-3">
              <p className="text-sm font-bold text-black">Gravando… {Math.ceil((MAX_AUDIO_DURATION_MS - elapsed) / 1000)}s</p>
              <div className="h-2 rounded-full bg-white border-2 border-black overflow-hidden">
                <div
                  className="h-full bg-lime-400 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <button
                type="button"
                id="btn-stop-audio"
                onClick={stopRecording}
                className="btn-accent !min-h-[48px] !text-sm mx-auto"
              >
                <Square className="h-4 w-4 fill-current shrink-0" aria-hidden="true" />
                Parar gravação
              </button>
            </div>
          ) : state === "processing" ? (
            <p className="text-sm font-semibold text-zinc-700">Compactando áudio para o link…</p>
          ) : (
            <button
              type="button"
              id="btn-start-audio"
              onClick={() => void startRecording()}
              disabled={!supported}
              className="btn-primary !min-h-[56px] !text-sm w-full sm:w-auto gap-2"
            >
              <Mic className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
              Gravar áudio de 10s sobre o produto
            </button>
          )}
        </div>
      )}
    </div>
  );
}
