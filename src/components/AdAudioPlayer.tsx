import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";

interface AdAudioPlayerProps {
  src: string;
  title?: string;
}

export function AdAudioPlayer({ src, title = "Áudio do vendedor" }: AdAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnd = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

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
    }
  };

  return (
    <div className="ad-audio-player mx-auto max-w-xs">
      <audio ref={audioRef} src={src} preload="metadata" className="sr-only" />
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
