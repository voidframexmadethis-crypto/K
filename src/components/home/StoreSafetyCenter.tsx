import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2, Download, Zap, CreditCard, Sparkles } from 'lucide-react';

export const StoreSafetyCenter: React.FC = () => {
  const safetyGuarantees = [
    {
      title: '100% UNTAGGED MASTER FILES',
      icon: Download,
      description: 'Instant delivery of clean, high-fidelity 24-bit 44.1kHz WAV and 320kbps MP3 audio files with all voice tags removed upon checkout.'
    },
    {
      title: 'ENCRYPTED 2PAY CHECKOUT',
      icon: Lock,
      description: '256-bit SSL encrypted transactions powered directly by 2Pay, supporting Credit Cards, Apple Pay, and Google Pay.'
    },
    {
      title: 'LEGAL PDF AGREEMENT CONTRACT',
      icon: FileText,
      description: 'Automated custom PDF license agreement document generated and delivered directly to your email with full commercial rights.'
    },
    {
      title: 'CONTENT ID WHITELIST CLEARANCE',
      icon: ShieldCheck,
      description: 'Guaranteed copyright whitelist protection across YouTube, Spotify, Apple Music, and Instagram for hassle-free monetization.'
    }
  ];

  return (
    <section className="bg-black py-20 border-b border-white/10 relative overflow-hidden">
      
      {/* GLOWING AMBIENT BACKGROUND */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-purple-950/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10 space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 flex items-center gap-2">
              <ShieldCheck size={12} /> STORE SAFETY & LICENSING GUARANTEE
            </span>
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter">
              STORE SAFETY CENTER
            </h2>
          </div>
          <p className="text-xs text-white/50 font-mono uppercase tracking-widest max-w-md">
            Complete buyer protection, encrypted checkout processing, and instant automated file delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {safetyGuarantees.map((item) => (
            <div 
              key={item.title}
              className="p-8 bg-neutral-950 border border-white/10 space-y-4 hover:border-purple-500/50 transition-all flex flex-col justify-between shadow-2xl group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-purple-600/10 border border-purple-500/30 text-purple-400 flex items-center justify-center rounded-xs group-hover:scale-110 transition-transform">
                  <item.icon size={22} />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight text-white">{item.title}</h3>
                <p className="text-xs text-white/60 font-light leading-relaxed uppercase tracking-wider">{item.description}</p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
                <CheckCircle2 size={12} /> VERIFIED GUARANTEE
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
