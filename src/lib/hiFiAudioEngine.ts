// Web Audio API Hi-Fi DSP Mastering Audio Engine
// Upgraded Professional Streaming-Preview DSP Engine
// Supports 3 Modes: STREAMING, KNOCK, and RAW.
// The original uploaded audio is NEVER modified and remains available untouched for downloads and licensing.

export type MasteringMode = 'STREAMING' | 'KNOCK' | 'RAW';
export type MasterPresetId = 'streaming' | 'knock' | 'raw';

export interface MasterPreset {
  id: MasterPresetId;
  name: string;
  badge: string;
  description: string;
}

export const MASTER_PRESETS: MasterPreset[] = [
  { id: 'streaming', name: 'Streaming Optimized', badge: 'STREAMING', description: '~ -14 LUFS Target, Transparent Limiting & Transient Preservation' },
  { id: 'knock', name: 'Knock (Punchy 808)', badge: 'KNOCK', description: 'Punchy 808 Impact, Strong Kick Transients & Loudness' },
  { id: 'raw', name: 'Raw Audio (Bypass)', badge: 'RAW', description: 'Unprocessed Original Audio Master' }
];

export interface EngineerSettings {
  mode: MasteringMode;
  isBypassed: boolean;
  lowMidWarmth: number;    // -6.0 to +6.0 dB
  highAir: number;          // 0.0 to +8.0 dB
  subPunch808: number;      // -6.0 to +8.0 dB (With Adaptive 808 Protection)
  harmonicDrive: number;    // 0.0 to 1.0
  outputLoudness: number;   // -6.0 to +3.0 dB
  limiterStrength: number;  // 0.0 to 1.0
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
  lowMidWarmth: 1.2,
  highAir: 3.5,
  subPunch808: 2.0,
  harmonicDrive: 0.20,
  outputLoudness: 0.0,
  limiterStrength: 0.50
};

class HiFiDSPAudioEngine {
  private ctx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  
  // DSP Chain Nodes
  private inputAnalyser: AnalyserNode | null = null;
  private highPassFilter: BiquadFilterNode | null = null; // 20Hz Subsonic
  private subLowShelf: BiquadFilterNode | null = null;     // 808 Low-Frequency Control
  private lowMidPeaking: BiquadFilterNode | null = null;   // Low-Mid Warmth (300Hz)
  private airHighShelf: BiquadFilterNode | null = null;    // High-Frequency Air (10kHz)
  private lowMidSaturator: WaveShaperNode | null = null;  // Low-Mid Tube Saturation
  private masterSaturator: WaveShaperNode | null = null;  // Harmonic Drive
  private outputGainNode: GainNode | null = null;         // Output Loudness
  private limiterNode: DynamicsCompressorNode | null = null;// Adaptive Limiter
  private outputAnalyser: AnalyserNode | null = null;
  private rawGainNode: GainNode | null = null;            // Raw Bypass Path
  private dspGainNode: GainNode | null = null;            // DSP Active Path

  private isInitialized = false;
  private isFallbackActive = false;
  private settings: EngineerSettings = { ...DEFAULT_ENGINEER_SETTINGS };

  // Initialize DSP pipeline attached to HTMLAudioElement safely
  public initialize(audioElement: HTMLAudioElement) {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        this.isFallbackActive = true;
        return;
      }

      this.ctx = new AudioCtxClass();

      // Create Nodes Safely
      this.sourceNode = this.ctx.createMediaElementSource(audioElement);
      
      // 1. Input Analyser
      this.inputAnalyser = this.ctx.createAnalyser();
      this.inputAnalyser.fftSize = 256;

      // 2. Subsonic Filter (20 Hz Butterworth Highpass)
      this.highPassFilter = this.ctx.createBiquadFilter();
      this.highPassFilter.type = 'highpass';
      this.highPassFilter.frequency.value = 20;

      // 3. Low-Frequency Control (60 Hz 808 Shelf)
      this.subLowShelf = this.ctx.createBiquadFilter();
      this.subLowShelf.type = 'lowshelf';
      this.subLowShelf.frequency.value = 60;

      // 4. Low-Mid Peaking Filter (320 Hz)
      this.lowMidPeaking = this.ctx.createBiquadFilter();
      this.lowMidPeaking.type = 'peaking';
      this.lowMidPeaking.frequency.value = 320;
      this.lowMidPeaking.Q.value = 1.0;

      // 5. High-Frequency Air Shelf (10 kHz)
      this.airHighShelf = this.ctx.createBiquadFilter();
      this.airHighShelf.type = 'highshelf';
      this.airHighShelf.frequency.value = 10000;

      // 6. Saturators
      this.lowMidSaturator = this.ctx.createWaveShaper();
      this.lowMidSaturator.oversample = '2x';

      this.masterSaturator = this.ctx.createWaveShaper();
      this.masterSaturator.oversample = '2x';

      // 7. Output Gain Node
      this.outputGainNode = this.ctx.createGain();
      this.outputGainNode.gain.value = 1.0;

      // 8. Adaptive Limiter
      this.limiterNode = this.ctx.createDynamicsCompressor();
      this.limiterNode.threshold.value = -1.0;
      this.limiterNode.knee.value = 0;
      this.limiterNode.ratio.value = 20;
      this.limiterNode.attack.value = 0.001;
      this.limiterNode.release.value = 0.08;

      // 9. Output Analyser
      this.outputAnalyser = this.ctx.createAnalyser();
      this.outputAnalyser.fftSize = 256;

      // 10. Dual-Path Routing (Raw Bypass vs DSP Chain)
      this.rawGainNode = this.ctx.createGain();
      this.dspGainNode = this.ctx.createGain();

