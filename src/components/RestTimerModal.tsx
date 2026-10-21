import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, X, Bell, Plus, Minus } from 'lucide-react';
import { playTimerDoneSound } from '../utils/audio';

interface RestTimerProps {
  initialSeconds?: number;
  isOpen: boolean;
  onClose: () => void;
  exerciseName?: string;
}

export const RestTimerModal: React.FC<RestTimerProps> = ({
  initialSeconds = 90,
  isOpen,
  onClose,
  exerciseName,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);

  // Sync when initialSeconds changes
  useEffect(() => {
    setTotalSeconds(initialSeconds);
    setSecondsLeft(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds, isOpen]);

  // Timer interval
  useEffect(() => {
    let timer: any = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            playTimerDoneSound();
            if ('vibrate' in navigator) {
              try {
                navigator.vibrate([200, 100, 200]);
              } catch (e) {}
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const remainingSecs = secondsLeft % 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  const handleAdjust = (delta: number) => {
    setSecondsLeft((prev) => Math.max(10, prev + delta));
    setTotalSeconds((prev) => Math.max(10, prev + delta));
  };

  const handleReset = () => {
    setSecondsLeft(totalSeconds);
    setIsRunning(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          aria-label="Close timer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Bell className="w-4 h-4 animate-bounce" />
            <span>Gym Rest Interval</span>
          </div>

          {exerciseName && (
            <p className="text-xs text-slate-400 font-medium truncate px-6">
              Next set for <strong className="text-white">{exerciseName}</strong>
            </p>
          )}

          {/* Big countdown display */}
          <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
            {/* Circular background track */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-800"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-emerald-400 transition-all duration-1000 ease-linear"
                strokeWidth="7"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Time readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-4xl font-black tracking-tight text-white">
                {String(minutes).padStart(2, '0')}:{String(remainingSecs).padStart(2, '0')}
              </span>
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                {secondsLeft === 0 ? 'READY TO LIFT!' : 'RECOVERING'}
              </span>
            </div>
          </div>

          {/* Quick preset selector */}
          <div className="flex items-center justify-center gap-2 pt-1">
            {[30, 60, 90, 120, 180].map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  setTotalSeconds(sec);
                  setSecondsLeft(sec);
                  setIsRunning(true);
                }}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg border transition ${
                  totalSeconds === sec
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* Adjust + / - */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <button
              onClick={() => handleAdjust(-15)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 active:scale-95"
            >
              <Minus className="w-3.5 h-3.5" /> 15s
            </button>
            <button
              onClick={() => handleAdjust(15)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> 15s
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl flex items-center justify-center active:scale-95 transition"
              title="Reset"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
