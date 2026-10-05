/**
 * Core Internet Archive S3 Storage Engine
 * Shared between Cloudflare Pages Functions, local development server, and client validation.
 *
 * Conforms to official Internet Archive S3 (IAS3) API specifications:
 * - Endpoint: https://s3.us.archive.org
 * - Authorization header: LOW <IA_ACCESS_KEY>:<IA_SECRET_KEY>
 * - Auto bucket/item creation: x-archive-auto-make-bucket: 1
 * - Public download/stream: https://archive.org/download/<itemId>/<category>/<fileName>
 */

export type UploadCategory = 'audio' | 'artwork' | 'stems';

export interface IAUploadValidationResult {
  valid: boolean;
  category: UploadCategory;
  sanitizedFileName: string;
  mimeType: string;
  error?: string;
}

export interface IAUploadResult {
  success: boolean;
  itemId: string;
  category: UploadCategory;
  fileName: string;
  durableUrl: string;
  archivePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  storage: {
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
 * Strict file validation:
 * - Reject WAV completely (no exceptions)
 * - Audio: MP3 or M4A only
 * - Artwork: JPG, JPEG, PNG, WEBP only
 * - Stems: ZIP (or RAR, 7Z) only
 */
export function validateIAFile(
  fileName: string,
  categoryInput: string,
  mimeTypeInput?: string
): IAUploadValidationResult {
  const lowerName = (fileName || '').toLowerCase().trim();
  const lowerMime = (mimeTypeInput || '').toLowerCase().trim();
  const category = (categoryInput || 'audio').toLowerCase() as UploadCategory;

  if (!['audio', 'artwork', 'stems'].includes(category)) {
    return {
      valid: false,
      category: 'audio',
      sanitizedFileName: '',
      mimeType: '',
      error: `Invalid upload category '${categoryInput}'. Must be audio, artwork, or stems.`,
    };
  }

  // 1. ABSOLUTE RULE: Reject WAV format everywhere
  if (
    lowerName.endsWith('.wav') ||
    lowerMime === 'audio/wav' ||
    lowerMime === 'audio/x-wav' ||
    lowerMime === 'audio/wave'
  ) {
    return {
      valid: false,
      category,
      sanitizedFileName: '',
      mimeType: '',
      error: 'WAV format is strictly prohibited. Please upload high-resolution MP3 or M4A master files.',
    };
  }

  // Sanitize filename to safe alphanumeric, dashes, underscores, and dots
  const baseName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const ext = baseName.split('.').pop()?.toLowerCase() || '';

  if (category === 'audio') {
    const isMp3 = ext === 'mp3' || lowerMime === 'audio/mpeg' || lowerMime === 'audio/mp3';
    const isM4a = ext === 'm4a' || lowerMime === 'audio/mp4' || lowerMime === 'audio/x-m4a' || lowerMime === 'audio/m4a';

    if (!isMp3 && !isM4a) {
      return {
        valid: false,
        category,
        sanitizedFileName: baseName,
        mimeType: '',
        error: 'Unsupported audio format. Only MP3 and M4A master audio files are permitted.',
      };
    }

    const mime = isM4a ? 'audio/mp4' : 'audio/mpeg';
    return { valid: true, category, sanitizedFileName: baseName, mimeType: mime };
  }

  if (category === 'artwork') {
    const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) || lowerMime.startsWith('image/');
    if (!isImage) {
      return {
        valid: false,
        category,
        sanitizedFileName: baseName,
        mimeType: '',
        error: 'Unsupported artwork format. Only JPG, PNG, and WEBP image files are allowed.',
      };
    }

    let mime = 'image/jpeg';
    if (ext === 'png') mime = 'image/png';
    else if (ext === 'webp') mime = 'image/webp';
    return { valid: true, category, sanitizedFileName: baseName, mimeType: mime };
  }

  if (category === 'stems') {
    const isZip = ['zip', 'rar', '7z'].includes(ext) || lowerMime.includes('zip') || lowerMime.includes('compressed');
    if (!isZip) {
      return {
        valid: false,
        category,
        sanitizedFileName: baseName,
        mimeType: '',
        error: 'Unsupported stems bundle format. Only .ZIP multi-track archives are permitted.',
      };
    }

    return { valid: true, category, sanitizedFileName: baseName, mimeType: 'application/zip' };
  }

  return {
    valid: false,
    category,
    sanitizedFileName: baseName,
    mimeType: '',
    error: 'Unrecognized upload request.',
  };
}

/**
 * Generates a deterministic, collision-resistant Internet Archive item identifier.
 * Internet Archive rules:
 * - Must be 5 to 100 characters
 * - Only lowercase alphanumeric, dashes, and underscores
 * - Reuses existing item ID if provided for this beat to prevent duplicate items
 */
export function generateIAItemId(beatId: string, existingItemId?: string): string {
  if (existingItemId && typeof existingItemId === 'string') {
    const cleaned = existingItemId.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (cleaned.startsWith('kraezelvbeatz-') && cleaned.length >= 5 && cleaned.length <= 100) {
      return cleaned;
    }
  }

  const cleanBeat = (beatId || 'beat')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/^-+|-+$/g, '');

