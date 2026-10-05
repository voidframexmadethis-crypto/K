import crypto from 'crypto';
import {
  validateIAFile,
  generateIAItemId,
  buildIAPublicUrl,
  UploadCategory,
} from '../../../src/lib/internetArchiveCore.ts';

// Universal bulletproof JSON response sender
function sendJsonResponse(res: any, statusCode: number, payload: any) {
  try {
    const jsonString = JSON.stringify(payload);
    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, x-beat-id, x-category, x-filename, x-title, x-producer, x-existing-item-id'
      );
    }
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(statusCode).json(payload);
    }
    res.statusCode = statusCode;
    return res.end(jsonString);
  } catch (err) {
    try {
      res.statusCode = 500;
      res.end('{"success":false,"stage":"RESPONSE","error":"Failed to serialize response JSON"}');
    } catch {
      // Emergency termination
    }
  }
}

export default async function handler(req: any, res: any) {
  let currentStage = 'INIT';

  // Always enable CORS
  try {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, x-beat-id, x-category, x-filename, x-title, x-producer, x-existing-item-id'
      );
    }
  } catch {
    // Non-blocking header set
  }

  if (req && req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req && req.method !== 'POST') {
    return sendJsonResponse(res, 405, {
      success: false,
      stage: 'METHOD_CHECK',
      error: 'Only POST requests are permitted for presign requests.',
      message: 'Only POST requests are permitted for presign requests.',
    });
  }

  try {
    // ==========================================
    // STAGE 1: ENV_VALIDATION
    // ==========================================
    currentStage = 'ENV_VALIDATION';
    const hasAccessKey = Boolean(process.env.IA_ACCESS_KEY && process.env.IA_ACCESS_KEY.trim().length > 0);
    const hasSecretKey = Boolean(process.env.IA_SECRET_KEY && process.env.IA_SECRET_KEY.trim().length > 0);
    const hasCollection = Boolean(process.env.IA_COLLECTION && process.env.IA_COLLECTION.trim().length > 0);

    const envCheck = {
      hasAccessKey,
      hasSecretKey,
      hasCollection,
    };

    if (!hasAccessKey || !hasSecretKey) {
      const missingKeys: string[] = [];
      if (!hasAccessKey) missingKeys.push('IA_ACCESS_KEY');
      if (!hasSecretKey) missingKeys.push('IA_SECRET_KEY');

      return sendJsonResponse(res, 500, {
        success: false,
        stage: 'ENV_VALIDATION',
        error: `Missing required server environment variable(s): ${missingKeys.join(', ')}. Please configure them in Vercel project settings.`,
        message: `Missing required server environment variable(s): ${missingKeys.join(', ')}.`,
        envCheck,
      });
    }

    const accessKey = (process.env.IA_ACCESS_KEY || '').trim();
    const secretKey = (process.env.IA_SECRET_KEY || '').trim();
    const collection = (process.env.IA_COLLECTION || 'opensource_audio').trim();

    // ==========================================
    // STAGE 2: REQUEST_BODY
    // ==========================================
    currentStage = 'REQUEST_BODY';
    let bodyData: Record<string, any> = {};

    try {
      if (req.body) {
        if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
          bodyData = req.body;
        } else if (typeof req.body === 'string') {
          bodyData = JSON.parse(req.body);
        } else if (Buffer.isBuffer(req.body)) {
          bodyData = JSON.parse(req.body.toString('utf-8'));
        }
      } else if (typeof req[Symbol.asyncIterator] === 'function') {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        if (chunks.length > 0) {
          const rawText = Buffer.concat(chunks).toString('utf-8');
          bodyData = JSON.parse(rawText);
        }
      }
    } catch (parseErr: any) {
      console.warn('[PRESIGN_BODY_PARSE_FALLBACK]', parseErr?.message || parseErr);
      bodyData = {};
    }

    let queryData: Record<string, any> = req.query || {};
    if ((!queryData || Object.keys(queryData).length === 0) && req.url) {
      try {
        const urlObj = new URL(req.url, 'http://localhost');
        queryData = Object.fromEntries(urlObj.searchParams.entries());
      } catch {
        queryData = {};
      }
    }

    const reqHeaders = req.headers || {};

    const rawFilename = (
      bodyData.filename ||
      bodyData.fileName ||
      queryData.filename ||
      reqHeaders['x-filename'] ||
      'asset'
    ).toString();

    const rawCategory = (
      bodyData.category ||
      queryData.category ||
      reqHeaders['x-category'] ||
      'audio'
    ).toString() as UploadCategory;

    const rawMimeType = (
      bodyData.mimeType ||
      bodyData.contentType ||
      queryData.mimeType ||
      reqHeaders['content-type'] ||
      ''
    ).toString();

    const beatId = (
      bodyData.beatId ||
      queryData.beatId ||
      reqHeaders['x-beat-id'] ||
      `track_${Date.now()}`
    ).toString();

    const rawTitle = (
      bodyData.title ||
      queryData.title ||
      reqHeaders['x-title'] ||
      'Instrumental Beat'
    ).toString();

    const rawProducer = (
      bodyData.producer ||
      queryData.producer ||
      reqHeaders['x-producer'] ||
      'KRAEZELV'
    ).toString();

    const existingItemId = (
      bodyData.existingItemId ||
      queryData.existingItemId ||
      reqHeaders['x-existing-item-id'] ||
      undefined
    )
      ? String(
          bodyData.existingItemId ||
            queryData.existingItemId ||
            reqHeaders['x-existing-item-id']
        )
      : undefined;

    // ==========================================
    // STAGE 3: FILE_VALIDATION
    // ==========================================
    currentStage = 'FILE_VALIDATION';
    const validation = validateIAFile(rawFilename, rawCategory, rawMimeType);
    if (!validation.valid) {
      return sendJsonResponse(res, 400, {
        success: false,
        stage: 'FILE_VALIDATION',
        error: validation.error || 'File validation failed against format security policy.',
        message: validation.error || 'File validation failed against format security policy.',
        envCheck,
      });
    }

    const category = validation.category;
    const sanitizedFileName = validation.sanitizedFileName;
    const mimeType = validation.mimeType;

    // ==========================================
    // STAGE 4: ITEM_ID
    // ==========================================
    currentStage = 'ITEM_ID';
    const itemId = generateIAItemId(beatId, existingItemId);
    if (!itemId || !itemId.startsWith('kraezelvbeatz-')) {
      return sendJsonResponse(res, 500, {
        success: false,
        stage: 'ITEM_ID',
        error: 'Failed to generate valid deterministic Internet Archive item identifier.',
        message: 'Failed to generate valid deterministic Internet Archive item identifier.',
        envCheck,
      });
    }

    // Map category to Internet Archive mediatype
    let mediaType = 'audio';
    if (category === 'artwork') mediaType = 'image';
    else if (category === 'stems') mediaType = 'data';

    // Sanitize metadata for ASCII headers (Internet Archive S3 requires ASCII header values)
    const safeTitle = rawTitle.replace(/[^\x20-\x7E]/g, '').trim() || 'Instrumental Beat';
    const safeCreator = rawProducer.replace(/[^\x20-\x7E]/g, '').trim() || 'KRAEZELV';

    // Expiration window: 30 minutes (1800s)
    const expiresInSeconds = 1800;
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;

    // Canonical S3 path
    const canonicalResource = `/${itemId}/${category}/${encodeURIComponent(sanitizedFileName)}`;

    // Archive metadata headers
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

    // ==========================================
    // STAGE 5: SIGNATURE_GENERATION
    // ==========================================
    currentStage = 'SIGNATURE_GENERATION';
    const stringToSign = `PUT\n\n${mimeType}\n${expires}\n${canonicalAmzHeaders}${canonicalResource}`;

    let signature = '';
    try {
      signature = crypto
        .createHmac('sha1', secretKey)
        .update(Buffer.from(stringToSign, 'utf-8'))
        .digest('base64');
    } catch (cryptoErr: any) {
      return sendJsonResponse(res, 500, {
        success: false,
        stage: 'SIGNATURE_GENERATION',
        error: `Cryptographic HMAC-SHA1 signature computation failed: ${cryptoErr?.message || 'Crypto error'}`,
        message: 'Cryptographic signature generation failed.',
        envCheck,
      });
    }

    const uploadUrl = `https://s3.us.archive.org${canonicalResource}?AWSAccessKeyId=${encodeURIComponent(
      accessKey
    )}&Signature=${encodeURIComponent(signature)}&Expires=${expires}`;

    const durableUrl = buildIAPublicUrl(itemId, category, sanitizedFileName);
    const archivePath = `${itemId}/${category}/${sanitizedFileName}`;

    const headersToSend: Record<string, string> = {
      'Content-Type': mimeType,
      ...archiveHeaders,
    };

    // ==========================================
    // STAGE 6: RESPONSE
    // ==========================================
    currentStage = 'RESPONSE';
    return sendJsonResponse(res, 200, {
      success: true,
      stage: 'RESPONSE',
      uploadUrl,
      durableUrl,
      archivePath,
      itemId,
      category,
      fileName: sanitizedFileName,
      headers: headersToSend,
      expiresAt: new Date(expires * 1000).toISOString(),
      envCheck,
    });
  } catch (uncaughtErr: any) {
    console.error('[PRESIGN_UNCAUGHT_ERROR]', uncaughtErr);
    return sendJsonResponse(res, 500, {
      success: false,
      stage: currentStage,
      error: `Unexpected error during ${currentStage}: ${uncaughtErr?.message || 'Unknown internal error'}`,
      message: `Presign request failed at stage ${currentStage}.`,
    });
  }
}
