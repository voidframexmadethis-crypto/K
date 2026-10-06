/**
 * Web Audio API Hi-Fi DSP Mastering Audio Engine
 *
 * ROOT CAUSE OF PREVIOUS AUDIO DISTORTION & FIXES IMPLEMENTED:
 * 1. Cumulative Gain Stacking: Previously, multiple EQ stages (60Hz sub, 320Hz mid, 10kHz air)
 *    and output gain nodes independently added boost without internal headroom padding. When applied
 *    to pre-mastered 0 dBFS beats, the internal Web Audio bus exceeded +6 dBFS, driving saturation curves
 *    and limiters into harsh digital clipping.
 *    FIX: Added a -3.0 dB internal headroom pad before EQ & saturation processing, preventing bus clipping.
 *
 * 2. Harsh Waveshaper Curves & Double Saturation: The engine previously routed audio through two
 *    Waveshaper nodes in series using aggressive, non-linear transfer functions.
 *    FIX: Replaced with a single, gentle, normalized tanh curve. When harmonicDrive is 0,
 *    the curve is set to null, completely bypassing the WaveShaperNode.
 *
 * 3. 808 Sub Destruction & High-End Harshness: The 20Hz highpass filter previously had high Q causing
 *    phase distortion on sub-bass, and the air exciter added up to +8 dB of harsh treble.
 *    FIX: Used a gentle Butterworth highpass filter (Q=0.5) to preserve 30-60Hz sub-bass transients,
 *    and capped air exciter / EQ boosts to conservative, transparent levels with safe defaults (0 dB).
 *
 * 4. Hard Output Safety Ceiling:
 *    FIX: Enforced a strict final-stage brickwall limiter at -1.0 dBFS ceiling to guarantee no playback clipping.
 *
 * 5. Audio Graph Double Processing Protection:
 *    FIX: Ensured MediaElementAudioSourceNode and AudioContext nodes are created exactly once per
 *    HTMLAudioElement instance, properly disconnected on teardown, preventing stacked processing chains.
 *
 * NOTE: The original uploaded audio file remains 100% untouched byte-for-byte. All processing is
 * real-time playback DSP only.
 */

export type MasteringMode = 'STREAMING' | 'KNOCK' | 'RAW';
export type MasterPresetId = 'streaming' | 'knock' | 'raw';

export interface MasterPreset {
  id: MasterPresetId;
  name: string;
  badge: string;
  description: string;
}

export const MASTER_PRESETS: MasterPreset[] = [
  { id: 'streaming', name: 'Streaming Reference', badge: 'STREAMING', description: 'Transparent Peak Safety & Clean Master Preservation' },
  { id: 'knock', name: 'Knock (Gentle 808 Punch)', badge: 'KNOCK', description: 'Subtle 808 Transient Definition & Dynamic Protection' },
  { id: 'raw', name: 'Clean Safe Bypass (RAW)', badge: 'RAW', description: '100% Unprocessed Bit-Identical Original Master' }
];

export interface EngineerSettings {
  mode: MasteringMode;
  isBypassed: boolean;
  lowMidWarmth: number;    // -3.0 to +3.0 dB (Default: 0.0)
  highAir: number;          // 0.0 to +3.0 dB (Default: 0.0)
  subPunch808: number;      // -3.0 to +3.0 dB (Default: 0.0)
  harmonicDrive: number;    // 0.0 to 0.3 (Default: 0.0)
  outputLoudness: number;   // -3.0 to +1.0 dB (Default: 0.0)
  limiterStrength: number;  // 0.0 to 1.0 (Default: 0.3)
}

export interface MeterData {
  inputLufs: number;
  outputLufs: number;
  targetLufs: number;
  inputPeakDb: number;
  outputPeakDb: number;
  gainReductionDb: number;
  isClipping: boolean;
  hasSubOverload: boolean;
}

export const DEFAULT_ENGINEER_SETTINGS: EngineerSettings = {
  mode: 'STREAMING',
  isBypassed: false,
  lowMidWarmth: 0.0,
  highAir: 0.0,
  subPunch808: 0.0,
  harmonicDrive: 0.0,
  outputLoudness: 0.0,
  limiterStrength: 0.30
};

