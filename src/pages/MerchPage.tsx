import React from 'react';
import { SectionHeader } from '../components/home/SectionHeader';
import { ShoppingBag, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MerchPage = () => {
  const products: any[] = [];

  return (
    <div className="pt-32 pb-40 px-6 md:px-12 max-w-[1800px] mx-auto min-h-screen">
      <SectionHeader 
        kicker="Official Line"
        title="Merchandise"
      />
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Products when available */}
        </div>
      ) : (
        <div className="p-16 bg-neutral-950 border border-white/10 text-center flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto">
          <ShoppingBag size={40} className="text-white/20" />
          <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase text-white tracking-tight">NO MERCH PRODUCTS ADDED YET</h3>
            <p className="text-white/40 uppercase tracking-widest text-xs leading-relaxed">
              KRAEZELVbeatz apparel, physical items, and studio merchandise will appear here once configured in the dashboard.
            </p>
          </div>
          <Link to="/dashboard" className="px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 hover:bg-neutral-200 transition-colors">
            <Upload size={14} /> Open Producer Dashboard
          </Link>
        </div>
      )}
    </div>
  );
};
