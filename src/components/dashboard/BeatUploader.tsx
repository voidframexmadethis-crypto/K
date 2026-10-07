import React, { useState, useEffect, useRef } from 'react';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { validateStorageUrl, createStorageMetadata, validateAudioFile } from '../../lib/storageEngine';
import { BEEHIIV_CONFIG } from '../../config/beehiiv';
import { Beat } from '../../types';
import { 
  Upload, Image as ImageIcon, Music, Tag, DollarSign, CheckCircle, 
  ArrowRight, ArrowLeft, Shield, Globe, Settings, FileAudio, 
  Archive, Cloud, Youtube, AlertTriangle, List, Layers, 
  Calendar, Lock, Link as LinkIcon, HelpCircle, X, Play, Pause, 
  Volume2, Sparkles, RefreshCw, Key, Share2, Copy, Check, Eye, 
  EyeOff, Sliders, Cpu, Video, Download, FileText, PieChart, 
  CreditCard, Radio, Hash, Mic, Award, Zap, ChevronDown, ChevronUp,
  HardDrive, Activity, Palette, SlidersHorizontal, ToggleLeft, ToggleRight, ExternalLink
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const sectionTabs = [
  { id: 1, name: 'Audio', icon: Music },
  { id: 2, name: 'Processing', icon: Activity },
  { id: 3, name: 'Artwork', icon: ImageIcon },
  { id: 4, name: 'Beat Info', icon: FileText },
  { id: 5, name: 'Store Options', icon: DollarSign },
  { id: 6, name: 'Preview', icon: Eye },
  { id: 7, name: 'Publish', icon: CheckCircle },
];

export const BeatUploader = ({ editingBeat }: { editingBeat?: Beat }) => {
  const addBeat = useBeatCatalogStore(state => state.addBeat);
  const updateBeat = useBeatCatalogStore(state => state.updateBeat);
  const findBeatByIdempotencyKey = useBeatCatalogStore(state => state.findBeatByIdempotencyKey);

  const [activeSection, setActiveSection] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Synchronous duplicate submission protection state & refs
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishSuccess, setIsPublishSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Upload loading indicators
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingArtwork, setIsUploadingArtwork] = useState(false);
  const [isUploadingStems, setIsUploadingStems] = useState(false);

  // Ref lock is 100% synchronous at method entry before any React re-renders or async events
  const isSubmittingRef = useRef(false);
  const currentSubmissionIdRef = useRef<string | null>(null);
  const createdBeatResultRef = useRef<Beat | null>(null);
  const activeBeatIdRef = useRef<string>(editingBeat?.id || `beat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

  // --- COMPREHENSIVE FORM STATE FOR ALL FEATURES ---
  const [formData, setFormData] = useState({
    // 1. Release Info
    title: 'VALKYRIE',
    producerId: 'KRAEZELV',
    typeBeatArtist: 'Drake x Future',
    description: 'Dark atmospheric trap instrumental with heavy sliding 808s and brass stabs.',
    durationMs: 204580,
    audioFileName: 'Valkyrie_Master_HighRes.mp3',
    coverArtName: 'Valkyrie_Artwork_3000x3000.jpg',
    stemZipFileName: 'Valkyrie_WAV_Stems_Bundle.zip',
    lyrics: '[Intro]\nYeah, KRAEZELV on the track...\n[Chorus]\nSliding through the dark...',

    // 2. Audio & Watermarking (Direct Direct URL Integration)
    audioUrl: editingBeat?.audioUrl || editingBeat?.storage?.durableUrl || '',
    artworkUrl: editingBeat?.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    stemsUrl: editingBeat?.stemsUrl || '',
    taggedAudioUrl: editingBeat?.taggedAudioUrl || '',
    isPreTaggedUpload: Boolean(editingBeat?.taggedAudioUrl),
    isWatermarkEnabled: true,
    globalVoicetagProfile: 'KRAEZELV_Official_Signature.wav',
    voicetagVolumeDb: -3,
    voicetagInterval: '30s',
    voicetagIntroOnly: false,
    untaggedLockedForCheckout: true,
    isPlayingWatermarkedPreview: false,

    // 3. Metadata & Discovery
    bpm: '144',
    key: 'C Minor',
    primaryGenre: 'Trap',
    subGenre: 'UK Drill',
    tags: ['DRILL', 'DARKTRAP', 'HARD808', 'CINEMATIC', 'CHARTTOPPER'],
    moods: ['Aggressive', 'Dark', 'Energetic'],
    instruments: ['808 Sub', 'Piano', 'Brass Hooks', 'Hi-Hat Rolls', 'Synth Pads'],
    associatedSoundKit: 'VALKYRIE Drill Drum Kit Vol. 1',
    tapTimeStamps: [] as number[],
    isScanningKey: false,
    detectedKeyInfo: 'C Minor (99.4% Harmonic Confidence)',

    // 4. Pricing & Licensing Mode (Tiered vs Custom Direct)
    pricingMode: 'tiered' as 'tiered' | 'direct',
    directPrice: '49.99',
    directPriceLabel: 'Direct Track Buyout',
    directCheckoutUrl: '',
    isFreeDownload: false,
    freeDownloadEmailRequired: false,
    beehiivFormUrl: BEEHIIV_CONFIG.FORM_ACTION_URL,
    freeUnlockMechanic: 'email',
    mp3LeasePrice: '29.99',
    wavLeasePrice: '49.99',
    stemsLeasePrice: '99.99',
    exclusiveBuyoutPrice: '499.99',
    selectedBlueprint: 'mid',
    enabledLicenses: {
      basic: true,
      premium: true,
      unlimited: true,
      exclusive: true,
    },

    // 5. Store & Visibility
    isPublic: true,
    releaseDate: new Date().toISOString().slice(0, 10),
    releaseTime: '12:00',
    vipShareLink: typeof window !== 'undefined' ? `${window.location.origin}/vip/beat/valkyrie?token=sec_98124x` : '',
    isPasswordProtected: false,
    previewPassword: '',

    // 6. Advanced Transcoding & Engine
    audioFormatCodec: '320kbps MP3 / M4A',
    bitDepth: '24-bit / 32-bit Float',
    sampleRate: '44.1 kHz',
    mp3BitrateCap: '320kbps',
    renderQualityScore: '99.2% Fidelity Match',
    catalogHealthStatus: '100% Intact (0 Corrupted)',

    // 7. Video & Socials
    autoPostSocials: { youtube: true, instagram: true, twitter: true, tiktok: true },
    isGeneratingVideo: false,
    videoRenderProgress: 0,
    generatedVideoUrl: 'Valkyrie_Cover_Visualizer_1080p.mp4',

    // 8. Storefront & Embeds
    embedWidth: 100,
    embedHeight: 166,
    payoutWalletEmail: 'kraezelvbeatz@gmail.com (Stripe & PayPal Active)',
  });

  const [tagInput, setTagInput] = useState('');
  const [copiedIframe, setCopiedIframe] = useState(false);

  // Direct File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: 'audio' | 'artwork' | 'stems') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (category === 'audio') {
      if (file.name.toLowerCase().endsWith('.wav')) {
        alert('WAV format is prohibited. Only MP3 and M4A master files are allowed.');
        return;
      }
      setIsUploadingAudio(true);
    } else if (category === 'artwork') {
      setIsUploadingArtwork(true);
    } else if (category === 'stems') {
      setIsUploadingStems(true);
    }

    try {
      const res = await fetch(`/api/storage/upload?category=${category}&filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (category === 'audio') {
          setFormData(prev => ({ ...prev, audioUrl: data.url, audioFileName: file.name }));
        } else if (category === 'artwork') {
          setFormData(prev => ({ ...prev, artworkUrl: data.url, coverArtName: file.name }));
        } else if (category === 'stems') {
          setFormData(prev => ({ ...prev, stemsUrl: data.url, stemZipFileName: file.name }));
        }
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err: any) {
      alert('Upload error: ' + (err?.message || err));
    } finally {
      if (category === 'audio') setIsUploadingAudio(false);
      if (category === 'artwork') setIsUploadingArtwork(false);
      if (category === 'stems') setIsUploadingStems(false);
    }
  };
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
      const bpm = Math.round(60000 / avgInterval);
      if (bpm >= 50 && bpm <= 220) {
        setFormData((prev) => ({ ...prev, bpm: bpm.toString() }));
      }
    }
  };

  // Tag Management
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

  // Toggle individual license tier enabled state
  const toggleLicenseTier = (tierKey: keyof typeof formData.enabledLicenses) => {
    setFormData((prev) => ({
      ...prev,
      enabledLicenses: {
        ...prev.enabledLicenses,
        [tierKey]: !prev.enabledLicenses[tierKey]
      }
    }));
  };

  // Pricing Blueprint Presets
  const applyBlueprint = (type: 'lower' | 'mid' | 'upper' | 'highest') => {
    let prices = { basic: '19.99', premium: '39.99', unlimited: '79.99', exclusive: '299.99' };
    if (type === 'mid') prices = { basic: '29.99', premium: '49.99', unlimited: '99.99', exclusive: '499.99' };
    if (type === 'upper') prices = { basic: '39.99', premium: '69.99', unlimited: '149.99', exclusive: '799.99' };
    if (type === 'highest') prices = { basic: '49.99', premium: '89.99', unlimited: '199.99', exclusive: '999.99' };

    setFormData((prev) => ({
      ...prev,
      selectedBlueprint: type,
      mp3LeasePrice: prices.basic,
      wavLeasePrice: prices.premium,
      stemsLeasePrice: prices.unlimited,
      exclusiveBuyoutPrice: prices.exclusive,
    }));
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const iframeCode = `<iframe src="${currentOrigin}/embed/beat/${formData.title.toLowerCase() || 'track'}?theme=dark" width="${formData.embedWidth}%" height="${formData.embedHeight}" frameborder="0" allow="autoplay"></iframe>`;

  // Validation Checks for Readiness Checklist
  const audioValidation = validateStorageUrl(formData.audioUrl, 'audio');
  const isAudioReady = Boolean(formData.audioUrl && audioValidation.valid);
  const isArtworkReady = Boolean(formData.artworkUrl);
  const isMetadataReady = Boolean(formData.title && formData.bpm && formData.key && formData.primaryGenre);
  const isPricingReady = formData.isFreeDownload || (formData.pricingMode === 'direct' ? parseFloat(formData.directPrice) > 0 : (parseFloat(formData.mp3LeasePrice) > 0 || parseFloat(formData.wavLeasePrice) > 0));
  const isStoreReady = true;

  const handlePublish = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // 1. SYNCHRONOUS LOCK CHECK - Must be 100% synchronous at entry
    if (isSubmittingRef.current || isSubmitting) {
      console.warn('[DUPLICATE_PREVENTION] Submission already in progress. Tap ignored.');
      return;
    }

    if (isPublishSuccess && createdBeatResultRef.current) {
      console.log('[DUPLICATE_PREVENTION] Beat already published successfully.', createdBeatResultRef.current.id);
      return;
    }

    // 2. Establish Lock SYNCHRONOUSLY
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setSubmissionError(null);

    // 3. Generate or retrieve unique Idempotency Key for this submission attempt
    if (!currentSubmissionIdRef.current) {
      currentSubmissionIdRef.current = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    const idempotencyKey = currentSubmissionIdRef.current;

    try {
      // 4. Validate Direct Audio URL
      const audioCheck = validateStorageUrl(formData.audioUrl, 'audio');
      if (!audioCheck.valid) {
        setSubmissionError(audioCheck.error || 'Please provide a valid Direct Direct File URL for the master audio.');
        setIsSubmitting(false);
        isSubmittingRef.current = false;
        return;
      }

      if (formData.stemsUrl) {
        const stemsCheck = validateStorageUrl(formData.stemsUrl, 'stems');
        if (!stemsCheck.valid) {
          setSubmissionError(stemsCheck.error || 'Invalid Direct Stems URL.');
          setIsSubmitting(false);
          isSubmittingRef.current = false;
          return;
        }
      }

      // 5. IDEMPOTENCY CHECK - Check if beat with this idempotency key already exists in catalog
      const existingInCatalog = findBeatByIdempotencyKey(idempotencyKey);
      if (existingInCatalog) {
        console.log('[DUPLICATE_PREVENTION] Idempotency hit: Beat already exists in store.', existingInCatalog.id);
        createdBeatResultRef.current = existingInCatalog;
        setIsPublishSuccess(true);
        setIsSubmitting(false);
        return;
      }

      // 6. Handle Editing Existing Beat vs Creating New Beat
      const editingId = editingBeat?.id || (formData as any).editingBeatId;
      if (editingId) {
        await updateBeat(editingId, {
          title: formData.title || 'Untitled Beat',
          bpm: parseInt(formData.bpm) || 140,
          key: formData.key || 'C Minor',
          genre: formData.primaryGenre || 'Trap',
          subgenre: formData.subGenre,
          tags: formData.tags || ['NEW'],
          moods: formData.moods || ['Dark'],
          instruments: formData.instruments || [],
          audioUrl: formData.audioUrl.trim(),
          taggedAudioUrl: formData.taggedAudioUrl ? formData.taggedAudioUrl.trim() : undefined,
          stemsUrl: formData.stemsUrl ? formData.stemsUrl.trim() : '',
          artworkUrl: formData.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
          isFree: formData.isFreeDownload,
          freeDownloadEnabled: formData.isFreeDownload,
          freeDownloadEmailRequired: formData.isFreeDownload ? formData.freeDownloadEmailRequired : false,
          beehiivFormUrl: formData.beehiivFormUrl || '',
          storage: {
            provider: 'custom',
            durableUrl: formData.audioUrl.trim(),
            fileUrl: formData.audioUrl.trim(),
            audioUrl: formData.audioUrl.trim(),
            artworkUrl: formData.artworkUrl,
            stemsUrl: formData.stemsUrl ? formData.stemsUrl.trim() : '',
            uploadedAt: new Date().toISOString(),
          },
          licenses: formData.pricingMode === 'direct' ? {
            basic: { price: parseFloat(formData.directPrice) || 49.99, enabled: true },
            premium: { price: parseFloat(formData.directPrice) || 49.99, enabled: false },
            unlimited: { price: parseFloat(formData.directPrice) || 49.99, enabled: false },
            exclusive: { price: parseFloat(formData.directPrice) || 49.99, enabled: false },
          } : {
            basic: { price: parseFloat(formData.mp3LeasePrice) || 29.99, enabled: formData.enabledLicenses.basic },
            premium: { price: parseFloat(formData.wavLeasePrice) || 49.99, enabled: formData.enabledLicenses.premium },
            unlimited: { price: parseFloat(formData.stemsLeasePrice) || 99.99, enabled: formData.enabledLicenses.unlimited },
            exclusive: { price: parseFloat(formData.exclusiveBuyoutPrice) || 499.99, enabled: formData.enabledLicenses.exclusive },
          }
        });
        setIsPublishSuccess(true);
        setIsSubmitting(false);
        return;
      }

      // 7. Create NEW Beat Record with Direct Storage Metadata
      const newBeatId = activeBeatIdRef.current;
      const cleanAudioUrl = formData.audioUrl.trim();
      const cleanArtworkUrl = formData.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80';
      const cleanStemsUrl = formData.stemsUrl ? formData.stemsUrl.trim() : '';

      const newBeat: Beat = {
        id: newBeatId,
        idempotencyKey,
        title: formData.title || 'Untitled Beat',
        producerId: formData.producerId || 'KRAEZELV',
        bpm: parseInt(formData.bpm) || 140,
        key: formData.key || 'C Minor',
        genre: formData.primaryGenre || 'Trap',
        subgenre: formData.subGenre,
        tags: formData.tags || ['NEW'],
        moods: formData.moods || ['Dark'],
        slug: (formData.title || 'beat').toLowerCase().replace(/\s+/g, '-'),
        isPrivate: !formData.isPublic,
        isBootleg: false,
        instruments: formData.instruments || [],
        audioUrl: cleanAudioUrl,
        taggedAudioUrl: formData.taggedAudioUrl ? formData.taggedAudioUrl.trim() : undefined,
        artworkUrl: cleanArtworkUrl,
        stemsUrl: cleanStemsUrl,
        isFree: formData.isFreeDownload,
        freeDownloadEnabled: formData.isFreeDownload,
        freeDownloadEmailRequired: formData.isFreeDownload ? formData.freeDownloadEmailRequired : false,
        freeDownloadType: (formData.freeDownloadEmailRequired ? 'email' : 'none') as 'email' | 'social' | 'none',
        beehiivFormUrl: formData.beehiivFormUrl || '',
        playsCount: 0,
        licenses: formData.pricingMode === 'direct' ? {
          basic: { price: parseFloat(formData.directPrice) || 49.99, enabled: true },
          premium: { price: parseFloat(formData.directPrice) || 49.99, enabled: false },
          unlimited: { price: parseFloat(formData.directPrice) || 49.99, enabled: false },
          exclusive: { price: parseFloat(formData.directPrice) || 49.99, enabled: false },
        } : {
          basic: { price: parseFloat(formData.mp3LeasePrice) || 29.99, enabled: formData.enabledLicenses.basic },
          premium: { price: parseFloat(formData.wavLeasePrice) || 49.99, enabled: formData.enabledLicenses.premium },
          unlimited: { price: parseFloat(formData.stemsLeasePrice) || 99.99, enabled: formData.enabledLicenses.unlimited },
          exclusive: { price: parseFloat(formData.exclusiveBuyoutPrice) || 499.99, enabled: formData.enabledLicenses.exclusive },
        },
        storage: {
          provider: 'custom',
          durableUrl: cleanAudioUrl,
          fileUrl: cleanAudioUrl,
          audioUrl: cleanAudioUrl,
          artworkUrl: cleanArtworkUrl,
          stemsUrl: cleanStemsUrl,
          uploadedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        published: true,
      };

      const createdBeat = await addBeat(newBeat);
      createdBeatResultRef.current = createdBeat;
      setIsPublishSuccess(true);
      setIsSubmitting(false);

    } catch (err: any) {
      console.error('[DUPLICATE_PREVENTION] Upload Error:', err);
      setSubmissionError(err?.message || 'Publish operation failed. Please try again.');
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleResetForNewBeat = () => {
    isSubmittingRef.current = false;
    currentSubmissionIdRef.current = null;
    createdBeatResultRef.current = null;
    activeBeatIdRef.current = `beat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setIsSubmitting(false);
    setIsPublishSuccess(false);
    setSubmissionError(null);
    setFormData(prev => ({
      ...prev,
      title: 'NEW BEAT ' + Math.floor(Math.random() * 1000),
      audioUrl: '',
      audioFileName: '',
      artworkUrl: '',
      coverArtName: 'Default Cover.jpg',
      stemsUrl: '',
      stemZipFileName: '',
      taggedAudioUrl: ''
    }));
    setActiveSection(1);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 md:px-8 text-white">
      {/* HEADER & SECTION TABS */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-3 text-purple-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">
            <Sparkles size={14} /> Official Producer Engine
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            Beat Uploader
          </h2>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
            KRAEZELV Independent Catalog Publishing Suite
          </p>
        </div>

        {/* iPad-Friendly Touch-Optimized Section Navigation */}
        <div className="flex flex-wrap gap-2 max-w-full">
          {sectionTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeSection;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={cn(
                  "px-4 py-3 border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 rounded-sm active:scale-95",
                  isActive 
                    ? "bg-white text-black border-white shadow-xl" 
                    : "bg-neutral-950 text-white/50 border-white/10 hover:text-white hover:border-white/30"
                )}
              >
                <Icon size={14} /> {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="space-y-12">

        {/* 1. RELEASE SECTION */}
        {(activeSection === 1 || activeSection === 8) && (
          <div className="p-8 bg-neutral-950 border border-white/10 rounded-sm space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-purple-400" />
                <h3 className="text-2xl font-black uppercase text-white tracking-tight">1. Release Information</h3>
              </div>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Required</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Track Title *</label>
                <input 
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="E.G. VALKYRIE"
                  className="w-full bg-white/5 border border-white/15 p-4 text-sm font-black text-white outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Producer / Artist Credit</label>
                <input 
                  type="text"
                  value={formData.producerId}
                  onChange={(e) => setFormData({ ...formData, producerId: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 p-4 text-sm font-black text-white outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Track Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe the vibe, instrumentation, and energy of the beat..."
                className="w-full bg-white/5 border border-white/15 p-4 text-xs font-bold text-white outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>
          </div>
        )}

        {/* 2. AUDIO SECTION */}
        {(activeSection === 2 || activeSection === 8) && (
          <div className="p-8 bg-neutral-950 border border-white/10 rounded-sm space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <Music size={18} className="text-purple-400" />
                <h3 className="text-2xl font-black uppercase text-white tracking-tight">2. Master Audio Upload</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">MP3 / M4A Master Files</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MASTER AUDIO CARD */}
              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-sm space-y-4 relative group hover:border-purple-500/40 transition-all">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Untagged Master *</span>
                    <h4 className="text-lg font-black text-white uppercase">Upload MP3 or M4A File</h4>
                  </div>
                  <FileAudio size={24} className="text-white/40" />
                </div>

                <p className="text-[10px] text-white/40 uppercase font-medium">
                  Select your master audio file directly. WAV format is prohibited.
                </p>

                <div className="space-y-4">
                  <label className="block w-full cursor-pointer">
                    <div className="p-6 border-2 border-dashed border-white/20 hover:border-purple-500 bg-white/5 rounded-sm flex flex-col items-center justify-center gap-2 transition-all">
                      <Upload size={24} className="text-purple-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        {isUploadingAudio ? 'Uploading Audio File...' : 'Choose MP3 / M4A File'}
                      </span>
                      {formData.audioFileName && (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold truncate max-w-xs">
                          Selected: {formData.audioFileName}
                        </span>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="audio/mp3,audio/m4a,audio/mpeg,audio/mp4" 
                      onChange={(e) => handleFileUpload(e, 'audio')}
                      className="hidden"
                      disabled={isUploadingAudio}
                    />
                  </label>

                  {formData.audioUrl && (
                    <div className="space-y-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-sm text-[10px] font-mono">
                      <div className="flex items-center justify-between text-emerald-400 font-bold uppercase">
                        <span className="flex items-center gap-1.5"><CheckCircle size={13} /> ✓ Audio Uploaded & Saved</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PRE-TAGGED AUDIO CARD */}
              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-sm space-y-4 relative group hover:border-purple-500/40 transition-all">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Pre-Tagged Preview</span>
                    <h4 className="text-lg font-black text-white uppercase">DAW Watermarked Preview</h4>
                  </div>
                  <Music size={24} className="text-white/40" />
                </div>

                <p className="text-[10px] text-white/40 uppercase font-medium">
                  Select audio pre-stamped with your voice tag (optional).
                </p>

                <div className="space-y-3">
                  <label className="block w-full cursor-pointer">
                    <div className="p-4 border border-white/15 hover:border-purple-500 bg-white/5 rounded-sm flex items-center justify-center gap-2 transition-all">
                      <Music size={16} className="text-purple-400" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-white">
                        Choose Watermarked Preview
                      </span>
                    </div>
                    <input 
                      type="file" 
                      accept="audio/mp3,audio/m4a,audio/mpeg,audio/mp4" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const res = await fetch(`/api/storage/upload?category=audio&filename=${encodeURIComponent(file.name)}`, {
                            method: 'POST',
                            body: file
                          });
                          const data = await res.json();
                          if (data.url) {
                            setFormData(prev => ({ ...prev, taggedAudioUrl: data.url, isPreTaggedUpload: true }));
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {formData.taggedAudioUrl && (
                    <span className="text-[9px] font-mono text-emerald-400 uppercase block font-bold">
                      ✓ Watermarked Preview Attached
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. STEMS SECTION */}
        {(activeSection === 3 || activeSection === 8) && (
          <div className="p-8 bg-neutral-950 border border-white/10 rounded-sm space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <Archive size={18} className="text-purple-400" />
                <h3 className="text-2xl font-black uppercase text-white tracking-tight">3. Stems (Multi-Track ZIP) — Optional</h3>
              </div>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Multi-Track Archive</span>
            </div>

            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Trackout ZIP Archive</span>
                  <h4 className="text-lg font-black text-white uppercase">Upload Stems Bundle (.ZIP)</h4>
                </div>
                <Archive size={24} className="text-white/40" />
              </div>

              <p className="text-[10px] text-white/40 uppercase font-medium">
                Select your multi-track stem bundle (.ZIP) file directly.
              </p>

              <div className="space-y-4">
                <label className="block w-full cursor-pointer">
                  <div className="p-6 border-2 border-dashed border-white/20 hover:border-purple-500 bg-white/5 rounded-sm flex flex-col items-center justify-center gap-2 transition-all">
                    <Archive size={24} className="text-purple-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      {isUploadingStems ? 'Uploading Stems Archive...' : 'Choose Stems (.ZIP) File'}
                    </span>
                    {formData.stemZipFileName && (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold truncate max-w-xs">
                        Selected: {formData.stemZipFileName}
                      </span>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept=".zip,application/zip,application/x-zip-compressed" 
                    onChange={(e) => handleFileUpload(e, 'stems')}
                    className="hidden"
                    disabled={isUploadingStems}
                  />
                </label>

                {formData.stemsUrl && (
                  <div className="space-y-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-sm text-[10px] font-mono">
                    <div className="flex items-center justify-between text-emerald-400 font-bold uppercase">
                      <span className="flex items-center gap-1.5"><CheckCircle size={13} /> ✓ Stems Archive Uploaded & Attached</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. ARTWORK SECTION */}
        {(activeSection === 4 || activeSection === 8) && (
          <div className="p-8 bg-neutral-950 border border-white/10 rounded-sm space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <ImageIcon size={18} className="text-purple-400" />
                <h3 className="text-2xl font-black uppercase text-white tracking-tight">4. Cover Artwork Upload</h3>
              </div>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">JPG, JPEG, PNG, WebP</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-4 flex justify-center">
                <div className="w-48 h-48 bg-neutral-900 border border-white/15 rounded-sm overflow-hidden relative group shadow-2xl">
                  <img 
                    src={formData.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80'} 
                    alt="Artwork Preview" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-[9px] font-black uppercase text-white tracking-widest">Artwork Preview</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xl font-black uppercase text-white">Cover Artwork File</h4>
                  <p className="text-xs text-white/40 uppercase tracking-wider">
                    Select your cover art image directly. Supported formats: JPG, JPEG, PNG, WebP.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="block w-full cursor-pointer">
                    <div className="p-6 border-2 border-dashed border-white/20 hover:border-purple-500 bg-white/5 rounded-sm flex flex-col items-center justify-center gap-2 transition-all">
                      <ImageIcon size={24} className="text-purple-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        {isUploadingArtwork ? 'Uploading Cover Image...' : 'Choose Cover Image File'}
                      </span>
                      {formData.coverArtName && (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold truncate max-w-xs">
                          Selected: {formData.coverArtName}
                        </span>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/jpg,image/png,image/webp" 
                      onChange={(e) => handleFileUpload(e, 'artwork')}
                      className="hidden"
                      disabled={isUploadingArtwork}
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80', coverArtName: 'Studio_Console_Cover.jpg' })}
                    className="px-4 py-2 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Use Dark Studio Cover
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, artworkUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80', coverArtName: 'Synthesizer_Cover.jpg' })}
                    className="px-4 py-2 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Use Neon Synth Cover
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. PRICING SECTION (TIERED VS DIRECT CUSTOM PRICING) */}
        { (activeSection === 5 || activeSection === 8) && (
          <div className="p-8 bg-neutral-950 border border-white/10 rounded-sm space-y-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <DollarSign size={18} className="text-purple-400" />
                <h3 className="text-2xl font-black uppercase text-white tracking-tight">5. Pricing & Checkout Options</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Custom Direct or Tiered Matrix</span>
            </div>

            {/* PRICING MODE STRATEGY SWITCHER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, pricingMode: 'tiered' })}
                className={cn(
                  "p-5 border text-left flex flex-col justify-between gap-3 transition-all",
                  formData.pricingMode === 'tiered' 
                    ? "border-purple-500 bg-purple-500/10 text-white" 
                    : "border-white/10 bg-white/[0.02] text-white/50 hover:text-white"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider">Tiered License Matrix</span>
                  <SlidersHorizontal size={18} className={formData.pricingMode === 'tiered' ? 'text-purple-400' : 'text-white/30'} />
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed uppercase">
                  Offer Basic MP3, Premium WAV, Unlimited Stems, and Exclusive Rights. Easily enable/disable specific tiers.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, pricingMode: 'direct' })}
                className={cn(
                  "p-5 border text-left flex flex-col justify-between gap-3 transition-all",
                  formData.pricingMode === 'direct' 
                    ? "border-emerald-500 bg-emerald-500/10 text-white" 
                    : "border-white/10 bg-white/[0.02] text-white/50 hover:text-white"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider">Custom Direct Flat Pricing</span>
                  <DollarSign size={18} className={formData.pricingMode === 'direct' ? 'text-emerald-400' : 'text-white/30'} />
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed uppercase">
                  Bypass tier matrices. Set a single flat purchase price or attach a custom direct invoice/checkout link.
                </p>
              </button>
            </div>

            {/* FREE RELEASE TOGGLE & EMAIL GATE MODE */}
            <div className="flex flex-col gap-4 p-6 bg-white/[0.02] border border-white/10 rounded-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <span className="text-lg font-black uppercase text-white">Free Download Release</span>
                  <p className="text-xs text-white/40 uppercase tracking-wider">
                    Allow instant or email-gated free downloads alongside your paid license tiers.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                    {formData.isFreeDownload ? 'FREE ACTIVE' : 'OFF'}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, isFreeDownload: !formData.isFreeDownload })}
                    className={cn("w-14 h-7 rounded-full relative transition-all", formData.isFreeDownload ? "bg-purple-600" : "bg-white/10")}
                  >
                    <div className={cn("absolute top-1 w-5 h-5 bg-white rounded-full transition-all", formData.isFreeDownload ? "right-1" : "left-1")} />
                  </button>
                </div>
              </div>

              {formData.isFreeDownload && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-sm space-y-4 mt-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-purple-300 block">
                    Free Download Requirement Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, freeDownloadEmailRequired: false })}
                      className={cn(
                        "p-3 border text-left text-xs font-black uppercase tracking-wider rounded-sm transition-all cursor-pointer",
                        !formData.freeDownloadEmailRequired
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                          : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                      )}
                    >
                      ○ No Email Required (Direct Instant Download)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, freeDownloadEmailRequired: true })}
                      className={cn(
                        "p-3 border text-left text-xs font-black uppercase tracking-wider rounded-sm transition-all cursor-pointer",
                        formData.freeDownloadEmailRequired
                          ? "bg-purple-500/20 border-purple-500 text-purple-300"
                          : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                      )}
                    >
                      ● Email Required (Beehiiv Audience Gate)
                    </button>
                  </div>

                  {formData.freeDownloadEmailRequired && (
                    <div className="space-y-1 pt-2 border-t border-purple-500/20">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/70 block">
                        Beehiiv Subscribe Embed Form URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.beehiivFormUrl}
                        onChange={(e) => setFormData({ ...formData, beehiivFormUrl: e.target.value })}
                        placeholder="e.g. https://embeds.beehiiv.com/publication_id"
                        className="w-full bg-black/60 border border-white/20 p-2.5 text-xs font-mono text-white outline-none focus:border-purple-400"
                      />
                      <p className="text-[8px] font-mono text-white/40 uppercase">
                        If provided, submitted emails will automatically route to your Beehiiv publication audience.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DIRECT PRICING MODE CONFIGURATION */}
            {formData.pricingMode === 'direct' && (
              <div className="p-6 bg-emerald-500/5 border border-emerald-500/30 rounded-sm space-y-6">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Direct Single Buyout Pricing</span>
                  <span className="text-[9px] font-mono text-emerald-300 uppercase">License Tiers Bypassed</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Direct Track Price ($) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">$</span>
                      <input 
                        type="number"
                        step="0.01"
                        value={formData.directPrice}
                        onChange={(e) => setFormData({ ...formData, directPrice: e.target.value })}
                        className="w-full bg-black border border-emerald-500/30 p-3 pl-8 text-xl font-black text-emerald-400 outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Price Badge / Contract Label</label>
                    <input 
                      type="text"
                      value={formData.directPriceLabel}
                      onChange={(e) => setFormData({ ...formData, directPriceLabel: e.target.value })}
                      placeholder="e.g. Single Track Buyout"
                      className="w-full bg-black border border-white/20 p-3 text-xs font-bold text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Custom Direct Checkout URL (Optional)</label>
                  <input 
                    type="url"
                    value={formData.directCheckoutUrl}
                    onChange={(e) => setFormData({ ...formData, directCheckoutUrl: e.target.value })}
                    placeholder="https://stripe.com/pay/custom_beat_link or PayPal Invoice URL"
                    className="w-full bg-black border border-white/20 p-3 text-xs font-mono text-white outline-none focus:border-emerald-400"
                  />
                  <p className="text-[9px] text-white/40 uppercase">If provided, buyers clicking Buy will be directed to this exact link.</p>
                </div>
              </div>
            )}

            {/* TIERED LICENSING MATRIX WITH INDIVIDUAL ENABLE/DISABLE TOGGLES */}
            {formData.pricingMode === 'tiered' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-white/60">Quick Pricing Presets</span>
                  <div className="flex gap-2">
                    {(['lower', 'mid', 'upper', 'highest'] as const).map((blueprint) => (
                      <button
                        key={blueprint}
                        type="button"
                        onClick={() => applyBlueprint(blueprint)}
                        className={cn(
                          "px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all",
                          formData.selectedBlueprint === blueprint ? "bg-white text-black border-white" : "bg-white/5 text-white/40 border-white/10"
                        )}
                      >
                        {blueprint}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* BASIC MP3 TIER CARD */}
                  <div className={cn(
                    "p-6 border rounded-sm space-y-4 transition-all relative",
                    formData.enabledLicenses.basic 
                      ? "bg-white/[0.02] border-white/10" 
                      : "bg-black/80 border-red-500/30 opacity-60"
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 block">Basic MP3</span>
                      <button
                        type="button"
                        onClick={() => toggleLicenseTier('basic')}
                        className={cn(
                          "px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border transition-all",
                          formData.enabledLicenses.basic 
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                            : "bg-red-500/20 text-red-400 border-red-500/40"
                        )}
                      >
                        {formData.enabledLicenses.basic ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
                      <input 
                        type="number" 
                        disabled={!formData.enabledLicenses.basic}
                        value={formData.mp3LeasePrice}
                        onChange={(e) => setFormData({ ...formData, mp3LeasePrice: e.target.value })}
                        className="w-full bg-white/5 border border-white/15 p-3 pl-8 text-lg font-black text-white outline-none focus:border-purple-500 disabled:opacity-40"
                      />
                    </div>
                  </div>

                  {/* PREMIUM WAV TIER CARD */}
                  <div className={cn(
                    "p-6 border rounded-sm space-y-4 transition-all relative",
                    formData.enabledLicenses.premium 
                      ? "bg-white/[0.02] border-white/10" 
                      : "bg-black/80 border-red-500/30 opacity-60"
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 block">Premium WAV</span>
                      <button
                        type="button"
                        onClick={() => toggleLicenseTier('premium')}
                        className={cn(
                          "px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border transition-all",
                          formData.enabledLicenses.premium 
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                            : "bg-red-500/20 text-red-400 border-red-500/40"
                        )}
                      >
                        {formData.enabledLicenses.premium ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
                      <input 
                        type="number" 
                        disabled={!formData.enabledLicenses.premium}
                        value={formData.wavLeasePrice}
                        onChange={(e) => setFormData({ ...formData, wavLeasePrice: e.target.value })}
                        className="w-full bg-white/5 border border-white/15 p-3 pl-8 text-lg font-black text-white outline-none focus:border-purple-500 disabled:opacity-40"
                      />
                    </div>
                  </div>

                  {/* UNLIMITED STEMS TIER CARD */}
                  <div className={cn(
                    "p-6 border rounded-sm space-y-4 transition-all relative",
                    formData.enabledLicenses.unlimited 
                      ? "bg-white/[0.02] border-white/10" 
                      : "bg-black/80 border-red-500/30 opacity-60"
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 block">Unlimited Stems</span>
                      <button
                        type="button"
                        onClick={() => toggleLicenseTier('unlimited')}
                        className={cn(
                          "px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border transition-all",
                          formData.enabledLicenses.unlimited 
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                            : "bg-red-500/20 text-red-400 border-red-500/40"
                        )}
                      >
                        {formData.enabledLicenses.unlimited ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
                      <input 
                        type="number" 
                        disabled={!formData.enabledLicenses.unlimited}
                        value={formData.stemsLeasePrice}
                        onChange={(e) => setFormData({ ...formData, stemsLeasePrice: e.target.value })}
                        className="w-full bg-white/5 border border-white/15 p-3 pl-8 text-lg font-black text-white outline-none focus:border-purple-500 disabled:opacity-40"
                      />
                    </div>
                  </div>

                  {/* EXCLUSIVE RIGHTS TIER CARD */}
                  <div className={cn(
                    "p-6 border rounded-sm space-y-4 transition-all relative",
                    formData.enabledLicenses.exclusive 
                      ? "bg-white/[0.02] border-white/10" 
                      : "bg-black/80 border-red-500/30 opacity-60"
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 block">Exclusive Rights</span>
                      <button
                        type="button"
                        onClick={() => toggleLicenseTier('exclusive')}
                        className={cn(
                          "px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border transition-all",
                          formData.enabledLicenses.exclusive 
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                            : "bg-red-500/20 text-red-400 border-red-500/40"
                        )}
                      >
                        {formData.enabledLicenses.exclusive ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
                      <input 
                        type="number" 
                        disabled={!formData.enabledLicenses.exclusive}
                        value={formData.exclusiveBuyoutPrice}
                        onChange={(e) => setFormData({ ...formData, exclusiveBuyoutPrice: e.target.value })}
                        className="w-full bg-white/5 border border-white/15 p-3 pl-8 text-lg font-black text-white outline-none focus:border-purple-500 disabled:opacity-40"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {(activeSection === 6 || activeSection === 8) && (
          <div className="p-8 bg-neutral-950 border border-white/10 rounded-sm space-y-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <Cpu size={18} className="text-purple-400" />
                <h3 className="text-2xl font-black uppercase text-white tracking-tight">6. Discovery Metadata</h3>
              </div>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Search & Matching</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">BPM Tempo</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    value={formData.bpm}
                    onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 p-4 text-sm font-black text-white outline-none focus:border-purple-500"
                  />
                  <button 
                    type="button"
                    onClick={handleBpmTap}
                    className="px-4 py-2 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 active:scale-95 transition-all shrink-0"
                  >
                    Tap
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Key Scale</label>
                <input 
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="E.G. C Minor"
                  className="w-full bg-white/5 border border-white/15 p-4 text-sm font-black text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Primary Genre</label>
                <select 
                  value={formData.primaryGenre}
                  onChange={(e) => setFormData({ ...formData, primaryGenre: e.target.value })}
                  className="w-full bg-neutral-900 border border-white/15 p-4 text-sm font-black text-white outline-none focus:border-purple-500"
                >
                  {['Trap', 'Dark Trap', 'Melodic Trap', 'UK Drill', 'Chicago Drill', 'Boom Bap', 'R&B', 'Cinematic'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Subgenre / Style</label>
                <input 
                  type="text"
                  value={formData.subGenre}
                  onChange={(e) => setFormData({ ...formData, subGenre: e.target.value })}
                  placeholder="E.G. Cyber Drill"
                  className="w-full bg-white/5 border border-white/15 p-4 text-sm font-black text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* TAG CHIPS INPUT */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Search Tags (Press Enter)</label>
              <div className="p-4 bg-white/5 border border-white/15 rounded-sm flex flex-wrap items-center gap-2">
                {formData.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-purple-600/30 border border-purple-500/40 text-purple-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-white"><X size={12} /></button>
                  </span>
                ))}
                <input 
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={formData.tags.length < 10 ? "ADD TAG..." : "MAX 10 TAGS"}
                  className="bg-transparent text-xs font-bold text-white outline-none flex-1 min-w-[120px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 7. STORE OPTIONS & ADVANCED */}
        {(activeSection === 7 || activeSection === 8) && (
          <div className="p-8 bg-neutral-950 border border-white/10 rounded-sm space-y-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-purple-400" />
                <h3 className="text-2xl font-black uppercase text-white tracking-tight">7. Store Options</h3>
              </div>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Publishing Controls</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Release Visibility</label>
                <select 
                  value={formData.isPublic ? 'public' : 'private'}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === 'public' })}
                  className="w-full bg-neutral-900 border border-white/15 p-4 text-sm font-black text-white outline-none focus:border-purple-500"
                >
                  <option value="public">PUBLIC STOREFRONT RELEASE</option>
                  <option value="private">PRIVATE VIP LINK ONLY</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Scheduled Release Date</label>
                <input 
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 p-4 text-sm font-black text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* EXPANDABLE ADVANCED OPTIONS ACCORDION */}
            <div className="border border-white/10 rounded-sm overflow-hidden bg-neutral-900/50">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Settings size={18} className="text-purple-400" />
                  <div>
                    <h4 className="text-lg font-black uppercase text-white tracking-tight">ADVANCED OPTIONS</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Watermarking, Transcoding, Embed Code & Wallet Settings</p>
                  </div>
                </div>
                {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {showAdvanced && (
                <div className="p-6 border-t border-white/10 space-y-6 bg-black/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Watermark Profile</span>
                      <input 
                        type="text" 
                        value={formData.globalVoicetagProfile}
                        onChange={(e) => setFormData({ ...formData, globalVoicetagProfile: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 p-3 text-xs font-mono text-white outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60 block">Payout Wallet</span>
                      <input 
                        type="text" 
                        value={formData.payoutWalletEmail}
                        readOnly
                        className="w-full bg-white/5 border border-white/10 p-3 text-xs font-mono text-white/60 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 block">HTML5 Embed Code</span>
                    <div className="p-3 bg-white/5 border border-white/10 font-mono text-[9px] text-white/80 break-all">
                      {iframeCode}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP NAVIGATION ACTION BAR WITH NEXT STEP ARROW */}
        {activeSection < 8 && (
          <div className="p-6 bg-neutral-950 border border-white/15 rounded-sm flex items-center justify-between shadow-2xl">
            {activeSection > 1 ? (
              <button
                type="button"
                onClick={() => setActiveSection(prev => Math.max(1, prev - 1))}
                className="px-6 py-3.5 border border-white/20 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95"
              >
                <ArrowLeft size={16} /> Previous Step
              </button>
            ) : <div />}

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest hidden sm:inline">
                Step {activeSection} of 8: {sectionTabs.find(t => t.id === activeSection)?.name}
              </span>

              <button
                type="button"
                onClick={() => setActiveSection(prev => Math.min(8, prev + 1))}
                className="px-8 py-4 bg-white text-black font-black uppercase tracking-[0.25em] text-xs flex items-center gap-3 hover:bg-neutral-200 transition-all active:scale-95 shadow-2xl"
              >
                Next Step <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* 8. PUBLISH AREA & READINESS CHECKLIST */}
        <div className="p-8 bg-neutral-950 border border-white/15 rounded-sm space-y-8 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-2xl font-black uppercase text-white tracking-tight">READY TO PUBLISH</h3>
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">Launch Control</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className={cn("p-4 border text-center rounded-sm", isAudioReady ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400" : "border-white/10 text-white/40")}>
              <span className="text-xs font-black uppercase block">{isAudioReady ? '✓ Audio' : '○ Audio'}</span>
            </div>

            <div className={cn("p-4 border text-center rounded-sm", isArtworkReady ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400" : "border-white/10 text-white/40")}>
              <span className="text-xs font-black uppercase block">{isArtworkReady ? '✓ Artwork' : '○ Artwork'}</span>
            </div>

            <div className={cn("p-4 border text-center rounded-sm", isMetadataReady ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400" : "border-white/10 text-white/40")}>
              <span className="text-xs font-black uppercase block">{isMetadataReady ? '✓ Metadata' : '○ Metadata'}</span>
            </div>

            <div className={cn("p-4 border text-center rounded-sm", isPricingReady ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400" : "border-white/10 text-white/40")}>
              <span className="text-xs font-black uppercase block">{isPricingReady ? '✓ Pricing' : '○ Pricing'}</span>
            </div>

            <div className={cn("p-4 border text-center rounded-sm", isStoreReady ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400" : "border-white/10 text-white/40")}>
              <span className="text-xs font-black uppercase block">✓ Store Settings</span>
            </div>
          </div>

          {submissionError && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-sm text-xs font-mono text-red-400">
              ⚠️ {submissionError}
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h4 className="text-xl font-black uppercase text-white">Publish Live To Catalog</h4>
              <p className="text-xs text-white/40 uppercase tracking-wider">
                Pushes track live to storefront catalog with Direct audio streaming.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button 
                type="button"
                disabled={isSubmitting || isPublishSuccess}
                onClick={handlePublish}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                className={cn(
                  "w-full sm:w-auto px-16 py-6 font-black uppercase tracking-[0.3em] text-xs transition-all shadow-2xl shrink-0 flex items-center justify-center gap-3 rounded-sm",
                  (isSubmitting || isPublishSuccess)
                    ? "bg-purple-900/50 text-white/50 cursor-not-allowed border border-purple-500/30"
                    : "bg-purple-600 hover:bg-purple-500 text-white active:scale-95 cursor-pointer"
                )}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>PUBLISHING BEAT...</span>
                  </>
                ) : isPublishSuccess ? (
                  <>
                    <CheckCircle size={18} className="text-emerald-400" />
                    <span>BEAT PUBLISHED LIVE!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>PUBLISH PROJECT</span>
                  </>
                )}
              </button>

              {isPublishSuccess && (
                <button
                  type="button"
                  onClick={handleResetForNewBeat}
                  className="w-full sm:w-auto px-8 py-6 bg-white/10 hover:bg-white text-white hover:text-black font-black uppercase tracking-[0.2em] text-xs transition-all border border-white/20 shrink-0 cursor-pointer rounded-sm"
                >
                  + Create Another Beat
                </button>
              )}
              
              {editingBeat && editingBeat.isFree && (
                <button
                  type="button"
                  onClick={() => {
                    const downloadUrl = `${window.location.origin}/?beat=${editingBeat.id}&download=free`;
                    navigator.clipboard.writeText(downloadUrl);
                    alert('Free Download Link Copied: ' + downloadUrl);
                  }}
                  className="w-full sm:w-auto px-8 py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.2em] text-xs transition-all border border-emerald-500/20 shrink-0 cursor-pointer rounded-sm"
                >
                  Generate Free Download Link
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

