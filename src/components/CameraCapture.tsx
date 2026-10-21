import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  Sparkles,
  Zap,
  Image as ImageIcon,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  RotateCcw,
  Smartphone,
  Video,
  Loader2
} from 'lucide-react';
import { playShutterSound } from '../utils/audio';
import { optimizeImageForUpload } from '../utils/imageUtils';
import { SAMPLE_SCHEDULES, SampleSchedule } from '../data/sampleSchedules';
import { CameraPermissionModal } from './CameraPermissionModal';

interface CameraCaptureProps {
  onImageCaptured: (base64Image: string, notes: string, goal: string) => void;
  isLoading: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageCaptured, isLoading }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);

  // User customizations for the AI prompt
  const [focusGoal, setFocusGoal] = useState<string>('Hypertrophy & Muscle Growth');
  const [userNotes, setUserNotes] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Stop camera tracks helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Start live stream with progressive iOS WebKit fallbacks
  const startCamera = useCallback(async () => {
    stopCamera();
    setPermissionError(null);

    // Verify if mediaDevices is supported (e.g. non-https context check)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError('Direct in-browser video is restricted on this device. Please tap "Take Photo with iPhone Camera" below.');
      setShowPermissionModal(true);
      return;
    }

    let stream: MediaStream | null = null;

    // Strategy 1: Ideal facingMode without strict resolution (best for iOS Safari)
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
        },
        audio: false,
      });
    } catch (e1) {
      console.warn('Initial getUserMedia attempt failed, trying exact facingMode:', e1);
      // Strategy 2: Fallback with simple facingMode string
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode },
          audio: false,
        });
      } catch (e2) {
        console.warn('Second attempt failed, trying basic video:', e2);
        // Strategy 3: Basic generic video constraint
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (err: any) {
          console.warn('All getUserMedia attempts failed:', err);
          const isDenied =
            err.name === 'NotAllowedError' ||
            err.name === 'PermissionDeniedError' ||
            err.name === 'SecurityError' ||
            err.message?.includes('Permission');

          const message = isDenied
            ? 'Camera permission was denied in Safari. Tap "Take Photo with iPhone Camera" below to capture without permission prompts.'
            : `Unable to launch video viewfinder (${err.name || 'Device error'}). Use the iPhone camera button below.`;

          setPermissionError(message);
          setShowPermissionModal(true);
          setCameraActive(false);
          return;
        }
      }
    }

    if (stream) {
      streamRef.current = stream;
      if (videoRef.current) {
        const video = videoRef.current;
        // Crucial iOS Safari WebKit attributes for inline camera playback
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.muted = true;
        video.srcObject = stream;
        try {
          await video.play();
        } catch (playErr) {
          console.warn('Video play error on iOS:', playErr);
        }
      }
      setCameraActive(true);
    }
  }, [facingMode, stopCamera]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Capture snapshot from live video
  const takeLiveSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Trigger visual flash and sound
    setIsFlashing(true);
    playShutterSound();
    setTimeout(() => setIsFlashing(false), 200);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    setCapturedImage(dataUrl);
    stopCamera();
  };

  // Handle native file input - optimized specifically for iPhone Safari & Android Chrome
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingFile(true);
      playShutterSound();
      // Optimize & scale iPhone multi-megapixel camera photo to prevent Safari heap crash
      const optimizedBase64 = await optimizeImageForUpload(file);
      setCapturedImage(optimizedBase64);
      stopCamera();
    } catch (err) {
      console.error('Failed to process iPhone photo:', err);
      // Fallback to basic file reader if canvas fails
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCapturedImage(result);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessingFile(false);
      // Clear input value so selecting the same photo works again
      e.target.value = '';
    }
  };

  // Flip camera between environment and user
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    if (cameraActive) {
      setTimeout(() => startCamera(), 100);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleSelectSample = (sample: SampleSchedule) => {
    setCapturedImage(sample.imageUrl);
    stopCamera();
  };

  const handleSubmit = () => {
    if (!capturedImage) return;
    onImageCaptured(capturedImage, userNotes, focusGoal);
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-8">
      {/* Permission helper modal */}
      <CameraPermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onFileSelected={async (file) => {
          setIsProcessingFile(true);
          try {
            const optimized = await optimizeImageForUpload(file);
            setCapturedImage(optimized);
          } finally {
            setIsProcessingFile(false);
          }
        }}
        errorMessage={permissionError || undefined}
      />

      {/* 
        Native HTML Inputs for iPhone:
        Tied directly to <label htmlFor="..."> buttons.
        This provides 100% reliable camera and gallery opening in iOS Safari
        without relying on JavaScript .click() which Safari often blocks.
      */}
      <input
        type="file"
        id="iphone-native-camera"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="sr-only"
      />
      <input
        type="file"
        id="iphone-native-gallery"
        accept="image/*"
        onChange={handleFileChange}
        className="sr-only"
      />

      {/* PROCESSING OVERLAY */}
      {isProcessingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-3 max-w-xs shadow-2xl">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <h4 className="text-sm font-bold text-white">Optimizing iPhone Photo...</h4>
            <p className="text-xs text-slate-400">Scaling for optimal Gemini AI recognition</p>
          </div>
        </div>
      )}

      {/* CAPTURED PREVIEW STATE */}
      {capturedImage ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md animate-fade-in space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                Schedule Captured
              </h2>
            </div>
            <button
              onClick={handleRetake}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Photo
            </button>
          </div>

          {/* Image Preview Card */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 bg-black/60 aspect-3/4 max-h-[380px] flex items-center justify-center group">
            <img
              src={capturedImage}
              alt="Captured Workout Schedule"
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Ready for AI Coach analysis
              </span>
              <span className="font-mono text-[11px] text-slate-400">gemini-3.8-flash</span>
            </div>
          </div>

          {/* Routine Customization Accordion */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
            >
              <span className="flex items-center gap-2 text-emerald-400">
                <SlidersHorizontal className="w-4 h-4" />
                Training Focus & Preferences (Optional)
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                {showSettings ? 'Hide' : focusGoal}
              </span>
            </button>

            {showSettings && (
              <div className="pt-2 space-y-3 border-t border-slate-800/60 animate-fade-in text-xs">
                <div>
                  <label className="text-slate-400 block mb-1.5 font-medium">Training Goal:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Hypertrophy & Muscle Growth',
                      'Max Strength & Power',
                      'Athletic Conditioning',
                      'Mobility & Lean Tone',
                    ].map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => setFocusGoal(goal)}
                        className={`p-2.5 rounded-xl text-left text-xs font-medium border transition cursor-pointer ${
                          focusGoal === goal
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1.5 font-medium">
                    Notes for Coach (injuries, equipment limits):
                  </label>
                  <input
                    type="text"
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="e.g. 50 min sessions, dumbbells & cables, bad left knee"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/25 transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
            <span>Generate Step-by-Step AI Routine</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        /* CAMERA SCANNER & CAPTURE VIEW */
        <div className="space-y-5 animate-fade-in">
          {/* Live Viewfinder or Scanner Placeholder */}
          <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 backdrop-blur-md">
            {cameraActive ? (
              <div className="relative rounded-2xl overflow-hidden aspect-3/4 max-h-[460px] bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Shutter flash animation overlay */}
                {isFlashing && (
                  <div className="absolute inset-0 bg-white z-30 animate-ping opacity-90" />
                )}

                {/* Gym scanner reticle and guides */}
                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
                    <div className="w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
                  </div>
                  <div className="text-center bg-slate-950/70 backdrop-blur-sm mx-auto px-4 py-1.5 rounded-full border border-emerald-500/30">
                    <p className="text-[11px] font-semibold text-emerald-300 tracking-wide uppercase">
                      Point at workout split or schedule note
                    </p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
                    <div className="w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />
                  </div>
                </div>

                {/* In-viewfinder controls */}
                <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                  <button
                    onClick={toggleFacingMode}
                    className="p-2.5 bg-slate-950/70 hover:bg-slate-900 backdrop-blur-md rounded-full text-white border border-white/20 transition active:scale-95 cursor-pointer"
                    title="Flip camera"
                    aria-label="Flip camera"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={stopCamera}
                    className="p-2.5 bg-slate-950/70 hover:bg-slate-900 backdrop-blur-md rounded-full text-white border border-white/20 transition active:scale-95 text-xs font-semibold px-3 cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {/* Viewfinder Bottom Shutter Trigger */}
                <div className="absolute bottom-5 inset-x-0 flex items-center justify-center z-20">
                  <button
                    onClick={takeLiveSnapshot}
                    className="w-20 h-20 rounded-full border-4 border-white/90 bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center shadow-2xl transition transform active:scale-90 cursor-pointer"
                    aria-label="Take photo"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/20 border border-white/40 flex items-center justify-center">
                      <Camera className="w-7 h-7 text-slate-950" />
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* Camera Ready State (Hero / Starter) */
              <div className="py-6 px-3 sm:px-4 text-center space-y-5">
                <div className="relative inline-block">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                    <Camera className="w-9 h-9 sm:w-10 sm:h-10" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                    AI
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Scan Workout Schedule
                  </h2>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Snap a photo of your gym split, handwritten notebook, or whiteboard. WorkoutAI crafts your custom daily routines.
                  </p>
                </div>

                {/* iPhone-Optimized Primary Action Buttons */}
                <div className="space-y-2.5 pt-1">
                  {/* BUTTON 1 (PRIMARY): Native iPhone Camera via Label */}
                  <label
                    htmlFor="iphone-native-camera"
                    className="w-full py-4 px-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/25 transition transform active:scale-[0.98] cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-slate-950" />
                    <span className="text-sm font-extrabold tracking-wide">
                      Take Photo with Camera
                    </span>
                  </label>

                  {/* BUTTON 2: Native iPhone Photo Library */}
                  <label
                    htmlFor="iphone-native-gallery"
                    className="w-full py-3.5 px-5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-white font-semibold rounded-2xl flex items-center justify-center gap-2.5 transition active:scale-[0.98] cursor-pointer text-xs"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>Choose from Photo Library</span>
                  </label>

                  {/* BUTTON 3: Optional In-Browser Live Viewfinder */}
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full py-2.5 px-4 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-slate-200 font-medium rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer text-[11px]"
                  >
                    <Video className="w-3.5 h-3.5 text-slate-400" />
                    <span>Launch Live Video Viewfinder</span>
                  </button>
                </div>

                {/* Platform Compatibility indicator */}
                <div className="pt-1 flex items-center justify-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-emerald-500" />
                    Optimized for iPhone (Safari) & Android
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Test Samples */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Or Test With A Sample Split
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Instant Test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SAMPLE_SCHEDULES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="p-3 bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 hover:border-emerald-500/50 rounded-2xl text-left transition group active:scale-[0.98] flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition flex items-center justify-between">
                      <span>{sample.title}</span>
                      <ImageIcon className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{sample.tagline}</p>
                  </div>
                  <span className="text-[10px] text-emerald-400/90 font-medium mt-2 block">
                    Use Sample &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
