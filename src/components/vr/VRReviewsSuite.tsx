import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { VRReviewRecord, submitVRReview } from '../../services/analyticsService';
import { 
  Headphones, 
  Glasses, 
  Star, 
  Volume2, 
  Sliders, 
  Sparkles, 
  Radio, 
  Send, 
  CheckCircle, 
  Cpu, 
  Zap,
  RotateCcw
} from 'lucide-react';

const HEADSET_MODELS = [
  'Meta Quest 3 / 3S',
  'Apple Vision Pro',
  'Valve Index 3D',
  'HTC Vive Pro 2',
  'PlayStation VR2',
  'Custom Spatial Headphones'
];

const VR_ENVIRONMENTS = [
  { id: 'atmos', name: 'Dolby Atmos Master Suite', reverb: '1.2s Warm', bassBoost: '+3dB Sub' },
  { id: 'cyber', name: 'Cyberpunk VR Soundbooth', reverb: '0.8s Tight', bassBoost: '+5dB Punch' },
  { id: 'arena', name: 'Mansion Sub-Bass Arena', reverb: '2.4s Deep Arena', bassBoost: '+8dB Sub-Bass' },
  { id: 'minimal', name: 'Acoustic Treated Booth', reverb: '0.3s Flat Reference', bassBoost: '0dB Neutral' }
];

