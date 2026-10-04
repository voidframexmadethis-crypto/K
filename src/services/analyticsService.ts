import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  getDocs
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

    // Sanitization: Remove any undefined or NaN properties to prevent Firestore errors
    const sanitizedPayload = Object.keys(payload).reduce((acc: any, key) => {
      const value = payload[key];
      if (value !== undefined && !(typeof value === 'number' && isNaN(value))) {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    await addDoc(collection(db, 'analytics_events'), sanitizedPayload);
  } catch (err) {
    console.warn('Analytics event logging fallback:', err);
  }
}

// Helper to record a lead subscriber (Beehiiv / Free Download Gate)
export async function recordLeadSubscriber(lead: Omit<LeadSubscriberRecord, 'id' | 'timestamp'>) {
  try {
    const docRef = await addDoc(collection(db, 'subscribers'), {
      ...lead,
      timestamp: serverTimestamp()
    });

    await logAnalyticsEvent({
      eventType: 'free_download',
      beatId: lead.beatId,
      beatTitle: lead.beatTitle
    });

    return docRef.id;
  } catch (err) {
    console.warn('Failed to record lead subscriber:', err);
    return null;
  }
}

// Helper to record a store purchase
export async function recordStoreOrder(order: Omit<OrderRecord, 'id' | 'timestamp'>) {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...order,
      timestamp: serverTimestamp()
    });

    // Also log matching checkout analytics event
    await logAnalyticsEvent({
      eventType: 'checkout_completed',
      beatId: order.beatId,
      beatTitle: order.beatTitle,
      amount: order.amount
    });

    return docRef.id;
  } catch (err) {
    console.error('Failed to record order:', err);
    throw err;
  }
}

// Helper to submit a VR review
export async function submitVRReview(review: Omit<VRReviewRecord, 'id' | 'timestamp'>) {
  try {
    const docRef = await addDoc(collection(db, 'vr_reviews'), {
      ...review,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    console.error('Failed to submit VR review:', err);
    throw err;
  }
}
