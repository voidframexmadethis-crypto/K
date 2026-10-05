import type { IncomingMessage, ServerResponse } from 'http';
import {
  validateIAFile,
  generateIAItemId,
  executeIAUpload,
} from '../../../src/lib/internetArchiveCore.ts';

// Disable default body parser to allow raw binary streaming on Vercel
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
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
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only POST requests are permitted.',
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
          'Internet Archive credentials (IA_ACCESS_KEY, IA_SECRET_KEY) are not configured in Vercel environment variables.',
      });
    }

    let query = req.query || {};
    if ((!query || Object.keys(query).length === 0) && req.url) {
      try {
        const urlObj = new URL(req.url, 'http://localhost');
        query = Object.fromEntries(urlObj.searchParams.entries());
      } catch {
        // Fallback to empty query if URL parsing fails
      }
    }
    const headers = req.headers || {};

    const fileName =
      (query.filename as string) || (headers['x-filename'] as string) || 'asset';
    const category =
      (query.category as string) || (headers['x-category'] as string) || 'audio';
    const beatId =
      (query.beatId as string) || (headers['x-beat-id'] as string) || '';
    const title =
      (query.title as string) || (headers['x-title'] as string) || 'Instrumental Beat';
    const producer =
      (query.producer as string) || (headers['x-producer'] as string) || 'KRAEZELV';
    const existingItemId =
      (query.existingItemId as string) ||
      (headers['x-existing-item-id'] as string) ||
      undefined;
    const mimeType = (headers['content-type'] as string) || '';

    // Handle payload from buffer, parsed body, or raw stream
    let fileBuffer: Buffer;
    if (Buffer.isBuffer(req.body)) {
      fileBuffer = req.body;
    } else if (req.body && typeof req.body === 'object' && req.body.length !== undefined) {
      fileBuffer = Buffer.from(req.body);
    } else {
      fileBuffer = await getRawBody(req);
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'EMPTY_FILE',
        message: 'No file data received in upload payload.',
      });
    }

    // Strict validation: reject WAV, enforce MP3/M4A/images/ZIP
    const validation = validateIAFile(fileName, category, mimeType);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_FILE_TYPE',
        message: validation.error || 'File validation failed.',
      });
    }

    const itemId = generateIAItemId(beatId || `track_${Date.now()}`, existingItemId);

    const uploadResult = await executeIAUpload({
      accessKey,
      secretKey,
      collection,
      itemId,
      category: validation.category,
      fileName: validation.sanitizedFileName,
      body: fileBuffer,
      mimeType: validation.mimeType,
      fileSize: fileBuffer.length,
      title,
      creator: producer,
    });

    return res.status(200).json(uploadResult);
  } catch (err: any) {
    console.error('[VERCEL_IA_API] Upload error:', err?.message || err);
    return res.status(500).json({
      success: false,
      error: 'UPLOAD_FAILED',
      message: err?.message || 'Internet Archive upload pipeline encountered an unexpected error.',
    });
  }
}
