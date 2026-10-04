import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBeatCatalogStore } from '../store/useBeatCatalogStore';
import { useAudioStore } from '../store/useAudioStore';
import { Beat } from '../types';

export function useBeatDeepLink() {
  const location = useLocation();
  const { beats } = useBeatCatalogStore();
  const { setBeat } = useAudioStore();

  useEffect(() => {
    const params = new URLSearchParams(location.search || window.location.search);
    const beatId = params.get('beat');

    if (!beatId || !beats.length) return;

    // Find matching beat safely
    const matchedBeat = beats.find(b => b.id === beatId);

    if (matchedBeat) {
      // 1. Load beat into persistent audio player
      setBeat(matchedBeat);

      // 2. Update Client-side Meta Tags for OpenGraph & Twitter
      updateHeadMetaTags(matchedBeat);

      // 3. Handle free download link parameter
      if (params.get('download') === 'free' && matchedBeat.isFree) {
        // Find a way to trigger FreeDownloadModal. 
        // Perhaps dispatch an event or use a store to trigger modal opening?
        // Let's assume there's a store for UI or just dispatch custom event.
        const event = new CustomEvent('open-free-download-modal', { detail: { beat: matchedBeat } });
        window.dispatchEvent(event);
      }
    }
  }, [location.search, beats, setBeat]);
}

function updateHeadMetaTags(beat: Beat) {
  if (typeof document === 'undefined') return;

  const titleText = `${beat.title} — KRAEZELVbeatz`;
  const descText = beat.description || `Stream and license official instrumental beat "${beat.title}" produced by ${beat.producerId} on KRAEZELVbeatz.`;
  const shareUrl = `${window.location.origin}/?beat=${beat.id}`;
  const artworkUrl = beat.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80';

  // Update Page Title
  document.title = titleText;

  // Helper to set/update meta tag
  const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Open Graph
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', titleText);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', descText);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', artworkUrl);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', shareUrl);
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'KRAEZELVbeatz');
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'music.song');

  // Twitter
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', titleText);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', descText);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', artworkUrl);
}
