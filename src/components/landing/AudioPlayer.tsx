import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { QuirkyButton, ZenQuirkyButton } from '../ui/QuirkyButton';
import { SecondaryButton, TertiaryButton } from '../ui/CustomButton';

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      const handleEnded = () => setIsPlaying(false);
      audioElement.addEventListener('ended', handleEnded);

      return () => {
        // Using the captured audioElement reference in cleanup
        audioElement.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  return (
    <div className="inline-flex flex-col items-center justify-center fade-in">

      <QuirkyButton
        onClick={togglePlayPause}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        <span className="font-medium">Hear how it works</span>
      </QuirkyButton>

      {/* Audio element */}
      <audio ref={audioRef} src="/demo-audio.mp3" preload="metadata" />

      {/* Waveform animation - only visible when playing */}
      {
        isPlaying && (
          <div className="flex items-center justify-center gap-[3px] h-8 fade-in">
            {[...Array(7)].map((_, i) => {
              const heights = ["h-2", "h-3", "h-5", "h-6", "h-5", "h-3", "h-2"];
              const delays = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6];

              return (
                <div
                  key={i}
                  className={`${heights[i]} w-[3px] bg-[hsl(var(--voice-accent))] rounded-full`}
                  style={{
                    animation: `bounce 1s ease-in-out infinite ${delays[i]}s`
                  }}
                ></div>
              );
            })}
          </div>
        )
      }
    </div >
  );
};

export default AudioPlayer;