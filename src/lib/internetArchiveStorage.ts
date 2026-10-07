/**
 * KRAEZELV Internet Archive Unified Storage & Audio Protocol
 * 
 * Complete, self-contained Internet Archive storage module for:
 * 1. Internet Archive URL parsing & item ID extraction
 * 2. Direct playable download URL generation (archive.org/download/{itemId}/{filename})
 * 3. Range-request proxy streaming helper (/api/audio/proxy)
 * 4. Audio format validation (MP3 & M4A supported, WAV strictly prohibited)
 * 5. Stems bundle (.ZIP) & Cover Artwork (.JPG/.PNG/.WEBP) handling
 * 6. Storage metadata object generation for Firestore beats & packs
 * 7. Fallback & resilient audio URL resolution
 */

import { BeatStorageMetadata } from '../types';

export interface IAItemInfo {
  itemId: string;
  fileName?: string;
  directUrl: string;
  detailsUrl: string;
  streamUrl: string;
  isAudio: boolean;
  isArchive: boolean;
  isImage: boolean;
  fileType: 'mp3' | 'm4a' | 'zip' | 'jpg' | 'png' | 'webp' | 'unknown';
}

export interface IAValidationResult {
  valid: boolean;
  error?: string;
  sanitizedUrl?: string;
  itemId?: string;
  fileName?: string;
  directUrl?: string;
  category: 'audio' | 'stems' | 'artwork' | 'pack';
  fileType?: 'mp3' | 'm4a' | 'zip' | 'jpg' | 'png' | 'webp';
}

/**
 * Parses any Internet Archive or direct URL and extracts Item ID, File Name, and direct URLs.
 */
export function parseInternetArchiveUrl(inputUrl: string): IAItemInfo | null {
  if (!inputUrl || typeof inputUrl !== 'string') return null;
  const trimmed = inputUrl.trim();
  
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    
    if (host.includes('archive.org')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      
      // Pattern 1: https://archive.org/download/{itemId}/{fileName}
      if (parts[0] === 'download' && parts.length >= 2) {
        const itemId = parts[1];
        const fileName = parts.slice(2).join('/');
        const directUrl = `https://archive.org/download/${itemId}/${fileName}`;
        const fileType = getFileTypeFromFileName(fileName);
        
        return {
          itemId,
          fileName,
          directUrl,
          detailsUrl: `https://archive.org/details/${itemId}`,
          streamUrl: directUrl,
          isAudio: ['mp3', 'm4a'].includes(fileType),
          isArchive: fileType === 'zip',
          isImage: ['jpg', 'png', 'webp'].includes(fileType),
          fileType,
        };
      }
      
      // Pattern 2: https://archive.org/details/{itemId}
      if (parts[0] === 'details' && parts.length >= 2) {
        const itemId = parts[1];
        return {
          itemId,
          directUrl: `https://archive.org/details/${itemId}`,
          detailsUrl: `https://archive.org/details/${itemId}`,
          streamUrl: `https://archive.org/download/${itemId}`,
          isAudio: false,
          isArchive: false,
          isImage: false,
          fileType: 'unknown',
        };
      }
    }

    // Direct Non-IA HTTPS URL Fallback
    const fileName = parsed.pathname.split('/').pop() || 'media_file';
    const fileType = getFileTypeFromFileName(fileName);

    return {
      itemId: 'direct_url',
      fileName,
      directUrl: trimmed,
      detailsUrl: trimmed,
      streamUrl: trimmed,
      isAudio: ['mp3', 'm4a'].includes(fileType),
      isArchive: fileType === 'zip',
      isImage: ['jpg', 'png', 'webp'].includes(fileType),
      fileType,
    };
  } catch {
    return null;
  }
}

/**
 * Determines file format extension type from filename or URL path.
 * Strict policy: WAV is permanently rejected.
 */
export function getFileTypeFromFileName(fileName: string): 'mp3' | 'm4a' | 'zip' | 'jpg' | 'png' | 'webp' | 'unknown' {
  if (!fileName) return 'unknown';
  const lower = fileName.toLowerCase();

  if (lower.endsWith('.wav') || lower.includes('.wav?')) {
    throw new Error('WAV format is strictly prohibited on KRAEZELV. Please upload high-resolution MP3 or M4A master files.');
  }
  if (lower.endsWith('.mp3')) return 'mp3';
  if (lower.endsWith('.m4a') || lower.endsWith('.mp4') || lower.endsWith('.aac')) return 'm4a';
  if (lower.endsWith('.zip') || lower.endsWith('.rar') || lower.endsWith('.7z')) return 'zip';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'jpg';
  if (lower.endsWith('.png')) return 'png';
  if (lower.endsWith('.webp')) return 'webp';

  return 'unknown';
}

