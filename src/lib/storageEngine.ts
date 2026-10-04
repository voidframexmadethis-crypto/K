/**
 * KRAEZELVbeatz Persistent Storage & Streaming Engine
 * Cloudflare Pages Function -> Internet Archive Pipeline
 * Durable media hosting on Internet Archive with metadata persisted in Firestore.
 */

import {
  validateIAFile,
  UploadCategory,
  IAUploadResult,
} from './internetArchiveCore.ts';
import { auth } from './firebase.ts';

export interface StorageAssetResult {
  assetId: string;
  cdnUrl: string; // Durable HTTPS Internet Archive stream/download URL
  archiveUrl: string; // Archive path (${itemId}/${category}/${fileName})
  fileName: string;
  fileSize: number;
  mimeType: string;
  itemId?: string;
  storage?: {
    provider: 'internet_archive';
    itemId: string;
    fileUrl: string;
    category: UploadCategory;
    fileName: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
  };
}

/**
 * Validates audio format rules:
 * - MP3 allowed
 * - M4A allowed
 * - WAV strictly prohibited
 */
export function validateAudioFile(file: File): void {
  const result = validateIAFile(file.name, 'audio', file.type);
  if (!result.valid) {
    throw new Error(result.error || 'Audio validation failed');
  }
}

/**
 * Uploads media assets to Internet Archive via secure Cloudflare Pages Function.
 * The browser NEVER holds or receives the Internet Archive secret key.
 *
 * Path architecture on Internet Archive:
 * - https://archive.org/download/{itemId}/audio/{fileName}.mp3 (or .m4a)
 * - https://archive.org/download/{itemId}/artwork/{fileName}.{jpg|png|webp}
 * - https://archive.org/download/{itemId}/stems/{fileName}.zip
 */
export async function uploadToStorage(
  file: File,
  category: 'audio' | 'stems' | 'artwork' | 'video' = 'audio',
  beatId?: string,
  metadata?: { title?: string; producer?: string; existingItemId?: string }
): Promise<StorageAssetResult> {
  const targetCategory: UploadCategory = category === 'video' ? 'audio' : category;

  // 1. Client-side pre-validation (Rejects WAV, validates format)
  const validation = validateIAFile(file.name, targetCategory, file.type);
  if (!validation.valid) {
    throw new Error(validation.error || 'File validation failed.');
  }

  const cleanBeatId = beatId ? beatId.replace(/[^a-zA-Z0-9_-]/g, '') : `beat_${Date.now()}`;
  const sanitizedName = validation.sanitizedFileName;
  const mimeType = validation.mimeType;

  // 2. Prepare request for Cloudflare Pages Function
  const headers: Record<string, string> = {
    'Content-Type': mimeType,
    'x-category': targetCategory,
    'x-beat-id': cleanBeatId,
    'x-filename': sanitizedName,
    'x-title': metadata?.title || 'Instrumental Beat',
    'x-producer': metadata?.producer || 'KRAEZELVbeatz',
  };

  if (metadata?.existingItemId) {
    headers['x-existing-item-id'] = metadata.existingItemId;
  }

  // Use short-lived cryptographically signed token if user is signed in
  if (auth.currentUser) {
    try {
      const idToken = await auth.currentUser.getIdToken();
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }
    } catch {
      // Non-blocking fallback for anonymous or local workflows
    }
  }

  const uploadEndpoint = `/api/storage/internet-archive/upload?category=${encodeURIComponent(targetCategory)}&beatId=${encodeURIComponent(cleanBeatId)}&filename=${encodeURIComponent(sanitizedName)}`;

  try {
    const res = await fetch(uploadEndpoint, {
      method: 'POST',
      headers,
      body: file,
    });

    const resJson = await res.json().catch(() => null);

    if (!res.ok || !resJson || resJson.success === false) {
      const errMsg =
        resJson?.message ||
        resJson?.error ||
        `Storage upload failed with HTTP status ${res.status}`;
      throw new Error(errMsg);
    }

    const iaResult = resJson as IAUploadResult;

    return {
      assetId: `ia_${targetCategory}_${iaResult.itemId}`,
      cdnUrl: iaResult.durableUrl,
      archiveUrl: iaResult.archivePath,
      fileName: file.name,
      fileSize: file.size,
      mimeType,
      itemId: iaResult.itemId,
      storage: iaResult.storage,
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[STORAGE_ENGINE] Upload pipeline error:', error?.message || error);
    throw error;
  }
}

/**
 * Backward compatibility alias for existing component call sites
 */
export const uploadToR2AndArchive = uploadToStorage;
