/**
 * KRAEZELV Persistent Storage & Streaming Engine
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
 * Uploads media assets directly to Internet Archive using an ephemeral,
 * server-generated S3 Presigned PUT URL.
 * 
 * Flow:
 * 1. Browser sends lightweight metadata to /api/storage/internet-archive/presign (~1KB)
 * 2. Vercel function signs the request using server-side IA credentials (never exposed to browser)
 * 3. Browser directly streams the full file to https://s3.us.archive.org via HTTP PUT (bypasses 4.5MB Vercel limit)
 * 4. Browser receives confirmation and returns the durable archive.org URL
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

  // 2. Request ephemeral IAS3 Presigned URL from server (Metadata only, < 1KB)
  const presignPayload = {
    beatId: cleanBeatId,
    filename: sanitizedName,
    category: targetCategory,
    mimeType,
    fileSize: file.size,
    title: metadata?.title || 'Instrumental Beat',
    producer: metadata?.producer || 'KRAEZELV',
    existingItemId: metadata?.existingItemId,
  };

  const presignHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth.currentUser) {
    try {
      const idToken = await auth.currentUser.getIdToken();
      if (idToken) {
        presignHeaders['Authorization'] = `Bearer ${idToken}`;
      }
    } catch {
      // Non-blocking fallback
    }
  }

  let presignRes: Response;
  try {
    presignRes = await fetch('/api/storage/internet-archive/presign', {
      method: 'POST',
      headers: presignHeaders,
      body: JSON.stringify(presignPayload),
    });
  } catch (err: unknown) {
    const error = err as Error;
    throw new Error(`Failed to reach upload presign service: ${error?.message || 'Network error'}`);
  }

  const presignJson = await presignRes.json().catch(() => null);

  if (!presignRes.ok || !presignJson || presignJson.success === false) {
    const presignErrMsg =
      presignJson?.message ||
      presignJson?.error ||
      `Presign request failed with status ${presignRes.status}`;
    throw new Error(`Upload authorization failed: ${presignErrMsg}`);
  }

  const { uploadUrl, durableUrl, archivePath, itemId, headers: signedHeaders } = presignJson;

  if (!uploadUrl || !durableUrl || !itemId) {
    throw new Error('Invalid presign response from storage service.');
  }

  // 3. Direct Browser-to-Internet-Archive S3 PUT Upload (Bypasses Vercel 4.5MB limit)
  try {
    const directUploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: signedHeaders || { 'Content-Type': mimeType },
      body: file,
    });

    if (!directUploadRes.ok) {
      const errorText = await directUploadRes.text().catch(() => '');
      throw new Error(
        `Internet Archive storage upload failed (HTTP ${directUploadRes.status}): ${errorText || 'Direct storage PUT was rejected'}`
      );
    }

    return {
      assetId: `ia_${targetCategory}_${itemId}`,
      cdnUrl: durableUrl,
      archiveUrl: archivePath,
      fileName: file.name,
      fileSize: file.size,
      mimeType,
      itemId,
      storage: {
        provider: 'internet_archive',
        itemId,
        fileUrl: durableUrl,
        category: targetCategory,
        fileName: sanitizedName,
        size: file.size,
        mimeType,
        uploadedAt: new Date().toISOString(),
      },
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[STORAGE_ENGINE] Direct Internet Archive upload error:', error?.message || error);
    throw error;
  }
}

/**
 * Backward compatibility alias for existing component call sites
 */
export const uploadToR2AndArchive = uploadToStorage;