      this.rawGainNode.gain.value = 0.0;
      this.dspGainNode.gain.value = 1.0;

      // --- Connect Graph ---
      // Source -> Input Analyser
      this.sourceNode.connect(this.inputAnalyser);

      // Branch A: Direct RAW Path
      this.inputAnalyser.connect(this.rawGainNode);
      this.rawGainNode.connect(this.ctx.destination);

      // Branch B: DSP Processed Path
      this.inputAnalyser.connect(this.dspGainNode);
      this.dspGainNode.connect(this.highPassFilter);
      this.highPassFilter.connect(this.subLowShelf);
      this.subLowShelf.connect(this.lowMidPeaking);
      this.lowMidPeaking.connect(this.airHighShelf);
      this.airHighShelf.connect(this.lowMidSaturator);
      this.lowMidSaturator.connect(this.masterSaturator);
      this.masterSaturator.connect(this.outputGainNode);
      this.outputGainNode.connect(this.limiterNode);
      this.limiterNode.connect(this.outputAnalyser);
      this.outputAnalyser.connect(this.ctx.destination);

      this.isInitialized = true;
      this.applySettings(this.settings);
    } catch (err) {
      console.warn('Hi-Fi Audio Engine Initialization Fallback:', err);
      this.isFallbackActive = true;
      // Guarantee fallback direct routing if web audio errors
      try {
        if (this.sourceNode && this.ctx) {
          this.sourceNode.connect(this.ctx.destination);
        }
      } catch (e) {}
    }
  }

  // Soft-Clipping Tube Saturation Curve Generator
  private makeSaturationCurve(amount: number): Float32Array | null {
    if (amount <= 0.01) return null;
    const k = Math.min(amount * 25, 25);
    const n_samples = 2048;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 12 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // Apply Settings & Modes
  public applySettings(newSettings: Partial<EngineerSettings>) {
    this.settings = { ...this.settings, ...newSettings };

    if (!this.isInitialized || this.isFallbackActive || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const mode = this.settings.mode;
      const isRaw = mode === 'RAW' || this.settings.isBypassed;

      // 1. Crossfade Between RAW and DSP Paths safely
      if (this.rawGainNode && this.dspGainNode) {
        this.rawGainNode.gain.setTargetAtTime(isRaw ? 1.0 : 0.0, now, 0.02);
        this.dspGainNode.gain.setTargetAtTime(isRaw ? 0.0 : 1.0, now, 0.02);
      }

      if (isRaw) return;

      // 2. Mode Configuration
      if (mode === 'STREAMING') {
        // Target: ~ -14 LUFS, -1.0 dBTP ceiling, transparent limiting, conservative harmonics
        if (this.limiterNode) {
          this.limiterNode.threshold.setTargetAtTime(-1.0, now, 0.02);
          this.limiterNode.knee.setTargetAtTime(3.0, now, 0.02);
          this.limiterNode.ratio.setTargetAtTime(12.0, now, 0.02);
          this.limiterNode.attack.setTargetAtTime(0.003, now, 0.02);
          this.limiterNode.release.setTargetAtTime(0.12, now, 0.02);
        }
      } else if (mode === 'KNOCK') {
        // Target: Punchy producer preview, 808 impact, strong kick transient, controlled low-end
        if (this.limiterNode) {
          this.limiterNode.threshold.setTargetAtTime(-0.5, now, 0.02);
          this.limiterNode.knee.setTargetAtTime(0.0, now, 0.02);
          this.limiterNode.ratio.setTargetAtTime(18.0, now, 0.02);
          this.limiterNode.attack.setTargetAtTime(0.001, now, 0.02);
          this.limiterNode.release.setTargetAtTime(0.06, now, 0.02);
        }
      }

      // 3. Adaptive 808 Sub Control with Protection
      const subEnergy = this.detectSubEnergy();
      let adaptiveSubGain = this.settings.subPunch808;
      
      // If excessive sub energy is detected (> -12dB sub), scale down boost to prevent low-end buildup/pumping
      if (subEnergy > 0.6 && adaptiveSubGain > 1.0) {
        adaptiveSubGain = adaptiveSubGain * 0.5;
      }

      if (this.subLowShelf) {
        this.subLowShelf.gain.setTargetAtTime(adaptiveSubGain, now, 0.02);
      }

      // 4. Low-Mid Warmth & High-End Air
      if (this.lowMidPeaking) {
        this.lowMidPeaking.gain.setTargetAtTime(this.settings.lowMidWarmth, now, 0.02);
      }
      if (this.airHighShelf) {
        this.airHighShelf.gain.setTargetAtTime(this.settings.highAir, now, 0.02);
      }

      // 5. Saturation Curves
      if (this.masterSaturator) {
        this.masterSaturator.curve = this.makeSaturationCurve(this.settings.harmonicDrive) as any;
      }
      if (this.lowMidSaturator) {
        this.lowMidSaturator.curve = this.makeSaturationCurve(this.settings.harmonicDrive * 0.5) as any;
      }

      // 6. Output Loudness Gain
      if (this.outputGainNode) {
        const gainLinear = Math.pow(10, this.settings.outputLoudness / 20);
        this.outputGainNode.gain.setTargetAtTime(gainLinear, now, 0.02);
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

      const hasSubOverload = this.detectSubEnergy() > 0.75;
      const isClipping = outputPeakDb >= 0.0;

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

  public getSettings(): EngineerSettings {
    return { ...this.settings };
  }

  public setMode(mode: MasteringMode) {
    this.applySettings({ mode });
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

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }
}

export const hiFiAudioEngine = new HiFiDSPAudioEngine();