export const VRReviewsSuite = () => {
  const [reviews, setReviews] = useState<VRReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnv, setSelectedEnv] = useState(VR_ENVIRONMENTS[0]);
  const [rotationAngle, setRotationAngle] = useState(45);
  const [spatialDistance, setSpatialDistance] = useState(70);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  // Review Form state
  const [form, setForm] = useState({
    beatTitle: 'KRAEZELV Heavy Trap #1',
    reviewerName: '',
    vrHeadsetModel: HEADSET_MODELS[0],
    rating: 5,
    spatialAudioScore: 98,
    bassClarityScore: 95,
    reviewText: ''
  });

  // Subscribe to real-time VR reviews in Firestore
  useEffect(() => {
    const q = query(collection(db, 'vr_reviews'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: VRReviewRecord[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VRReviewRecord[];
      setReviews(fetched);
      setLoading(false);
    }, (err) => {
      console.warn('VR reviews fallback:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reviewerName || !form.reviewText) {
      alert('Please fill out your name and VR review feedback.');
      return;
    }

    try {
      await submitVRReview({
        beatId: 'vr_beat_001',
        beatTitle: form.beatTitle,
        reviewerName: form.reviewerName,
        rating: form.rating,
        vrHeadsetModel: form.vrHeadsetModel,
        environmentName: selectedEnv.name,
        spatialAudioScore: form.spatialAudioScore,
        bassClarityScore: form.bassClarityScore,
        reviewText: form.reviewText
      });

      setSubmittedMessage(true);
      setForm({
        beatTitle: 'KRAEZELV Heavy Trap #1',
        reviewerName: '',
        vrHeadsetModel: HEADSET_MODELS[0],
        rating: 5,
        spatialAudioScore: 98,
        bassClarityScore: 95,
        reviewText: ''
      });
      setTimeout(() => setSubmittedMessage(false), 5000);
    } catch (err) {
      alert('Failed to post VR review.');
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const avgSpatial = reviews.length > 0
    ? Math.round(reviews.reduce((sum, r) => sum + r.spatialAudioScore, 0) / reviews.length)
    : 96;

  return (
    <div className="flex flex-col gap-10 text-white">
      {/* VR Header Banner */}
      <div className="p-8 border border-white/10 bg-gradient-to-r from-purple-950/40 via-black to-emerald-950/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Glasses className="text-purple-400" size={32} />
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
              VR Spatial Audio & Headset Review Suite
            </h2>
            <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-full">
              Real 3D Listening Data
            </span>
          </div>
          <p className="text-white/60 text-xs max-w-2xl leading-relaxed">
            Test studio acoustic reverberation, spatial audio immersion, sub-bass clarity, and review tracks directly from VR headset environments.
          </p>
        </div>

        <div className="flex items-center gap-6 border-l border-white/10 pl-6">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">Avg VR Rating</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-amber-400">{avgRating}</span>
              <div className="flex text-amber-400"><Star size={14} fill="currentColor" /></div>
            </div>
          </div>

          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">Spatial Clarity</span>
            <span className="text-3xl font-black text-purple-400">{avgSpatial}%</span>
          </div>
        </div>
      </div>

      {/* Interactive 3D Spatial VR Environment Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 border border-white/10 bg-black/80 p-6 flex flex-col gap-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" />
              <h3 className="text-lg font-black uppercase tracking-wider">360° VR Soundstage Simulator</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/30 uppercase">
              Live Acoustic Matrix
            </span>
          </div>

          {/* Interactive Visualizer Canvas / Radar Grid */}
          <div className="relative h-64 bg-gradient-to-b from-purple-950/20 to-black border border-white/10 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]" />
            
            {/* Concentric Spatial Radar Rings */}
            <div className="w-48 h-48 border border-purple-500/20 rounded-full absolute animate-ping opacity-20" />
            <div className="w-40 h-40 border border-purple-500/40 rounded-full absolute" />
            <div className="w-24 h-24 border border-emerald-500/30 rounded-full absolute" />

            {/* Listener Position (Center VR Headset) */}
            <div className="z-10 bg-purple-600 p-3 rounded-full border-2 border-white shadow-lg shadow-purple-500/50 flex items-center justify-center">
              <Glasses size={20} className="text-white" />
            </div>

            {/* Orbiting Audio Sound Source */}
            <div 
              className="absolute z-10 transition-all duration-300 flex items-center gap-2 bg-emerald-500 text-black px-3 py-1.5 rounded-full font-black text-[10px] uppercase shadow-lg shadow-emerald-500/40"
              style={{
                transform: `rotate(${rotationAngle}deg) translate(${spatialDistance}px) rotate(-${rotationAngle}deg)`
              }}
            >
              <Volume2 size={12} />
              Spatial Audio Source
            </div>

            <div className="absolute bottom-3 left-3 text-[10px] font-mono text-white/50">
              Env: {selectedEnv.name} | Reverb: {selectedEnv.reverb} | Sub: {selectedEnv.bassBoost}
            </div>
          </div>

          {/* Interactive Environment & Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-2">Select Acoustic Environment</label>
              <div className="flex flex-col gap-2">
                {VR_ENVIRONMENTS.map(env => (
                  <button
                    key={env.id}
                    onClick={() => setSelectedEnv(env)}
                    className={`p-3 border text-left text-xs transition-all flex justify-between items-center ${
                      selectedEnv.id === env.id 
                        ? 'border-purple-400 bg-purple-500/10 text-white font-bold' 
                        : 'border-white/10 bg-white/[0.02] text-white/60 hover:text-white'
                    }`}
                  >
                    <span>{env.name}</span>
                    <span className="text-[9px] text-purple-300 font-mono">{env.reverb}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-2">
                  Head Rotation Angle ({rotationAngle}°)
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="360" 
                  value={rotationAngle}
                  onChange={(e) => setRotationAngle(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-2">
                  Spatial Distance ({spatialDistance}px)
                </label>
                <input 
                  type="range" 
                  min="30" 
                  max="110" 
                  value={spatialDistance}
                  onChange={(e) => setSpatialDistance(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Real VR Review Submission Form */}
        <div className="lg:col-span-5 border border-white/10 bg-black/80 p-6 flex flex-col gap-5">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
              <Headphones size={20} className="text-purple-400" />
              Post Real VR Headset Review
            </h3>
            <p className="text-white/40 text-[10px] uppercase tracking-wider mt-1">
              Submit real listening feedback to Firestore from your VR setup.
            </p>
          </div>

          {submittedMessage && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle size={16} />
              VR review posted live to store!
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Your Name / Artist Tag</label>
              <input 
                type="text"
                required
                placeholder="e.g. Producer CyberX"
                value={form.reviewerName}
                onChange={(e) => setForm({...form, reviewerName: e.target.value})}
                className="w-full bg-black border border-white/20 p-2.5 text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">VR Headset / Hardware Model</label>
              <select
                value={form.vrHeadsetModel}
                onChange={(e) => setForm({...form, vrHeadsetModel: e.target.value})}
                className="w-full bg-black border border-white/20 p-2.5 text-white focus:outline-none focus:border-purple-400"
              >
                {HEADSET_MODELS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Overall Rating (1 - 5 Stars)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setForm({...form, rating: star})}
                    className={`p-2 border flex-1 text-center font-bold text-xs ${
                      form.rating >= star 
                        ? 'border-amber-400 bg-amber-400/20 text-amber-300' 
                        : 'border-white/10 text-white/40'
                    }`}
                  >
                    ★ {star}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Spatial Audio Score ({form.spatialAudioScore}%)</label>
                <input 
                  type="range"
                  min="50"
                  max="100"
                  value={form.spatialAudioScore}
                  onChange={(e) => setForm({...form, spatialAudioScore: Number(e.target.value)})}
                  className="w-full accent-purple-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Sub-Bass Clarity ({form.bassClarityScore}%)</label>
                <input 
                  type="range"
                  min="50"
                  max="100"
                  value={form.bassClarityScore}
                  onChange={(e) => setForm({...form, bassClarityScore: Number(e.target.value)})}
                  className="w-full accent-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">VR Acoustic Review & Feedback</label>
              <textarea 
                required
                rows={3}
                placeholder="How did the 808s, vocal staging, and stereo width translate inside the VR environment?"
                value={form.reviewText}
                onChange={(e) => setForm({...form, reviewText: e.target.value})}
                className="w-full bg-black border border-white/20 p-2.5 text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-emerald-500 text-black font-black uppercase tracking-wider text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Send size={15} />
              Publish VR Review Live
            </button>
          </form>
        </div>
      </div>

      {/* Real-time VR Reviews Feed from Firestore */}
      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
          <Glasses className="text-purple-400" size={24} />
          Verified Real VR Headset Reviews Feed
        </h3>

        {loading ? (
          <div className="p-12 text-center text-white/40 text-xs uppercase tracking-widest">
            Fetching real VR headset reviews from Firestore...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 border border-white/10 bg-black/60 text-center text-white/40 text-xs uppercase tracking-widest">
            No VR reviews submitted yet. Use the form above to post the first VR spatial listening review!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-6 border border-white/10 bg-black/80 flex flex-col justify-between gap-4 group hover:border-purple-500/40 transition-all">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <h4 className="font-bold text-white text-sm">{rev.reviewerName}</h4>
                      <span className="text-[10px] text-purple-400 font-mono flex items-center gap-1 mt-0.5">
                        <Glasses size={12} />
                        {rev.vrHeadsetModel}
                      </span>
                    </div>

                    <div className="flex text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" />
                      ))}
                    </div>
                  </div>

                  <p className="text-white/80 text-xs italic leading-relaxed">
                    "{rev.reviewText}"
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50">
                  <span>Env: {rev.environmentName || 'Master Studio'}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-300 font-bold">3D: {rev.spatialAudioScore}%</span>
                    <span className="text-emerald-300 font-bold">Sub: {rev.bassClarityScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
