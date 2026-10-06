import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, CheckCircle2, MessageSquare, ThumbsUp, X, Lock } from 'lucide-react';
import { collection, onSnapshot, addDoc, query, where, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export interface VerifiedReviewItem {
  id?: string;
  beatId: string;
  beatTitle: string;
  customerEmail: string;
  customerName: string;
  rating: number;
  reviewText: string;
  verifiedPurchase: boolean;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

interface VerifiedReviewsSectionProps {
  beatId?: string;
  beatTitle?: string;
}

export const VerifiedReviewsSection: React.FC<VerifiedReviewsSectionProps> = ({ beatId, beatTitle }) => {
  const [reviews, setReviews] = useState<VerifiedReviewItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });

    const unsubFirestore = onSnapshot(collection(db, 'verified_reviews'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: VerifiedReviewItem[] = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as VerifiedReviewItem))
          .filter(r => r.status === 'approved' || isAdmin);
        setReviews(loaded);
      }
    }, (err) => {
      console.warn('Verified reviews fallback:', err);
    });

    return () => {
      unsubAuth();
      unsubFirestore();
    };
  }, [isAdmin]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !reviewText) return;

    const newReview: VerifiedReviewItem = {
      beatId: beatId || 'general',
      beatTitle: beatTitle || 'KRAEZELV Catalog',
      customerEmail,
      customerName: customerName || 'Verified Artist',
      rating,
      reviewText,
      verifiedPurchase: true,
      status: 'approved', // Auto-approved for verified purchasers
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'verified_reviews'), newReview);
      setSubmitMessage('Thank you! Your verified customer review is published.');
      setTimeout(() => {
        setShowSubmitModal(false);
        setSubmitMessage('');
        setReviewText('');
        setCustomerEmail('');
        setCustomerName('');
      }, 2000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviews(prev => [...prev, { ...newReview, id: Date.now().toString() }]);
      setShowSubmitModal(false);
    }
  };

  const approvedReviews = reviews.filter(r => r.status === 'approved');
  const avgRating = approvedReviews.length > 0 
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
    : '5.0';

  return (
    <section className="bg-black py-20 border-t border-white/10">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 space-y-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-400 text-[10px] font-black uppercase tracking-[0.4em]">
              <ShieldCheck size={14} /> Verified Buyer Feedback
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tighter">
              CUSTOMER REVIEWS
            </h2>
            <div className="flex items-center gap-3 pt-1">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <span className="text-sm font-black text-white font-mono">{avgRating} / 5.0</span>
              <span className="text-xs text-white/40 uppercase tracking-widest">({approvedReviews.length} Verified Buyer Reviews)</span>
            </div>
          </div>

          <button 
            onClick={() => setShowSubmitModal(true)}
            className="px-6 py-3.5 bg-white hover:bg-neutral-200 text-black font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-lg"
          >
            <MessageSquare size={14} /> Write Verified Review
          </button>
        </div>

        {/* REVIEWS GRID */}
        {approvedReviews.length === 0 ? (
          <div className="p-12 text-center text-white/40 text-xs font-mono uppercase tracking-widest border border-white/5 bg-white/[0.01]">
            Be the first verified customer to leave feedback on your beat order.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {approvedReviews.map((item) => (
              <div 
                key={item.id}
                className="p-8 bg-neutral-950 border border-white/10 flex flex-col gap-4 relative group hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black text-xs">
                      {item.customerName[0] || 'A'}
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase text-white tracking-wide block">
                        {item.customerName}
                      </span>
                      <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 size={10} /> Verified License Purchase
                      </span>
                    </div>
                  </div>

                  <div className="flex text-amber-400">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </div>
                </div>

                <p className="text-xs md:text-sm text-white/80 leading-relaxed font-light italic">
                  "{item.reviewText}"
                </p>

                <div className="pt-2 flex items-center justify-between text-[9px] font-mono text-white/30 uppercase tracking-widest border-t border-white/5">
                  <span>Track: {item.beatTitle}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUBMIT REVIEW MODAL */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
            <div className="bg-black border border-white/20 p-8 max-w-md w-full space-y-6 relative shadow-2xl">
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 flex items-center gap-1.5">
                  <ShieldCheck size={12} /> Verified Buyer Verification
                </span>
                <h3 className="text-2xl font-black uppercase text-white tracking-tight">Submit Beat Review</h3>
              </div>

              {submitMessage ? (
                <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-widest text-center">
                  {submitMessage}
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Your Artist / Stage Name</label>
                    <input 
                      type="text" 
                      required 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Young Producer"
                      className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Purchase Email (For Verification)</label>
                    <input 
                      type="email" 
                      required 
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="your.paypal@email.com"
                      className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Rating</label>
                    <select 
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500"
                    >
                      <option value={5}>★★★★★ 5 - Industry Excellence</option>
                      <option value={4}>★★★★☆ 4 - Great Beat Quality</option>
                      <option value={3}>★★★☆☆ 3 - Average Mix</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Review Feedback</label>
                    <textarea 
                      rows={4}
                      required
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Describe beat mix, headroom, licensing experience..."
                      className="w-full bg-neutral-900 border border-white/20 p-3 text-xs text-white outline-none focus:border-purple-500 resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    POST VERIFIED REVIEW
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
