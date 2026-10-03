import React from 'react';
import { SectionHeader } from '../components/home/SectionHeader';
import { BeatsPage } from './BeatsPage';

export const FreeBeatsPage = () => {
  return (
    <div className="min-h-screen">
      {/* We can reuse the BeatsPage layout but with a specific filter in a real app */}
      {/* For now, just a clear indicator */}
      <div className="pt-32 px-6 md:px-12 max-w-[1800px] mx-auto">
        <SectionHeader 
          kicker="No Cost"
          title="Free Downloads"
        />
        <p className="text-white/40 uppercase tracking-widest text-sm mb-20">
          Non-profit usage only. For commercial releases, please purchase a license.
        </p>
      </div>
      <BeatsPage />
    </div>
  );
};
