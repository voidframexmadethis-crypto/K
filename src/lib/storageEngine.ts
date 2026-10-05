/**
 * KRAEZELV Storage Engine — Direct Link & Storage Protocol
 * 
 * Direct link integration:
 * - Producer provides master MP3/M4A/ZIP and Artwork (JPG/JPEG/PNG/WebP) direct links
 * - Direct link is validated and stored in Firestore beat/pack metadata
 * - Audio player, storefront cards, and downloads use the durable direct URL
 * 
 * WAV format is strictly and permanently prohibited.
 */

import { BeatStorageMetadata, UploadCategory } from '../types';

export interface StorageAssetResult {
  assetId: string;
  cdnUrl: string; // Durable Direct HTTPS URL
  archiveUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  itemId?: string;
  storage?: BeatStorageMetadata;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedUrl?: string;
  category: 'audio' | 'stems' | 'artwork' | 'pack';
  fileType?: 'mp3' | 'm4a' | 'zip' | 'jpg' | 'jpeg' | 'png' | 'webp';
  storageProvider?: 'Direct';
}

/**
 * Validates a direct public media URL against security and format policies.
 * WAV format is permanently prohibited.
 */
export function validateStorageUrl(
  urlInput: string,
  category: 'audio' | 'stems' | 'artwork' | 'pack' = 'audio'
): ValidationResult {
  const trimmed = (urlInput || '').trim();

  if (!trimmed) {
    return {
      valid: false,
      category,
      error: 'Please provide a valid Direct File URL.',
    };
  }

  // Reject local blob or data URLs
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return {
      valid: false,
      category,
      error: 'Local blob: and base64 data: URLs are temporary. Please paste a permanent public direct URL.',
    };
  }

  // Must be a valid HTTPS / HTTP URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        valid: false,
        category,
        error: 'URL must start with https:// or http://',
      };
    }
  } catch {
    return {
      valid: false,
      category,
      error: 'The provided URL is not a valid web address.',
    };
  }

  const lowerPath = parsedUrl.pathname.toLowerCase();
  const lowerFull = trimmed.toLowerCase();

  // 1. ABSOLUTE RULE: Reject WAV format everywhere
  if (
    lowerPath.endsWith('.wav') ||
    lowerFull.includes('.wav?') ||
    lowerFull.includes('format=wav') ||
    lowerFull.includes('mime=audio/wav') ||
    lowerFull.includes('audio/x-wav')
  ) {
    return {
      valid: false,
      category,
      error: 'WAV format is strictly prohibited. Please upload high-resolution MP3 or M4A master files.',
    };
  }

  let detectedFileType: 'mp3' | 'm4a' | 'zip' | 'jpg' | 'jpeg' | 'png' | 'webp' = 'mp3';

  if (category === 'audio') {
    const hasExtension = lowerPath.includes('.');
    if (hasExtension) {
      const ext = lowerPath.split('.').pop() || '';
      if (ext === 'm4a') {
        detectedFileType = 'm4a';
      } else if (ext === 'mp3' || ext === 'aac' || ext === 'ogg') {
        detectedFileType = 'mp3';
      } else if (ext !== '') {
        return {
          valid: false,
          category,
          error: 'Unsupported audio format. Only MP3 and M4A audio URLs are permitted.',
        };
      }
    } else {
      detectedFileType = lowerFull.includes('m4a') ? 'm4a' : 'mp3';
    }
  }

  if (category === 'stems' || category === 'pack') {
    detectedFileType = 'zip';
    const hasExtension = lowerPath.includes('.');
    if (hasExtension) {
      const ext = lowerPath.split('.').pop() || '';
      if (!['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) && ext !== '') {
        return {
          valid: false,
          category,
          error: 'Unsupported archive format. Only .ZIP multi-track archives are permitted.',
        };
      }
    }
  }

  if (category === 'artwork') {
    detectedFileType = 'jpg';
    const hasExtension = lowerPath.includes('.');
    if (hasExtension) {
      const ext = lowerPath.split('.').pop() || '';
      if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        detectedFileType = ext as any;
      } else if (ext !== '') {
        return {
          valid: false,
          category,
          error: 'Unsupported image format. Only JPG, JPEG, PNG, and WebP artwork formats are permitted.',
        };
      }
    }
  }

  return {
    valid: true,
    category,
    sanitizedUrl: trimmed,
    fileType: detectedFileType,
    storageProvider: 'Direct',
  };
}



