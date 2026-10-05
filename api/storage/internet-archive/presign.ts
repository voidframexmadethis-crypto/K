import crypto from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';
import {
  validateIAFile,
  generateIAItemId,
  buildIAPublicUrl,
  UploadCategory,
} from '../../../src/lib/internetArchiveCore.ts';

// Helper to safely send JSON across Vercel, Express, and standard Node.js ServerResponse
function sendJson(res: any, statusCode: number, data: any) {
  try {
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(statusCode).json(data);
    }
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(data));
  } catch (sendErr) {
    console.error('[PRESIGN_SEND_JSON_ERROR]', sendErr);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('{"success":false,"error":"INTERNAL_SERVER_ERROR"}');
    }
  }
}

// Safely parse request body from parsed object, string, Buffer, or stream
async function parseRequestBody(req: any): Promise<Record<string, any>> {
  if (req.body) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return req.body;
    }
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    if (Buffer.isBuffer(req.body)) {
      try {
        return JSON.parse(req.body.toString('utf-8'));
      } catch {
        return {};
      }
    }
  }

  // If req.body is undefined, read stream chunks
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    if (chunks.length > 0) {
      const rawText = Buffer.concat(chunks).toString('utf-8');
      return JSON.parse(rawText);
    }
  } catch (streamErr) {
    console.warn('[PRESIGN_STREAM_PARSE_WARNING]', streamErr);
  }

  return {};
}

export default async function handler(req: any, res: any) {
  // CORS Preflight headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-beat-id, x-category, x-filename, x-title, x-producer, x-existing-item-id'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, {
      success: false,
      stage: 'METHOD_CHECK',
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only POST requests are permitted for presign requests.',
    });
  }

  try {
    // 1. Validate Environment Variables (Never expose secret values)
    const accessKey = (process.env.IA_ACCESS_KEY || '').trim();
    const secretKey = (process.env.IA_SECRET_KEY || '').trim();
    const collection = (process.env.IA_COLLECTION || 'opensource_audio').trim();

    if (!accessKey) {
      return sendJson(res, 500, {
        success: false,
        stage: 'ENV_VALIDATION',
        error: 'IA_ACCESS_KEY_MISSING',
        message: 'IA_ACCESS_KEY is missing from server environment variables.',
      });
    }

    if (!secretKey) {
      return sendJson(res, 500, {
        success: false,
        stage: 'ENV_VALIDATION',
        error: 'IA_SECRET_KEY_MISSING',
        message: 'IA_SECRET_KEY is missing from server environment variables.',
      });
    }

    // 2. Parse request query and body parameters
    let query: Record<string, any> = req.query || {};
    if ((!query || Object.keys(query).length === 0) && req.url) {
      try {
        const urlObj = new URL(req.url, 'http://localhost');
        query = Object.fromEntries(urlObj.searchParams.entries());
      } catch {
        query = {};
      }
    }

    const bodyData = await parseRequestBody(req);
    const headers = req.headers || {};

    const rawFilename = (
      bodyData.filename ||
      bodyData.fileName ||
      query.filename ||
      headers['x-filename'] ||
      'asset'
    ).toString();

    const rawCategory = (
      bodyData.category ||
      query.category ||
      headers['x-category'] ||
      'audio'
    ).toString() as UploadCategory;

    const rawMimeType = (
      bodyData.mimeType ||
      bodyData.contentType ||
      query.mimeType ||
      headers['content-type'] ||
      ''
    ).toString();

    const beatId = (
      bodyData.beatId ||
      query.beatId ||
      headers['x-beat-id'] ||
      `track_${Date.now()}`
    ).toString();

    const rawTitle = (
      bodyData.title ||
      query.title ||
      headers['x-title'] ||
      'Instrumental Beat'
    ).toString();

    const rawProducer = (
      bodyData.producer ||
      query.producer ||
      headers['x-producer'] ||
      'KRAEZELV'
    ).toString();

    const existingItemId = (
      bodyData.existingItemId ||
      query.existingItemId ||
      headers['x-existing-item-id'] ||
      undefined
    )
      ? String(
          bodyData.existingItemId ||
            query.existingItemId ||
            headers['x-existing-item-id']
        )
      : undefined;

    // 3. Strict Server-Side Validation: Reject WAV, enforce MP3/M4A/ZIP/Images
    const validation = validateIAFile(rawFilename, rawCategory, rawMimeType);
    if (!validation.valid) {
      return sendJson(res, 400, {
        success: false,
        stage: 'FILE_VALIDATION',
        error: 'INVALID_FILE_TYPE',
        message: validation.error || 'File validation failed against security policy.',
      });
    }

    const category = validation.category;
    const sanitizedFileName = validation.sanitizedFileName;
    const mimeType = validation.mimeType;

    // 4. Deterministic Item ID generation
    const itemId = generateIAItemId(beatId, existingItemId);

    // 5. Map category to Internet Archive mediatype
    let mediaType = 'audio';
    if (category === 'artwork') mediaType = 'image';
    else if (category === 'stems') mediaType = 'data';

    // Sanitize metadata for ASCII headers (Internet Archive S3 requires ASCII header values)
    const safeTitle = rawTitle.replace(/[^\x20-\x7E]/g, '').trim() || 'Instrumental Beat';
    const safeCreator = rawProducer.replace(/[^\x20-\x7E]/g, '').trim() || 'KRAEZELV';

    // 6. Set expiration window (30 minutes)
    const expiresInSeconds = 1800;
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;

    // 7. Build canonical S3 path
    const canonicalResource = `/${itemId}/${category}/${encodeURIComponent(sanitizedFileName)}`;

    // 8. Construct Archive metadata headers
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

    // 9. S3 V2 Presigned URL String-To-Sign:
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

    return sendJson(res, 200, {
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
    return sendJson(res, 500, {
      success: false,
      stage: 'SIGNATURE_GENERATION',
      error: 'PRESIGN_FAILED',
      message: err?.message || 'Failed to generate Internet Archive presigned upload URL.',
    });
  }
}
