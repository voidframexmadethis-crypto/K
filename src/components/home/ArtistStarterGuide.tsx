import React from 'react';
import { HelpCircle, Search, Play, FileText, ShoppingBag, Download, Mail, ArrowRight } from 'lucide-react';

export const ArtistStarterGuide: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'BROWSE & DISCOVER',
      icon: Search,
      desc: 'Filter the catalog by genre, mood, BPM, musical key, or project goal (Freestyle, Single, Album).'
    },
    {
      num: '02',
      title: 'PREVIEW UNTAGGED',
      icon: Play,
      desc: 'Listen to high-fidelity audio previews using the persistent player and Web Audio DSP engine.'
    },
    {
      num: '03',
      title: 'CHOOSE YOUR LICENSE',
      icon: FileText,
      desc: 'Compare Basic MP3 Lease, Premium WAV, Unlimited, or Exclusive Rights depending on your release plans.'
    },
    {
      num: '04',
      title: 'PAYHIP CHECKOUT',
      icon: ShoppingBag,
      desc: 'Complete instant encrypted purchase via Credit Card or PayPal directly through the Payhip bridge.'
    },
    {
      num: '05',
      title: 'INSTANT DOWNLOADS',
      icon: Download,
      desc: 'Receive untagged audio files, PDF license agreement contract, and stems delivered immediately to your email.'
    }
  ];

  return (
    <section className="bg-neutral-950 py-20 border-b border-white/10 relative">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 flex items-center gap-2">
              <HelpCircle size={12} /> ONBOARDING GUIDE
            </span>
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter">
              NEW HERE? START HERE.
            </h2>
          </div>
          <p className="text-xs text-white/50 font-mono uppercase tracking-widest max-w-md">
            Everything you need to know about purchasing instrumentals, rights, checkout, and file delivery from KRAEZELV.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((step) => (
            <div 
              key={step.num}
              className="p-6 bg-white/[0.02] border border-white/10 space-y-4 hover:border-purple-500/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black font-mono text-purple-400">{step.num}</span>
                  <step.icon size={18} className="text-white/40" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight text-white">{step.title}</h3>
                <p className="text-xs text-white/60 font-light leading-relaxed uppercase tracking-wider">{step.desc}</p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center gap-1 text-[9px] font-mono text-purple-300 font-bold uppercase tracking-widest">
                <span>Step {step.num} Complete</span>
              </div>
            </div>
          ))}
        </div>

        {/* PRODUCER CONTACT CTA */}
        <div className="p-8 bg-purple-600/10 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-xl font-black uppercase tracking-tight text-white">Have Custom Questions or Commission Requests?</h4>
            <p className="text-xs text-white/60 font-mono uppercase tracking-widest">Contact KRAEZELV directly for custom beats, exclusive buyouts, and mixing services.</p>
          </div>
          <a
            href="mailto:kraezelv@gmail.com?subject=KRAEZELV%20Producer%20Inquiry"
            className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Mail size={14} /> CONTACT PRODUCER
          </a>
        </div>

      </div>
    </section>
  );
};
