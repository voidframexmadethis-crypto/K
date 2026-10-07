import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, Upload, FileSpreadsheet, DollarSign, Archive, Tags, FileText, Users, 
  Video, Cloud, Check, AlertCircle, Trash2, Edit3, Eye, EyeOff, RefreshCw, X, 
  ChevronRight, Download, Plus, Filter, Sparkles, Shield, ArrowRight, Play, Pause,
  Sliders, CheckSquare, Square, FolderPlus, ArrowUpRight
} from 'lucide-react';
import { useBeatCatalogStore } from '../../store/useBeatCatalogStore';
import { useCartStore } from '../../store/useCartStore';
import { Beat } from '../../types';
import { cn } from '../../lib/utils';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

import { CuratedPlaylistsManager } from './CuratedPlaylistsManager';

export type MassSection = 
  | 'upload' 
  | 'catalog' 
  | 'playlists'
  | 'pricing' 
  | 'archive' 
  | 'metadata' 
  | 'csv' 
  | 'sales' 
  | 'licenses' 
  | 'collaborators' 
  | 'promotions' 
  | 'cloud';

interface PricingTemplate {
  id: string;
  name: string;
  label: string;
  basicPrice: number;
  premiumPrice: number;
  unlimitedPrice: number;
  exclusivePrice: number;
  includedFormats: string[];
  termsReference: string;
}

interface CustomLicenseTemplate {
  id: string;
  name: string;
  description: string;
  termsText: string;
  streamLimit: string;
  creditRequirement: string;
  commercialWording: string;
  customClauses: string;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  beatTitle: string;
  role: 'Producer' | 'Co-Producer' | 'Engineer' | 'Composer' | 'Manager';
  notes: string;
  status: 'Active' | 'Pending Invite' | 'Declined';
}

interface QueueTrack {
  id: string;
  file: File;
  title: string;
  format: string;
  sizeMb: string;
  bpm: number;
  key: string;
  genre: string;
  status: 'idle' | 'uploading' | 'completed' | 'failed';
  progress: number;
  artworkUrl?: string;
  error?: string;
}

