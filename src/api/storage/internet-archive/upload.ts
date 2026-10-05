import { Request, Response } from 'express';
import {
  validateIAFile,
  generateIAItemId,
  executeIAUpload,
} from '../../../lib/internetArchiveCore.ts';

export async function handleInternetArchiveUpload(req: Request, res: Response) {
  try {
    const accessKey = process.env.IA_ACCESS_KEY;
    const secretKey = process.env.IA_SECRET_KEY;
    const collection = process.env.IA_COLLECTION || 'opensource_audio';

    if (!accessKey || !secretKey) {
      return res.status(503).json({
        success: false,
        error: 'CONFIGURATION_REQUIRED',
        message: 'Internet Archive credentials are not configured.',
      });
    }

    const fileName = (req.query.filename as string) || (req.headers['x-filename'] as string) || 'asset';
    const category = (req.query.category as string) || (req.headers['x-category'] as string) || 'audio';
    const beatId = (req.query.beatId as string) || (req.headers['x-beat-id'] as string) || '';
    const title = (req.query.title as string) || (req.headers['x-title'] as string) || 'Instrumental Beat';
    const producer = (req.query.producer as string) || (req.headers['x-producer'] as string) || 'KRAEZELV';
    const existingItemId = (req.query.existingItemId as string) || (req.headers['x-existing-item-id'] as string) || undefined;
    const mimeType = (req.headers['content-type'] as string) || '';

    const fileBuffer = req.body as Buffer;
    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ success: false, error: 'EMPTY_FILE', message: 'No file data received.' });
    }

    const validation = validateIAFile(fileName, category, mimeType);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: 'INVALID_FILE_TYPE', message: validation.error });
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

    return res.json(uploadResult);
  } catch (err: any) {
    console.error('[IA_SERVER_ROUTE] Upload error:', err?.message || err);
    return res.status(500).json({
      success: false,
      error: 'UPLOAD_FAILED',
      message: err?.message || 'Internet Archive upload failed.',
    });
  }
}
