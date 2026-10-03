import React, { useState, useEffect } from 'react';
import { 
  Upload, Image as ImageIcon, Music, Tag, DollarSign, CheckCircle, 
  ArrowRight, ArrowLeft, Shield, Globe, Settings, FileAudio, 
  Archive, Cloud, Youtube, AlertTriangle, List, Layers, 
  Calendar, Lock, Link as LinkIcon, HelpCircle, X, Play, Pause, 
  Volume2, Sparkles, RefreshCw, Key, Share2, Copy, Check, Eye, 
  EyeOff, Sliders, Cpu, Video, Download, FileText, PieChart, 
  CreditCard, Radio, Hash, Mic, Award, Zap, CheckSquare, Square,
  HardDrive, Wifi, Server, Activity, Database, Scissors, BarChart,
  Wrench, Trash2, ShieldCheck, CornerUpLeft, Filter, Palette, Code,
  Monitor, Smartphone, Tablet, Layers3, Sun, Moon, Eye as EyeIcon,
  Maximize, SlidersHorizontal, RefreshCcw
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const steps = [
  { id: 1, name: 'Files & Watermark', icon: Music },
  { id: 2, name: 'AI Metadata & Attributes', icon: Cpu },
  { id: 3, name: 'Audio Transcoding & Engine', icon: HardDrive },
  { id: 4, name: 'Cloud Health & Processing', icon: Activity },
  { id: 5, name: 'Visual Branding & Scaling', icon: Palette },
  { id: 6, name: 'Stems & Cloud Storage', icon: Archive },
  { id: 7, name: 'Licensing & Contracts', icon: DollarSign },
  { id: 8, name: 'Privacy & Free Unlocks', icon: Lock },
  { id: 9, name: 'Video Generator & Socials', icon: Video },
  { id: 10, name: 'Storefront & Analytics', icon: Globe },
  { id: 11, name: 'Final Launch Review', icon: CheckCircle },
];

export const BeatUploader = () => {
  const [currentStep, setCurrentStep] = useState(1);

  // --- COMPREHENSIVE STATE FOR ALL 150+ FEATURES ---
  const [formData, setFormData] = useState({
    // Basic Track Info
    title: 'VALKYRIE',
    bpm: '144',
    key: 'C Minor',
    primaryGenre: 'Trap',
    subGenre: 'UK Drill',
    typeBeatArtist: 'Drake x Future',
    description: 'Dark atmospheric trap instrumental with heavy sliding 808s and brass stabs.',
    durationMs: 204580,
    audioFileName: 'Valkyrie_Master_24bit.wav',
    coverArtName: 'Valkyrie_Artwork_3000x3000.jpg',
    lyrics: '[Intro]\nYeah, KRAEZELV on the track...\n[Chorus]\nSliding through the dark...',

    // Tags & Attributes
    tags: ['DRILL', 'DARKTRAP', 'HARD808', 'CINEMATIC', 'CHARTTOPPER'],
    moods: ['Aggressive', 'Dark', 'Energetic'],
    instruments: ['808 Sub', 'Piano', 'Brass Hooks', 'Hi-Hat Rolls', 'Synth Pads'],
    associatedSoundKit: 'VALKYRIE Drill Drum Kit Vol. 1',

    // Watermarking & Audio Tagging
    globalVoicetagProfile: 'KRAEZELV_Official_Signature.wav',
    voicetagVolumeDb: -3,
    voicetagInterval: '30s',
    voicetagIntroOnly: false,
    isWatermarkEnabled: true,
    isPreTaggedUpload: false,
    untaggedLockedForCheckout: true,
    isPlayingWatermarkedPreview: false,

    // AI Metadata
    isScanningKey: false,
    detectedKeyInfo: 'C Minor (99.4% Harmonic Confidence)',
    tapTimeStamps: [] as number[],

    // Master Transcoding
    audioFormatCodec: '24-bit PCM WAV',
    bitDepth: '24-bit / 32-bit Float',
    sampleRate: '44.1 kHz',
    isSampleRateValid: true,
    md5Fingerprint: '9f8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    sanitizedFileName: 'Valkyrie_Master_24bit.wav',
    originalRawFileName: 'Valkyrie 🔥 (final master) #1.wav',
    
    // Codec & Quality Selectors
    mp3BitrateCap: '320kbps',
    vbrQualityPreset: 'V0 (Max Quality)',
    ditheringModel: 'Triangular Noise Shaping',
    normalizationPeakCeilingDb: -1.0,
    vbrScaleControl: 0,
    bufferSizeKb: '128KB',

    // Processing Filters
    dcOffsetCorrection: true,
    transientProtection: true,
    phaseLinearization: true,
    silentHeaderStripped: true,
    silentHeaderStrippedMs: 120,
    tailFadeOutInjected: true,
    tailFadeDurationSec: 2,
    monoDownmixActive: false,
    chunkEncryptionActive: true,
    preDelayCorrectionMs: -15,

    // Diagnostics & Meters
    stereoCorrelation: 0.98,
    stereoFieldStatus: 'Phase Correlation Optimal (+0.98)',
    clipDetectionCount: 0,
    compressionArtifactsCount: 0,
    structuralSilenceGapsCount: 0,
    loudestPeakPointMs: 102120,
    
    // Trimmer Canvas & Preview
    trimStartSec: 0,
    trimEndSec: 204.58,
    
    // Legacy Version Vault
    legacyVersions: [
      { id: 'v1', name: 'v1.0 Initial Mix Master', date: '2026-09-15', size: '52.1 MB' },
      { id: 'v2', name: 'v1.1 Vocal Boost Master', date: '2026-09-22', size: '53.8 MB' },
      { id: 'v3', name: 'v2.0 Current Active Master', date: '2026-10-01', size: '54.2 MB' },
    ],

    // Parallel Queue & Network
    parallelUploadThreads: 4,
    networkBandwidthMbps: 18.4,
    cdnEdgeRegion: 'US-East (Virginia Edge CDN)',
    uploadProgressRingPct: 100,
    uploadSpeedKbps: 4850,
    ftpPortEndpoint: 'ftp.kraezelv.com:2121 (User: kv_producer_01)',
    cloudMultiBackupStatus: 'Mirrored (AWS S3, GCP Storage, Cloudflare R2)',
    spectrumLevels: { low: 85, mid: 68, high: 74 },

    // ==========================================
    // NEW: CLOUD HEALTH & FAIL-SAFE AUDIO (1-19, 77-100)
    // ==========================================
    renderQualityScore: '99.2% Fidelity Match',
    snrValueDb: 78,
    truePeakDbTP: -0.8,
    isFailSafeActive: true,
    catalogHealthStatus: '100% Intact (0 Corrupted)',
    priorityQueueActive: true,
    duplicateCheckStatus: '0 Duplicates Detected',
    storageCapacityPct: 42,
    phaseInverted: false,
    loudnessProfile: 'Urban / Trap (-8.0 LUFS Target)',
    stereoBalanceLeftPct: 50,
    stereoBalanceRightPct: 50,
    decodingTarget: 'desktop', // desktop, mobile, tv
    keyRotationStatus: 'AES-256 Keys Rotated 2 Hours Ago',
    uploadSpeedChartData: [12, 14, 18, 16, 19, 21, 18.4],

    // ==========================================
    // NEW: VISUAL BRANDING & ASSET SCALING (101-153)
    // ==========================================
    webpConvertedSize: '420 KB (Saved 82%)',
    svgLogoFileName: 'KRAEZELV_Vector_Logo.svg',
    gifBannerActive: false,
    videoBannerUrl: 'https://kraezelv.com/assets/video_banner.mp4',
    extractedPalette: ['#000000', '#FFFFFF', '#10B981', '#3B82F6', '#EC4899'],
    cssOverrideCode: '/* Custom Storefront Overrides */\n.store-header { text-transform: uppercase; letter-spacing: 0.2em; }',
    parallaxEnabled: true,
    exifStrippedCount: 14,
    breakpointPreview: 'desktop', // mobile, tablet, desktop
    fontFamily: 'Inter, sans-serif',
    graphicWatermarkStamped: true,
    brightnessLevel: 100, // 50 to 150
    contrastLevel: 100, // 50 to 150
    saturationLevel: 100, // 0 to 200
    gammaLevel: 1.0, // 0.8 to 1.4
    textureOverlay: 'none', // none, grain, grit, paper
    borderRadiusPx: 4,
    boxShadowPx: 20,
    hoverAccentColor: '#FFFFFF',
    maskShape: 'square', // square, rounded, circle, diamond
    layoutDensity: 'comfortable', // comfortable, compact
    promoPopupTitle: 'SPECIAL FLASH PROMO',
    promoPopupOffer: 'BUY 2 BEATS, GET 1 FREE',
    promoPopupActive: true,

    // Stems & Cloud Storage
    stemZipFileName: 'Valkyrie_WAV_Stems_Bundle.zip',
    thirdPartyCloudLink: 'https://dropbox.com/s/kraezelv/valkyrie_stems.zip',
    cloudPasskey: 'KV-982F-X7L1',
    instantPasskeyDelivery: true,
    isEvaluatingStems: false,
    stemPeakVolumeStatus: 'Pass (-0.3 dBFS Peak - No Clipping)',

    // Licensing & Contracts
    selectedBlueprint: 'mid',
    licenses: {
      basic: { name: 'Basic MP3 Lease', price: '29.99', enabled: true, files: ['MP3', 'PDF Contract'], streamCap: '100,000', salesCap: '5,000 Copies', producerRoyaltyPct: '50%', writerRoyaltyPct: '50%', autoAttachStems: false },
      premium: { name: 'Premium WAV Lease', price: '49.99', enabled: true, files: ['MP3', 'WAV', 'PDF Contract'], streamCap: '500,000', salesCap: '10,000 Copies', producerRoyaltyPct: '50%', writerRoyaltyPct: '50%', autoAttachStems: false },
      unlimited: { name: 'Platinum Unlimited Rights', price: '99.99', enabled: true, files: ['MP3', 'WAV', 'Stems ZIP', 'PDF Contract'], streamCap: 'Unlimited Streams', salesCap: 'Unlimited Sales', producerRoyaltyPct: '50%', writerRoyaltyPct: '50%', autoAttachStems: true },
      exclusive: { name: 'Full Exclusive Rights', price: '499.99', enabled: true, files: ['MP3', 'WAV', 'Stems ZIP', 'PDF Contract', 'Ownership Transfer'], streamCap: 'Unlimited Streams', salesCap: 'Unlimited Sales', producerRoyaltyPct: '50%', writerRoyaltyPct: '50%', autoAttachStems: true },
    },
    exclusiveAutoPullDown: true,
    bulkPriceModifierPct: 0,

    // Privacy & Free Unlocks
    isPublic: true,
    releaseDate: new Date().toISOString().slice(0, 10),
    releaseTime: '12:00',
    vipShareLink: 'https://kraezelv.com/vip/beat/valkyrie?token=sec_98124x',
    isPasswordProtected: false,
    previewPassword: '',
    isFreeDownload: true,
    freeUnlockMechanic: 'email',
    forceWatermarkOnFree: true,
    nonCommercialAgreement: true,

    // Video & Socials
    autoPostSocials: { youtube: true, instagram: true, twitter: true, tiktok: true },
    isGeneratingVideo: false,
    videoRenderProgress: 0,
    generatedVideoUrl: 'Valkyrie_Cover_Visualizer_1080p.mp4',
    youtubeContentIdStatus: 'whitelist',
    videoDescriptionTemplate: 'KRAEZELV - VALKYRIE (Official Instrumental Video)\nBPM: 144 | Key: C Minor\nPurchase License: https://kraezelv.com/beat/valkyrie\nContact: kraezelvbeatz@gmail.com',

    // Storefront & Analytics
    infinityStoreSync: true,
    storeTabRoute: 'beats',
    coverGraphicScale: '1:1',
    embedWidth: 100,
    embedHeight: 166,
    payoutWalletConnected: true,
    payoutWalletEmail: 'kraezelvbeatz@gmail.com (Stripe & PayPal Active)',
    downloadTokenLimit: 3,
  });

  // Feedback & Copy States
  const [copiedMd5, setCopiedMd5] = useState(false);
  const [copiedPasskey, setCopiedPasskey] = useState(false);
  const [copiedVipLink, setCopiedVipLink] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [repairedHeaderMsg, setRepairedHeaderMsg] = useState('');
  const [purgedCacheMsg, setPurgedCacheMsg] = useState('');
  const [purgedCdnMsg, setPurgedCdnMsg] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Audio Playback Simulation for Watermark Preview
  const [audioProgress, setAudioProgress] = useState(0);
  const [tagTriggered, setTagTriggered] = useState(false);

  useEffect(() => {
    let interval: any;
    if (formData.isPlayingWatermarkedPreview) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          const next = (prev + 1) % 100;
          if (next % 25 === 0) {
            setTagTriggered(true);
            setTimeout(() => setTagTriggered(false), 1500);
          }
          return next;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [formData.isPlayingWatermarkedPreview]);

  // Step Navigation
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // BPM Tap Tempo
  const handleBpmTap = () => {
    const now = Date.now();
    const stamps = [...formData.tapTimeStamps, now].slice(-5);
    setFormData((prev) => ({ ...prev, tapTimeStamps: stamps }));

    if (stamps.length > 1) {
      const intervals = [];
      for (let i = 1; i < stamps.length; i++) {
        intervals.push(stamps[i] - stamps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 240) {
        setFormData((prev) => ({ ...prev, bpm: calculatedBpm.toString() }));
      }
    }
  };

  // Auto Key Scanner
  const handleKeyScan = () => {
    setFormData((prev) => ({ ...prev, isScanningKey: true }));
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        key: 'C Minor',
        isScanningKey: false,
        detectedKeyInfo: 'C Minor (Analytic Match: 99.4%)'
      }));
    }, 1200);
  };

  // Format Repair Tool
  const handleRepairHeader = () => {
    setRepairedHeaderMsg('Corrupted WAV Chunk Header Repaired Successfully!');
    setTimeout(() => setRepairedHeaderMsg(''), 3000);
  };

  // Cache Cleaner
  const handlePurgeCache = () => {
    setPurgedCacheMsg('Cleared 142.5 MB Browser Upload Cache Fragments');
    setTimeout(() => setPurgedCacheMsg(''), 3000);
  };

  // CDN Cache Purger
  const handlePurgeCdnCache = () => {
    setPurgedCdnMsg('Global Image CDN Purged across 48 Nodes!');
    setTimeout(() => setPurgedCdnMsg(''), 3000);
  };

  // Rotate Encryption Keys
  const handleRotateEncryptionKeys = () => {
    const now = new Date().toLocaleTimeString();
    setFormData((prev) => ({
      ...prev,
      keyRotationStatus: `AES-256 Keys Rotated Fresh at ${now}`
    }));
  };

  // Export JSON Metadata
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.title.toLowerCase() || 'track'}_metadata_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Passkey Generator
  const generatePasskey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'KV-';
    for (let i = 0; i < 4; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    key += '-';
    for (let i = 0; i < 4; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData((prev) => ({ ...prev, cloudPasskey: key }));
  };

  // VIP Link Generator
  const generateVipLink = () => {
    const token = 'sec_' + Math.random().toString(36).substring(2, 8);
    const link = `https://kraezelv.com/vip/beat/${formData.title.toLowerCase() || 'track'}?token=${token}`;
    setFormData((prev) => ({ ...prev, vipShareLink: link }));
  };

  // Video Render Simulation
  const renderVideo = () => {
    setFormData((prev) => ({ ...prev, isGeneratingVideo: true, videoRenderProgress: 0 }));
    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setFormData((prev) => ({ ...prev, videoRenderProgress: p }));
      if (p >= 100) {
        clearInterval(interval);
        setFormData((prev) => ({
          ...prev,
          isGeneratingVideo: false,
          generatedVideoUrl: `${formData.title || 'Track'}_1080p_Visualizer.mp4`
        }));
      }
    }, 300);
  };

  // Tag Manager
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (formData.tags.length < 10 && !formData.tags.includes(tagInput.trim().toUpperCase())) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim().toUpperCase()] }));
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tagToRemove) }));
  };

  // Preset Blueprint Loader
  const applyBlueprint = (type: 'lower' | 'mid' | 'upper' | 'highest' | 'exclusive') => {
    let prices = { basic: '19.99', premium: '39.99', unlimited: '79.99', exclusive: '299.99' };
    if (type === 'mid') prices = { basic: '29.99', premium: '49.99', unlimited: '99.99', exclusive: '499.99' };
    if (type === 'upper') prices = { basic: '39.99', premium: '69.99', unlimited: '149.99', exclusive: '799.99' };
    if (type === 'highest') prices = { basic: '49.99', premium: '89.99', unlimited: '199.99', exclusive: '999.99' };
    if (type === 'exclusive') prices = { basic: '59.99', premium: '99.99', unlimited: '249.99', exclusive: '1499.99' };

    setFormData((prev) => ({
      ...prev,
      selectedBlueprint: type,
      licenses: {
        ...prev.licenses,
        basic: { ...prev.licenses.basic, price: prices.basic },
        premium: { ...prev.licenses.premium, price: prices.premium },
        unlimited: { ...prev.licenses.unlimited, price: prices.unlimited },
        exclusive: { ...prev.licenses.exclusive, price: prices.exclusive },
      }
    }));
  };

  // Formatted duration readout
  const formatMillis = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const millis = ms % 1000;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  };

  const iframeCode = `<iframe src="https://kraezelv.com/embed/beat/${formData.title.toLowerCase() || 'track'}?theme=dark" width="${formData.embedWidth}%" height="${formData.embedHeight}" frameborder="0" allow="autoplay"></iframe>`;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 md:px-8">
      {/* HEADER & STEPPER */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-3 text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mb-2">
            <Sparkles size={14} className="text-white" /> Complete Producer Engine & Visual Suite
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
            {steps[currentStep - 1].name}
          </h2>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
            Step {currentStep} of {steps.length} — Integrated Audio & Visual Suite
          </p>
        </div>

        {/* Stepper Dots */}
        <div className="flex flex-wrap gap-1.5 max-w-md justify-end">
          {steps.map((step) => {
            const StepIcon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "p-3 border transition-all flex items-center justify-center relative group",
                  isActive 
                    ? "bg-white text-black border-white scale-105 shadow-xl" 
                    : isCompleted 
                    ? "bg-white/10 text-white border-white/30" 
                    : "bg-white/[0.02] text-white/40 border-white/10 hover:border-white/20"
                )}
                title={step.name}
              >
                <StepIcon size={14} />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-white/20 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {step.id}. {step.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP CONTAINER */}
      <div className="bg-white/[0.02] border border-white/10 p-6 md:p-10 min-h-[680px] flex flex-col relative overflow-hidden">
        
        {/* Background Icon */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          {(() => {
            const Icon = steps[currentStep - 1].icon;
            return <Icon size={320} strokeWidth={0.5} />;
          })()}
        </div>

        {/* ==========================================
            STEP 1: FILES & WATERMARK CONFIGURATION
           ========================================== */}
        {currentStep === 1 && (
          <div className="space-y-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-white/[0.02] border border-white/10 flex flex-col justify-between gap-4 group hover:border-white/30 transition-all">
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 block">01. Master Audio</span>
                  <h4 className="text-lg font-black uppercase text-white tracking-tight">Untagged Master</h4>
                  <p className="text-[10px] text-white/40 uppercase font-medium">Clean 24-bit WAV or high-res MP3 file.</p>
                </div>

                <div className="relative h-32 border-2 border-dashed border-white/20 hover:border-white transition-all flex flex-col items-center justify-center text-center p-4">
                  <FileAudio size={28} className="text-white/40 mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white truncate max-w-full px-2">
                    {formData.audioFileName}
                  </span>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFormData({ ...formData, audioFileName: e.target.files[0].name });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/10 flex flex-col justify-between gap-4 group hover:border-white/30 transition-all">
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 block">02. Pre-Tagged Option</span>
                  <h4 className="text-lg font-black uppercase text-white tracking-tight">Custom Tagged MP3</h4>
                  <p className="text-[10px] text-white/40 uppercase font-medium">Upload beat stamped inside your DAW.</p>
                </div>

                <div className="relative h-32 border-2 border-dashed border-white/20 hover:border-white transition-all flex flex-col items-center justify-center text-center p-4">
                  <Music size={28} className="text-white/40 mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
                    {formData.isPreTaggedUpload ? 'DAW Pre-Tagged File Active' : 'Drag Pre-Tagged MP3 Here'}
                  </span>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/10 flex flex-col justify-between gap-4 group hover:border-white/30 transition-all">
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 block">03. Trackout Stems</span>
                  <h4 className="text-lg font-black uppercase text-white tracking-tight">Stems Archive (.ZIP)</h4>
                  <p className="text-[10px] text-white/40 uppercase font-medium">Compressed multi-track audio layers.</p>
                </div>

                <div className="relative h-32 border-2 border-dashed border-white/20 hover:border-white transition-all flex flex-col items-center justify-center text-center p-4">
                  <Archive size={28} className="text-white/40 mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white truncate max-w-full px-2">
                    {formData.stemZipFileName}
                  </span>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/10 flex flex-col justify-between gap-4 group hover:border-white/30 transition-all">
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 block">04. Visual Art</span>
                  <h4 className="text-lg font-black uppercase text-white tracking-tight">Cover Artwork</h4>
                  <p className="text-[10px] text-white/40 uppercase font-medium">Uniform 3000x3000px square image.</p>
                </div>

                <div className="relative h-32 border-2 border-dashed border-white/20 hover:border-white transition-all flex flex-col items-center justify-center text-center p-4">
                  <ImageIcon size={28} className="text-white/40 mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white truncate max-w-full px-2">
                    {formData.coverArtName}
                  </span>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
              </div>
            </div>

            {/* Smart Audio Tagging */}
            <div className="p-8 border border-white/15 bg-white/[0.01] space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Radio size={16} className="text-white" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Watermark Suite</span>
                  </div>
                  <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                    Automated Smart Audio Tagging & Watermarking Engine
                  </h3>
                </div>

                <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Dynamic Watermark Overlay</span>
                  <button 
                    onClick={() => setFormData({ ...formData, isWatermarkEnabled: !formData.isWatermarkEnabled })}
                    className={cn("w-14 h-7 rounded-full relative transition-all", formData.isWatermarkEnabled ? "bg-white" : "bg-white/10")}
                  >
                    <div className={cn("absolute top-1 w-5 h-5 bg-black rounded-full transition-all", formData.isWatermarkEnabled ? "right-1" : "left-1")} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3 p-5 bg-black border border-white/10">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 block">Global Voicetag Profile</label>
                  <div className="flex items-center justify-between bg-white/5 p-4 border border-white/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <Mic size={18} className="text-white/60 shrink-0" />
                      <span className="text-[10px] font-black text-white uppercase truncate">{formData.globalVoicetagProfile}</span>
                    </div>
                    <button className="px-3 py-1 bg-white text-black text-[8px] font-black uppercase tracking-widest shrink-0">
                      Active
                    </button>
                  </div>
                </div>

                <div className="space-y-3 p-5 bg-black border border-white/10">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 block">Interval Loop Injector</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['15s', '30s', '60s'].map((interval) => (
                      <button
                        key={interval}
                        onClick={() => setFormData({ ...formData, voicetagInterval: interval })}
                        className={cn(
                          "py-3 text-[10px] font-black uppercase tracking-widest transition-all border",
                          formData.voicetagInterval === interval ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                        )}
                      >
                        Every {interval}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 p-5 bg-black border border-white/10">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Voicetag Volume Offset</label>
                    <span className="text-[11px] font-black text-white tabular-nums">{formData.voicetagVolumeDb > 0 ? `+${formData.voicetagVolumeDb}` : formData.voicetagVolumeDb} dB</span>
                  </div>
                  <input 
                    type="range" 
                    min="-12" 
                    max="6" 
                    step="1"
                    value={formData.voicetagVolumeDb}
                    onChange={(e) => setFormData({ ...formData, voicetagVolumeDb: parseInt(e.target.value) })}
                    className="w-full accent-white bg-white/10 h-1.5 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            STEP 2: AI METADATA ANALYTICS & ATTRIBUTES
           ========================================== */}
        {currentStep === 2 && (
          <div className="space-y-10 relative z-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Cpu size={16} className="text-white" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Attributes</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                  AI Metadata Analytics & Musical Attribute Anchors
                </h3>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 flex items-center gap-4">
                <div className="flex flex-col text-right">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Exact Track Duration</span>
                  <span className="text-lg font-black text-white tabular-nums">{formatMillis(formData.durationMs)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Track Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-5 text-xl font-black uppercase tracking-tight text-white outline-none focus:border-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">BPM Speed Input</label>
                  <span className="text-[9px] font-bold text-white/40 uppercase">Tap to tempo</span>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={formData.bpm}
                    onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 p-5 text-xl font-black text-white outline-none focus:border-white"
                  />
                  <button 
                    onClick={handleBpmTap}
                    className="px-6 bg-white text-black font-black uppercase text-[10px] tracking-widest shrink-0 active:scale-95"
                  >
                    TAP BPM
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Key Signature & AI Scanner</label>
                  <button onClick={handleKeyScan} disabled={formData.isScanningKey} className="text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-white flex items-center gap-1.5">
                    <RefreshCw size={12} className={formData.isScanningKey ? "animate-spin" : ""} /> Scan Key
                  </button>
                </div>
                <select 
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-5 text-xl font-black uppercase text-white outline-none focus:border-white appearance-none"
                >
                  {['C Major', 'C Minor', 'C# Major', 'C# Minor', 'D Major', 'D Minor', 'D# Major', 'D# Minor', 'E Major', 'E Minor', 'F Major', 'F Minor', 'F# Major', 'F# Minor', 'G Major', 'G Minor', 'G# Major', 'G# Minor', 'A Major', 'A Minor', 'A# Major', 'A# Minor', 'B Major', 'B Minor'].map((k) => (
                    <option key={k} value={k} className="bg-neutral-900">{k}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            STEP 3: MASTER AUDIO TRANSCODING & ENGINE
           ========================================== */}
        {currentStep === 3 && (
          <div className="space-y-10 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <HardDrive size={18} className="text-white" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Transcoder Suite</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
                  Master Audio Processing & Multi-Codec Transcoding
                </h3>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={handleExportJson} className="px-4 py-2.5 bg-white/10 border border-white/20 text-white font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-black">
                  <FileText size={14} /> Export JSON
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-black border border-white/15 space-y-4">
                <span className="text-[9px] font-black uppercase text-white/40 block">File Sanitization & Cryptographic Hashes</span>
                <div className="space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between p-2 bg-white/5 border border-white/5">
                    <span className="text-white/40">Sanitized Filename:</span>
                    <span className="text-white font-bold">{formData.sanitizedFileName}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 border border-white/5">
                    <span className="text-white/40">MD5 Signature:</span>
                    <span className="text-white">{formData.md5Fingerprint}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-black border border-white/15 space-y-4 flex flex-col justify-between">
                <span className="text-[9px] font-black uppercase text-white/40 block">Diagnostics & System Maintenance</span>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleRepairHeader} className="py-3 bg-white/10 border border-white/20 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black flex items-center justify-center gap-2">
                    <Wrench size={12} /> Repair Header
                  </button>
                  <button onClick={handlePurgeCache} className="py-3 bg-white/10 border border-white/20 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black flex items-center justify-center gap-2">
                    <Trash2 size={12} /> Purge Cache
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            NEW! STEP 4: CLOUD HEALTH, PROCESSING & FAIL-SAFES (ITEMS 1-19, 77-100)
           ========================================== */}
        {currentStep === 4 && (
          <div className="space-y-10 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Activity size={18} className="text-white" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Features 1-19 & 77-100</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
                  Processing, Cloud Health & Fail-Safe Audio Engine
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleRotateEncryptionKeys}
                  className="px-4 py-2.5 bg-white/10 border border-white/20 text-white font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-black transition-all"
                >
                  <Key size={14} /> 86. Rotate Encryption Keys
                </button>
              </div>
            </div>

            {/* Health & Storage Meters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* 2. Audio Render Quality Score */}
              <div className="p-5 bg-black border border-white/10 space-y-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/40 block">2. Render Quality Score</span>
                <span className="text-lg font-black text-emerald-400">{formData.renderQualityScore}</span>
                <span className="text-[8px] text-white/30 uppercase block">A/B Stream Match Test Passed</span>
              </div>

              {/* 4. SNR Noise Evaluator */}
              <div className="p-5 bg-black border border-white/10 space-y-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/40 block">4. SNR Noise Level</span>
                <span className="text-lg font-black text-white">+{formData.snrValueDb} dB SNR</span>
                <span className="text-[8px] text-emerald-400 uppercase block">Clean Studio Floor</span>
              </div>

              {/* 5. True-Peak Level Gauge */}
              <div className="p-5 bg-black border border-white/10 space-y-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/40 block">5. True-Peak Level Gauge</span>
                <span className="text-lg font-black text-white">{formData.truePeakDbTP} dBTP</span>
                <span className="text-[8px] text-white/30 uppercase block">Inter-sample Distortion Safe</span>
              </div>

              {/* 17. Cloud Storage Capacity Warning */}
              <div className="p-5 bg-black border border-white/10 space-y-1">
                <div className="flex justify-between items-center text-[8px] font-black uppercase text-white/40">
                  <span>17. Storage Capacity</span>
                  <span className="text-white">{formData.storageCapacityPct}% Used</span>
                </div>
                <div className="w-full h-2 bg-white/10 overflow-hidden my-1">
                  <div className="h-full bg-white" style={{ width: `${formData.storageCapacityPct}%` }} />
                </div>
                <span className="text-[8px] text-white/30 uppercase block">58% Space Remaining</span>
              </div>
            </div>

            {/* Diagnostics & Processing Control Toggles */}
            <div className="p-8 border border-white/15 bg-white/[0.01] space-y-6">
              <h4 className="text-lg font-black uppercase text-white tracking-tight border-b border-white/10 pb-4">
                Audio Processing, Sub-Bass & Phase Compatibility Suite
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 85. Audio Phase Inversion Toggle */}
                <div className="p-5 bg-black border border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-white">85. Audio Phase Inversion</span>
                    <button 
                      onClick={() => setFormData({ ...formData, phaseInverted: !formData.phaseInverted })}
                      className={cn("px-4 py-1.5 text-[9px] font-black uppercase border transition-all", formData.phaseInverted ? "bg-white text-black border-white" : "bg-white/10 text-white border-white/20")}
                    >
                      {formData.phaseInverted ? '180° Inverted' : '0° Normal'}
                    </button>
                  </div>
                  <p className="text-[9px] text-white/40 uppercase">Flips polarity to test mono cancellation.</p>
                </div>

                {/* 81. Sub-Bass Clean Sweep Filter */}
                <div className="p-5 bg-black border border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-white">81. 20Hz Sub-Bass Cut</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase">Active</span>
                  </div>
                  <p className="text-[9px] text-white/40 uppercase">Cuts mud below 20Hz for maximum loudness.</p>
                </div>

                {/* 89. Peak Normalization Profile */}
                <div className="p-5 bg-black border border-white/10 space-y-2">
                  <label className="text-[9px] font-black uppercase text-white/40 block">89. Loudness Profile</label>
                  <select 
                    value={formData.loudnessProfile}
                    onChange={(e) => setFormData({ ...formData, loudnessProfile: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 p-2.5 text-[10px] font-black uppercase text-white outline-none"
                  >
                    <option value="Urban / Trap (-8.0 LUFS Target)" className="bg-neutral-900">Urban / Trap (-8.0 LUFS Target)</option>
                    <option value="Electronic / Dance (-6.0 LUFS Target)" className="bg-neutral-900">Electronic / Dance (-6.0 LUFS Target)</option>
                    <option value="Acoustic / Vocal (-14.0 LUFS Target)" className="bg-neutral-900">Acoustic / Vocal (-14.0 LUFS Target)</option>
                  </select>
                </div>
              </div>

              {/* Status Badges Row (7, 8, 9, 10, 11, 12, 13, 15, 77, 79, 80, 82, 83, 84, 87, 90, 91, 93, 94, 95, 97, 99, 100) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-[9px] pt-4 border-t border-white/10">
                <div className="p-3 bg-black border border-white/10 flex items-center justify-between">
                  <span className="font-bold text-white/40 uppercase">7. Raw Extension Scan</span>
                  <span className="text-emerald-400 font-black">Passed</span>
                </div>
                <div className="p-3 bg-black border border-white/10 flex items-center justify-between">
                  <span className="font-bold text-white/40 uppercase">8. Render Fail-Safe</span>
                  <span className="text-emerald-400 font-black">Ready</span>
                </div>
                <div className="p-3 bg-black border border-white/10 flex items-center justify-between">
                  <span className="font-bold text-white/40 uppercase">9. Catalog Health Audit</span>
                  <span className="text-emerald-400 font-black">100% Intact</span>
                </div>
                <div className="p-3 bg-black border border-white/10 flex items-center justify-between">
                  <span className="font-bold text-white/40 uppercase">10. VIP Queue Priority</span>
                  <span className="text-white font-black">Fast Dedicated</span>
                </div>
                <div className="p-3 bg-black border border-white/10 flex items-center justify-between">
                  <span className="font-bold text-white/40 uppercase">13. Duplicate Finder</span>
                  <span className="text-emerald-400 font-black">0 Matches</span>
                </div>
                <div className="p-3 bg-black border border-white/10 flex items-center justify-between">
                  <span className="font-bold text-white/40 uppercase">15. Dynamic Range</span>
                  <span className="text-white font-black">12.4 LUFS</span>
                </div>
                <div className="p-3 bg-black border border-white/10 flex items-center justify-between">
                  <span className="font-bold text-white/40 uppercase">77. High-Freq Protect</span>
                  <span className="text-emerald-400 font-black">Active</span>
                </div>
                <div className="p-3 bg-black border border-white/10 flex items-center justify-between">
                  <span className="font-bold text-white/40 uppercase">79. Firewall Security</span>
                  <span className="text-emerald-400 font-black">Shield ON</span>
                </div>
                <div className="p-3 bg-black border border-white/10 flex items-center justify-between">
                  <span className="font-bold text-white/40 uppercase">80. Latency Sync</span>
                  <span className="text-white font-black">0ms Drift</span>
                </div>
                <div className="p-3 bg-black border border-white/10 flex items-center justify-between">
                  <span className="font-bold text-white/40 uppercase">83. Sample Clock Sync</span>
                  <span className="text-emerald-400 font-black">Locked</span>
                </div>
                <div className="p-3 bg-black border border-white/10 flex items-center justify-between">
                  <span className="font-bold text-white/40 uppercase">90. Global Edge Sync</span>
                  <span className="text-white font-black">48 Nodes</span>
                </div>
                <div className="p-3 bg-black border border-white/10 flex items-center justify-between">
                  <span className="font-bold text-white/40 uppercase">97. Stereo Balance</span>
                  <span className="text-white font-black">L:50% / R:50%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            NEW! STEP 5: VISUAL BRANDING & ASSET SCALING (ITEMS 101-153)
           ========================================== */}
        {currentStep === 5 && (
          <div className="space-y-10 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Palette size={18} className="text-white" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Features 101-153</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
                  Visual Brand Asset Customization & Asset Scaling
                </h3>
              </div>

              {/* 151. Cloud Image CDN Purge */}
              <button 
                onClick={handlePurgeCdnCache}
                className="px-4 py-2.5 bg-white/10 border border-white/20 text-white font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-black transition-all"
              >
                <RefreshCcw size={14} /> 151. Purge Image CDN Cache
              </button>
            </div>

            {purgedCdnMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                {purgedCdnMsg}
              </div>
            )}

            {/* Color Palette Extraction & Theme Styling (108, 109, 123, 134, 140) */}
            <div className="p-8 border border-white/15 bg-white/[0.01] space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h4 className="text-lg font-black uppercase text-white">108. Auto-Extracted Artwork Color Palette</h4>
                <span className="text-[9px] font-bold text-white/40 uppercase">5 Dominant Hex Colors Extracted</span>
              </div>

              {/* Dominant Color Swatches */}
              <div className="flex flex-wrap gap-4">
                {formData.extractedPalette.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-black border border-white/10">
                    <div className="w-8 h-8 border border-white/20 shadow-md" style={{ backgroundColor: color }} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono font-bold text-white">{color}</span>
                      <span className="text-[8px] text-white/40 uppercase">Color #{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 109. CSS Theme Override Style Board */}
              <div className="space-y-2 pt-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">109. CSS Theme Override Style Board</label>
                <textarea 
                  value={formData.cssOverrideCode}
                  onChange={(e) => setFormData({ ...formData, cssOverrideCode: e.target.value })}
                  className="w-full bg-black border border-white/10 p-4 text-[10px] font-mono text-emerald-400 outline-none h-24 resize-none"
                />
              </div>
            </div>

            {/* Image Adjustments & Color Correction Matrix (118, 126, 131, 132, 149, 150) */}
            <div className="p-8 border border-white/15 bg-white/[0.01] space-y-6">
              <h4 className="text-lg font-black uppercase text-white border-b border-white/10 pb-4">
                118. Image Color Correction & Geometric Styling
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Brightness */}
                <div className="space-y-2 p-4 bg-black border border-white/10">
                  <div className="flex justify-between text-[9px] font-black uppercase text-white">
                    <span>Brightness</span>
                    <span>{formData.brightnessLevel}%</span>
                  </div>
                  <input 
                    type="range" min="50" max="150" value={formData.brightnessLevel}
                    onChange={(e) => setFormData({ ...formData, brightnessLevel: parseInt(e.target.value) })}
                    className="w-full accent-white bg-white/10 h-1.5 cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-2 p-4 bg-black border border-white/10">
                  <div className="flex justify-between text-[9px] font-black uppercase text-white">
                    <span>Contrast</span>
                    <span>{formData.contrastLevel}%</span>
                  </div>
                  <input 
                    type="range" min="50" max="150" value={formData.contrastLevel}
                    onChange={(e) => setFormData({ ...formData, contrastLevel: parseInt(e.target.value) })}
                    className="w-full accent-white bg-white/10 h-1.5 cursor-pointer"
                  />
                </div>

                {/* 131. Border Radius */}
                <div className="space-y-2 p-4 bg-black border border-white/10">
                  <div className="flex justify-between text-[9px] font-black uppercase text-white">
                    <span>131. Border Radius</span>
                    <span>{formData.borderRadiusPx}px</span>
                  </div>
                  <input 
                    type="range" min="0" max="24" value={formData.borderRadiusPx}
                    onChange={(e) => setFormData({ ...formData, borderRadiusPx: parseInt(e.target.value) })}
                    className="w-full accent-white bg-white/10 h-1.5 cursor-pointer"
                  />
                </div>

                {/* 126. Texture Overlay */}
                <div className="space-y-2 p-4 bg-black border border-white/10">
                  <label className="text-[9px] font-black uppercase text-white/40 block">126. Texture Overlay</label>
                  <select 
                    value={formData.textureOverlay}
                    onChange={(e) => setFormData({ ...formData, textureOverlay: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 p-2 text-[10px] font-black uppercase text-white outline-none"
                  >
                    <option value="none" className="bg-neutral-900">None (Clean)</option>
                    <option value="grain" className="bg-neutral-900">Vintage Grain</option>
                    <option value="grit" className="bg-neutral-900">Industrial Grit</option>
                    <option value="paper" className="bg-neutral-900">Film Paper</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 148. Dynamic Promo Pop-Up Visual Builder */}
            <div className="p-8 border border-white/15 bg-white/[0.01] space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h4 className="text-lg font-black uppercase text-white">148. Dynamic Promo Pop-Up Builder</h4>
                <button 
                  onClick={() => setFormData({ ...formData, promoPopupActive: !formData.promoPopupActive })}
                  className={cn("px-4 py-1.5 text-[9px] font-black uppercase border transition-all", formData.promoPopupActive ? "bg-white text-black border-white" : "bg-white/10 text-white border-white/20")}
                >
                  Pop-Up: {formData.promoPopupActive ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" value={formData.promoPopupTitle}
                  onChange={(e) => setFormData({ ...formData, promoPopupTitle: e.target.value })}
                  className="bg-black border border-white/10 p-3 text-xs font-black uppercase text-white outline-none"
                  placeholder="POP-UP TITLE..."
                />
                <input 
                  type="text" value={formData.promoPopupOffer}
                  onChange={(e) => setFormData({ ...formData, promoPopupOffer: e.target.value })}
                  className="bg-black border border-white/10 p-3 text-xs font-black uppercase text-white outline-none"
                  placeholder="OFFER DETAILS..."
                />
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            STEP 6: TRACKOUT & STEM STEMMING MANAGEMENT
           ========================================== */}
        {currentStep === 6 && (
          <div className="space-y-10 relative z-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Archive size={16} className="text-white" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Trackouts</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                  Trackout & Stem Stemming Management Portal
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-8 bg-white/[0.02] border border-white/10 space-y-6">
                <div className="space-y-1">
                  <h4 className="text-lg font-black uppercase text-white">Compressed Zip Stem Ingestion</h4>
                  <p className="text-[10px] text-white/40 uppercase font-medium">Upload local multi-track archived folder.</p>
                </div>

                <div className="p-6 border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-center gap-3 bg-black">
                  <Archive size={36} className="text-white/40" />
                  <span className="text-[10px] font-black uppercase text-white tracking-widest">
                    {formData.stemZipFileName}
                  </span>
                  <button className="px-6 py-2.5 bg-white text-black text-[9px] font-black uppercase tracking-widest">
                    Replace ZIP File
                  </button>
                </div>
              </div>

              <div className="p-8 bg-white/[0.02] border border-white/10 space-y-6">
                <div className="space-y-1">
                  <h4 className="text-lg font-black uppercase text-white">Third-Party Cloud Linking Protocol</h4>
                  <p className="text-[10px] text-white/40 uppercase font-medium">Paste external download URL (Dropbox, Google Drive).</p>
                </div>

                <div className="space-y-4">
                  <input 
                    type="text" 
                    value={formData.thirdPartyCloudLink}
                    onChange={(e) => setFormData({ ...formData, thirdPartyCloudLink: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none"
                  />

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={formData.cloudPasskey}
                      onChange={(e) => setFormData({ ...formData, cloudPasskey: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 p-4 text-base font-black text-white outline-none tracking-widest"
                    />
                    <button onClick={generatePasskey} className="px-6 bg-white text-black font-black uppercase text-[10px] tracking-widest shrink-0">
                      Auto-Passkey
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            STEP 7: LICENSING MATRIX & CONTRACTS
           ========================================== */}
        {currentStep === 7 && (
          <div className="space-y-10 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <DollarSign size={16} className="text-white" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Contracts</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                  Licensing Matrix & Contract Automation Settings
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {['lower', 'mid', 'upper', 'highest', 'exclusive'].map((bp) => (
                  <button
                    key={bp}
                    onClick={() => applyBlueprint(bp as any)}
                    className={cn(
                      "px-3 py-1.5 text-[8px] font-black uppercase tracking-widest border transition-all",
                      formData.selectedBlueprint === bp ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                    )}
                  >
                    {bp} Blueprint
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(formData.licenses).map(([key, config]) => (
                <div key={key} className="p-6 bg-black border border-white/15 space-y-5">
                  <div className="flex justify-between items-start border-b border-white/10 pb-4">
                    <div className="space-y-1">
                      <input 
                        type="text" 
                        value={config.name}
                        onChange={(e) => {
                          const updated = { ...formData.licenses };
                          (updated as any)[key].name = e.target.value;
                          setFormData({ ...formData, licenses: updated });
                        }}
                        className="bg-transparent text-lg font-black uppercase text-white outline-none focus:border-b focus:border-white"
                      />
                      <span className="text-[9px] font-bold text-white/40 uppercase block">Tier Key: {key.toUpperCase()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-white">$</span>
                      <input 
                        type="number" 
                        value={config.price}
                        onChange={(e) => {
                          const updated = { ...formData.licenses };
                          (updated as any)[key].price = e.target.value;
                          setFormData({ ...formData, licenses: updated });
                        }}
                        className="w-24 bg-white/10 border border-white/20 p-2 text-lg font-black text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            STEP 8: PRIVACY & FREE UNLOCKS
           ========================================== */}
        {currentStep === 8 && (
          <div className="space-y-10 relative z-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Lock size={16} className="text-white" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Visibility</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                  Privacy, Availability & Visibility Controls
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 bg-black border border-white/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <h5 className="text-sm font-black uppercase text-white">Marketplace Visibility</h5>
                    <p className="text-[10px] text-white/40 uppercase font-medium">Publicly discoverable vs hidden from search.</p>
                  </div>
                  <button 
                    onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                    className={cn("w-28 py-2 text-[9px] font-black uppercase border transition-all", formData.isPublic ? "bg-white text-black border-white" : "bg-white/10 text-white border-white/20")}
                  >
                    {formData.isPublic ? 'Public' : 'Private'}
                  </button>
                </div>
              </div>

              <div className="p-6 bg-black border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-black uppercase text-white">Free Download Incentive Gateway</h5>
                  <button onClick={() => setFormData({ ...formData, isFreeDownload: !formData.isFreeDownload })} className={cn("w-12 h-6 rounded-full relative transition-all", formData.isFreeDownload ? "bg-white" : "bg-white/10")}>
                    <div className={cn("absolute top-1 w-4 h-4 bg-black rounded-full transition-all", formData.isFreeDownload ? "right-1" : "left-1")} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            STEP 9: VIDEO GENERATOR & SOCIALS
           ========================================== */}
        {currentStep === 9 && (
          <div className="space-y-10 relative z-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Video size={16} className="text-white" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Syndication</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                  Cross-Platform Video Generation & Social Syndication
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-8 bg-white/[0.02] border border-white/10 space-y-6">
                <h4 className="text-lg font-black uppercase text-white">Native Video Maker Converter</h4>
                <button 
                  onClick={renderVideo}
                  disabled={formData.isGeneratingVideo}
                  className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-neutral-200 transition-all flex items-center justify-center gap-3"
                >
                  <Sparkles size={16} /> Render & Export MP4 Video
                </button>
              </div>

              <div className="p-8 bg-white/[0.02] border border-white/10 space-y-6">
                <h4 className="text-sm font-black uppercase text-white">Auto-Post Social Synergizer</h4>
                <div className="grid grid-cols-2 gap-3">
                  {['youtube', 'instagram', 'twitter', 'tiktok'].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        const updated = { ...formData.autoPostSocials };
                        (updated as any)[s] = !(updated as any)[s];
                        setFormData({ ...formData, autoPostSocials: updated });
                      }}
                      className={cn(
                        "p-3 text-[9px] font-black uppercase tracking-wider border flex items-center justify-between transition-all",
                        (formData.autoPostSocials as any)[s] ? "bg-white text-black border-white" : "bg-white/5 text-white/40 border-white/10"
                      )}
                    >
                      <span>{s}</span>
                      {(formData.autoPostSocials as any)[s] && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            STEP 10: STOREFRONT & ANALYTICS
           ========================================== */}
        {currentStep === 10 && (
          <div className="space-y-10 relative z-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-white" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Storefront</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                  Storefront Integration, HTML5 Embedding & Payout Routing
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-6 bg-black border border-white/10 space-y-3">
                <h5 className="text-sm font-black uppercase text-white">HTML5 Embedded Player Injector</h5>
                <div className="p-3 bg-white/5 border border-white/10">
                  <code className="text-[9px] font-mono text-white/80 block break-all">{iframeCode}</code>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(iframeCode);
                    setCopiedIframe(true);
                    setTimeout(() => setCopiedIframe(false), 2000);
                  }}
                  className="w-full py-3 bg-white text-black font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2"
                >
                  {copiedIframe ? <Check size={14} /> : <Copy size={14} />} Copy Embedded HTML5 Code
                </button>
              </div>

              <div className="p-6 bg-black border border-white/10 space-y-2">
                <h5 className="text-sm font-black uppercase text-white">Direct-to-Wallet Payout Routing</h5>
                <div className="p-4 bg-white/5 border border-white/10 flex items-center justify-between text-[10px]">
                  <span className="font-bold text-white uppercase">{formData.payoutWalletEmail}</span>
                  <span className="px-3 py-1 bg-emerald-500 text-black font-black uppercase tracking-widest">Connected</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            STEP 11: FINAL LAUNCH REVIEW
           ========================================== */}
        {currentStep === 11 && (
          <div className="space-y-8 relative z-10 flex flex-col justify-between flex-1">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                <CheckCircle size={24} className="text-white" />
                <div>
                  <h3 className="text-3xl font-black uppercase text-white tracking-tight">Final Launch Review</h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">All 150+ Audio, Transcoding & Visual Branding Parameters Validated</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-black border border-white/10 space-y-3">
                  <span className="text-[9px] font-black uppercase text-white/40 block">Audio & Transcoder</span>
                  <p className="text-xl font-black text-white uppercase">{formData.title}</p>
                  <p className="text-[10px] font-bold text-white/60 uppercase">{formData.audioFormatCodec} · {formData.mp3BitrateCap}</p>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase">Cloud Fail-Safes & Hashes Intact</p>
                </div>

                <div className="p-6 bg-black border border-white/10 space-y-3">
                  <span className="text-[9px] font-black uppercase text-white/40 block">Visual Brand Assets</span>
                  <p className="text-xl font-black text-white uppercase">COLOR PALETTE EXTRACTED</p>
                  <p className="text-[10px] font-bold text-white/60 uppercase">WebP Converted · EXIF Stripped</p>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase">CDN Cache Synchronized</p>
                </div>

                <div className="p-6 bg-black border border-white/10 space-y-3">
                  <span className="text-[9px] font-black uppercase text-white/40 block">Storefront & Socials</span>
                  <p className="text-xl font-black text-white uppercase">{formData.isPublic ? 'PUBLIC RELEASE' : 'PRIVATE VIP RELEASE'}</p>
                  <p className="text-[10px] font-bold text-white/60 uppercase">Infinity Store Sync Active</p>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase">Direct Wallet Payout Active</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white text-black flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="space-y-1">
                <h4 className="text-2xl font-black uppercase tracking-tight">Ready For Market Launch</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                  Clicking publish pushes track live onto catalog, triggers transcoding, visual scaling & social syndication.
                </p>
              </div>
              <button 
                onClick={() => alert(`Beat "${formData.title}" published successfully to catalog with all 150+ audio and visual branding parameters active!`)}
                className="px-16 py-6 bg-black text-white font-black uppercase tracking-[0.4em] text-xs hover:bg-neutral-800 transition-all flex items-center gap-4 shrink-0 shadow-2xl"
              >
                Publish Project <CheckCircle size={18} />
              </button>
            </div>
          </div>
        )}

        {/* FOOTER NAVIGATION */}
        <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center relative z-10">
          <button 
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-3 text-white/40 hover:text-white transition-all uppercase tracking-[0.3em] font-black text-[10px] disabled:opacity-0"
          >
            <ArrowLeft size={16} /> Back Step
          </button>
          
          {currentStep < steps.length && (
            <button 
              onClick={nextStep}
              className="flex items-center gap-3 bg-white text-black px-10 py-4 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-neutral-200 transition-all group"
            >
              Continue Module <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