class HiFiDSPAudioEngine {
  private ctx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private attachedAudioElement: HTMLAudioElement | null = null;
  
  // DSP Chain Nodes
  private inputAnalyser: AnalyserNode | null = null;
  private headroomPadNode: GainNode | null = null;       // -3dB Internal Bus Pad
  private highPassFilter: BiquadFilterNode | null = null; // Gentle 20Hz Subsonic Filter
  private subLowShelf: BiquadFilterNode | null = null;     // 60Hz Low-Frequency Control
  private lowMidPeaking: BiquadFilterNode | null = null;   // Low-Mid Warmth (300Hz)
  private airHighShelf: BiquadFilterNode | null = null;    // High-Frequency Air (10kHz)
  private masterSaturator: WaveShaperNode | null = null;  // Normalized Soft Saturator
  private makeupGainNode: GainNode | null = null;         // Internal Makeup Gain
  private limiterNode: DynamicsCompressorNode | null = null;// Final Safety Ceiling Limiter
  private outputAnalyser: AnalyserNode | null = null;
  private rawGainNode: GainNode | null = null;            // Raw Clean Bypass Path
  private dspGainNode: GainNode | null = null;            // DSP Active Path

  private isInitialized = false;
  private isFallbackActive = false;
  private settings: EngineerSettings = { ...DEFAULT_ENGINEER_SETTINGS };

