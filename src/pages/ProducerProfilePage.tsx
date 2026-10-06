import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Music, 
  Globe, 
  Youtube, 
  Instagram, 
  Twitter, 
  Send, 
  ExternalLink, 
  Settings, 
  Sparkles, 
  CheckCircle2, 
  Play, 
  ShoppingCart, 
  Download, 
  Disc, 
  Radio, 
  Search,
  Share2,
  Tv
} from 'lucide-react';
import { useBeatCatalogStore } from '../store/useBeatCatalogStore';
import { BeatCard } from '../components/beats/BeatCard';
import { BeatShareModal } from '../components/player/BeatShareModal';
import { PlacementShowcase } from '../components/home/PlacementShowcase';
import { VerifiedReviewsSection } from '../components/beats/VerifiedReviewsSection';

export const ProducerProfilePage = () => {
  const { beats } = useBeatCatalogStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');

  // Load profile from localStorage (saved in Dashboard Settings) or fallback
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('kraezelv_producer_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved producer profile', e);
      }
    }
    return {
      displayName: 'KRAEZELV',
      username: 'kraezelv',
      location: 'Atlanta, GA / Global',
      primaryGenre: 'Dark Trap / UK Drill',
      bio: 'Multi-platinum certified trap & drill producer. Crafting dark, cinematic instrumentals for top charting artists worldwide.',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&auto=format&fit=crop&q=80',
      socials: {
        youtube: 'https://youtube.com/@kraezelvbeatz',
        instagram: 'https://instagram.com/kraezelvbeatz',
        twitter: 'https://x.com/kraezelvbeatz',
        tiktok: 'https://tiktok.com/@kraezelvbeatz',
        spotify: 'https://open.spotify.com/artist/kraezelv',
        soundcloud: 'https://soundcloud.com/kraezelvbeatz',
        discord: 'https://discord.gg/kraezelv',
        appleMusic: 'https://music.apple.com/artist/kraezelv'
      }
    };
  });

  // Filter beats
  const filteredBeats = beats.filter(beat => {
    const matchesSearch = beat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          beat.genre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'ALL' || beat.genre.toUpperCase() === selectedGenre.toUpperCase();
    return matchesSearch && matchesGenre;
  });

  const genres = ['ALL', 'DARK TRAP', 'UK DRILL', 'HYPERPOP', 'R&B'];

  useEffect(() => {
    const syncProfile = () => {
      const saved = localStorage.getItem('kraezelv_producer_profile');
      if (saved) {
        try {
          setProfile(JSON.parse(saved));
        } catch (e) {
          console.warn('Failed to parse updated profile', e);
        }
      }
    };
    syncProfile();
    window.addEventListener('storage', syncProfile);
    return () => window.removeEventListener('storage', syncProfile);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-32">
      
      {/* 1. PANORAMIC PROFILE BANNER */}
      <div className="relative h-64 md:h-96 w-full bg-neutral-900 overflow-hidden border-b border-white/10">
        <img 
          src={profile.bannerUrl} 
          alt={profile.displayName} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Top Floating Badge */}
        <div className="absolute top-6 right-6 md:right-12 flex items-center gap-3">
          <Link
            to="/dashboard/settings"
            className="px-5 py-2.5 bg-white text-black font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-200 transition-all shadow-2xl active:scale-95"
          >
            <Settings size={14} /> Edit Profile Settings
          </Link>
        </div>
      </div>

      {/* 2. PROFILE HERO & HEADER METADATA */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative -mt-20 z-20">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar Picture */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 bg-black border-4 border-black rounded-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] shrink-0">
              <img 
                src={profile.avatarUrl} 
                alt={profile.displayName} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-purple-600 border border-purple-400 text-[8px] font-black uppercase text-white">
                PRODUCER
              </div>
            </div>

            {/* Title & Stats */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
                  {profile.displayName}
                </h1>
                <CheckCircle2 size={24} className="text-purple-400 shrink-0" />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 font-bold uppercase tracking-wider">
                <span className="text-purple-400">@{profile.username}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="flex items-center gap-1"><MapPin size={13} /> {profile.location}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="flex items-center gap-1"><Music size={13} /> {profile.primaryGenre}</span>
              </div>
            </div>
          </div>

          {/* Catalog Stats Overview */}
          <div className="flex items-center gap-6 bg-white/5 border border-white/10 p-4 rounded-sm">
            <div className="text-center px-3 border-r border-white/10">
              <span className="block text-2xl font-black text-white">{beats.length}</span>
              <span className="text-[9px] font-mono uppercase text-white/40">Beats Uploaded</span>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <span className="block text-2xl font-black text-purple-400">4.9★</span>
              <span className="text-[9px] font-mono uppercase text-white/40">Producer Rating</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-2xl font-black text-emerald-400">100%</span>
              <span className="text-[9px] font-mono uppercase text-white/40">Verified Licensor</span>
            </div>
          </div>
        </div>

        {/* 3. PRODUCER BIO & DESCRIPTION */}
        <div className="py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 border-b border-white/10">
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-purple-400">Producer Biography</h3>
            <p className="text-sm md:text-base text-white/80 leading-relaxed font-light">
              {profile.bio}
            </p>
          </div>

          {/* 4. SOCIAL MEDIA LINKS MATRIX */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-purple-400">Connect Social Channels</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {profile.socials.youtube && (
                <a 
                  href={profile.socials.youtube} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all group"
                >
                  <Youtube size={16} className="text-red-500 group-hover:scale-110 transition-transform" /> YouTube
                </a>
              )}

              {profile.socials.instagram && (
                <a 
                  href={profile.socials.instagram} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all group"
                >
                  <Instagram size={16} className="text-pink-500 group-hover:scale-110 transition-transform" /> Instagram
                </a>
              )}

              {profile.socials.twitter && (
                <a 
                  href={profile.socials.twitter} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 bg-white/5 border border-white/10 hover:border-sky-400/50 hover:bg-sky-400/10 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all group"
                >
                  <Twitter size={16} className="text-sky-400 group-hover:scale-110 transition-transform" /> X / Twitter
                </a>
              )}

              {profile.socials.tiktok && (
                <a 
                  href={profile.socials.tiktok} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 bg-white/5 border border-white/10 hover:border-emerald-400/50 hover:bg-emerald-400/10 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all group"
                >
                  <Send size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" /> TikTok
                </a>
              )}

              {profile.socials.spotify && (
                <a 
                  href={profile.socials.spotify} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all group"
                >
                  <Disc size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" /> Spotify
                </a>
              )}

              {profile.socials.soundcloud && (
                <a 
                  href={profile.socials.soundcloud} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all group"
                >
                  <Globe size={16} className="text-orange-500 group-hover:scale-110 transition-transform" /> SoundCloud
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 5. PUBLISHED BEATS CATALOG STOREFRONT */}
        <div className="py-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-3xl font-black uppercase text-white tracking-tight flex items-center gap-3">
                <Music size={28} className="text-purple-400" />
                Producer Beat Store Catalog
              </h2>
              <p className="text-xs text-white/50 uppercase tracking-widest mt-1">
                Stream, license, or download official production instrumentals directly from {profile.displayName}
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text"
                  placeholder="Search beats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black border border-white/20 pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Beat Cards Grid */}
          {filteredBeats.length === 0 ? (
            <div className="py-20 text-center text-white/30 text-xs uppercase tracking-widest border border-white/5 bg-white/[0.01]">
              No beats uploaded yet. Use the Producer Command Center to upload official KRAEZELV beats.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredBeats.map(beat => (
                <BeatCard key={beat.id} beat={beat} />
              ))}
            </div>
          )}
        </div>

        {/* VERIFIED PLACEMENTS SHOWCASE */}
        <PlacementShowcase />

        {/* VERIFIED CUSTOMER REVIEWS */}
        <VerifiedReviewsSection />

      </div>
    </div>
  );
};
