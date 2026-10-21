import React, { useState, useEffect } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { LoadingScreen } from './components/LoadingScreen';
import { WorkoutRoutineView } from './components/WorkoutRoutineView';
import { RestTimerModal } from './components/RestTimerModal';
import { WorkoutProgram } from './types/workout';
import {
  Dumbbell,
  Sparkles,
  Timer,
  Bookmark,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Flame,
  Check
} from 'lucide-react';

const STORAGE_KEY = 'workout_ai_saved_programs_v1';

export default function App() {
  const [currentProgram, setCurrentProgram] = useState<WorkoutProgram | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Gym Rest Timer State
  const [isTimerOpen, setIsTimerOpen] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(90);
  const [timerExerciseName, setTimerExerciseName] = useState<string | undefined>(undefined);

  // Saved Programs History
  const [savedPrograms, setSavedPrograms] = useState<WorkoutProgram[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Load saved programs from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedPrograms(parsed);
          // If no active program, set the most recent saved routine
          if (!currentProgram) {
            setCurrentProgram(parsed[0]);
          }
        }
      }
    } catch (e) {
      console.warn('Could not read saved routines from localStorage');
    }
  }, []);

  // Save new program to history
  const persistProgram = (newProgram: WorkoutProgram) => {
    try {
      const updated = [newProgram, ...savedPrograms.filter((p) => p.programTitle !== newProgram.programTitle)].slice(0, 10);
      setSavedPrograms(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save routine to localStorage');
    }
  };

  // Handle image capture and call Gemini API
  const handleImageCaptured = async (
    base64Image: string,
    userNotes: string,
    focusGoal: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/analyze-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Image,
          userNotes,
          focusGoal,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error || 'Failed to analyze schedule. Please ensure the workout schedule is legible and try again.'
        );
      }

      setCurrentProgram(json.data);
      persistProgram(json.data);
      // Scroll to top of routine
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error generating workout:', err);
      setErrorMessage(
        err.message ||
          'Something went wrong while analyzing your schedule photo. Please try retaking the photo with good lighting.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTimer = (seconds: number, exerciseName?: string) => {
    setTimerSeconds(seconds);
    setTimerExerciseName(exerciseName);
    setIsTimerOpen(true);
  };

  const handleStartNewScan = () => {
    setCurrentProgram(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Background Decorative Mesh Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {/* Logo / Brand */}
          <div
            onClick={handleStartNewScan}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
              <Dumbbell className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white">WorkoutAI</span>
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase">
                  Scanner
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Gym Routine Generator</p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Quick Rest Timer Trigger */}
            <button
              onClick={() => handleOpenTimer(90)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
              title="Open Rest Timer"
            >
              <Timer className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Rest Timer</span>
            </button>

            {/* Saved Routines History */}
            {savedPrograms.length > 0 && (
              <button
                onClick={() => setShowHistoryModal(true)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                title="Saved Routines"
              >
                <Bookmark className="w-4 h-4 text-teal-400" />
                <span className="hidden sm:inline">Saved ({savedPrograms.length})</span>
              </button>
            )}

            {/* Scan New Button (visible when viewing routine) */}
            {currentProgram && (
              <button
                onClick={handleStartNewScan}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Scan</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 flex flex-col relative z-10">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mb-5 p-4 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-3 shadow-lg animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <strong className="text-white block font-semibold">Could not generate routine</strong>
              <p className="leading-relaxed">{errorMessage}</p>
              <div className="pt-1 flex items-center gap-3">
                <button
                  onClick={handleStartNewScan}
                  className="px-3 py-1.5 bg-red-900/60 hover:bg-red-900 text-white rounded-lg font-bold text-xs transition"
                >
                  Try Again
                </button>
                <span className="text-[11px] text-red-300">
                  Tip: Ensure the workout text is clearly lit and in focus.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {isLoading ? (
          <LoadingScreen />
        ) : currentProgram ? (
          /* WORKOUT ROUTINE RESULT VIEW */
          <WorkoutRoutineView
            program={currentProgram}
            onRetake={handleStartNewScan}
            onOpenTimer={handleOpenTimer}
          />
        ) : (
          /* CAMERA / SCANNER HOME VIEW */
          <CameraCapture
            onImageCaptured={handleImageCaptured}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* REST TIMER MODAL */}
      <RestTimerModal
        initialSeconds={timerSeconds}
        exerciseName={timerExerciseName}
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
      />

      {/* SAVED ROUTINES DRAWER / MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-bold tracking-tight">Saved Workout Routines</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Previously scanned gym splits saved on this device.
            </p>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {savedPrograms.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentProgram(p);
                    setShowHistoryModal(false);
                    setErrorMessage(null);
                  }}
                  className="p-3.5 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl cursor-pointer transition flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                      {p.programTitle}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{p.programSubtitle}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{p.totalDays} Days</span>
                      <span>•</span>
                      <span>{p.weeklyFrequency}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 px-4 text-center text-xs text-slate-500 relative z-10">
        <p>
          WorkoutAI • Powered by Gemini Multimodal Vision • Mobile-First for iOS Safari & Android Chrome
        </p>
      </footer>
    </div>
  );
}