/**
 * Validates audio file name and format rules
 */
export function validateAudioFile(file: File | string): void {
  const fileName = typeof file === 'string' ? file : file.name;
  const lower = fileName.toLowerCase();

  if (lower.endsWith('.wav') || (typeof file !== 'string' && file.type.includes('wav'))) {
    throw new Error('WAV format is strictly prohibited. Please upload high-resolution MP3 or M4A files.');
  }

  if (
    !lower.endsWith('.mp3') &&
    !lower.endsWith('.m4a') &&
    (typeof file === 'string' || (!file.type.includes('audio/mpeg') && !file.type.includes('audio/mp4')))
  ) {
    throw new Error('Unsupported audio format. Only MP3 and M4A files are permitted.');
  }
}

/**
 * Helper to build standard storage metadata for Firestore beats
 */
export function createStorageMetadata(params: {
  audioUrl: string;
  fileType?: 'mp3' | 'm4a' | 'zip';
  artworkUrl?: string;
  stemsUrl?: string;
  fileName?: string;
}): BeatStorageMetadata {
  return {
    provider: 'custom',
    durableUrl: params.audioUrl,
    fileType: params.fileType || (params.audioUrl.toLowerCase().includes('.m4a') ? 'm4a' : 'mp3'),
    fileUrl: params.audioUrl,
    audioUrl: params.audioUrl,
    artworkUrl: params.artworkUrl,
    stemsUrl: params.stemsUrl,
    uploadedAt: new Date().toISOString(),
  };
}



/**
 * Helper to build standard storage metadata for Firestore beat packs
 */
export function createPackStorageMetadata(params: {
  durableUrl: string;
  artworkUrl?: string;
  fileName?: string;
}) {
  return {
    provider: 'custom' as const,
    durableUrl: params.durableUrl,
    fileType: 'zip' as const,
    artworkUrl: params.artworkUrl,
    uploadedAt: new Date().toISOString(),
  };
}



/**
 * Compatibility wrapper
 */
export async function uploadToStorage(
  fileOrUrl: File | string,
  category: 'audio' | 'stems' | 'artwork' | 'video' = 'audio',
  beatId?: string,
  metadata?: { title?: string; producer?: string; existingItemId?: string }
): Promise<StorageAssetResult> {
  const targetCategory: 'audio' | 'stems' | 'artwork' = category === 'video' ? 'audio' : category;

  if (typeof fileOrUrl === 'string') {
    const validation = validateStorageUrl(fileOrUrl, targetCategory);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid URL supplied.');
    }

    const cleanUrl = validation.sanitizedUrl || fileOrUrl;
    return {
      assetId: `store_${targetCategory}_${Date.now()}`,
      cdnUrl: cleanUrl,
      archiveUrl: cleanUrl,
      fileName: cleanUrl.split('/').pop() || `${targetCategory}_asset`,
      fileSize: 0,
      mimeType: targetCategory === 'audio' ? 'audio/mpeg' : targetCategory === 'artwork' ? 'image/jpeg' : 'application/zip',
      storage: {
        provider: 'custom',
        durableUrl: cleanUrl,
        fileType: ['jpg', 'jpeg', 'png', 'webp'].includes(validation.fileType as string) ? undefined : (validation.fileType as any),
        fileUrl: cleanUrl,
        audioUrl: targetCategory === 'audio' ? cleanUrl : undefined,
        artworkUrl: targetCategory === 'artwork' ? cleanUrl : undefined,
        stemsUrl: targetCategory === 'stems' ? cleanUrl : undefined,
        uploadedAt: new Date().toISOString(),
      },
    };
  }

  validateAudioFile(fileOrUrl);
  throw new Error(
    'Direct automated upload is not active. Please provide a direct public media URL.'
  );
}

export const uploadToR2AndArchive = uploadToStorage;
