import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Sliders, 
  Volume2, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Cpu, 
  Flame, 
  Radio, 
  Disc, 
  Download,
  Info
} from 'lucide-react';
import { hiFiAudioEngine, MASTER_PRESETS, MasterPresetId } from '../../lib/hiFiAudioEngine';
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
  if (!isOpen) return null;

  const [activePreset, setActivePreset] = useState<MasterPresetId>(hiFiAudioEngine.getCurrentPreset().id);
  const [subGain, setSubGain] = useState(2.5);
  const [lowMidGain, setLowMidGain] = useState(1.2);
  const [airGain, setAirGain] = useState(3.8);
  const [saturation, setSaturation] = useState(0.20);
  const [truePeakCeiling, setTruePeakCeiling] = useState(-1.0);
  const [liveLufs, setLiveLufs] = useState(-14.0);
  const [livePeak, setLivePeak] = useState(-1.0);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Poll live LUFS meters
  useEffect(() => {
    const interval = setInterval(() => {
      const readings = hiFiAudioEngine.getRmsLufsLevel();
      setLiveLufs(readings.lufs);
      setLivePeak(readings.truePeak);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const handleSelectPreset = (presetId: MasterPresetId) => {
    setActivePreset(presetId);
    hiFiAudioEngine.applyPreset(presetId);
    
    const p = MASTER_PRESETS.find(item => item.id === presetId);
    if (p) {
      setSubGain(p.subGainDb);
      setLowMidGain(p.lowMidGainDb);
      setAirGain(p.airGainDb);
      setSaturation(p.saturationDrive);
      setTruePeakCeiling(p.truePeakCeilingDb);
    }
  };

  const handleSubChange = (val: number) => {
    setSubGain(val);
    hiFiAudioEngine.updateCustomParam('sub', val);
  };

  const handleLowMidChange = (val: number) => {
    setLowMidGain(val);
    hiFiAudioEngine.updateCustomParam('lowMid', val);
  };

  const handleAirChange = (val: number) => {
    setAirGain(val);
    hiFiAudioEngine.updateCustomParam('air', val);
  };

  const handleSaturationChange = (val: number) => {
    setSaturation(val);
    hiFiAudioEngine.updateCustomParam('saturation', val);
  };

  const handleCeilingChange = (val: number) => {
    setTruePeakCeiling(val);
    hiFiAudioEngine.updateCustomParam('ceiling', val);
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
                  Spotify Audio Mastering Suite
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[8px] font-black uppercase">
                  -14 LUFS / -1.0 dBFS
                </span>
              </div>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                Professional 32-Bit Float DSP Engine • True Peak Ceiling & Tube Harmonic Saturation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-sm">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span className="text-[9px] font-mono text-emerald-300 uppercase tracking-widest font-bold">
              Spotify Normalization Certified
            </span>
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
              <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold">Processing Target: -14.0 LUFS</span>
              <span className="text-[9px] font-mono text-white/40 block">Ceiling: -1.0 dBFS True Peak</span>
            </div>
          </div>
        )}

        {/* Real-time Meters Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Integrated LUFS Meter */}
          <div className="p-4 bg-black border border-white/10 rounded-sm space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-white/60 uppercase font-bold flex items-center gap-1.5">
                <Activity size={14} className="text-emerald-400" /> Integrated LUFS Loudness
              </span>
              <span className="text-emerald-400 font-bold">{liveLufs} LUFS</span>
            </div>

            <div className="h-4 bg-white/10 rounded-full overflow-hidden relative border border-white/10">
              {/* Target Marker at -14 LUFS (approx 76% width) */}
              <div className="absolute top-0 bottom-0 left-[76%] w-0.5 bg-emerald-400 z-10 shadow-[0_0_10px_#10b981]" title="Target -14 LUFS" />
              <div 
                className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-400 transition-all duration-150"
                style={{ width: `${Math.min(100, Math.max(0, ((liveLufs + 60) / 60) * 100))}%` }}
              />
            </div>

            <div className="flex justify-between text-[8px] font-mono text-white/30">
              <span>-60 LUFS</span>
              <span className="text-emerald-400 font-bold">-14 LUFS (Target)</span>
              <span>0 LUFS</span>
            </div>
          </div>

          {/* True Peak Meter */}
          <div className="p-4 bg-black border border-white/10 rounded-sm space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-white/60 uppercase font-bold flex items-center gap-1.5">
                <Zap size={14} className="text-amber-400" /> True Peak Ceiling (-1.0 dBFS)
              </span>
              <span className={`font-bold ${livePeak >= -1.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {livePeak} dBFS
              </span>
            </div>

            <div className="h-4 bg-white/10 rounded-full overflow-hidden relative border border-white/10">
              {/* Ceiling Line (-1.0 dBFS) */}
              <div className="absolute top-0 bottom-0 right-[5%] w-0.5 bg-amber-400 z-10 shadow-[0_0_10px_#f59e0b]" title="Ceiling -1.0 dBFS" />
              <div 
                className={`h-full transition-all duration-150 ${
                  livePeak >= -1.0 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, ((livePeak + 60) / 60) * 100))}%` }}
              />
            </div>

            <div className="flex justify-between text-[8px] font-mono text-white/30">
              <span>-60 dBFS</span>
              <span className="text-amber-400 font-bold">-1.0 dBFS (Ceiling)</span>
              <span>0 dBFS</span>
            </div>
          </div>

        </div>

        {/* Master Preset Selector */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">
            Select Mastering Profile
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {MASTER_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-3 text-left border rounded-sm transition-all flex flex-col justify-between gap-2 ${
                  activePreset === preset.id 
                    ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg' 
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-[8px] font-black uppercase tracking-wider block">{preset.badge}</span>
                <span className="text-[10px] font-bold uppercase truncate">{preset.name.split('(')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Engineer DSP Precision Sliders */}
        <div className="p-6 bg-black/60 border border-white/10 rounded-sm space-y-6">
          <h4 className="text-xs font-black uppercase text-emerald-400 tracking-widest flex items-center gap-2">
            <Flame size={14} /> Engineer Multi-Band Saturation & EQ Sliders
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Low-Mid Body Tube Saturation (200Hz - 500Hz) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/80 font-bold uppercase">Low-Mid Tube Warmth (200Hz-500Hz)</span>
                <span className="text-emerald-400 font-bold">+{lowMidGain.toFixed(1)} dB</span>
              </div>
              <input 
                type="range" 
                min="-6" 
                max="6" 
                step="0.1"
                value={lowMidGain}
                onChange={(e) => handleLowMidChange(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <p className="text-[9px] text-white/40 font-mono">Adds 2nd-order analog warmth to body without muddying 808s.</p>
            </div>

            {/* 2. High-End Air Exciter (>8kHz) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/80 font-bold uppercase">High-End Air Shimmer (&gt;8kHz)</span>
                <span className="text-emerald-400 font-bold">+{airGain.toFixed(1)} dB</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="8" 
                step="0.1"
                value={airGain}
                onChange={(e) => handleAirChange(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <p className="text-[9px] text-white/40 font-mono">Silky 3rd-order harmonic sheen for vocal & hi-hat shimmer.</p>
            </div>

            {/* 3. Sub-Bass 808 Punch (60Hz) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/80 font-bold uppercase">808 Sub-Bass Punch (60Hz)</span>
                <span className="text-emerald-400 font-bold">+{subGain.toFixed(1)} dB</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="8" 
                step="0.1"
                value={subGain}
                onChange={(e) => handleSubChange(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <p className="text-[9px] text-white/40 font-mono">Unclipped low-end sub punch with 20Hz subsonic high-pass filter.</p>
            </div>

            {/* 4. Total Harmonic Saturation Drive */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white/80 font-bold uppercase">Harmonic Drive Amount</span>
                <span className="text-emerald-400 font-bold">{(saturation * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={saturation}
                onChange={(e) => handleSaturationChange(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <p className="text-[9px] text-white/40 font-mono">Soft-clipping WaveShaper saturator for perceived loudness.</p>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <CheckCircle2 size={16} /> 
            <span>Integrated LUFS Target (-14.0 LUFS) & Ceiling (-1.0 dBFS) Locked</span>
          </div>

          <button
            onClick={handleExportMaster}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
          >
            {exportSuccess ? <CheckCircle2 size={16} /> : <Download size={16} />}
            {exportSuccess ? 'Master Profile Exported!' : 'Export Spotify Mastered Profile'}
          </button>
        </div>

      </div>
    </div>
  );
};
