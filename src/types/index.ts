export interface Campaign {
  id: string;
  name: string;
  productId?: string; // Beat, Pack, etc.
  productLink?: string; // Automatically attached link
  status: 'draft' | 'in-production' | 'ready' | 'published' | 'archived';
  variants: CreativeVariant[];
  createdAt: string;
}

export interface CreativeVariant {
  id: string;
  name: string;
  script: string;
  templateId: string;
  actorId?: string;
  aspectRatio: '9:16' | '1:1' | '16:9';
  generationStatus: 'idle' | 'pending' | 'success' | 'error';
  generatedVideoUrl?: string;
  errorMessage?: string;
}

export interface Beat {
  id: string;
  idempotencyKey?: string;
  title: string;
  producerId: string;
  bpm: number;
  key: string;
  genre: string;
  secondaryGenre?: string;
  subgenre?: string;
  tags: string[];
  moods: string[];
  description?: string;
  audioUrl: string; // Untagged
  taggedAudioUrl?: string;
  stemsUrl?: string; // ZIP
  videoUrl?: string; // YouTube/Vimeo
  artworkUrl: string;
  isFree: boolean;
  freeDownloadEnabled?: boolean;
  freeDownloadEmailRequired?: boolean;
  freeDownloadType?: 'email' | 'social' | 'none';
  freeDownloadLimit?: 'tagged' | 'untagged';
  beehiivFormUrl?: string;
  negotiable?: boolean;
  licenses: {
    basic: { price: number; enabled: boolean };
    premium: { price: number; enabled: boolean };
    unlimited: { price: number; enabled: boolean };
    exclusive: { price: number; enabled: boolean };
  };
  metaTitle?: string;
  metaDescription?: string;
  imageAltText?: string;
  releaseDate?: string;
  isPrivate: boolean;
  slug: string;
  contentIdStatus?: 'whitelist' | 'blacklist' | 'none';
  isBootleg: boolean;
  instruments: string[];
  albumId?: string;
  playsCount?: number;
  createdAt: string;
  published: boolean;
  isArchived?: boolean;
  pricingTemplateId?: string;
  collectionId?: string;
  producerNotes?: string;
  isVault?: boolean;
  energy?: string;
  style?: string;
  storage?: BeatStorageMetadata;
}

export type UploadCategory = 'audio' | 'artwork' | 'stems';

export interface BeatStorageMetadata {
  provider: 'internet_archive' | 'custom';
  durableUrl: string;
  fileType?: 'mp3' | 'm4a' | 'zip';
  itemId?: string;
  fileUrl?: string;
  audioUrl?: string;
  artworkUrl?: string;
  stemsUrl?: string;
  uploadedAt: string;
  files?: {
    category: 'audio' | 'artwork' | 'stems';
    fileName?: string;
    durableUrl: string;
    size?: number;
    mimeType?: string;
  }[];
}

export interface Producer {
  id: string;
  name: string;
  avatarUrl: string;
  subscribersCount: number;
  verified: boolean;
  isFollowing?: boolean;
  featuredTrackId?: string;
  genre: string;
}

export interface FeedItem {
  id: string;
  type: 'upload' | 'article' | 'tutorial' | 'announcement';
  title: string;
  content: string;
  author: string;
  timestamp: string;
  imageUrl?: string;
  beatId?: string;
  likes: number;
  comments: number;
  videoUrl?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: 'Mixing & Mastering' | 'Custom Artwork' | 'Feature Verse' | 'Custom Production';
  description: string;
  price: number;
  turnaroundDays: number;
  rating: number;
  reviewsCount: number;
}

export interface SoundKit {
  id: string;
  title: string;
  type: 'Drum Kit' | 'Synth Presets' | 'MIDI & Loops' | 'Sample Pack';
  description: string;
  price: number;
  artworkUrl: string;
  audioDemoUrl?: string;
  downloadUrl?: string;
  itemCount: number;
  fileSize: string;
  storage?: {
    provider: 'custom';
    durableUrl: string;
    fileType: 'zip';
    uploadedAt?: string;
  };
}

export interface BeatPack {
  id: string;
  title: string;
  description: string;
  artworkUrl: string;
  beatIds: string[];
  price: number;
  downloadUrl?: string;
  zipUrl?: string;
  storage?: {
    provider: 'custom';
    durableUrl: string;
    fileType: 'zip';
    uploadedAt?: string;
  };
  createdAt: string;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  artworkUrl: string;
  slug: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'producer' | 'customer' | 'manager' | 'curator' | 'label' | 'engineer' | 'song_manager';
  purchasedBeatIds: string[];
  favoriteBeatIds: string[];
  displayName: string;
}

export interface Sale {
  id: string;
  beatId: string;
  customerId: string;
  licenseType: 'basic' | 'premium' | 'unlimited' | 'exclusive';
  grossAmount: number;
  netAmount: number;
  fees: number;
  currency: string;
  status: 'completed' | 'pending' | 'refunded' | 'disputed';
  createdAt: string;
}

export interface Offer {
  id: string;
  beatId: string;
  customerId: string;
  amount: number;
  status: 'pending' | 'accepted' | 'countered' | 'declined';
  message?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  usageCount: number;
  expiryDate?: string;
}

export interface AnalyticsData {
  plays: number;
  downloads: number;
  salesCount: number;
  conversionRate: number;
  ltv: number;
  dropOffPoints: { time: number; count: number }[];
  sources: { name: string; count: number }[];
  demographics: { city: string; country: string; count: number }[];
  devices: { type: string; count: number }[];
}

export interface AudioState {
  currentBeat: Beat | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: Beat[];
  queueIndex: number;
  history: Beat[];
  isShuffle: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isQueueOpen: boolean;
}
