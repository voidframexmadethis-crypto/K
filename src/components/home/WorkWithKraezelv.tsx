import React, { useState } from 'react';
import { Mail, Sparkles, Send, CheckCircle2, MessageSquare, Headphones } from 'lucide-react';

export const WorkWithKraezelv: React.FC = () => {
  const [inquiryType, setInquiryType] = useState('Custom Beats');
  const [artistName, setArtistName] = useState('');
  const [artistEmail, setArtistEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistEmail || !message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setArtistName('');
      setArtistEmail('');
      setMessage('');
    }, 4000);
  };

  return (
    <section id="work-with-kraezelv" className="bg-black py-20 border-b border-white/10 relative">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 flex items-center gap-2">
              <Headphones size={12} /> PRODUCER SERVICES & COMMISSIONS
            </span>
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter">
              WORK WITH KRAEZELV
            </h2>
          </div>
          <p className="text-xs text-white/50 font-mono uppercase tracking-widest max-w-md">
            Direct access to KRAEZELV for custom production, exclusive sound design, song arrangements, and mixing services.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* SERVICES LIST */}
          <div className="lg:col-span-5 space-y-6">
            {[
              { title: 'CUSTOM BEATS', desc: 'Bespoke instrumental tailored specifically to your voice, key range, and sonic concept.' },
              { title: 'PRODUCER COLLABORATIONS', desc: 'Co-production for major releases, executive album production, and beat swaps.' },
              { title: 'BEAT COMMISSIONS', desc: 'Exclusive buyout production for TV, film, video games, sync licensing, and commercial ad campaigns.' },
              { title: 'MIXING & MASTERING', desc: 'Professional stem mixing, vocal tuning, and master polishing using hi-fi DSP processing.' }
            ].map((srv) => (
              <div 
                key={srv.title}
                onClick={() => setInquiryType(srv.title)}
                className={`p-6 border text-left transition-all cursor-pointer ${
                  inquiryType === srv.title 
                    ? 'bg-purple-600/10 border-purple-500 text-white' 
                    : 'bg-white/[0.02] border-white/10 hover:border-white/30 text-white/70'
                }`}
              >
                <h3 className="text-base font-black uppercase tracking-tight text-white mb-2">{srv.title}</h3>
                <p className="text-xs font-light text-white/60 leading-relaxed uppercase tracking-wider">{srv.desc}</p>
              </div>
            ))}
          </div>

          {/* FORM */}
          <div className="lg:col-span-7 bg-neutral-950 border border-white/10 p-8 sm:p-10 space-y-6 relative shadow-2xl">
            
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400">DIRECT INQUIRY FORM</span>
              <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                Submit Inquiry: {inquiryType}
              </h3>
            </div>

            {submitted ? (
              <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono uppercase tracking-wider space-y-2 text-center animate-in fade-in duration-300">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                <p className="font-bold text-sm">INQUIRY RECEIVED</p>
                <p className="text-white/60">Thank you! KRAEZELV will review your message and reply via email within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 block">Artist / Brand Name</label>
                    <input 
                      type="text"
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                      placeholder="Your Name..."
                      className="w-full bg-white/5 border border-white/15 px-4 py-3 text-xs font-mono text-white outline-none focus:border-purple-500 uppercase tracking-widest"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 block">Email Address</label>
                    <input 
                      type="email"
                      value={artistEmail}
                      onChange={(e) => setArtistEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-white/5 border border-white/15 px-4 py-3 text-xs font-mono text-white outline-none focus:border-purple-500 tracking-widest"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 block">Project Details & Budget</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Describe your project, timeline, reference links, and budget..."
                    className="w-full bg-white/5 border border-white/15 p-4 text-xs font-mono text-white outline-none focus:border-purple-500 uppercase tracking-widest leading-relaxed"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.25em] text-xs hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl"
                >
                  <Send size={14} /> SUBMIT PRODUCER INQUIRY
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
