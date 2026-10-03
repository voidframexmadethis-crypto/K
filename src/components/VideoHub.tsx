import React from 'react';
import { Youtube, Play, ExternalLink } from 'lucide-react';
import { SectionHeader } from './home/SectionHeader';

export const VideoHub = () => {
  const videos = [
    { id: '1', title: 'VALKYRIE | STUDIO SESSION V1', duration: '12:44', thumb: '/src/assets/images/studio_session_video_1791054172809.jpg' },
    { id: '2', title: 'CRAFTING THE DARK TRAP SOUND', duration: '08:12', thumb: '/src/assets/images/hero_studio_cinematic_1791053615857.jpg' },
    { id: '3', title: 'MAKING OF STARS (SOUTH SIDE TYPE)', duration: '15:30', thumb: '/src/assets/images/hero_valkyrie_massive_1791054144327.jpg' },
  ];

  return (
    <section className="max-w-[1800px] mx-auto px-6 md:px-12 py-40">
      <SectionHeader 
        kicker="Multimedia"
        title="Video Hub"
        href="https://youtube.com"
        viewAll="YouTube Channel"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {videos.map((vid) => (
          <div key={vid.id} className="group flex flex-col gap-6 cursor-pointer">
            <div className="relative aspect-video bg-neutral-900 border border-white/5 overflow-hidden">
               <img src={vid.thumb} className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="Video" />
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500">
                     <Play size={24} fill="currentColor" className="ml-1" />
                  </div>
               </div>
               <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/80 backdrop-blur-md text-[8px] font-black text-white/60 tracking-widest uppercase">
                  {vid.duration}
               </div>
            </div>
            
            <div className="flex flex-col gap-2">
               <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight group-hover:text-white/80 transition-colors">
                 {vid.title}
               </h3>
               <div className="flex items-center gap-3 text-[8px] font-bold uppercase tracking-[0.3em] text-white/40">
                  <Youtube size={12} className="text-white/20" /> YouTube Premium Content
               </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