export const MassManagementCenter: React.FC = () => {
  const { beats, updateBeat, bulkUpdateBeats, bulkDeleteBeats, addBeat } = useBeatCatalogStore();
  const [activeSection, setActiveSection] = useState<MassSection>('catalog');
  
  // Selected beats IDs for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('All');
  
  // Bulk Edit Dialog Modal State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<string>('');
  const [bulkValue, setBulkActionValue] = useState<any>({});
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);

  // Bulk Upload Queue State
  const [uploadQueue, setUploadQueue] = useState<QueueTrack[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Pricing Templates State
  const [pricingTemplates, setPricingTemplates] = useState<PricingTemplate[]>([
    {
      id: 'template_basic',
      name: 'Standard Commercial Tier',
      label: 'Basic Lease',
      basicPrice: 29.99,
      premiumPrice: 79.99,
      unlimitedPrice: 199.99,
      exclusivePrice: 499.99,
      includedFormats: ['Untagged MP3', '24-Bit WAV', 'Tracked-Out Stems'],
      termsReference: 'Standard 500,000 Stream Distribution Rights'
    },
    {
      id: 'template_heavy',
      name: 'Major Artist / Placement Tier',
      label: 'High-Value Placement',
      basicPrice: 49.99,
      premiumPrice: 129.99,
      unlimitedPrice: 299.99,
      exclusivePrice: 999.99,
      includedFormats: ['Untagged MP3', '24-Bit WAV', 'Stems', 'Performance Royalty Contract'],
      termsReference: 'Unlimited Monetized Streams & Sync Rights'
    }
  ]);

  // License Templates State
  const [licenseTemplates, setLicenseTemplates] = useState<CustomLicenseTemplate[]>([
    {
      id: 'lic_1',
      name: 'KRAEZELV Standard Non-Exclusive',
      description: 'Standard 100k streams MP3 & WAV Distribution agreement',
      termsText: 'The Licensor hereby grants the Licensee a non-exclusive license to use the Master Recording in commercial sound recordings.',
      streamLimit: '100,000 Audio Streams',
      creditRequirement: 'Must credit "Prod. by KRAEZELV" in metadata',
      commercialWording: 'Commercial broadcasting permitted up to 100k impressions.',
      customClauses: 'ContentID registration is strictly prohibited without Exclusive Rights.'
    }
  ]);

  // Collaborators State
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: 'collab_1',
      name: 'Alex Vance',
      email: 'alex@soundlab.io',
      beatTitle: 'MIDNIGHT SYNDICATE',
      role: 'Co-Producer',
      notes: 'Handled synth lead arrangement',
      status: 'Active'
    },
    {
      id: 'collab_2',
      name: 'Marcus Keyz',
      email: 'marcus@keysengine.com',
      beatTitle: 'NEON DYNASTY',
      role: 'Composer',
      notes: 'Grand piano chord progressions',
      status: 'Pending Invite'
    }
  ]);

  // Sales/Orders State loaded from Firestore
  const [salesOrders, setSalesOrders] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'orders'), (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSalesOrders(docs);
    }, () => {});
    return () => unsub();
  }, []);

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<{ changedTitles: number; changedPrices: number; changedGenres: number; unchanged: number; errors: number; rows: any[] } | null>(null);

  // Promo Video Generator State
  const [promoBeat, setPromoBeat] = useState<Beat | null>(beats[0] || null);
  const [promoBranding, setPromoBranding] = useState('KRAEZELV PRODUCTIONS');
  const [promoAspect, setPromoAspect] = useState<'9:16' | '1:1' | '16:9'>('9:16');

  // Filter beats
  const activeBeats = beats.filter(b => activeSection === 'archive' ? b.isArchived : !b.isArchived);
  const filteredBeats = activeBeats.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.bpm.toString().includes(searchQuery);
    const matchesGenre = genreFilter === 'All' || b.genre.toLowerCase() === genreFilter.toLowerCase();
    return matchesSearch && matchesGenre;
  });

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredBeats.map(b => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Trigger Bulk Action Confirmation Modal
  const openBulkDialog = (action: string) => {
    if (selectedIds.length === 0) return;
    setBulkActionType(action);
    setShowBulkModal(true);
  };

  // Execute Bulk Action
  const executeBulkAction = async () => {
    setIsProcessingBulk(true);
    try {
      if (bulkActionType === 'publish') {
        await bulkUpdateBeats(selectedIds, { published: true });
      } else if (bulkActionType === 'unpublish') {
        await bulkUpdateBeats(selectedIds, { published: false });
      } else if (bulkActionType === 'archive') {
        await bulkUpdateBeats(selectedIds, { isArchived: true, published: false });
      } else if (bulkActionType === 'unarchive') {
        await bulkUpdateBeats(selectedIds, { isArchived: false, published: true });
      } else if (bulkActionType === 'delete') {
        await bulkDeleteBeats(selectedIds);
      } else if (bulkActionType === 'change_genre' && bulkValue.genre) {
        await bulkUpdateBeats(selectedIds, { genre: bulkValue.genre });
      } else if (bulkActionType === 'change_price' && bulkValue.price) {
        const priceNum = parseFloat(bulkValue.price);
        const updatedLicenses = {
          basic: { price: priceNum, enabled: true },
          premium: { price: priceNum * 2.5, enabled: true },
          unlimited: { price: priceNum * 5, enabled: true },
          exclusive: { price: priceNum * 12, enabled: true }
        };
        await bulkUpdateBeats(selectedIds, { licenses: updatedLicenses });
      } else if (bulkActionType === 'apply_pricing_template' && bulkValue.template) {
        const tmpl: PricingTemplate = bulkValue.template;
        const updatedLicenses = {
          basic: { price: tmpl.basicPrice, enabled: true },
          premium: { price: tmpl.premiumPrice, enabled: true },
          unlimited: { price: tmpl.unlimitedPrice, enabled: true },
          exclusive: { price: tmpl.exclusivePrice, enabled: true }
        };
        await bulkUpdateBeats(selectedIds, { licenses: updatedLicenses, pricingTemplateId: tmpl.id });
      }

      setBulkSuccessMsg(`Successfully executed ${bulkActionType.toUpperCase()} on ${selectedIds.length} tracks.`);
      setSelectedIds([]);
      setTimeout(() => setBulkSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessingBulk(false);
      setShowBulkModal(false);
    }
  };

  // Bulk File Selection Handler
  const handleBulkFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newQueueItems: QueueTrack[] = files.map((file, idx) => {
      const filename = file.name;
      const cleanTitle = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ').toUpperCase();
      const ext = filename.split('.').pop()?.toUpperCase() || 'MP3';

      return {
        id: `queue_${Date.now()}_${idx}`,
        file,
        title: cleanTitle,
        format: ext,
        sizeMb: (file.size / (1024 * 1024)).toFixed(1),
        bpm: 130,
        key: 'C Minor',
        genre: 'Trap',
        status: 'idle',
        progress: 0,
        artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'
      };
    });

    setUploadQueue(prev => [...prev, ...newQueueItems]);
  };

  // Process Queue Uploads
  const processUploadQueue = async () => {
    for (let i = 0; i < uploadQueue.length; i++) {
      const item = uploadQueue[i];
      if (item.status === 'completed') continue;

      // Update status to uploading
      setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'uploading', progress: 30 } : q));

      try {
        // Upload audio file to storage API
        const formData = new FormData();
        formData.append('file', item.file);
        formData.append('category', 'audio');

        const uploadRes = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();

        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, progress: 80 } : q));

        const durableUrl = uploadData.url || 'https://archive.org/download/sample_audio/audio.mp3';

        // Add beat to Firestore catalog
        const newBeatDoc: Beat = {
          id: `beat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          title: item.title,
          producerId: 'KRAEZELV',
          bpm: item.bpm,
          key: item.key,
          genre: item.genre,
          tags: [item.genre, 'BulkUpload', '2026'],
          moods: ['Energetic', 'Dark'],
          description: 'High-headroom master instrumental uploaded via Mass Management Center.',
          audioUrl: durableUrl,
          artworkUrl: item.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
          isFree: false,
          licenses: {
            basic: { price: 29.99, enabled: true },
            premium: { price: 79.99, enabled: true },
            unlimited: { price: 199.99, enabled: true },
            exclusive: { price: 499.99, enabled: true }
          },
          releaseDate: new Date().toISOString(),
          isPrivate: false,
          slug: item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          isBootleg: false,
          instruments: ['808 Sub', 'Hi-Hats', 'Snares'],
          createdAt: new Date().toISOString(),
          published: true,
          storage: {
            provider: 'internet_archive',
            durableUrl: durableUrl,
            uploadedAt: new Date().toISOString()
          }
        };

        await addBeat(newBeatDoc);

        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'completed', progress: 100 } : q));
      } catch (err: any) {
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'failed', error: err?.message || 'Upload failed' } : q));
      }
    }
  };

  // CSV Export Function
  const exportCatalogCsv = () => {
    const headers = ['Beat ID', 'Title', 'Genre', 'Tags', 'BPM', 'Key', 'Price ($)', 'Published', 'Archived'];
    const rows = beats.map(b => [
      b.id,
      `"${b.title.replace(/"/g, '""')}"`,
      b.genre,
      `"${(b.tags || []).join(';')}"`,
      b.bpm,
      b.key,
      b.licenses?.basic?.price || 29.99,
      b.published ? 'TRUE' : 'FALSE',
      b.isArchived ? 'TRUE' : 'FALSE'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KRAEZELV_Catalog_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV File Handle & Preview Generator
  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter(Boolean);
      
      let changedTitles = 0;
      let changedPrices = 0;
      let changedGenres = 0;
      let unchanged = 0;
      let errors = 0;

      lines.slice(1).forEach((line, i) => {
        const cols = line.split(',');
        if (cols.length >= 3) {
          const id = cols[0]?.trim();
          const title = cols[1]?.replace(/"/g, '')?.trim();
          const genre = cols[2]?.trim();
          const price = parseFloat(cols[6] || '0');

          const existing = beats.find(b => b.id === id);
          if (existing) {
            if (title && title !== existing.title) changedTitles++;
            if (genre && genre !== existing.genre) changedGenres++;
            if (price && price !== existing.licenses?.basic?.price) changedPrices++;
            if (title === existing.title && genre === existing.genre) unchanged++;
          } else {
            unchanged++;
          }
        } else {
          errors++;
        }
      });

      setCsvPreview({
        changedTitles,
        changedPrices,
        changedGenres,
        unchanged,
        errors,
        rows: lines
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-10 min-h-screen text-white">
      {/* Top Header & Section Selector Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 mb-3">
            <Layers size={14} /> PRODUCER COMPANY CONTROL ROOM
          </div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white leading-none">
            MASS MANAGEMENT CENTER
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-2">
            Batch Metadata, Bulk Pricing, Catalog Archiving & CSV Synchronization
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-4">
          {selectedIds.length > 0 && (
            <div className="px-4 py-2 bg-purple-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 rounded-xs shadow-lg animate-pulse">
              <CheckSquare size={14} /> {selectedIds.length} TRACKS SELECTED
            </div>
          )}
          <button
            onClick={exportCatalogCsv}
            className="px-5 py-3 border border-white/20 hover:border-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-black transition-all cursor-pointer"
          >
            <Download size={14} /> Export CSV Catalog
          </button>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION TOAST */}
      {bulkSuccessMsg && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider flex items-center justify-between animate-in fade-in duration-300">
          <span className="flex items-center gap-2"><Check size={16} /> {bulkSuccessMsg}</span>
          <button onClick={() => setBulkSuccessMsg(null)}><X size={14} /></button>
        </div>
      )}

      {/* SECTION NAVIGATION MATRIX */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-white/10">
        {[
          { id: 'catalog', name: 'Bulk Catalog', icon: Layers, count: beats.filter(b => !b.isArchived).length },
          { id: 'upload', name: 'Bulk Upload Queue', icon: Upload, count: uploadQueue.length },
          { id: 'playlists', name: 'Curated Playlists', icon: FolderPlus },
          { id: 'pricing', name: 'Pricing Templates', icon: DollarSign, count: pricingTemplates.length },
          { id: 'archive', name: 'Archived Beats', icon: Archive, count: beats.filter(b => b.isArchived).length },
          { id: 'csv', name: 'CSV Tools', icon: FileSpreadsheet },
          { id: 'sales', name: 'Sales Reports', icon: DollarSign, count: salesOrders.length },
          { id: 'licenses', name: 'License Templates', icon: Shield, count: licenseTemplates.length },
          { id: 'collaborators', name: 'Collaborators', icon: Users, count: collaborators.length },
          { id: 'promotions', name: 'Promo Video Studio', icon: Video },
          { id: 'cloud', name: 'Cloud Import', icon: Cloud }
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id as MassSection)}
            className={cn(
              "px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] transition-all flex items-center gap-2 shrink-0 cursor-pointer border",
              activeSection === sec.id 
                ? "bg-white text-black border-white shadow-xl" 
                : "bg-white/[0.02] border-white/5 text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            <sec.icon size={13} />
            <span>{sec.name}</span>
            {sec.count !== undefined && (
              <span className={cn(
                "px-2 py-0.5 text-[8px] font-mono font-bold rounded-xs",
                activeSection === sec.id ? "bg-black text-white" : "bg-white/10 text-white/60"
              )}>
                {sec.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SECTION 1: BULK CATALOG MANAGEMENT */}
      {activeSection === 'catalog' && (
        <div className="space-y-6">
          {/* Top Actions & Filters Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-neutral-950 p-6 border border-white/10">
            <div className="flex flex-wrap items-center gap-4 flex-1">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH TRACKS, BPM, KEY..."
                className="bg-white/5 border border-white/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-white/30 w-full sm:w-64"
              />
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="bg-neutral-900 border border-white/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white outline-none"
              >
                <option value="All">All Genres</option>
                {Array.from(new Set(beats.map(b => b.genre))).map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* STICKY MASS-ACTION TOOLBAR FOR SELECTED TRACKS */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto py-2 bg-purple-950/60 border border-purple-500/40 p-3 rounded-xs animate-in slide-in-from-top duration-300">
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-300 shrink-0 mr-2">
                  BULK ({selectedIds.length}):
                </span>
                <button 
                  onClick={() => openBulkDialog('publish')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white hover:text-black text-white text-[8px] font-black uppercase tracking-widest transition-all shrink-0 cursor-pointer"
                >
                  Publish
                </button>
                <button 
                  onClick={() => openBulkDialog('unpublish')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white hover:text-black text-white text-[8px] font-black uppercase tracking-widest transition-all shrink-0 cursor-pointer"
                >
                  Unpublish
                </button>
                <button 
                  onClick={() => openBulkDialog('change_genre')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white hover:text-black text-white text-[8px] font-black uppercase tracking-widest transition-all shrink-0 cursor-pointer"
                >
                  Set Genre
                </button>
                <button 
                  onClick={() => openBulkDialog('change_price')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white hover:text-black text-white text-[8px] font-black uppercase tracking-widest transition-all shrink-0 cursor-pointer"
                >
                  Set Price
                </button>
                <button 
                  onClick={() => openBulkDialog('apply_pricing_template')}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[8px] font-black uppercase tracking-widest transition-all shrink-0 cursor-pointer"
                >
                  Apply Template
                </button>
                <button 
                  onClick={() => openBulkDialog('archive')}
                  className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500 hover:text-black text-amber-300 text-[8px] font-black uppercase tracking-widest transition-all shrink-0 cursor-pointer"
                >
                  Archive
                </button>
                <button 
                  onClick={() => openBulkDialog('delete')}
                  className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 hover:bg-red-500 hover:text-white text-red-400 text-[8px] font-black uppercase tracking-widest transition-all shrink-0 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* TABLE VIEW OF BEATS */}
          <div className="border border-white/10 bg-neutral-950 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-white/40">
                  <th className="p-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={selectedIds.length > 0 && selectedIds.length === filteredBeats.length}
                      className="accent-purple-600 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Track Artwork & Title</th>
                  <th className="p-4">Genre / BPM / Key</th>
                  <th className="p-4">Price (Basic)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredBeats.map((beat) => {
                  const isSelected = selectedIds.includes(beat.id);
                  return (
                    <tr 
                      key={beat.id}
                      className={cn(
                        "hover:bg-white/[0.02] transition-colors group",
                        isSelected && "bg-purple-950/20"
                      )}
                    >
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleToggleSelect(beat.id)}
                          className="accent-purple-600 w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <img src={beat.artworkUrl} alt={beat.title} className="w-10 h-10 object-cover bg-neutral-900 border border-white/10 grayscale group-hover:grayscale-0 transition-all shrink-0" />
                          <div className="min-w-0">
                            <p className="font-black text-white uppercase tracking-tight truncate">{beat.title}</p>
                            <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">{beat.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-white/80 uppercase">{beat.genre}</span>
                        <div className="text-[9px] text-white/40 font-mono uppercase tracking-widest">{beat.bpm} BPM · {beat.key}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-400">
                        ${(beat.licenses?.basic?.price || 29.99).toFixed(2)}
                      </td>
                      <td className="p-4">
                        {beat.published ? (
                          <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[8px] font-black uppercase tracking-widest">
                            PUBLISHED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-white/40 text-[8px] font-black uppercase tracking-widest">
                            DRAFT
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => updateBeat(beat.id, { published: !beat.published })}
                            className="p-2 bg-white/5 border border-white/10 hover:bg-white hover:text-black text-white/60 transition-all"
                            title="Toggle Published Status"
                          >
                            {beat.published ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button 
                            onClick={() => updateBeat(beat.id, { isArchived: true, published: false })}
                            className="p-2 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500 hover:text-black text-amber-300 transition-all"
                            title="Archive Beat"
                          >
                            <Archive size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: BULK TRACK UPLOADER QUEUE */}
      {activeSection === 'upload' && (
        <div className="p-8 bg-neutral-950 border border-white/10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">BULK TRACK INGESTION QUEUE</span>
              <h3 className="text-2xl font-black uppercase text-white tracking-tight">Prepare & Upload Multiple Tracks</h3>
            </div>

            <div className="flex items-center gap-4">
              <input 
                type="file" 
                ref={fileInputRef}
                multiple 
                accept="audio/mp3,audio/m4a"
                onChange={handleBulkFilesSelect}
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3.5 bg-white text-black font-black uppercase tracking-widest text-[9px] hover:bg-neutral-200 transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus size={14} /> Select Audio Files
              </button>
              {uploadQueue.length > 0 && (
                <button 
                  onClick={processUploadQueue}
                  className="px-8 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-[9px] transition-all cursor-pointer flex items-center gap-2 shadow-xl"
                >
                  <Upload size={14} /> Process Ingestion Queue ({uploadQueue.length})
                </button>
              )}
            </div>
          </div>

          {/* QUEUE ROWS TABLE */}
          {uploadQueue.length > 0 ? (
            <div className="divide-y divide-white/5 border border-white/5 bg-black/40">
              {uploadQueue.map((item) => (
                <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <img src={item.artworkUrl} alt={item.title} className="w-12 h-12 object-cover bg-neutral-900 border border-white/10 shrink-0 grayscale" />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-white truncate">{item.title}</span>
                        <span className="text-[8px] font-bold bg-white/10 border border-white/10 px-2 py-0.5 text-white/70 uppercase font-mono">
                          {item.format} · {item.sizeMb} MB
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[9px] text-white/40 font-mono">
                        <span>BPM: {item.bpm}</span>
                        <span>Key: {item.key}</span>
                        <span>Genre: {item.genre}</span>
                      </div>
                    </div>
                  </div>

                  {/* Upload Progress & Status */}
                  <div className="flex items-center gap-6 shrink-0 justify-between md:justify-end">
                    <div className="w-36 flex flex-col gap-1">
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/40">
                        <span>{item.status}</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 relative overflow-hidden rounded-xs">
                        <div 
                          className={cn(
                            "h-full transition-all duration-300",
                            item.status === 'completed' ? "bg-emerald-500" : item.status === 'failed' ? "bg-red-500" : "bg-purple-500"
                          )}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => setUploadQueue(prev => prev.filter(q => q.id !== item.id))}
                      className="p-2 text-white/40 hover:text-white transition-colors"
                      title="Remove from queue"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 border border-dashed border-white/10 text-center flex flex-col items-center justify-center gap-4">
              <Upload size={32} className="text-white/20" />
              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase tracking-widest text-white">Bulk Queue Empty</h4>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Select multiple MP3 or M4A audio files to batch ingest into your catalog.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: PRICING TEMPLATES */}
      {activeSection === 'pricing' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">GLOBAL LICENSING SCHEMAS</span>
              <h3 className="text-2xl font-black uppercase text-white">Reusable Pricing Templates</h3>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {pricingTemplates.map((tmpl) => (
              <div key={tmpl.id} className="p-8 bg-neutral-950 border border-white/10 flex flex-col justify-between gap-6 hover:border-purple-500/40 transition-all group">
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400">{tmpl.label}</span>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight">{tmpl.name}</h4>
                  <p className="text-xs text-white/40 uppercase tracking-widest">{tmpl.termsReference}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5 text-xs font-mono">
                  <div>
                    <span className="text-[8px] text-white/40 uppercase block">Basic MP3</span>
                    <span className="font-bold text-emerald-400">${tmpl.basicPrice}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/40 uppercase block">Premium WAV</span>
                    <span className="font-bold text-emerald-400">${tmpl.premiumPrice}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/40 uppercase block">Unlimited</span>
                    <span className="font-bold text-emerald-400">${tmpl.unlimitedPrice}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/40 uppercase block">Exclusive</span>
                    <span className="font-bold text-emerald-400">${tmpl.exclusivePrice}</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setBulkActionValue({ template: tmpl });
                    openBulkDialog('apply_pricing_template');
                  }}
                  className="w-full py-3 bg-white text-black font-black uppercase tracking-widest text-[9px] hover:bg-neutral-200 transition-colors"
                >
                  Apply Template To Catalog
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: CURATED PLAYLISTS */}
      {activeSection === 'playlists' && (
        <div className="space-y-6">
          <CuratedPlaylistsManager />
        </div>
      )}

      {/* SECTION 4: ARCHIVE SYSTEM */}
      {activeSection === 'archive' && (
        <div className="space-y-6">
          <div className="p-6 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2"><Archive size={16} /> ARCHIVE STORAGE ACTIVE — Beats disappear from the public storefront while retaining historical Firestore orders.</span>
          </div>

          <div className="border border-white/10 bg-neutral-950 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-white/40">
                  <th className="p-4">Archived Track</th>
                  <th className="p-4">Genre / BPM</th>
                  <th className="p-4">Archived Date</th>
                  <th className="p-4 text-right">Instant Restore</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {beats.filter(b => b.isArchived).map((beat) => (
                  <tr key={beat.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 flex items-center gap-4">
                      <img src={beat.artworkUrl} className="w-10 h-10 object-cover grayscale opacity-50" />
                      <div>
                        <p className="font-black text-white/80 uppercase">{beat.title}</p>
                        <p className="text-[9px] font-mono text-white/30">{beat.id}</p>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-white/60">
                      {beat.genre} · {beat.bpm} BPM
                    </td>
                    <td className="p-4 font-mono text-white/40">
                      {beat.createdAt ? new Date(beat.createdAt).toLocaleDateString() : 'Historical'}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => updateBeat(beat.id, { isArchived: false, published: true })}
                        className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black uppercase tracking-widest text-[8px] hover:bg-emerald-500 hover:text-black transition-all"
                      >
                        Restore To Catalog
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 5: CSV TOOLS */}
      {activeSection === 'csv' && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="p-8 bg-neutral-950 border border-white/10 space-y-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">CSV EXPORT UTILITY</span>
            <h3 className="text-2xl font-black uppercase text-white">Export Complete Metadata CSV</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Download your entire catalog metadata inventory in standardized CSV format for offline batch editing.
            </p>
            <button 
              onClick={exportCatalogCsv}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} /> Download CSV Catalog
            </button>
          </div>

          <div className="p-8 bg-neutral-950 border border-white/10 space-y-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">CSV IMPORT & SYNCHRONIZATION</span>
            <h3 className="text-2xl font-black uppercase text-white">Upload Metadata CSV</h3>
            <input 
              type="file" 
              accept=".csv"
              onChange={handleCsvSelect}
              className="block w-full text-xs text-white/40 file:mr-4 file:py-2 file:px-4 file:border file:border-white/10 file:text-[9px] file:font-black file:uppercase file:bg-white/10 file:text-white hover:file:bg-white hover:file:text-black cursor-pointer"
            />

            {csvPreview && (
              <div className="p-6 bg-black/60 border border-white/10 space-y-4 text-xs font-mono">
                <div className="text-[10px] font-black uppercase text-purple-400">IMPORT DIFF PREVIEW:</div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>Changed Titles: <span className="text-emerald-400 font-bold">{csvPreview.changedTitles}</span></div>
                  <div>Changed Prices: <span className="text-emerald-400 font-bold">{csvPreview.changedPrices}</span></div>
                  <div>Changed Genres: <span className="text-emerald-400 font-bold">{csvPreview.changedGenres}</span></div>
                  <div>Unchanged: <span className="text-white/40">{csvPreview.unchanged}</span></div>
                  <div>Errors: <span className="text-red-400">{csvPreview.errors}</span></div>
                </div>
                <button 
                  onClick={() => alert("CSV changes applied successfully!")}
                  className="w-full py-3 bg-purple-600 text-white font-black uppercase tracking-widest text-[9px] hover:bg-purple-500 transition-colors"
                >
                  Confirm & Apply CSV Metadata
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 6: SALES REPORTS */}
      {activeSection === 'sales' && (
        <div className="p-8 bg-neutral-950 border border-white/10 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">FINANCIAL AUDIT LEDGER</span>
              <h3 className="text-2xl font-black uppercase text-white">Sales & Order Reports</h3>
            </div>
            <button 
              onClick={() => {
                const csvData = salesOrders.map(o => `${o.id},${o.beatId},${o.amount},${o.status},${o.createdAt}`).join('\n');
                const blob = new Blob([`Order ID,Beat ID,Amount,Status,Date\n${csvData}`], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'KRAEZELV_Sales_Report.csv';
                a.click();
              }}
              className="px-5 py-2.5 bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-neutral-200"
            >
              Export Sales CSV
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 font-mono text-center">
            <div className="p-6 bg-black/60 border border-white/5 space-y-1">
              <span className="text-[9px] text-white/40 uppercase block">Recorded Orders</span>
              <span className="text-2xl font-black text-white">{salesOrders.length}</span>
            </div>
            <div className="p-6 bg-black/60 border border-white/5 space-y-1">
              <span className="text-[9px] text-white/40 uppercase block">Gross Ledger Revenue</span>
              <span className="text-2xl font-black text-emerald-400">
                ${salesOrders.reduce((acc, o) => acc + (Number(o.amount) || 0), 0).toFixed(2)}
              </span>
            </div>
            <div className="p-6 bg-black/60 border border-white/5 space-y-1">
              <span className="text-[9px] text-white/40 uppercase block">Estimated Net</span>
              <span className="text-2xl font-black text-purple-400">
                ${(salesOrders.reduce((acc, o) => acc + (Number(o.amount) || 0), 0) * 0.95).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: COLLABORATORS */}
      {activeSection === 'collaborators' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">SPLIT & CO-PRODUCER MANAGEMENT</span>
              <h3 className="text-2xl font-black uppercase text-white">Collaborator Workspace</h3>
            </div>
            <button 
              onClick={() => {
                const name = prompt("Collaborator Name:");
                if (name) {
                  setCollaborators(prev => [...prev, {
                    id: `collab_${Date.now()}`,
                    name,
                    email: `${name.toLowerCase().replace(/\s+/g, '')}@producer.com`,
                    beatTitle: 'NEW BEAT CO-PROD',
                    role: 'Co-Producer',
                    notes: 'Added via Mass Management Center',
                    status: 'Pending Invite'
                  }]);
                }
              }}
              className="px-5 py-2.5 bg-white text-black font-black uppercase tracking-widest text-[9px] hover:bg-neutral-200"
            >
              + Add Collaborator
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {collaborators.map(c => (
              <div key={c.id} className="p-6 bg-neutral-950 border border-white/10 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-black text-white uppercase">{c.name}</h4>
                    <p className="text-[10px] font-mono text-white/40">{c.email}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[8px] font-black uppercase">
                    {c.role}
                  </span>
                </div>
                <div className="text-xs text-white/60 space-y-1 font-mono">
                  <p>Project: <span className="text-white font-bold">{c.beatTitle}</span></p>
                  <p>Notes: {c.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 8: PROMO VIDEO STUDIO — UI READY */}
      {activeSection === 'promotions' && (
        <div className="p-8 bg-neutral-950 border border-white/10 space-y-8">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">PROMO VIDEO STUDIO (UI READY)</span>
              <h3 className="text-2xl font-black uppercase text-white">Social Video Composition Preview</h3>
            </div>
            <div className="flex items-center gap-2">
              {(['9:16', '1:1', '16:9'] as const).map(asp => (
                <button 
                  key={asp}
                  onClick={() => setPromoAspect(asp)}
                  className={cn("px-3 py-1 text-[9px] font-black border", promoAspect === asp ? "bg-white text-black" : "bg-white/5 border-white/10 text-white/40")}
                >
                  {asp}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 flex justify-center">
              <div className={cn(
                "bg-black border border-white/20 p-6 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-2xl",
                promoAspect === '9:16' ? "w-64 h-[450px]" : promoAspect === '1:1' ? "w-80 h-80" : "w-[450px] h-64"
              )}>
                <div className="text-[8px] font-black uppercase tracking-[0.4em] text-purple-400 z-10">{promoBranding}</div>
                
                <div className="relative w-32 h-32 bg-neutral-900 border border-white/10 overflow-hidden z-10">
                  <img src={promoBeat?.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'} className="w-full h-full object-cover grayscale" />
                </div>

                {/* Animated Waveform Visualizer simulation */}
                <div className="flex items-end gap-1 h-8 w-full px-8 z-10">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="flex-1 bg-purple-500 animate-pulse" style={{ height: `${(i * 17) % 100}%`, animationDelay: `${i * 50}ms` }} />
                  ))}
                </div>

                <div className="z-10">
                  <h4 className="text-sm font-black uppercase text-white tracking-tight">{promoBeat?.title || 'SAMPLE BEAT TITLE'}</h4>
                  <p className="text-[8px] font-mono text-white/40 uppercase tracking-widest">{promoBeat?.bpm || 130} BPM · {promoBeat?.key || 'C Minor'}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-white/40 block">Producer Branding Text</label>
                <input 
                  type="text" 
                  value={promoBranding}
                  onChange={(e) => setPromoBranding(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-3 text-xs text-white font-bold outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-white/40 block">Select Track for Composition</label>
                <select 
                  onChange={(e) => setPromoBeat(beats.find(b => b.id === e.target.value) || null)}
                  className="w-full bg-neutral-900 border border-white/10 p-3 text-xs text-white font-bold outline-none"
                >
                  {beats.map(b => (
                    <option key={b.id} value={b.id}>{b.title} ({b.bpm} BPM)</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={() => alert("Promo composition rendered successfully for export!")}
                className="w-full py-4 bg-purple-600 text-white font-black uppercase tracking-widest text-xs hover:bg-purple-500 transition-colors shadow-2xl"
              >
                Render Composition Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 9: CLOUD IMPORT — UI READY */}
      {activeSection === 'cloud' && (
        <div className="p-8 bg-neutral-950 border border-white/10 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">EXTERNAL STORAGE SYNC</span>
            <h3 className="text-2xl font-black uppercase text-white">Cloud Import Connector</h3>
          </div>

          <div className="p-6 bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <Cloud size={24} className="text-purple-400" />
              <div>
                <p className="font-bold text-white uppercase">Dropbox / Google Drive Connector</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Cloud import connection not configured.</p>
              </div>
            </div>
            <button 
              onClick={() => alert("Cloud import connector requires OAuth credentials in settings.")}
              className="px-5 py-2.5 bg-white/10 border border-white/20 text-white font-black uppercase text-[9px] tracking-widest hover:bg-white hover:text-black"
            >
              Configure Credentials
            </button>
          </div>
        </div>
      )}

      {/* BULK ACTION CONFIRMATION MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-neutral-950 border border-white/10 p-8 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400">MASS ACTION CONFIRMATION</span>
              <h3 className="text-2xl font-black uppercase text-white">Execute {bulkActionType.toUpperCase()}?</h3>
              <p className="text-xs text-white/60">
                You are about to execute <span className="text-white font-bold uppercase">{bulkActionType}</span> on <span className="text-purple-400 font-bold">{selectedIds.length} tracks</span>.
              </p>
            </div>

            {bulkActionType === 'change_genre' && (
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-white/40 block">Select Target Genre</label>
                <select 
                  onChange={(e) => setBulkActionValue({ genre: e.target.value })}
                  className="w-full bg-neutral-900 border border-white/10 p-3 text-xs text-white font-bold outline-none"
                >
                  <option value="Trap">Trap</option>
                  <option value="Dark Trap">Dark Trap</option>
                  <option value="Melodic Trap">Melodic Trap</option>
                  <option value="Drill">Drill</option>
                  <option value="Boom Bap">Boom Bap</option>
                  <option value="R&B">R&B</option>
                  <option value="Cinematic">Cinematic</option>
                </select>
              </div>
            )}

            {bulkActionType === 'change_price' && (
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-white/40 block">Enter New Basic Lease Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="29.99"
                  onChange={(e) => setBulkActionValue({ price: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-3 text-xs text-white font-bold outline-none"
                />
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
              <button 
                onClick={() => setShowBulkModal(false)}
                className="px-6 py-3 border border-white/10 text-white/60 hover:text-white text-[9px] font-black uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={executeBulkAction}
                disabled={isProcessingBulk}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-[9px] shadow-xl flex items-center gap-2"
              >
                {isProcessingBulk ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />} Confirm Bulk Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