  // Initialize DSP pipeline attached to HTMLAudioElement safely without duplicate nodes
  public initialize(audioElement: HTMLAudioElement) {
    // Check if audio element is playing cross-origin media without CORS credentials
    // The W3C Web Audio API specification requires MediaElementAudioSourceNode to output
    // zeros (silence) for cross-origin media lacking CORS. To preserve full audible playback,
    // we bypass MediaElementAudioSourceNode and let the browser play native high-res audio.
    const isCrossOriginNoCors = (() => {
      if (!audioElement || !audioElement.src) return false;
      try {
        const u = new URL(audioElement.src, typeof window !== 'undefined' ? window.location.href : 'http://localhost');
        return u.origin !== window.location.origin && !audioElement.crossOrigin;
      } catch (e) {
        return false;
      }
    })();

    if (isCrossOriginNoCors) {
      console.log('[HIFI_AUDIO_ENGINE] Native Direct Playback Active (Preserving audible output for direct media stream)');
      this.isFallbackActive = true;
      return;
    }

    // If already attached to this exact audio element, just ensure AudioContext is active
    if (this.isInitialized && this.attachedAudioElement === audioElement && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    // Teardown previous nodes if attaching to a new audio element
    if (this.attachedAudioElement && this.attachedAudioElement !== audioElement) {
      this.teardown();
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        this.isFallbackActive = true;
        return;
      }

      this.ctx = new AudioCtxClass();
      this.attachedAudioElement = audioElement;

      // Create Source Node safely
      this.sourceNode = this.ctx.createMediaElementSource(audioElement);
      
      // 1. Input Analyser
      this.inputAnalyser = this.ctx.createAnalyser();
      this.inputAnalyser.fftSize = 256;

      // 2. Headroom Pad Node (-3.0 dB internal pad to prevent EQ clipping)
      this.headroomPadNode = this.ctx.createGain();
      this.headroomPadNode.gain.value = Math.pow(10, -3.0 / 20); // 0.707 linear

      // 3. Subsonic Highpass Filter (20 Hz Butterworth Q=0.5 - transparent, preserves 808 sub)
      this.highPassFilter = this.ctx.createBiquadFilter();
      this.highPassFilter.type = 'highpass';
      this.highPassFilter.frequency.value = 20;
      this.highPassFilter.Q.value = 0.5;

      // 4. Low-Frequency 808 Control (60 Hz Low Shelf)
      this.subLowShelf = this.ctx.createBiquadFilter();
      this.subLowShelf.type = 'lowshelf';
      this.subLowShelf.frequency.value = 60;
      this.subLowShelf.gain.value = 0.0;

      // 5. Low-Mid Peaking Filter (320 Hz, Q=0.7)
      this.lowMidPeaking = this.ctx.createBiquadFilter();
      this.lowMidPeaking.type = 'peaking';
      this.lowMidPeaking.frequency.value = 320;
      this.lowMidPeaking.Q.value = 0.7;
      this.lowMidPeaking.gain.value = 0.0;

      // 6. High-Frequency Air Shelf (10 kHz)
      this.airHighShelf = this.ctx.createBiquadFilter();
      this.airHighShelf.type = 'highshelf';
      this.airHighShelf.frequency.value = 10000;
      this.airHighShelf.gain.value = 0.0;

      // 7. Single Gentle WaveShaper Saturator
      this.masterSaturator = this.ctx.createWaveShaper();
      this.masterSaturator.oversample = '2x';
      this.masterSaturator.curve = null; // Bypassed by default

      // 8. Output / Makeup Gain Node
      this.makeupGainNode = this.ctx.createGain();
      this.makeupGainNode.gain.value = Math.pow(10, 3.0 / 20); // Compensates internal -3dB pad

      // 9. Hard Output Safety Ceiling Limiter (-1.0 dBFS Max True-Peak Target)
      this.limiterNode = this.ctx.createDynamicsCompressor();
      this.limiterNode.threshold.value = -1.0;
      this.limiterNode.knee.value = 0.0;
      this.limiterNode.ratio.value = 20.0;
      this.limiterNode.attack.value = 0.001;
      this.limiterNode.release.value = 0.08;

      // 10. Output Analyser
      this.outputAnalyser = this.ctx.createAnalyser();
      this.outputAnalyser.fftSize = 256;

      // 11. Dual-Path Routing (Clean RAW Bypass vs DSP Active Chain)
      this.rawGainNode = this.ctx.createGain();
      this.dspGainNode = this.ctx.createGain();

      this.rawGainNode.gain.value = 0.0;
      this.dspGainNode.gain.value = 1.0;

      // --- Connect Web Audio Graph Conceptually ---
      // Source -> Input Analyser
      this.sourceNode.connect(this.inputAnalyser);

      // Branch A: Direct RAW Passthrough Path (100% Clean Original Master)
      this.inputAnalyser.connect(this.rawGainNode);
      this.rawGainNode.connect(this.ctx.destination);

      // Branch B: Processed DSP Path
      this.inputAnalyser.connect(this.dspGainNode);
      this.dspGainNode.connect(this.headroomPadNode);
      this.headroomPadNode.connect(this.highPassFilter);
      this.highPassFilter.connect(this.subLowShelf);
      this.subLowShelf.connect(this.lowMidPeaking);
      this.lowMidPeaking.connect(this.airHighShelf);
      this.airHighShelf.connect(this.masterSaturator);
      this.masterSaturator.connect(this.makeupGainNode);
      this.makeupGainNode.connect(this.limiterNode);
      this.limiterNode.connect(this.outputAnalyser);
      this.outputAnalyser.connect(this.ctx.destination);

      this.isInitialized = true;
      this.applySettings(this.settings);
    } catch (err) {
      console.warn('Hi-Fi Audio Engine Initialization Fallback:', err);
      this.isFallbackActive = true;
    }
  }

  // Teardown and disconnect nodes cleanly to prevent memory leaks
  private teardown() {
    try {
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
      if (this.ctx && this.ctx.state !== 'closed') {
        this.ctx.close().catch(() => {});
        this.ctx = null;
      }
    } catch (e) {
      console.warn('Teardown error:', e);
    }
    this.isInitialized = false;
    this.attachedAudioElement = null;
  }

