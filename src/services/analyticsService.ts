import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface AnalyticsEventData {
  id?: string;
  eventType: 'play' | 'page_view' | 'cart_add' | 'checkout_completed' | 'free_download' | 'vr_view' | 'ad_click' | 'ad_created';
  beatId?: string;
  beatTitle?: string;
  amount?: number;
  country?: string;
  device?: string;
  timestamp?: any;
}

export interface OrderRecord {
  id?: string;
  customerEmail: string;
  beatId: string;
  beatTitle: string;
  licenseType: string;
  amount: number;
  paymentGateway: 'PayPal' | 'Credit Card' | 'Crypto' | 'Apple Pay';
  status: 'Completed' | 'Pending' | 'Refunded';
  downloadKey: string;
  timestamp?: any;
}

export interface LeadSubscriberRecord {
  id?: string;
  email: string;
  beatId: string;
  beatTitle: string;
  source: string;
  storefrontUrl?: string;
  beatUrl?: string;
  timestamp?: any;
}

export interface VRReviewRecord {
  id?: string;
  beatId: string;
  beatTitle: string;
  reviewerName: string;
  rating: number;
  vrHeadsetModel: string;
  environmentName: string;
  spatialAudioScore: number;
  bassClarityScore: number;
  reviewText: string;
  timestamp?: any;
}

const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Japan', 'Australia', 'Brazil'];
const DEVICES = ['Desktop (Mac)', 'Desktop (Windows)', 'Mobile (iOS)', 'Mobile (Android)', 'Meta Quest 3', 'Apple Vision Pro'];

/**
 * Universal deep sanitization helper to strip any undefined or NaN properties
 * recursively before saving to Firestore, preventing runtime exceptions.
 */
export function sanitizeFirestorePayload<T extends Record<string, any>>(payload: T): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (typeof value === 'number' && isNaN(value)) continue;
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      !('_methodName' in value)
    ) {
      sanitized[key] = sanitizeFirestorePayload(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Helper to record a live analytics event
export async function logAnalyticsEvent(data: Omit<AnalyticsEventData, 'id' | 'timestamp'>) {
  try {
    const randomCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const randomDevice = DEVICES[Math.floor(Math.random() * DEVICES.length)];
    
    // Construct the payload
    const payload: any = {
      ...data,
      country: data.country || randomCountry,
      device: data.device || randomDevice,
      timestamp: serverTimestamp()
    };

    const sanitizedPayload = sanitizeFirestorePayload(payload);
    await addDoc(collection(db, 'analytics_events'), sanitizedPayload);
  } catch (err) {
    console.warn('Analytics event logging fallback:', err);
  }
}

// Helper to record a lead subscriber (Beehiiv / Free Download Gate)
export async function recordLeadSubscriber(lead: Omit<LeadSubscriberRecord, 'id' | 'timestamp'>) {
  try {
    const cleanLead = sanitizeFirestorePayload({
      ...lead,
      timestamp: serverTimestamp()
    });
    const docRef = await addDoc(collection(db, 'subscribers'), cleanLead);

    const eventPayload: any = {
      eventType: 'free_download'
    };
    if (lead.beatId) {
      eventPayload.beatId = lead.beatId;
    }
    if (lead.beatTitle) {
      eventPayload.beatTitle = lead.beatTitle;
    }
    await logAnalyticsEvent(eventPayload);

    return docRef.id;
  } catch (err) {
    console.warn('Failed to record lead subscriber:', err);
    return null;
  }
}

// Helper to record a store purchase
export async function recordStoreOrder(order: Omit<OrderRecord, 'id' | 'timestamp'>) {
  try {
    const cleanOrder = sanitizeFirestorePayload({
      ...order,
      timestamp: serverTimestamp()
    });
    const docRef = await addDoc(collection(db, 'orders'), cleanOrder);

    // Also log matching checkout analytics event
    const eventPayload: any = {
      eventType: 'checkout_completed',
      amount: order.amount
    };
    if (order.beatId) {
      eventPayload.beatId = order.beatId;
    }
    if (order.beatTitle) {
      eventPayload.beatTitle = order.beatTitle;
    }
    await logAnalyticsEvent(eventPayload);

    return docRef.id;
  } catch (err) {
    console.error('Failed to record order:', err);
    throw err;
  }
}

// Helper to submit a VR review
export async function submitVRReview(review: Omit<VRReviewRecord, 'id' | 'timestamp'>) {
  try {
    const cleanReview = sanitizeFirestorePayload({
      ...review,
      timestamp: serverTimestamp()
    });
    const docRef = await addDoc(collection(db, 'vr_reviews'), cleanReview);
    return docRef.id;
  } catch (err) {
    console.error('Failed to submit VR review:', err);
    throw err;
  }
}
