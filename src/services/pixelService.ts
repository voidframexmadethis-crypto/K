/**
 * Pixel & Event Tracking Service
 * Integrates Google Analytics (gtag), Meta Pixel (fbq), and TikTok Pixel (ttq).
 */

export interface PixelConfig {
  gaMeasurementId?: string;
  metaPixelId?: string;
  tiktokPixelId?: string;
}

const STORAGE_KEY = 'kraezelv_pixel_config';

export function getPixelConfig(): PixelConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to parse pixel config from localStorage', e);
  }
  return {
    gaMeasurementId: 'G-KRAEZELV888',
    metaPixelId: '9876543210',
    tiktokPixelId: 'TT-KRAEZELV01'
  };
}

export function savePixelConfig(config: PixelConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save pixel config:', e);
  }
}

export function trackPixelEvent(
  eventName: 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase' | 'Lead' | 'Search',
  payload?: {
    beatId?: string;
    beatTitle?: string;
    price?: number;
    currency?: string;
    searchQuery?: string;
  }
) {
  const config = getPixelConfig();

  // Log for audit
  console.log(`[PIXEL TRACKING] Event: ${eventName}`, payload, config);

  // 1. Meta Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, {
      content_ids: payload?.beatId ? [payload.beatId] : [],
      content_name: payload?.beatTitle || 'Beat License',
      value: payload?.price || 0,
      currency: payload?.currency || 'USD'
    });
  }

  // 2. Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName.toLowerCase(), {
      event_category: 'ecommerce',
      event_label: payload?.beatTitle,
      value: payload?.price
    });
  }

  // 3. TikTok Pixel
  if (typeof window !== 'undefined' && (window as any).ttq) {
    (window as any).ttq.track(eventName, {
      content_id: payload?.beatId,
      content_name: payload?.beatTitle,
      value: payload?.price,
      currency: 'USD'
    });
  }
}