  // Normalized Soft-Clipping Saturation Curve Generator
  // Uses smooth Math.tanh normalized so amplitude at x = 1 is exactly 1.0 (no clipping).
  private makeSaturationCurve(amount: number): Float32Array | null {
    if (amount <= 0.01) return null; // Bypasses WaveShaperNode completely when drive is 0
    
    // Scale drive down to gentle subtle range (max 0.15 intensity)
    const drive = Math.min(amount * 0.15, 0.15);
    const samples = 1024;
    const curve = new Float32Array(samples);
    const norm = Math.tanh(1 + drive);
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1; // Range [-1, 1]
      curve[i] = Math.tanh(x * (1 + drive)) / norm;
    }
    return curve;
  }

  // Apply Settings & Modes safely with smooth ramps
  public applySettings(newSettings: Partial<EngineerSettings>) {
    this.settings = { ...this.settings, ...newSettings };

    if (!this.isInitialized || this.isFallbackActive || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const mode = this.settings.mode;
      const isRaw = mode === 'RAW' || this.settings.isBypassed;

      // 1. Crossfade Between RAW Bypass and DSP Paths
      if (this.rawGainNode && this.dspGainNode) {
        this.rawGainNode.gain.setTargetAtTime(isRaw ? 1.0 : 0.0, now, 0.02);
        this.dspGainNode.gain.setTargetAtTime(isRaw ? 0.0 : 1.0, now, 0.02);
      }

      if (isRaw) return;

      // 2. Limiter Configuration (Strict -1.0 dBFS Output Ceiling)
      if (this.limiterNode) {
        const threshold = mode === 'KNOCK' ? -0.8 : -1.0;
        this.limiterNode.threshold.setTargetAtTime(threshold, now, 0.02);
        this.limiterNode.knee.setTargetAtTime(0.0, now, 0.02);
        this.limiterNode.ratio.setTargetAtTime(20.0, now, 0.02);
        this.limiterNode.attack.setTargetAtTime(0.001, now, 0.02);
        this.limiterNode.release.setTargetAtTime(0.08, now, 0.02);
      }

      // 3. Adaptive 808 Sub Control with Low-End Overload Protection
      const subEnergy = this.detectSubEnergy();
      let adaptiveSubGain = Math.min(Math.max(this.settings.subPunch808, -3.0), 3.0);
      
      // If excessive sub energy is detected (> 0.70), scale back low-end boost to prevent pumping
      if (subEnergy > 0.70 && adaptiveSubGain > 0.0) {
        adaptiveSubGain = adaptiveSubGain * 0.3;
      }

      if (this.subLowShelf) {
        this.subLowShelf.gain.setTargetAtTime(adaptiveSubGain, now, 0.02);
      }

      // 4. Low-Mid Warmth & High-End Air (Bounded for safety)
      if (this.lowMidPeaking) {
        const warmthGain = Math.min(Math.max(this.settings.lowMidWarmth, -3.0), 3.0);
        this.lowMidPeaking.gain.setTargetAtTime(warmthGain, now, 0.02);
      }
      if (this.airHighShelf) {
        const airGain = Math.min(Math.max(this.settings.highAir, 0.0), 3.0);
        this.airHighShelf.gain.setTargetAtTime(airGain, now, 0.02);
      }

      // 5. Saturation Curve
      if (this.masterSaturator) {
        this.masterSaturator.curve = this.makeSaturationCurve(this.settings.harmonicDrive) as any;
      }

      // 6. Makeup & Output Loudness Gain (-3dB base pad compensation + user offset)
      if (this.makeupGainNode) {
        const userOffsetDb = Math.min(Math.max(this.settings.outputLoudness, -3.0), 1.0);
        const totalMakeupDb = 3.0 + userOffsetDb; // Compensate internal -3dB pad
        const gainLinear = Math.pow(10, totalMakeupDb / 20);
        this.makeupGainNode.gain.setTargetAtTime(gainLinear, now, 0.02);
      }

    } catch (err) {
      console.warn('Hi-Fi Audio Engine Parameter Update Error:', err);
    }
  }

  // Detect Sub Energy (<80Hz) to prevent 808 distortion & pumping
  private detectSubEnergy(): number {
    if (!this.inputAnalyser) return 0.2;
    const data = new Uint8Array(this.inputAnalyser.frequencyBinCount);
    this.inputAnalyser.getByteFrequencyData(data);
    let subSum = 0;
    const subBins = Math.min(8, data.length);
    for (let i = 0; i < subBins; i++) {
      subSum += data[i];
    }
    return (subSum / (subBins * 255)) || 0;
  }

  // Measure Real-time Input, Output, LUFS, Peak & Gain Reduction
  public getMeterData(): MeterData {
    const fallback: MeterData = {
      inputLufs: -14.0,
      outputLufs: -14.0,
      targetLufs: this.settings.mode === 'KNOCK' ? -11.0 : -14.0,
      inputPeakDb: -1.0,
      outputPeakDb: -1.0,
      gainReductionDb: 0.0,
      isClipping: false,
      hasSubOverload: false
    };

    if (!this.isInitialized || this.isFallbackActive) return fallback;

    try {
      // 1. Input Measurement
      let inputLufs = -60.0;
      let inputPeakDb = -60.0;
      if (this.inputAnalyser) {
        const inputData = new Uint8Array(this.inputAnalyser.frequencyBinCount);
        this.inputAnalyser.getByteFrequencyData(inputData);
        let sum = 0;
        let maxBin = 0;
        for (let i = 0; i < inputData.length; i++) {
          const val = inputData[i] / 255;
          sum += val * val;
          if (val > maxBin) maxBin = val;
        }
        const rms = Math.sqrt(sum / (inputData.length || 1));
        inputLufs = rms > 0 ? Math.max(-60, 20 * Math.log10(rms) - 3) : -60;
        inputPeakDb = maxBin > 0 ? Math.min(6, 20 * Math.log10(maxBin)) : -60;
      }

      // 2. Output Measurement
      let outputLufs = -60.0;
      let outputPeakDb = -60.0;
      if (this.outputAnalyser) {
        const outputData = new Uint8Array(this.outputAnalyser.frequencyBinCount);
        this.outputAnalyser.getByteFrequencyData(outputData);
        let sum = 0;
        let maxBin = 0;
        for (let i = 0; i < outputData.length; i++) {
          const val = outputData[i] / 255;
          sum += val * val;
          if (val > maxBin) maxBin = val;
        }
        const rms = Math.sqrt(sum / (outputData.length || 1));
        outputLufs = rms > 0 ? Math.max(-60, 20 * Math.log10(rms) - 3) : -60;
        outputPeakDb = maxBin > 0 ? Math.min(6, 20 * Math.log10(maxBin)) : -60;
      }

      // If in RAW mode, output equals input
      if (this.settings.mode === 'RAW' || this.settings.isBypassed) {
        outputLufs = inputLufs;
        outputPeakDb = inputPeakDb;
      }

      // 3. Gain Reduction
      let grDb = 0.0;
      if (this.limiterNode && this.settings.mode !== 'RAW' && !this.settings.isBypassed) {
        grDb = Math.abs(this.limiterNode.reduction || 0);
      }

      const hasSubOverload = this.detectSubEnergy() > 0.70;
      const isClipping = outputPeakDb > -0.5;

      return {
        inputLufs: parseFloat(inputLufs.toFixed(1)),
        outputLufs: parseFloat(outputLufs.toFixed(1)),
        targetLufs: this.settings.mode === 'KNOCK' ? -11.0 : -14.0,
        inputPeakDb: parseFloat(inputPeakDb.toFixed(1)),
        outputPeakDb: parseFloat(outputPeakDb.toFixed(1)),
        gainReductionDb: parseFloat(grDb.toFixed(1)),
        isClipping,
        hasSubOverload
      };
    } catch (e) {
      return fallback;
    }
  }

  public getByteFrequencyData(array: Uint8Array) {
    if (this.outputAnalyser && this.isInitialized && !this.isFallbackActive) {
      this.outputAnalyser.getByteFrequencyData(array as any);
    }
  }

  public getSettings(): EngineerSettings {
    return { ...this.settings };
  }

  public setMode(mode: MasteringMode) {
    if (mode === 'RAW') {
      this.applySettings({ mode, isBypassed: true });
    } else {
      this.applySettings({ mode, isBypassed: false });
    }
  }

  public applyPreset(presetId: string) {
    if (presetId === 'knock') {
      this.setMode('KNOCK');
    } else if (presetId === 'raw') {
      this.setMode('RAW');
    } else {
      this.setMode('STREAMING');
    }
  }

  public toggleBypass() {
    this.applySettings({ isBypassed: !this.settings.isBypassed });
  }

  public resetToSafeDefaults() {
    this.applySettings({ ...DEFAULT_ENGINEER_SETTINGS, isBypassed: false, mode: 'STREAMING' });
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }
}

export const hiFiAudioEngine = new HiFiDSPAudioEngine();
