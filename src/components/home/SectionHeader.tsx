import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  kicker: string;
  title: string;
  href?: string;
  viewAll?: string;
}

export const SectionHeader = ({ kicker, title, href, viewAll = "View Catalog" }: SectionHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
           <div className="w-10 h-px bg-white/20" />
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">{kicker}</span>
        </div>
        <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white leading-none">
          {title}
        </h2>
      </div>
      
      {href && (
        <Link 
          to={href} 
          className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all hover:gap-6 group"
        >
          {viewAll} <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
        </Link>
      )}
    </div>
  );
};
