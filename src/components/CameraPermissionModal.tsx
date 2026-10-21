import React, { useState } from 'react';
import { AlertCircle, Camera, Smartphone, Check, X, ShieldAlert, ArrowRight, Image as ImageIcon } from 'lucide-react';

interface CameraPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelected?: (file: File) => void;
  onUseFileInput?: () => void;
  errorMessage?: string;
}

export const CameraPermissionModal: React.FC<CameraPermissionModalProps> = ({
  isOpen,
  onClose,
  onFileSelected,
  onUseFileInput,
  errorMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelected) {
      onFileSelected(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Camera Access</h3>
              <p className="text-xs text-slate-400">Enable in settings or use direct photo snap</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Platform Selector */}
        <div className="flex bg-slate-800/80 p-1 rounded-2xl mb-4 border border-slate-700/50">
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'ios'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            iOS Safari (iPhone)
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'android'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Android Chrome
          </button>
        </div>

        {/* Step-by-step instructions */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-5 space-y-3">
          {activeTab === 'ios' ? (
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-white block font-medium">In Safari Address Bar:</strong>
                  Tap the <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[10px]">aA</span> icon on the left side of the web address bar.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  Tap <strong className="text-white">Website Settings</strong>.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  Change <strong className="text-white">Camera</strong> to <strong className="text-emerald-400">Allow</strong>, then reload page.
                </div>
              </div>
              <div className="flex items-start gap-2.5 pt-1 text-[11px] text-slate-400">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Or open iPhone <strong>Settings &gt; Safari &gt; Camera &gt; Allow</strong>.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-white block font-medium">In Chrome URL bar:</strong>
                  Tap the <strong className="text-white">tune/lock icon</strong> to the left of the address.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  Tap <strong className="text-white">Permissions &gt; Camera</strong>.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  Toggle to <strong className="text-emerald-400">Allowed</strong>, then refresh.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons with 100% native iPhone label binding */}
        <div className="space-y-2.5">
          {/* Hidden inputs directly tied to the labels below */}
          <input
            id="modal-camera-capture"
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={handleInputChange}
          />
          <input
            id="modal-gallery-capture"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleInputChange}
          />

          <label
            htmlFor="modal-camera-capture"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition active:scale-[0.98] cursor-pointer"
          >
            <Camera className="w-5 h-5" />
            <span>Take Photo with iPhone Camera</span>
            <ArrowRight className="w-4 h-4" />
          </label>

          <label
            htmlFor="modal-gallery-capture"
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-2xl flex items-center justify-center gap-2 border border-slate-700 transition active:scale-[0.98] cursor-pointer text-xs"
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>Choose from iPhone Photos / Gallery</span>
          </label>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-slate-400 hover:text-white font-medium transition text-center"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
