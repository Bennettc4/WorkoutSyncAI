import React, { useEffect, useState } from 'react';
import { Dumbbell, Sparkles, Activity, Clock, Flame } from 'lucide-react';

const ANALYSIS_STAGES = [
  { text: 'Scanning workout schedule with Gemini 3.8 Flash...', icon: Sparkles },
  { text: 'Decoding workout days, splits, and muscle groups...', icon: Activity },
  { text: 'Structuring step-by-step gym exercises & rep ranges...', icon: Dumbbell },
  { text: 'Formulating dynamic warm-up and cool-down stretches...', icon: Flame },
  { text: 'Calibrating rest intervals & pro coaching cues...', icon: Clock },
];

const PRO_TIPS = [
  'Pro Tip: Perform dynamic stretching before lifting to boost motor unit recruitment without reducing peak force.',
  'Pro Tip: Compound movements (bench, squats, deadlifts) should be performed first when neuromuscular energy is highest.',
  'Pro Tip: Post-workout static stretches held for 30–60 seconds help downregulate the central nervous system and restore muscle length.',
  'Pro Tip: Hydrate with at least 500ml water and electrolytes before starting your working sets.',
  'Pro Tip: Track your rest periods—60 to 90 seconds for hypertrophy, 2 to 3 minutes for heavy strength work.',
];

export const LoadingScreen: React.FC = () => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    // Stage rotation
    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev < ANALYSIS_STAGES.length - 1 ? prev + 1 : prev));
    }, 2400);

    // Tip rotation
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % PRO_TIPS.length);
    }, 4500);

    // Progress bar simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 600);

    return () => {
      clearInterval(stageInterval);
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const CurrentIcon = ANALYSIS_STAGES[currentStageIndex].icon;

  return (
    <div className="w-full max-w-md mx-auto my-auto py-12 px-6 flex flex-col items-center justify-center text-center animate-fade-in">
      {/* Outer pulse and fitness avatar */}
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center relative animate-pulse">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/30">
            <CurrentIcon className="w-10 h-10 animate-spin-slow" />
          </div>
        </div>
        <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping opacity-30 pointer-events-none" />
      </div>

      {/* Main Title */}
      <h3 className="text-xl font-bold tracking-tight text-white mb-2">
        Building Your AI Workout Routine
      </h3>

      {/* Stage Status */}
      <p className="text-sm font-medium text-emerald-400 min-h-[44px] flex items-center justify-center px-4 leading-snug">
        {ANALYSIS_STAGES[currentStageIndex].text}
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-xs bg-slate-800/80 rounded-full h-2 my-5 overflow-hidden border border-slate-700/50 p-0.5">
        <div
          className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Pro Gym Tip Card */}
      <div className="mt-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left max-w-sm w-full backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1.5 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5" />
          <span>Gym Science Insight</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed min-h-[38px] transition-opacity duration-300">
          {PRO_TIPS[currentTipIndex]}
        </p>
      </div>
    </div>
  );
};
