import React from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader } from './SectionHeader';
import { ShoppingBag } from 'lucide-react';

const products = [
  { id: '1', name: 'KV-01 Studio Hoodie', price: '$85.00', thumb: '/src/assets/images/merch_streetwear_luxury_1791053642631.jpg' },
  { id: '2', name: 'Reference Headphones', price: '$299.00', thumb: '/src/assets/images/merch_headphones_premium_1791054164283.jpg' },
  { id: '3', name: 'KRAEZELV Oversized Tee', price: '$45.00', thumb: '/src/assets/images/merch_streetwear_luxury_1791053642631.jpg' },
];

export const MerchSection = () => {
  return (
    <section className="max-w-[1800px] mx-auto px-6 md:px-12 py-40">
      <SectionHeader 
        kicker="Official"
        title="Department"
        href="/merch"
        viewAll="Shop Collection"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {products.map((p) => (
          <Link key={p.id} to="/merch" className="group flex flex-col gap-8 cursor-pointer">
            <div className="relative aspect-square bg-[#0a0a0a] border border-white/5 flex items-center justify-center overflow-hidden">
               <img src={p.thumb} className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" alt={p.name} />
               <button className="absolute bottom-8 left-8 right-8 py-5 bg-white text-black font-black uppercase tracking-[0.4em] text-[8px] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-2xl">
                 Add to Cart
               </button>
            </div>
            
            <div className="flex justify-between items-start">
               <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{p.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Premium Apparel Line</span>
               </div>
               <span className="text-xl font-black text-white/60">{p.price}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
