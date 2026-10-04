/**
 * Cloudflare Pages Function: Internet Archive Upload Handler
 * Route: /api/storage/internet-archive/upload
 *
 * Runs exclusively in the Cloudflare Pages runtime.
 * Accesses credentials ONLY through context.env (encrypted runtime secrets).
 * NEVER returns or exposes credentials.
 */

import {
  validateIAFile,
  generateIAItemId,
  executeIAUpload,
} from '../../../../src/lib/internetArchiveCore.ts';

export interface PagesEnv {
  IA_ACCESS_KEY?: string;
  IA_SECRET_KEY?: string;
  IA_COLLECTION?: string;
}

export interface PagesContext<Env = PagesEnv> {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<unknown>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, unknown>;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-beat-id, x-category, x-filename, x-title, x-producer, x-existing-item-id',
};

function jsonResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

/**
 * Handle CORS preflight
 */
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Handle File Upload to Internet Archive via Cloudflare Pages Function
 */
export async function onRequestPost(context: PagesContext): Promise<Response> {
  try {
    const { request, env } = context;

    // 1. Verify Cloudflare Pages runtime secrets
    const accessKey = env.IA_ACCESS_KEY;
    const secretKey = env.IA_SECRET_KEY;
    const collection = env.IA_COLLECTION || 'opensource_audio';

    if (!accessKey || !secretKey) {
      return jsonResponse(
        {
          success: false,
          error: 'CONFIGURATION_REQUIRED',
          message:
            'Internet Archive storage credentials (IA_ACCESS_KEY, IA_SECRET_KEY) are not configured in Cloudflare Pages runtime secrets. Please configure them in Cloudflare dashboard under Settings > Variables and Secrets.',
        },
        503
      );
    }

    // 3. Extract and parse upload payload
    const contentType = request.headers.get('content-type') || '';
    let fileBuffer: ArrayBuffer | null = null;
    let fileName = '';
    let category = 'audio';
    let beatId = '';
    let title = 'Instrumental Beat';
    let producer = 'KRAEZELVbeatz';
    let existingItemId: string | undefined = undefined;
    let mimeType = '';
    let fileSize = 0;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return jsonResponse({ success: false, error: 'MISSING_FILE', message: 'No file received in upload payload.' }, 400);
      }

      fileBuffer = await file.arrayBuffer();
      fileName = file.name;
      mimeType = file.type;
      fileSize = file.size;

      category = (formData.get('category') as string) || 'audio';
      beatId = (formData.get('beatId') as string) || '';
      title = (formData.get('title') as string) || 'Instrumental Beat';
      producer = (formData.get('producer') as string) || 'KRAEZELVbeatz';
      existingItemId = (formData.get('existingItemId') as string) || undefined;
    } else {
      // Direct binary stream mode with headers/query params
      const url = new URL(request.url);
      fileName = url.searchParams.get('filename') || request.headers.get('x-filename') || 'media_asset';
      category = url.searchParams.get('category') || request.headers.get('x-category') || 'audio';
      beatId = url.searchParams.get('beatId') || request.headers.get('x-beat-id') || '';
      title = url.searchParams.get('title') || request.headers.get('x-title') || 'Instrumental Beat';
      producer = url.searchParams.get('producer') || request.headers.get('x-producer') || 'KRAEZELVbeatz';
      existingItemId = url.searchParams.get('existingItemId') || request.headers.get('x-existing-item-id') || undefined;
      mimeType = request.headers.get('content-type') || '';

      fileBuffer = await request.arrayBuffer();
      fileSize = fileBuffer.byteLength;
    }

    if (!fileBuffer || fileBuffer.byteLength === 0) {
      return jsonResponse({ success: false, error: 'EMPTY_FILE', message: 'Received empty file payload.' }, 400);
    }

    // 4. Strict File Type Validation (Reject WAV, enforce MP3/M4A/Images/ZIP)
    const validation = validateIAFile(fileName, category, mimeType);
    if (!validation.valid) {
      return jsonResponse(
        {
          success: false,
          error: 'INVALID_FILE_TYPE',
          message: validation.error || 'File validation failed.',
        },
        400
      );
    }

    // 5. Deterministic collision-resistant Internet Archive item identifier
    const itemId = generateIAItemId(beatId || `track_${Date.now()}`, existingItemId);

    // 6. Execute authentic Internet Archive S3 PUT upload
    const uploadResult = await executeIAUpload({
      accessKey,
      secretKey,
      collection,
      itemId,
      category: validation.category,
      fileName: validation.sanitizedFileName,
      body: fileBuffer,
      mimeType: validation.mimeType,
      fileSize,
      title,
      creator: producer,
    });

    // 7. Return safe upload result to client (zero secrets returned)
    return jsonResponse(uploadResult as unknown as Record<string, unknown>, 200);

  } catch (err: unknown) {
    const error = err as Error;
    console.error('[IA_PAGES_FUNCTION] Upload error:', error?.message || error);
    return jsonResponse(
      {
        success: false,
        error: 'UPLOAD_FAILED',
        message: error?.message || 'Internet Archive upload pipeline encountered an unexpected error.',
      },
      500
    );
  }
}