  let itemId = `kraezelvbeatz-${cleanBeat}`;
  if (itemId.length > 90) {
    itemId = itemId.substring(0, 90);
  }
  if (itemId.length < 5) {
    itemId = `kraezelvbeatz-track-${Date.now()}`;
  }

  return itemId;
}

/**
 * Returns durable public download/streaming URL on Internet Archive
 */
export function buildIAPublicUrl(itemId: string, category: string, fileName: string): string {
  return `https://archive.org/download/${itemId}/${category}/${encodeURIComponent(fileName)}`;
}

/**
 * Returns official IAS3 PUT endpoint URL
 */
export function buildIAS3Url(itemId: string, category: string, fileName: string): string {
  return `https://s3.us.archive.org/${itemId}/${category}/${encodeURIComponent(fileName)}`;
}

/**
 * Performs official IAS3 upload
 */
export async function executeIAUpload(params: {
  accessKey: string;
  secretKey: string;
  collection?: string;
  itemId: string;
  category: UploadCategory;
  fileName: string;
  body: any;
  mimeType: string;
  fileSize?: number;
  title?: string;
  creator?: string;
}): Promise<IAUploadResult> {
  const {
    accessKey,
    secretKey,
    collection = 'opensource_audio',
    itemId,
    category,
    fileName,
    body,
    mimeType,
    fileSize = 0,
    title = 'Instrumental Beat',
    creator = 'KRAEZELV',
  } = params;

  if (!accessKey || !secretKey) {
    throw new Error('Internet Archive credentials (IA_ACCESS_KEY, IA_SECRET_KEY) are missing.');
  }

  const s3Url = buildIAS3Url(itemId, category, fileName);
  const durableUrl = buildIAPublicUrl(itemId, category, fileName);
  const archivePath = `${itemId}/${category}/${fileName}`;

  // Map category to official Internet Archive mediatype
  let mediaType = 'audio';
  if (category === 'artwork') mediaType = 'image';
  else if (category === 'stems') mediaType = 'data';

  // Sanitize metadata for ASCII headers (Internet Archive requires ASCII header values)
  const safeTitle = title.replace(/[^\x20-\x7E]/g, '').trim() || 'Instrumental';
  const safeCreator = creator.replace(/[^\x20-\x7E]/g, '').trim() || 'KRAEZELV';

  const headers: Record<string, string> = {
    Authorization: `LOW ${accessKey}:${secretKey}`,
    'x-archive-auto-make-bucket': '1',
    'x-archive-meta-collection': collection || 'opensource_audio',
    'x-archive-meta-mediatype': mediaType,
    'x-archive-meta-title': safeTitle,
    'x-archive-meta-creator': safeCreator,
    'x-archive-meta-date': new Date().toISOString().slice(0, 10),
    'x-archive-keep-old-version': '0',
    'x-archive-interactive-priority': '1',
    'Content-Type': mimeType || 'application/octet-stream',
  };

  if (fileSize > 0) {
    headers['Content-Length'] = fileSize.toString();
  }

  const res = await fetch(s3Url, {
    method: 'PUT',
    headers,
    body,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    const cleanError = errorText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    throw new Error(`Internet Archive S3 Error (HTTP ${res.status}): ${cleanError || res.statusText || 'Upload rejected'}`);
  }

  const now = new Date().toISOString();

  return {
    success: true,
    itemId,
    category,
    fileName,
    durableUrl,
    archivePath,
    fileSize,
    mimeType,
    uploadedAt: now,
    storage: {
      provider: 'internet_archive',
      itemId,
      fileUrl: durableUrl,
      category,
      fileName,
      size: fileSize,
      mimeType,
      uploadedAt: now,
    },
  };
}