/**
 * Validates an Internet Archive or Direct Media URL against KRAEZELV policies.
 */
export function validateInternetArchiveUrl(
  urlInput: string,
  category: 'audio' | 'stems' | 'artwork' | 'pack' = 'audio'
): IAValidationResult {
  const trimmed = (urlInput || '').trim();

  if (!trimmed) {
    return { valid: false, category, error: 'Please provide a valid Internet Archive or Direct URL.' };
  }

  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return { valid: false, category, error: 'Local blob: or base64 URLs are temporary. Please paste a permanent public URL.' };
  }

  // Check WAV format policy
  const lower = trimmed.toLowerCase();
  if (lower.includes('.wav') || lower.includes('format=wav') || lower.includes('audio/wav')) {
    return {
      valid: false,
      category,
      error: 'WAV format is strictly prohibited on KRAEZELV. Please upload MP3 or M4A master files.',
    };
  }

  const parsed = parseInternetArchiveUrl(trimmed);
  if (!parsed) {
    return { valid: false, category, error: 'Invalid URL format provided.' };
  }

  let detectedType: 'mp3' | 'm4a' | 'zip' | 'jpg' | 'png' | 'webp' = 'mp3';

  if (category === 'audio') {
    if (parsed.fileType === 'm4a') detectedType = 'm4a';
    else detectedType = 'mp3';
  } else if (category === 'stems' || category === 'pack') {
    detectedType = 'zip';
  } else if (category === 'artwork') {
    if (['jpg', 'png', 'webp'].includes(parsed.fileType)) {
      detectedType = parsed.fileType as any;
    } else {
      detectedType = 'jpg';
    }
  }

  return {
    valid: true,
    category,
    sanitizedUrl: parsed.directUrl,
    itemId: parsed.itemId,
    fileName: parsed.fileName,
    directUrl: parsed.directUrl,
    fileType: detectedType,
  };
}

/**
 * Builds a range-request proxy streaming URL (/api/audio/proxy?url=...)
 * Ensures Web Audio DSP, seekbars, and PersistentPlayer work smoothly on iOS/Android/Desktop.
 */
export function getProxiedAudioUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();

  // If already proxied, return as-is
  if (trimmed.startsWith('/api/audio/proxy') || trimmed.includes('/api/audio/proxy?url=')) {
    return trimmed;
  }

  // Route Internet Archive and external media streams through backend Range-request proxy
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return `/api/audio/proxy?url=${encodeURIComponent(trimmed)}`;
  }

  return trimmed;
}

/**
 * Creates standard KRAEZELV Firestore Storage Metadata for Beats.
 */
export function createIAStorageMetadata(params: {
  audioUrl: string;
  fileType?: 'mp3' | 'm4a' | 'zip';
  artworkUrl?: string;
  stemsUrl?: string;
  itemId?: string;
}): BeatStorageMetadata {
  const parsed = parseInternetArchiveUrl(params.audioUrl);
  return {
    provider: 'custom',
    durableUrl: params.audioUrl,
    fileType: params.fileType || (parsed?.fileType === 'm4a' ? 'm4a' : 'mp3'),
    fileUrl: params.audioUrl,
    audioUrl: params.audioUrl,
    artworkUrl: params.artworkUrl,
    stemsUrl: params.stemsUrl,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Server-Side Express Range-Request Proxy Handler Helper
 * (Can be mounted at /api/audio/proxy in Express server.ts)
 */
export async function handleAudioProxyRequest(req: any, res: any) {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).send('Missing audio URL parameter.');
  }

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'KRAEZELV-AudioEngine/2.0 (+https://kraezelv.com)',
    };

    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const audioRes = await fetch(targetUrl, { headers });

    if (!audioRes.ok && audioRes.status !== 206) {
      return res.status(audioRes.status).send('Failed to fetch upstream audio content.');
    }

    res.setHeader('Content-Type', audioRes.headers.get('content-type') || 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    if (audioRes.headers.get('content-range')) {
      res.setHeader('Content-Range', audioRes.headers.get('content-range')!);
      res.status(206);
    } else {
      res.status(200);
    }

    if (audioRes.headers.get('content-length')) {
      res.setHeader('Content-Length', audioRes.headers.get('content-length')!);
    }

    if (!audioRes.body) {
      return res.end();
    }

    // Stream audio buffer chunk by chunk to client
    const reader = audioRes.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (err: any) {
    console.error('[AUDIO_PROXY_ERROR]', err);
    if (!res.headersSent) {
      res.status(500).send('Internal Audio Proxy Error');
    }
  }
}
