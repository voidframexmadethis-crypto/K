import React from 'react';
import { SectionHeader } from '../components/home/SectionHeader';
import { VideoHub } from '../components/VideoHub';

export const VideosPage = () => {
  return (
    <div className="min-h-screen">
      <div className="pt-32 px-6 md:px-12 max-w-[1800px] mx-auto">
        <SectionHeader 
          kicker="Studio Sessions"
          title="Video Gallery"
        />
      </div>
      <VideoHub />
    </div>
  );
};
