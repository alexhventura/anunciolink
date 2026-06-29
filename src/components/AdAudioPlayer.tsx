import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { resolveAudioPlaybackUrl } from "../lib/audioPlayback";

interface AdAudioPlayerProps {
  src: string;
  title?: string;
}

export function AdAudioPlayer({ src, title = "Áudio do vendedor" }: AdAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!src) {
      setPlaybackUrl(null);
      return;
    }

    const { url, revoke } = resolveAudioPlaybackUrl(src);
    setPlaybackUrl(url);
    setLoadError(false);

    return () => {
      revoke?.();
    };
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playbackUrl) return;

    const onTime = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const onEnd = () => setPlaying(false);
    const onError = () => setLoadError(true);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("error", onError);
    };
  }, [playbackUrl]);

  if (!src || !playbackUrl) return null;

  if (loadError) {
    return (
      <p className="text-xs font-medium text-zinc-500 text-center max-w-xs mx-auto">
        Não foi possível carregar o áudio neste aparelho.
      </p>
    );
  }

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      setLoadError(true);
    }
  };

  return (
    <div className="ad-audio-player mx-auto max-w-xs w-full">
      <audio
        ref={audioRef}
        src={playbackUrl}
        preload="metadata"
        playsInline
        className="sr-only"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void toggle()}
          id="btn-ad-audio-play"
          aria-label={playing ? "Pausar áudio" : "Ouvir áudio do vendedor"}
          className="ad-audio-player__btn shrink-0"
        >
          {playing ? (
            <Pause className="h-4 w-4" fill="currentColor" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" fill="currentColor" aria-hidden="true" />
          )}
        </button>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-[11px] font-bold uppercase text-black/70 flex items-center gap-1 truncate">
            <Volume2 className="h-3 w-3 shrink-0" aria-hidden="true" />
            {title}
          </p>
          <div className="h-1.5 rounded-full bg-white border border-black overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
