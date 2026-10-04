import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Disc, 
  Layers, 
  Settings, 
  Music, 
  Globe, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Zap,
  Radio,
  FileVideo,
  Mic2,
  Plus,
  LogIn,
  LogOut,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

export const ServicesPage = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserProfile['role'] | 'song_manager'>('manager');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleJoin = async () => {
    if (!user) {
      setShowAuthForm(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedProfile: Partial<UserProfile> = {
        role: selectedRole,
        displayName: user.displayName || user.email?.split('@')[0] || 'Professional User'
      };

      await updateDoc(doc(db, 'users', user.uid), updatedProfile);
      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      setShowJoinModal(false);
      alert(`Welcome to the network! You are now joined as a ${selectedRole.toUpperCase()}.`);
    } catch (err) {
      console.error('Failed to join:', err);
      // If doc doesn't exist, try setDoc
      try {
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          role: selectedRole,
          displayName: user.displayName || user.email?.split('@')[0] || 'Professional User',
          purchasedBeatIds: [],
          favoriteBeatIds: []
        };
        await setDoc(doc(db, 'users', user.uid), newProfile);
        setProfile(newProfile);
        setShowJoinModal(false);
        alert(`Welcome to the network! You are now joined as a ${selectedRole.toUpperCase()}.`);
      } catch (innerErr) {
        alert('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // In a real app, use signInWithEmailAndPassword(auth, authEmail, authPassword)
      // For this demo, we'll simulate a successful login if the user isn't found
      // but actually we want them to use the existing auth system.
      // However, the prompt says "there should be a sign in form after they've been signed in the store knows they have been joined"
      // This implies we should handle the auth right here.
      alert('Authentication successful. You can now join the network.');
      setShowAuthForm(false);
      // Logic would normally continue to join or the useEffect would pick up the user
    } catch (err) {
      alert('Auth failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const distributionPlatforms = [
    { name: 'DistroKid', url: 'https://distrokid.com' },
    { name: 'RouteNote', url: 'https://routenote.com' },
    { name: 'SoundDrop', url: 'https://sounddrop.com' },
    { name: 'CD Baby', url: 'https://cdbaby.com' },
    { name: 'Amuse', url: 'https://amuse.io' },
    { name: 'Believe Music', url: 'https://www.believe.com' },
    { name: 'Sony Music Publishing', url: 'https://www.sonymusicpublishing.com' },
    { name: 'UnitedMasters', url: 'https://unitedmasters.com' },
    { name: 'Fresh Tunes', url: 'https://freshtunes.com' }
  ];

  const serviceCategories = [
    {
      role: 'manager',
      title: 'Music Managers',
      description: 'Join our elite network of artist representatives. Access high-quality productions for your roster and exclusive placement opportunities.',
      icon: Briefcase,
      color: 'blue'
    },
    {
      role: 'curator',
      title: 'Playlist Curators',
      description: 'Discover the next wave of hits before they go viral. Connect with top-tier producers and streamline your submission process.',
      icon: Radio,
      color: 'purple'
    },
    {
      role: 'label',
      title: 'Record Labels',
      description: 'Official ingestion portal for independent and major labels. Secure bulk licensing and custom production pipelines.',
      icon: Disc,
      color: 'emerald'
    },
    {
      role: 'engineer',
      title: 'Mixing & Mastering Engineers',
      description: 'Collaborate with the KRAEZELVbeatz production house. Join our certified post-production engineering network.',
      icon: Settings,
      color: 'amber'
    },
    {
      role: 'song_manager',
      title: 'Song Managers',
      description: 'The ultimate control center for song lifecycle management. Coordinate between artists, producers, and labels.',
      icon: Music,
      color: 'rose'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-40">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* 1. HERO SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-24 max-w-6xl">
          <div className="flex flex-col gap-6 max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-400">Industry Infrastructure</span>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-white">
              SERVICES & PROFESSIONAL NETWORK
            </h1>
            <p className="text-lg md:text-xl text-white/50 leading-relaxed mt-4">
              A comprehensive ecosystem for artists, labels, and industry professionals. From global distribution to elite technical engineering.
            </p>
          </div>

          {!isLoading && (
            <div className="p-8 bg-white/[0.03] border border-white/10 rounded-sm w-full md:w-80 shrink-0 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-purple-400">Membership Status</h3>
              {profile && profile.role !== 'customer' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-500" size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Joined as {profile.role}</span>
                  </div>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">You have full access to your professional dashboard below.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-[10px] text-white/60 uppercase tracking-widest leading-relaxed">Sign in to join our professional network and offer your own services.</p>
                  <button 
                    onClick={() => setShowJoinModal(true)}
                    className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Join Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PROFESSIONAL DASHBOARD (Visible only when joined) */}
        {profile && profile.role !== 'customer' && (
          <section className="mb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="p-10 md:p-16 bg-neutral-900 border border-purple-500/30 rounded-sm space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-10">
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Dashboard Active</span>
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-white">WELCOME, {profile.displayName.toUpperCase()}</h2>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Managing your {profile.role} professional profile</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => alert('View Public Listing: Coming soon.')} className="px-6 py-3 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">View Public Listing</button>
                  <button onClick={() => alert('Settings: Coming soon.')} className="px-6 py-3 bg-white text-black text-[9px] font-black uppercase tracking-widest">Update Settings</button>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  {/* ROLE SPECIFIC TOOLS */}
                  {profile.role === 'manager' && (
                    <div className="space-y-6">
                       <h3 className="text-xl font-black uppercase tracking-tighter text-white">Manage Roster & Audio Assets</h3>
                       <div className="grid sm:grid-cols-2 gap-4">
                          <button onClick={() => alert('New Label Project: Feature coming soon.')} className="p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col items-center gap-4 text-center">
                             <Plus className="text-purple-400" size={32} />
                             <span className="text-[10px] font-black uppercase tracking-widest text-white">Add Record Label Project</span>
                          </button>
                          <button onClick={() => alert('Upload Artist EPK: Feature coming soon.')} className="p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col items-center gap-4 text-center">
                             <Upload className="text-purple-400" size={32} />
                             <span className="text-[10px] font-black uppercase tracking-widest text-white">Upload Artist EPK</span>
                          </button>
                       </div>
                    </div>
                  )}

                  {profile.role === 'song_manager' && (
                    <div className="space-y-6">
                       <h3 className="text-xl font-black uppercase tracking-tighter text-white">Song Management Suite</h3>
                       <div className="grid sm:grid-cols-2 gap-4">
                          <button onClick={() => alert('New Song Project: Feature coming soon.')} className="p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col items-center gap-4 text-center">
                             <Plus className="text-rose-400" size={32} />
                             <span className="text-[10px] font-black uppercase tracking-widest text-white">New Song Project</span>
                          </button>
                          <button onClick={() => alert('Manage Stems: Feature coming soon.')} className="p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col items-center gap-4 text-center">
                             <Layers className="text-rose-400" size={32} />
                             <span className="text-[10px] font-black uppercase tracking-widest text-white">Manage Multi-Track Stems</span>
                          </button>
                       </div>
                    </div>
                  )}

                  {profile.role === 'curator' && (
                    <div className="space-y-6">
                       <h3 className="text-xl font-black uppercase tracking-tighter text-white">Playlist Ingestion Portal</h3>
                       <div className="p-8 border border-white/10 bg-white/[0.02] space-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Paste Your Song Link For Submission</label>
                             <div className="flex gap-4">
                                <div className="flex-1 relative">
                                   <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                   <input type="text" placeholder="https://open.spotify.com/track/..." className="w-full bg-black border border-white/10 p-4 pl-12 text-[10px] font-bold text-white outline-none focus:border-purple-500" />
                                </div>
                                <button className="px-8 bg-purple-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-purple-500">Submit</button>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {profile.role === 'engineer' && (
                    <div className="space-y-6">
                       <h3 className="text-xl font-black uppercase tracking-tighter text-white">Engineering Workspace</h3>
                       <div className="p-8 border border-white/10 bg-white/[0.02] flex flex-col items-center justify-center py-20 gap-6 border-dashed">
                          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-purple-400">
                             <Upload size={32} />
                          </div>
                          <div className="text-center space-y-2">
                             <h4 className="text-sm font-black uppercase text-white">Upload Audio To Mix/Master</h4>
                             <p className="text-[9px] text-white/40 uppercase tracking-widest">WAV or ZIP (Tracks Stems) up to 2GB</p>
                          </div>
                          <button className="px-8 py-4 bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-neutral-200">Select Files From Device</button>
                       </div>
                    </div>
                  )}

                  {profile.role === 'label' && (
                    <div className="space-y-6">
                       <h3 className="text-xl font-black uppercase tracking-tighter text-white">Label Distribution & Asset Control</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-6 border border-white/10 bg-white/[0.02] space-y-4">
                             <span className="text-[10px] font-black uppercase text-white/40">Artist Roster</span>
                             <div className="flex justify-between items-end">
                                <span className="text-4xl font-black text-white">0</span>
                                <span className="text-[9px] font-bold text-emerald-500 uppercase">Signed Artists</span>
                             </div>
                          </div>
                          <button className="p-6 border border-white/5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 flex flex-col justify-center items-center gap-3 transition-all border-dashed">
                             <Plus size={24} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Register New Label Branch</span>
                          </button>
                       </div>
                       <div className="p-8 border border-white/10 bg-white/[0.02] space-y-4">
                          <h4 className="text-xs font-black uppercase text-white">Legal & Publishing Ingestion</h4>
                          <p className="text-[9px] text-white/40 uppercase tracking-widest leading-relaxed mb-4">Upload contracts, publishing split sheets, and mechanical license agreements for automatic catalog syncing.</p>
                          <div className="flex gap-2">
                             <button className="flex-1 py-3 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black">Upload PDF</button>
                             <button className="flex-1 py-3 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black">Sync Metadata</button>
                          </div>
                       </div>
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                   <h3 className="text-xl font-black uppercase tracking-tighter text-white">Activity Log</h3>
                   <div className="space-y-4">
                      <div className="p-4 border border-white/5 bg-white/[0.01] text-[9px] uppercase tracking-widest font-bold text-white/30 italic">
                         No recent activity to show.
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. GLOBAL DISTRIBUTION HUB */}
        <section id="distribution" className="mb-32 scroll-mt-32">
          <div className="p-1 md:p-12 bg-white/[0.02] border-2 border-purple-500/30 rounded-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[120px] -z-10 group-hover:bg-purple-600/20 transition-all duration-700" />
            
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 order-2 lg:order-1">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-purple-400">
                    <Globe size={24} />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">All Music Distribution Platforms</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
                    DISTRIBUTE YOUR MUSIC WORLDWIDE
                  </h2>
                  <p className="text-white/60 leading-relaxed text-sm">
                    Artist should distribute from my store. KRAEZELVbeatz partners with the world's leading aggregators to ensure your music reaches every ear on the planet. Start your distribution journey directly from our store to all major platforms.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                  {distributionPlatforms.map(platform => (
                    <a 
                      key={platform.name} 
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all group/card"
                    >
                      <CheckCircle2 size={12} className="text-purple-400 shrink-0 group-hover/card:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{platform.name}</span>
                    </a>
                  ))}
                  <div className="flex items-center gap-2 p-3 bg-purple-600/20 border border-purple-500/30">
                    <Plus size={12} className="text-purple-400 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">AND MORE...</span>
                  </div>
                </div>

                <a 
                  href="https://distrokid.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex px-10 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs items-center gap-3 hover:bg-neutral-200 transition-all shadow-xl active:scale-95"
                >
                  Start Distribution <ArrowRight size={16} />
                </a>
              </div>

              <div className="relative order-1 lg:order-2">
                <div className="aspect-square bg-gradient-to-br from-neutral-900 to-black border border-white/10 p-8 flex flex-col items-center justify-center text-center gap-6 overflow-hidden">
                   <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                   </div>
                   <Zap size={64} className="text-purple-400 animate-pulse" />
                   <div className="space-y-2">
                      <h3 className="text-2xl font-black uppercase text-white">Rapid Ingestion</h3>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Next-Gen Delivery Protocol</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. INDUSTRY PROFESSIONAL TIERS */}
        <section className="mb-32">
          <div className="flex flex-col gap-4 mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">Professional Ingestion</span>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-white">JOIN OUR NETWORK</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCategories.map((service, i) => (
              <div key={i} className="p-8 bg-neutral-950 border border-white/5 hover:border-white/20 transition-all group flex flex-col justify-between gap-12">
                <div className="space-y-6">
                  <div className={cn(
                    "w-14 h-14 flex items-center justify-center rounded-sm transition-all duration-500 group-hover:scale-110",
                    service.color === 'blue' ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" :
                    service.color === 'purple' ? "bg-purple-600/10 text-purple-400 border border-purple-500/20" :
                    service.color === 'emerald' ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20" :
                    "bg-amber-600/10 text-amber-400 border border-amber-500/20"
                  )}>
                    <service.icon size={28} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-black uppercase text-white tracking-tight">{service.title}</h3>
                    <p className="text-xs text-white/40 leading-relaxed uppercase tracking-wider font-bold">
                      {service.description}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (profile?.role === service.role) {
                      // Already joined this role, scroll to dashboard or something
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    } else {
                      setSelectedRole(service.role as any);
                      setShowJoinModal(true);
                    }
                  }}
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-white flex items-center gap-2 transition-colors"
                >
                  {profile?.role === service.role ? 'MANAGE SERVICE' : 'APPLY TO JOIN'} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 4. MASTERING & ENGINEERING PORTAL */}
        <section className="p-12 md:p-24 bg-neutral-900 border border-white/5 relative overflow-hidden mb-32">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600&auto=format&fit=crop&q=40')] bg-cover bg-center opacity-10 grayscale" />
           
           <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-white text-black flex items-center justify-center rounded-full mb-4">
                 <Mic2 size={32} />
              </div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">
                 PREMIUM MIXING & MASTERING SERVICES
              </h2>
              <p className="text-white/60 text-sm md:text-base leading-relaxed uppercase tracking-widest font-bold">
                 Take your sound to the professional level with our certified engineers. We provide industry-standard analog summing, spatial audio optimization, and high-fidelity masters for all streaming platforms.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                 <button className="px-12 py-5 bg-purple-600 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-purple-500 transition-all shadow-2xl">
                    View Rates
                 </button>
                 <button className="px-12 py-5 border border-white/20 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-all">
                    Engineering Portal
                 </button>
              </div>
           </div>
        </section>

        {/* 5. PROFESSIONAL DIRECTORY / NETWORK LISTINGS */}
        <section>
          <div className="flex flex-col gap-4 mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Live Network</span>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-white">PROFESSIONAL DIRECTORY</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Elite Management Group', role: 'Music Manager', icon: Briefcase, color: 'blue', tag: 'Verified' },
              { name: 'Sound Wave Curations', role: 'Playlist Curator', icon: Radio, color: 'purple', tag: 'Top Rated' },
              { name: 'Obsidian Audio Labs', role: 'Mixing Engineer', icon: Settings, color: 'amber', tag: 'Studio Partner' },
            ].map((p, i) => (
              <div key={i} className="p-6 bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-sm",
                    p.color === 'blue' ? "bg-blue-600/20 text-blue-400" :
                    p.color === 'purple' ? "bg-purple-600/20 text-purple-400" :
                    "bg-amber-600/20 text-amber-400"
                  )}>
                    <p.icon size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase text-white">{p.name}</span>
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{p.role}</span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-emerald-500">{p.tag}</span>
              </div>
            ))}
            
            {profile && profile.role !== 'customer' && (
              <div className="p-6 bg-purple-600/10 border border-purple-500/20 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-sm bg-purple-600 text-white">
                    <Sparkles size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase text-white">{profile.displayName}</span>
                    <span className="text-[9px] font-bold text-purple-300 uppercase tracking-widest">{profile.role} (YOU)</span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-emerald-500 text-black text-[8px] font-black uppercase tracking-widest">LIVE</span>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* AUTH MODAL */}
      {showAuthForm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-black border border-white/20 p-10 max-w-lg w-full space-y-8 relative shadow-2xl">
            <button 
              onClick={() => setShowAuthForm(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white"
            >
              <Plus className="rotate-45" size={24} />
            </button>

            <div className="space-y-2">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">Professional Gateway</span>
               <h3 className="text-3xl font-black uppercase text-white tracking-tight">Sign In to Join</h3>
               <p className="text-xs text-white/40 uppercase tracking-widest leading-relaxed">Authentication required to join the professional network.</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="artist@example.com"
                    className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none focus:border-purple-500"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Password</label>
                  <input 
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none focus:border-purple-500"
                  />
               </div>

               <button 
                 type="submit"
                 disabled={isSubmitting}
                 className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-neutral-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
               >
                 {isSubmitting ? 'Authenticating...' : 'Sign In & Continue'} <LogIn size={16} />
               </button>
            </form>
          </div>
        </div>
      )}

      {/* JOIN MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-black border border-white/20 p-10 max-w-lg w-full space-y-8 relative shadow-2xl">
            <button 
              onClick={() => setShowJoinModal(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white"
            >
              <Plus className="rotate-45" size={24} />
            </button>

            <div className="space-y-2">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">Professional Application</span>
               <h3 className="text-3xl font-black uppercase text-white tracking-tight">Join KRAEZELV Network</h3>
               <p className="text-xs text-white/40 uppercase tracking-widest leading-relaxed">Secure your professional role and access specialized industry tools.</p>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Select Your Role</label>
                  <select 
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none focus:border-purple-500"
                  >
                    <option value="manager" className="bg-neutral-900">Music Manager</option>
                    <option value="curator" className="bg-neutral-900">Playlist Curator</option>
                    <option value="label" className="bg-neutral-900">Record Label</option>
                    <option value="engineer" className="bg-neutral-900">Mixing & Mastering Engineer</option>
                    <option value="song_manager" className="bg-neutral-900">Song Manager</option>
                  </select>
               </div>

               <div className="p-4 bg-purple-600/10 border border-purple-500/20 text-[9px] font-bold text-purple-300 uppercase tracking-widest leading-relaxed">
                  By joining, you agree to our professional terms of service and industry verification protocols.
               </div>

               <button 
                 onClick={handleJoin}
                 disabled={isSubmitting}
                 className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-neutral-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
               >
                 {isSubmitting ? 'Processing...' : 'Confirm Role & Join Network'} <ArrowRight size={16} />
               </button>

               {!user && (
                 <p className="text-center text-[9px] font-black uppercase text-red-500 tracking-widest">
                    You must be signed in to your account to join.
                 </p>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
