import crypto from 'crypto';
import {
  validateIAFile,
  generateIAItemId,
  buildIAPublicUrl,
  UploadCategory,
} from '../../../src/lib/internetArchiveCore.ts';

export default async function handler(req: any, res: any) {
  // CORS Preflight headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only POST requests are permitted for presign requests.',
    });
  }

  try {
    const accessKey = process.env.IA_ACCESS_KEY;
    const secretKey = process.env.IA_SECRET_KEY;
    const collection = process.env.IA_COLLECTION || 'opensource_audio';

    if (!accessKey || !secretKey) {
      return res.status(503).json({
        success: false,
        error: 'CONFIGURATION_REQUIRED',
        message:
          'Internet Archive credentials (IA_ACCESS_KEY, IA_SECRET_KEY) are not configured in server environment variables.',
      });
    }

    // Parse JSON body
    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      try {
        bodyData = JSON.parse(bodyData);
      } catch {
        bodyData = {};
      }
    } else if (Buffer.isBuffer(bodyData)) {
      try {
        bodyData = JSON.parse(bodyData.toString('utf-8'));
      } catch {
        bodyData = {};
      }
    }
    bodyData = bodyData || {};

    const rawFilename = (bodyData.filename || bodyData.fileName || 'asset').toString();
    const rawCategory = (bodyData.category || 'audio').toString() as UploadCategory;
    const rawMimeType = (bodyData.mimeType || bodyData.contentType || '').toString();
    const beatId = (bodyData.beatId || `track_${Date.now()}`).toString();
    const rawTitle = (bodyData.title || 'Instrumental Beat').toString();
    const rawProducer = (bodyData.producer || 'KRAEZELV').toString();
    const existingItemId = bodyData.existingItemId ? bodyData.existingItemId.toString() : undefined;

    // 1. Strict Server-Side Validation: Reject WAV, validate MP3/M4A/ZIP/Images
    const validation = validateIAFile(rawFilename, rawCategory, rawMimeType);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_FILE_TYPE',
        message: validation.error || 'File validation failed against security policy.',
      });
    }

    const category = validation.category;
    const sanitizedFileName = validation.sanitizedFileName;
    const mimeType = validation.mimeType;

    // 2. Deterministic Item ID generation
    const itemId = generateIAItemId(beatId, existingItemId);

    // 3. Map category to Internet Archive mediatype
    let mediaType = 'audio';
    if (category === 'artwork') mediaType = 'image';
    else if (category === 'stems') mediaType = 'data';

    // Sanitize metadata for ASCII headers (Internet Archive S3 requires ASCII header values)
    const safeTitle = rawTitle.replace(/[^\x20-\x7E]/g, '').trim() || 'Instrumental Beat';
    const safeCreator = rawProducer.replace(/[^\x20-\x7E]/g, '').trim() || 'KRAEZELV';

    // 4. Set expiration window (30 minutes)
    const expiresInSeconds = 1800;
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;

    // 5. Build canonical S3 path
    const canonicalResource = `/${itemId}/${category}/${encodeURIComponent(sanitizedFileName)}`;

    // 6. Construct Archive metadata headers
    const archiveHeaders: Record<string, string> = {
      'x-archive-auto-make-bucket': '1',
      'x-archive-meta-collection': collection,
      'x-archive-meta-mediatype': mediaType,
      'x-archive-meta-title': safeTitle,
      'x-archive-meta-creator': safeCreator,
    };

    // Sort and format canonical x-archive-* headers for S3 signature
    const sortedKeys = Object.keys(archiveHeaders).sort();
    let canonicalAmzHeaders = '';
    for (const key of sortedKeys) {
      canonicalAmzHeaders += `${key.toLowerCase()}:${archiveHeaders[key].trim()}\n`;
    }

    // 7. S3 V2 Presigned URL String-To-Sign:
    // PUT\n + Content-MD5\n + Content-Type\n + Expires\n + CanonicalizedAmzHeaders + CanonicalizedResource
    const stringToSign = `PUT\n\n${mimeType}\n${expires}\n${canonicalAmzHeaders}${canonicalResource}`;

    const signature = crypto
      .createHmac('sha1', secretKey)
      .update(Buffer.from(stringToSign, 'utf-8'))
      .digest('base64');

    const uploadUrl = `https://s3.us.archive.org${canonicalResource}?AWSAccessKeyId=${encodeURIComponent(
      accessKey
    )}&Signature=${encodeURIComponent(signature)}&Expires=${expires}`;

    const durableUrl = buildIAPublicUrl(itemId, category, sanitizedFileName);
    const archivePath = `${itemId}/${category}/${sanitizedFileName}`;

    const headersToSend: Record<string, string> = {
      'Content-Type': mimeType,
      ...archiveHeaders,
    };

    return res.status(200).json({
      success: true,
      uploadUrl,
      durableUrl,
      archivePath,
      itemId,
      category,
      fileName: sanitizedFileName,
      headers: headersToSend,
      expiresAt: new Date(expires * 1000).toISOString(),
    });
  } catch (err: any) {
    console.error('[PRESIGN_API_ERROR]', err?.message || err);
    return res.status(500).json({
      success: false,
      error: 'PRESIGN_FAILED',
      message: err?.message || 'Failed to generate Internet Archive presigned upload URL.',
    });
  }
}
