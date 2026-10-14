import React, { useState, useEffect } from 'react';

interface FocusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FocusModal: React.FC<FocusModalProps> = ({ isOpen, onClose }) => {
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [soundMode, setSoundMode] = useState<'silent' | 'rain' | 'birds'>('silent');

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((sec) => sec - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const setTimer = (mins: number) => {
    setDurationMinutes(mins);
    setSecondsRemaining(mins * 60);
    setIsActive(false);
  };

  const progressPercent = ((durationMinutes * 60 - secondsRemaining) / (durationMinutes * 60)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-3xl w-full max-w-sm p-6 border border-outline-variant/30 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        <div className="flex items-center justify-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Mindful Focus Session</span>
        </div>

        <h3 className="font-display text-xl font-extrabold text-on-surface">
          Deep Product Thinking
        </h3>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Serene sanctuary for your 90-minute daily intention
        </p>

        {/* Circular Countdown Progress */}
        <div className="relative w-48 h-48 mx-auto my-6 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#e7eeff"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#4648d4"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-extrabold tracking-tight text-on-surface tabular-nums">
              {formattedTime}
            </span>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
              {isActive ? 'Session Active' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Preset Duration Pills */}
        <div className="flex justify-center gap-2 mb-5">
          {[15, 25, 45, 90].map((mins) => (
            <button
              key={mins}
              onClick={() => setTimer(mins)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                durationMinutes === mins
                  ? 'bg-primary text-on-primary shadow-2xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Ambient Sound Mode */}
        <div className="flex items-center justify-center gap-2 mb-6 text-xs text-on-surface-variant">
          <span className="font-medium">Ambient:</span>
          <button
            onClick={() => setSoundMode('silent')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
              soundMode === 'silent' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-container'
            }`}
          >
            Mute
          </button>
          <button
            onClick={() => setSoundMode('rain')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 ${
              soundMode === 'rain' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-container'
            }`}
          >
            🌧️ Rain
          </button>
          <button
            onClick={() => setSoundMode('birds')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 ${
              soundMode === 'birds' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-container'
            }`}
          >
            🕊️ Dawn
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex-1 py-3 px-5 rounded-2xl bg-primary text-on-primary font-display font-bold text-sm shadow-sm hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isActive ? 'pause' : 'play_arrow'}
            </span>
            <span>{isActive ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            onClick={() => setTimer(durationMinutes)}
            className="w-12 h-12 rounded-2xl bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center active:scale-95 transition-all"
            title="Reset timer"
          >
            <span className="material-symbols-outlined text-[20px]">replay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
