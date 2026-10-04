import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sliders, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Flame, 
  Radio, 
  Disc, 
  Download,
  Power,
  Volume2,
  AlertTriangle,
  Info,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { 
  hiFiAudioEngine, 
  MasteringMode, 
  EngineerSettings, 
  MeterData 
} from '../../lib/hiFiAudioEngine';
import { Beat } from '../../types';

interface SpotifyMasteringStudioModalProps {
  beat: Beat | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SpotifyMasteringStudioModal: React.FC<SpotifyMasteringStudioModalProps> = ({
  beat,
  isOpen,
  onClose
}) => {
  const [settings, setSettings] = useState<EngineerSettings>(() => hiFiAudioEngine.getSettings());
  const [meters, setMeters] = useState<MeterData>(() => hiFiAudioEngine.getMeterData());
  const [exportSuccess, setExportSuccess] = useState(false);

  // Poll live meters
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setMeters(hiFiAudioEngine.getMeterData());
    }, 100);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleModeSelect = (mode: MasteringMode) => {
    const updated = { ...settings, mode, isBypassed: mode === 'RAW' };
    setSettings(updated);
    hiFiAudioEngine.applySettings(updated);
  };

  const handleToggleBypass = () => {
    const updated = { ...settings, isBypassed: !settings.isBypassed };
    setSettings(updated);
    hiFiAudioEngine.applySettings(updated);
  };

  const handleResetToSafeDefaults = () => {
    hiFiAudioEngine.resetToSafeDefaults();
    const safe = hiFiAudioEngine.getSettings();
    setSettings(safe);
  };

  const handleParamChange = (key: keyof EngineerSettings, value: number) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    hiFiAudioEngine.applySettings(updated);
  };

  const handleExportMaster = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3500);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[300] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-neutral-950 border border-emerald-500/30 max-w-4xl w-full p-6 sm:p-8 rounded-sm shadow-[0_0_100px_rgba(16,185,129,0.15)] relative flex flex-col gap-6 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-white/40 hover:text-white hover:bg-white/10 transition-all rounded-sm"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/40 rounded-sm flex items-center justify-center text-emerald-400 font-bold shrink-0">
              <Sliders size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black uppercase text-white tracking-tight">
                  Streaming Preview DSP Mastering Studio
                </h3>
                <span className={`px-2 py-0.5 border text-[8px] font-black uppercase ${
                  settings.isBypassed ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                  settings.mode === 'STREAMING' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' :
                  settings.mode === 'KNOCK' ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' :
                  'bg-white/10 border-white/20 text-white/60'
                }`}>
                  {settings.isBypassed ? 'BYPASSED' : settings.mode}
                </span>
              </div>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                Original uploaded audio master remains 100% untouched for licensing & downloads.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToSafeDefaults}
              className="px-3 py-2 border border-white/20 hover:bg-white/10 text-white/80 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
              title="Reset parameters to safe clean defaults"
            >
              <RotateCcw size={13} /> Clean Reset
            </button>
            <button
              onClick={handleToggleBypass}
              className={`px-4 py-2 border text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
                settings.isBypassed 
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
              }`}
            >
              <Power size={14} /> {settings.isBypassed ? 'Bypass Active' : 'Engage DSP'}
            </button>
          </div>
        </div>

        {/* Active Track Banner */}
        {beat && (
          <div className="p-3 bg-white/5 border border-white/10 rounded-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img src={beat.artworkUrl} alt={beat.title} className="w-12 h-12 object-cover border border-white/10 shrink-0" />
              <div className="min-w-0">
                <h4 className="text-sm font-black uppercase text-white truncate">{beat.title}</h4>
                <p className="text-[10px] text-white/50 uppercase font-mono">{beat.producerId} · {beat.bpm} BPM · {beat.key}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold">
                Max Ceiling: -1.0 dBFS
              </span>
              <span className="text-[9px] font-mono text-white/40 block">Clean Playback Guard</span>
            </div>
          </div>
        )}

        {/* THREE MASTERING MODES SELECTOR */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">
            Select Preview Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* 1. STREAMING MODE */}
            <button
              onClick={() => handleModeSelect('STREAMING')}
              className={`p-4 border text-left rounded-sm transition-all flex flex-col justify-between gap-2 ${
                settings.mode === 'STREAMING' && !settings.isBypassed
                  ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-emerald-400">1. Streaming Reference</span>
                <span className="text-[8px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 uppercase">-1.0 dB Ceiling</span>
              </div>
              <p className="text-[9px] text-white/70 leading-relaxed">
                Clean reference preview with transparent safety limiting, preserved 808 transients, and zero clipping.
              </p>
            </button>

            {/* 2. KNOCK MODE */}
            <button
              onClick={() => handleModeSelect('KNOCK')}
              className={`p-4 border text-left rounded-sm transition-all flex flex-col justify-between gap-2 ${
                settings.mode === 'KNOCK' && !settings.isBypassed
                  ? 'bg-purple-500/20 border-purple-500 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-purple-400">2. Knock Mode</span>
                <span className="text-[8px] font-mono px-2 py-0.5 bg-purple-500/20 text-purple-300 uppercase">Gentle 808</span>
              </div>
              <p className="text-[9px] text-white/70 leading-relaxed">
                Punchy producer preview with 808 sub impact, clear kick transients, and adaptive dynamic protection.
              </p>
            </button>

            {/* 3. RAW MODE */}
            <button
              onClick={() => handleModeSelect('RAW')}
              className={`p-4 border text-left rounded-sm transition-all flex flex-col justify-between gap-2 ${
                (settings.mode === 'RAW' || settings.isBypassed)
                  ? 'bg-white/20 border-white text-white shadow-lg'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-white">3. Clean Safe Bypass</span>
                <span className="text-[8px] font-mono px-2 py-0.5 bg-white/20 text-white uppercase">RAW</span>
              </div>
              <p className="text-[9px] text-white/70 leading-relaxed">
                Completely bypasses all DSP processing. Plays the original uploaded audio 100% bit-identical.
              </p>
            </button>

          </div>
        </div>

        {/* METERING DASHBOARD (Input LUFS, Output LUFS, Input Peak, Output Peak, GR) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-black border border-white/10 rounded-sm">
          
          <div className="space-y-1">
            <span className="text-[8px] font-mono uppercase text-white/40 block">Input LUFS</span>
            <span className="text-sm font-black text-white font-mono">{meters.inputLufs}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[8px] font-mono uppercase text-white/40 block">Output LUFS</span>
            <span className="text-sm font-black text-emerald-400 font-mono">{meters.outputLufs}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[8px] font-mono uppercase text-white/40 block">Input Peak</span>
            <span className="text-sm font-black text-white/80 font-mono">{meters.inputPeakDb} dBFS</span>
          </div>

          <div className="space-y-1">
            <span className="text-[8px] font-mono uppercase text-white/40 block">Output Peak</span>
            <span className={`text-sm font-black font-mono ${meters.isClipping ? 'text-amber-400' : 'text-emerald-400'}`}>
              {meters.outputPeakDb} dBFS
            </span>
          </div>

          <div className="space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[8px] font-mono uppercase text-white/40 block">Limiter Reduction</span>
            <span className="text-sm font-black text-amber-400 font-mono">-{meters.gainReductionDb} dB</span>
          </div>

        </div>

        {/* 808 PROTECTION NOTIFICATION BAR */}
        {meters.hasSubOverload && !settings.isBypassed && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0" />
            <span>Adaptive Sub Protection Active: Scaling down excessive low-end to preserve 808 transient punch.</span>
          </div>
        )}

        {/* ENGINEER SLIDERS */}
        <div className="p-6 bg-black/60 border border-white/10 rounded-sm space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-emerald-400 tracking-widest flex items-center gap-2">
              <Flame size={14} /> Engineer Fine-Tuning Controls
            </h4>
            <span className="text-[9px] font-mono text-white/40 uppercase">Internal -3dB Headroom Guard Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Low-Mid Warmth */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/80 font-bold uppercase">Low-Mid Warmth (320Hz)</span>
                <span className="text-emerald-400 font-bold">{settings.lowMidWarmth > 0 ? '+' : ''}{settings.lowMidWarmth.toFixed(1)} dB</span>
              </div>
              <input 
                type="range" 
                min="-3" 
                max="3" 
                step="0.1"
                value={settings.lowMidWarmth}
                onChange={(e) => handleParamChange('lowMidWarmth', parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* 2. High-End Air */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/80 font-bold uppercase">High-End Air (10kHz)</span>
                <span className="text-emerald-400 font-bold">+{settings.highAir.toFixed(1)} dB</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="3" 
                step="0.1"
                value={settings.highAir}
                onChange={(e) => handleParamChange('highAir', parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* 3. 808 Sub Punch */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/80 font-bold uppercase">808 Sub Control (60Hz)</span>
                <span className="text-emerald-400 font-bold">{settings.subPunch808 > 0 ? '+' : ''}{settings.subPunch808.toFixed(1)} dB</span>
              </div>
              <input 
                type="range" 
                min="-3" 
                max="3" 
                step="0.1"
                value={settings.subPunch808}
                onChange={(e) => handleParamChange('subPunch808', parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* 4. Harmonic Saturation Drive */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/80 font-bold uppercase">Gentle Saturation Drive</span>
                <span className="text-emerald-400 font-bold">{(settings.harmonicDrive * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="0.30" 
                step="0.01"
                value={settings.harmonicDrive}
                onChange={(e) => handleParamChange('harmonicDrive', parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* 5. Output Loudness */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/80 font-bold uppercase">Output Loudness Offset</span>
                <span className="text-emerald-400 font-bold">{settings.outputLoudness > 0 ? '+' : ''}{settings.outputLoudness.toFixed(1)} dB</span>
              </div>
              <input 
                type="range" 
                min="-3" 
                max="1" 
                step="0.1"
                value={settings.outputLoudness}
                onChange={(e) => handleParamChange('outputLoudness', parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* 6. Limiter Response Strength */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/80 font-bold uppercase">Limiter Response Strength</span>
                <span className="text-emerald-400 font-bold">{(settings.limiterStrength * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={settings.limiterStrength}
                onChange={(e) => handleParamChange('limiterStrength', parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <CheckCircle2 size={16} /> 
            <span>Original Upload File Intact · Safe Headroom Guard Active</span>
          </div>

          <button
            onClick={handleExportMaster}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
          >
            {exportSuccess ? <CheckCircle2 size={16} /> : <Download size={16} />}
            {exportSuccess ? 'Settings Saved To Player!' : 'Save Mastering Settings'}
          </button>
        </div>

      </div>
    </div>
  );
};
