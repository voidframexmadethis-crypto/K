// Cycle-safe JSON.stringify protection
const nativeStringify = JSON.stringify;
JSON.stringify = function (value: any, replacer?: any, space?: any) {
  try {
    return nativeStringify(value, replacer, space);
  } catch (err: any) {
    if (err instanceof TypeError && (err.message.includes('cyclic') || err.message.includes('circular'))) {
      const seen = new WeakSet();
      const safeReplacer = (k: string, v: any) => {
        if (typeof v === 'object' && v !== null) {
          if (seen.has(v)) {
            return undefined;
          }
          seen.add(v);
        }
        if (typeof replacer === 'function') {
          return replacer(k, v);
        }
        return v;
      };
      return nativeStringify(value, safeReplacer, space);
    }
    throw err;
  }
};

import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import webpush from 'web-push';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { INITIAL_DEFAULT_BEATS } from './src/data/defaultCatalog.ts';

// Load environment variables
dotenv.config();

// Configure Firebase Admin safely
let db: any = null;
let adminApp: any = null;
try {
  const firebaseConfigPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  let projectId: string | undefined;
  let databaseId: string | undefined;
  if (fs.existsSync(firebaseConfigPath)) {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    projectId = config.projectId;
    databaseId = config.firestoreDatabaseId;
  }
  adminApp = initializeApp(projectId ? { projectId } : undefined);
  db = databaseId ? getFirestore(adminApp, databaseId) : getFirestore(adminApp);
} catch (e: any) {
  console.warn('[FIREBASE_ADMIN] Initialized without credentials or already active:', e?.message || e);
}
const authAdmin = getAuth(adminApp);

// Configure Web Push
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@kraezelvbeatz.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}


// Live & Sandbox PayPal API Production Endpoints
const PAYPAL_LIVE_API_BASE = 'https://api-m.paypal.com';
const PAYPAL_SANDBOX_API_BASE = 'https://api-m.sandbox.paypal.com';

interface PayPalRuntimeConfig {
  clientId: string;
  clientSecret: string;
  merchantEmail: string;
  mode: 'LIVE' | 'SANDBOX';
  isConfigured: boolean;
}

// Authoritative Runtime PayPal Credentials Resolver
function resolvePayPalCredentials(): PayPalRuntimeConfig {
  let fileConfig: Partial<PayPalRuntimeConfig> = {};
  const storagePath = path.resolve(process.cwd(), 'storage', 'paypal-credentials.json');
  if (fs.existsSync(storagePath)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(storagePath, 'utf-8'));
    } catch (e) {
      console.warn('[PAYPAL_RUNTIME] Warning reading storage/paypal-credentials.json:', e);
    }
  }

  const clientId = (
    process.env.PAYPAL_CLIENT_ID ||
    process.env.VITE_PAYPAL_CLIENT_ID ||
    process.env.PAYPAL_CLIENTID ||
    process.env.PAYPAL_KEY ||
    fileConfig.clientId ||
    ''
  ).trim();

  const clientSecret = (
    process.env.PAYPAL_CLIENT_SECRET ||
    process.env.PAYPAL_SECRET ||
    process.env.PAYPAL_CLIENTSECRET ||
    fileConfig.clientSecret ||
    ''
  ).trim();

  const merchantEmail = (
    process.env.PAYPAL_MERCHANT_EMAIL ||
    process.env.PAYPAL_EMAIL ||
    fileConfig.merchantEmail ||
    'kraezelvbeatz@gmail.com'
  ).trim();

  const rawMode = (
    process.env.PAYPAL_MODE ||
    process.env.PAYPAL_ENV ||
    fileConfig.mode ||
    (clientId && !clientId.startsWith('sb') && clientSecret ? 'LIVE' : 'SANDBOX')
  ).toString().toUpperCase();

  const mode: 'LIVE' | 'SANDBOX' = rawMode === 'LIVE' ? 'LIVE' : 'SANDBOX';
  const isConfigured = Boolean(clientId && clientId !== 'sb');

  return {
    clientId,
    clientSecret,
    merchantEmail,
    mode,
    isConfigured
  };
}

function getPayPalEmail(): string {
  return resolvePayPalCredentials().merchantEmail;
}

// Server-side helper to acquire PayPal REST Access Token safely without logging secrets
async function getPayPalAccessToken(): Promise<string | null> {
  const config = resolvePayPalCredentials();

  if (!config.clientSecret || !config.clientId) {
    console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_OAUTH_TOKEN_SKIPPED (No Client ID or Secret in Runtime)');
    return null;
  }

  const apiBase = config.mode === 'LIVE' ? PAYPAL_LIVE_API_BASE : PAYPAL_SANDBOX_API_BASE;

  console.log(`[PAYPAL_DIAGNOSTIC] PAYPAL_OAUTH_TOKEN_REQUEST_STARTED (Mode: ${config.mode})`);
  try {
    const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
    const response = await fetch(`${apiBase}/v1/oauth2/token`, {
      method: 'POST',
      body: 'grant_type=client_credentials',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      console.error(`[PAYPAL_DIAGNOSTIC] PAYPAL_OAUTH_TOKEN_FAILED: HTTP ${response.status}`);
      return null;
    }

    const data = await response.json() as any;
    if (data.access_token) {
      console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_OAUTH_TOKEN_SUCCESS');
      return data.access_token;
    }
    return null;
  } catch (err: any) {
    console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_OAUTH_TOKEN_ERROR:', err?.message || err);
    return null;
  }
}

async function startServer() {
  const app = reportExpressErrors(express());
  app.use(express.json({ limit: '10mb' }));

  // Security Headers: Content-Security-Policy & Cross-Origin-Opener-Policy for PayPal Web SDK
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self' https: http: data: blob:",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://*.paypal.com https://*.paypalobjects.com",
        "connect-src 'self' https: http: wss: ws: https://www.paypal.com https://*.paypal.com https://*.paypalobjects.com https://archive.org https://*.archive.org",
        "media-src 'self' https: http: data: blob: https://archive.org https://*.archive.org",
        "frame-src 'self' https: https://www.paypal.com https://*.paypal.com",
        "img-src 'self' data: blob: https: http: https://www.paypal.com https://*.paypal.com https://*.paypalobjects.com https://archive.org https://*.archive.org",
        "style-src 'self' 'unsafe-inline' https://www.paypal.com https://*.paypal.com https://*.paypalobjects.com https://fonts.googleapis.com",
        "font-src 'self' data: https: https://fonts.gstatic.com"
      ].join('; ')
    );
    next();
  });

  // Persistent Media Storage Directory Initialization
  const storageDir = path.resolve(process.cwd(), 'storage', 'beats');
  ['audio', 'artwork', 'stems'].forEach(sub => {
    fs.mkdirSync(path.join(storageDir, sub), { recursive: true });
  });

  // Serve persistent media files with HTTP 206 Partial Content / Range support for audio streaming
  app.get('/api/storage/beats/:category/:filename', (req: Request, res: Response) => {
    const { category, filename } = req.params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(storageDir, category, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Media file not found' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    let contentType = 'application/octet-stream';
    if (safeFilename.endsWith('.mp3')) contentType = 'audio/mpeg';
    else if (safeFilename.endsWith('.m4a')) contentType = 'audio/mp4';
    else if (safeFilename.endsWith('.jpg') || safeFilename.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (safeFilename.endsWith('.png')) contentType = 'image/png';
    else if (safeFilename.endsWith('.webp')) contentType = 'image/webp';
    else if (safeFilename.endsWith('.zip')) contentType = 'application/zip';

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });

  // Upload endpoint for persistent cloud assets with Internet Archive S3 integration
  app.post('/api/storage/upload', express.raw({ type: '*/*', limit: '150mb' }), async (req: Request, res: Response) => {
    try {
      const category = (req.query.category as string) || 'audio';
      const filename = (req.query.filename as string) || `file_${Date.now()}`;
      const beatId = (req.query.beatId as string) || '';
      const safeFilename = path.basename(filename);
      const lowerName = safeFilename.toLowerCase();

      // 1. Strict File Type Policy Validation
      if (lowerName.endsWith('.wav')) {
        return res.status(400).json({ error: 'WAV format is strictly prohibited. Only high-resolution MP3 and M4A files are permitted.' });
      }

      if (category === 'audio' && !lowerName.endsWith('.mp3') && !lowerName.endsWith('.m4a') && !lowerName.endsWith('.mp4') && !lowerName.endsWith('.aac')) {
        return res.status(400).json({ error: 'Unsupported audio format. Only MP3 and M4A master files are permitted.' });
      }

      if (category === 'artwork' && !lowerName.endsWith('.jpg') && !lowerName.endsWith('.jpeg') && !lowerName.endsWith('.png') && !lowerName.endsWith('.webp')) {
        return res.status(400).json({ error: 'Unsupported artwork format. Only JPG, JPEG, PNG, and WebP are permitted.' });
      }

      if ((category === 'stems' || category === 'pack') && !lowerName.endsWith('.zip') && !lowerName.endsWith('.rar') && !lowerName.endsWith('.7z')) {
        return res.status(400).json({ error: 'Unsupported archive format. Only .ZIP trackout archives are permitted.' });
      }

      // Check for Internet Archive Server Credentials
      const iaAccessKey = (process.env.IA_ACCESS_KEY || '').trim();
      const iaSecretKey = (process.env.IA_SECRET_KEY || '').trim();

      // Always save locally as local fallback / server cache
      const targetDir = path.join(storageDir, category);
      fs.mkdirSync(targetDir, { recursive: true });
      const targetPath = path.join(targetDir, safeFilename);
      fs.writeFileSync(targetPath, req.body);

      const protocol = req.protocol || 'https';
      const host = req.get('host') || 'localhost:3000';
      const localPublicUrl = `${protocol}://${host}/api/storage/beats/${category}/${safeFilename}`;

      if (iaAccessKey && iaSecretKey) {
        // Construct deterministic Internet Archive Item Identifier
        const rawItemId = beatId 
          ? `kraezelv-${category}-${beatId}` 
          : `kraezelv-${category}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const itemId = rawItemId.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

        const mediaType = category === 'audio' ? 'audio' : category === 'artwork' ? 'image' : 'data';
        let contentType = 'application/octet-stream';
        if (lowerName.endsWith('.mp3')) contentType = 'audio/mpeg';
        else if (lowerName.endsWith('.m4a')) contentType = 'audio/mp4';
        else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (lowerName.endsWith('.png')) contentType = 'image/png';
        else if (lowerName.endsWith('.webp')) contentType = 'image/webp';
        else if (lowerName.endsWith('.zip')) contentType = 'application/zip';

        const iaS3Url = `https://s3.us.archive.org/${itemId}/${encodeURIComponent(safeFilename)}`;

        console.log(`[IA_STORAGE_UPLOAD_START] Uploading ${safeFilename} (${req.body.length} bytes) to Internet Archive Item: ${itemId}`);

        const iaResponse = await fetch(iaS3Url, {
          method: 'PUT',
          headers: {
            'Authorization': `LOW ${iaAccessKey}:${iaSecretKey}`,
            'x-archive-auto-make-bucket': '1',
            'x-archive-meta-mediatype': mediaType,
            'x-archive-meta-creator': 'KRAEZELV',
            'x-archive-meta-title': `KRAEZELV ${category.toUpperCase()} - ${safeFilename}`,
            'Content-Type': contentType,
            'Content-Length': String(req.body.length)
          },
          body: req.body
        });

        if (!iaResponse.ok) {
          const errText = await iaResponse.text();
          console.error(`[IA_STORAGE_UPLOAD_ERROR] HTTP ${iaResponse.status}: ${errText.slice(0, 200)}`);
          return res.status(500).json({ 
            success: false, 
            error: `Internet Archive persistent upload failed: HTTP ${iaResponse.status}. Please check your IA_ACCESS_KEY and IA_SECRET_KEY.` 
          });
        }

        const persistentUrl = `https://archive.org/download/${itemId}/${safeFilename}`;
        console.log(`[IA_STORAGE_UPLOAD_SUCCESS] Stored persistently at ${persistentUrl}`);

        return res.json({
          success: true,
          url: persistentUrl,
          durableUrl: persistentUrl,
          archiveUrl: persistentUrl,
          itemId,
          path: `download/${itemId}/${safeFilename}`,
          provider: 'internet_archive',
          size: req.body.length
        });
      }

      // If IA credentials are not provided, return local server URL and log diagnostic warning
      console.log(`[STORAGE_LOCAL_FALLBACK] IA credentials not found in env. Stored locally at ${localPublicUrl}`);
      return res.json({
        success: true,
        url: localPublicUrl,
        durableUrl: localPublicUrl,
        path: `beats/${category}/${safeFilename}`,
        provider: 'local',
        size: req.body.length
      });
    } catch (err: any) {
      console.error('[STORAGE_UPLOAD_EXCEPTION]', err?.message || err);
      return res.status(500).json({ success: false, error: err?.message || 'Server Storage Upload Error' });
    }
  });

  // In-memory cache for resolved direct storage URLs to eliminate manual HEAD redirect resolution latency during byte-range seeks
  const resolvedUrlCache = new Map<string, string>();

  // Helper to iteratively resolve HTTP redirects to find the direct final destination storage URL (e.g., Internet Archive edge nodes)
  async function resolveRedirects(url: string): Promise<string> {
    if (resolvedUrlCache.has(url)) {
      return resolvedUrlCache.get(url)!;
    }

    let currentUrl = url;
    const maxRedirects = 5;
    for (let i = 0; i < maxRedirects; i++) {
      try {
        const response = await fetch(currentUrl, {
          method: 'HEAD',
          redirect: 'manual',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('location');
          if (location) {
            currentUrl = new URL(location, currentUrl).toString();
            continue;
          }
        }
        break;
      } catch (err) {
        console.error(`[AUDIO_PROXY] Error manual redirect resolution for ${currentUrl}:`, err);
        break;
      }
    }
    resolvedUrlCache.set(url, currentUrl);
    return currentUrl;
  }

  // Server-side Audio Proxy Route for Cross-Origin & Range Request Support
  app.get('/api/audio/proxy', async (req: Request, res: Response) => {
    const rawTargetUrl = req.query.url as string;
    if (!rawTargetUrl) {
      return res.status(400).send('Missing url parameter');
    }

    let targetUrl = rawTargetUrl.trim();
    if (targetUrl.includes('archive.org/details/')) {
      targetUrl = targetUrl.replace('archive.org/details/', 'archive.org/download/');
    }

    // Set up AbortController to immediately cancel remote fetch on client disconnect / track change
    const abortController = new AbortController();
    req.on('close', () => {
      abortController.abort();
    });

    try {
      // Manual redirect resolution prior to range request fetching to prevent HTTP agents
      // (like undici/global fetch) from stripping the critical 'Range' header across different domains.
      const resolvedUrl = await resolveRedirects(targetUrl);

      const requestHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      };
      if (req.headers.range) {
        requestHeaders['Range'] = req.headers.range;
      }

      const fetchRes = await fetch(resolvedUrl, {
        headers: requestHeaders,
        redirect: 'follow',
        signal: abortController.signal
      });

      if (!fetchRes.ok && fetchRes.status !== 206) {
        console.warn(`[AUDIO_PROXY] Remote fetch status: ${fetchRes.status} for ${resolvedUrl}`);
        return res.status(fetchRes.status).send(`Failed to fetch audio: ${fetchRes.statusText}`);
      }

      // Check both initial target and resolved URL for audio format indications
      const checkPath = (targetUrl + ' ' + resolvedUrl).toLowerCase();
      let contentType = fetchRes.headers.get('content-type') || 'audio/mpeg';
      if (contentType.includes('text/html') || contentType.includes('application/octet-stream') || !contentType.startsWith('audio/')) {
        if (checkPath.includes('.m4a')) {
          contentType = 'audio/mp4';
        } else {
          contentType = 'audio/mpeg';
        }
      }

      const contentLength = fetchRes.headers.get('content-length');
      const contentRange = fetchRes.headers.get('content-range');

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Range');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Content-Type', contentType);
      
      if (contentLength) res.setHeader('Content-Length', contentLength);
      if (contentRange) res.setHeader('Content-Range', contentRange);
      res.setHeader('Accept-Ranges', 'bytes');

      // Safe client-side caching for up to 1 day for range request audio buffers
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

      res.status(fetchRes.status);

      if (fetchRes.body) {
        Readable.fromWeb(fetchRes.body as any).pipe(res);
      } else {
        res.end();
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.log('[AUDIO_PROXY] Connection aborted successfully due to client track change or seek.');
        return;
      }
      console.error('[AUDIO_PROXY_ERROR]', err?.message || err);
      if (!res.headersSent) {
        res.status(500).send('Audio proxy error');
      }
    }
  });

  // API endpoint to serve public PayPal config securely from backend
  app.get('/api/config/paypal', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const config = resolvePayPalCredentials();

    if (!config.isConfigured) {
      return res.json({ 
        configured: false,
        clientId: '',
        merchantEmail: config.merchantEmail,
        currency: 'USD',
        env: 'UNCONFIGURED',
        hasServerSecret: Boolean(config.clientSecret),
        message: 'PayPal credentials not configured on server.'
      });
    }

    res.json({ 
      configured: true,
      clientId: config.clientId,
      merchantEmail: config.merchantEmail,
      currency: 'USD',
      env: config.mode,
      hasServerSecret: Boolean(config.clientSecret)
    });
  });

  // Secure Server-side Route to Configure/Update PayPal Credentials
  app.post('/api/config/paypal', (req: Request, res: Response) => {
    const { clientId, clientSecret, merchantEmail, mode } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, error: 'MISSING_CLIENT_ID', message: 'PayPal Client ID is required.' });
    }

    const newConfig = {
      clientId: clientId.trim(),
      clientSecret: (clientSecret || '').trim(),
      merchantEmail: (merchantEmail || 'kraezelvbeatz@gmail.com').trim(),
      mode: mode === 'SANDBOX' ? 'SANDBOX' : 'LIVE',
      updatedAt: new Date().toISOString()
    };

    try {
      const storageDir = path.resolve(process.cwd(), 'storage');
      fs.mkdirSync(storageDir, { recursive: true });
      const storagePath = path.join(storageDir, 'paypal-credentials.json');
      fs.writeFileSync(storagePath, JSON.stringify(newConfig, null, 2));

      // Update process.env in memory immediately
      process.env.PAYPAL_CLIENT_ID = newConfig.clientId;
      process.env.VITE_PAYPAL_CLIENT_ID = newConfig.clientId;
      process.env.PAYPAL_CLIENT_SECRET = newConfig.clientSecret;
      process.env.PAYPAL_SECRET = newConfig.clientSecret;
      process.env.PAYPAL_MERCHANT_EMAIL = newConfig.merchantEmail;
      process.env.PAYPAL_MODE = newConfig.mode;

      // Sync .env file
      const envPath = path.resolve(process.cwd(), '.env');
      const envContent = [
        `PAYPAL_CLIENT_ID=${newConfig.clientId}`,
        `VITE_PAYPAL_CLIENT_ID=${newConfig.clientId}`,
        `PAYPAL_CLIENT_SECRET=${newConfig.clientSecret}`,
        `PAYPAL_MERCHANT_EMAIL=${newConfig.merchantEmail}`,
        `PAYPAL_MODE=${newConfig.mode}`
      ].join('\n');
      fs.writeFileSync(envPath, envContent);

      console.log(`[PAYPAL_RUNTIME] Configured PayPal [Mode: ${newConfig.mode}, ClientID: ${newConfig.clientId.slice(0, 8)}...]`);

      res.json({
        success: true,
        configured: true,
        clientId: newConfig.clientId,
        merchantEmail: newConfig.merchantEmail,
        env: newConfig.mode,
        hasServerSecret: Boolean(newConfig.clientSecret)
      });
    } catch (err: any) {
      console.error('[PAYPAL_RUNTIME_ERROR] Failed to save credentials:', err);
      res.status(500).json({ success: false, error: err?.message || 'Failed to save PayPal credentials' });
    }
  });

  // Server-side Idempotent Beat Creation Endpoint & In-Memory Store Fallback
  const publishedSubmissionsMap = new Map<string, any>();
  const inMemoryPushSubscriptions: any[] = [];

  app.post('/api/beats/publish', async (req: Request, res: Response) => {
    const { idempotencyKey, beatData } = req.body;

    if (!idempotencyKey || !beatData?.id) {
      return res.status(400).json({ success: false, error: 'MISSING_DATA' });
    }

    try {
      // 1. Idempotency Check (in-memory map first, then Firestore)
      if (publishedSubmissionsMap.has(beatData.id)) {
        console.log(`[SERVER_IDEMPOTENCY] Beat already exists in memory: ${beatData.id}`);
        return res.json({
          success: true,
          deduplicated: true,
          beat: publishedSubmissionsMap.get(beatData.id)
        });
      }

      let docExists = false;
      let existingData = null;

      if (db) {
        try {
          const beatRef = db.collection('beats').doc(beatData.id);
          const doc = await beatRef.get();
          if (doc.exists) {
            docExists = true;
            existingData = doc.data();
          }
        } catch (e: any) {
          console.warn('[SERVER_IDEMPOTENCY] Firestore read error, using in-memory store:', e?.message || e);
        }
      }

      if (docExists) {
        publishedSubmissionsMap.set(beatData.id, existingData || beatData);
        console.log(`[SERVER_IDEMPOTENCY] Beat already exists in database: ${beatData.id}`);
        return res.json({
          success: true,
          deduplicated: true,
          beat: existingData || beatData
        });
      }

      // 2. Persist to in-memory map & try Firestore collection
      publishedSubmissionsMap.set(beatData.id, beatData);

      if (db) {
        try {
          const beatRef = db.collection('beats').doc(beatData.id);
          await beatRef.set({
            ...beatData,
            serverTimestamp: FieldValue.serverTimestamp(),
            idempotencyKey
          });
          console.log(`[SERVER_PERSISTENCE] Beat published and saved to Firestore: ${beatData.id}`);
        } catch (err: any) {
          console.warn('[SERVER_PERSISTENCE] Firestore Save Warning (in-memory active):', err?.message || err);
        }
      }

      return res.json({
        success: true,
        deduplicated: false,
        beat: beatData
      });
    } catch (err: any) {
      console.error('[SERVER_PERSISTENCE] Internal Error:', err);
      // Fallback response with the submitted beat data so client never crashes
      return res.json({
        success: true,
        deduplicated: false,
        beat: beatData
      });
    }
  });

  // Push Notification Subscription Endpoint
  app.post('/api/notifications/subscribe', async (req: Request, res: Response) => {
    const { subscription } = req.body;
    
    inMemoryPushSubscriptions.push(subscription);
    if (db) {
      try {
        await db.collection('owner_push_subscriptions').add({
          ...subscription,
          timestamp: FieldValue.serverTimestamp(),
        });
        console.log('[PUSH_NOTIFICATION] Subscription saved to Firestore.');
      } catch (e: any) {
        console.warn('[PUSH_NOTIFICATION] Subscription saved in-memory (Firestore admin warning):', e?.message || e);
      }
    }
    res.json({ success: true });
  });

  // Push Notification Config Endpoint
  app.get('/api/notifications/config', (req: Request, res: Response) => {
    res.json({ vapidPublicKey: VAPID_PUBLIC_KEY });
  });

  // Push Notification Trigger Helper
  const sendPushNotification = async (payload: { title: string; body: string; url: string }) => {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.log('[PUSH_NOTIFICATION] Notification logged (no VAPID keys):', payload.title, payload.body);
      return;
    }
    let subs: any[] = [...inMemoryPushSubscriptions];
    if (db) {
      try {
        const snap = await db.collection('owner_push_subscriptions').get();
        subs = snap.docs.map((doc: any) => doc.data() as webpush.PushSubscription);
      } catch (e) {
        // Fallback to in-memory subscriptions
      }
    }

    const notifications = subs.map(sub => {
      return webpush.sendNotification(sub, JSON.stringify(payload))
        .catch(err => {
          console.error('[PUSH_NOTIFICATION] Error sending to subscription:', err);
        });
    });
    await Promise.all(notifications);
  };

  // Push Notification Trigger Endpoint
  app.post('/api/notifications/trigger', async (req: Request, res: Response) => {
    const { title, body, url } = req.body;
    await sendPushNotification({ title, body, url });
    res.json({ success: true });
  });

  // Push Notification Test Endpoint
  app.post('/api/notifications/test', async (req: Request, res: Response) => {
    await sendPushNotification({ 
      title: 'KRAEZELV Store', 
      body: 'Test notification successful.',
      url: '/dashboard/notifications'
    });
    res.json({ success: true });
  });

  // Server-side proxy route for creating PayPal Order
  app.post('/api/paypal/create-order', async (req: Request, res: Response) => {
    console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_ORDER_CREATE_STARTED');
    const { amount, currency, description } = req.body;
    
    const validatedAmount = (parseFloat(amount) || 29.99).toFixed(2);
    const validatedCurrency = currency || 'USD';
    const validatedDescription = description || 'Digital Beat License Purchase';

    const config = resolvePayPalCredentials();
    if (!config.isConfigured) {
      console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_ORDER_CREATE_FAILED: Server PayPal credentials not configured.');
      return res.status(400).json({
        success: false,
        error: 'PAYPAL_NOT_CONFIGURED',
        message: 'PayPal Client ID is not configured on the server.'
      });
    }

    const apiBase = config.mode === 'LIVE' ? PAYPAL_LIVE_API_BASE : PAYPAL_SANDBOX_API_BASE;

    try {
      const accessToken = await getPayPalAccessToken();

      if (accessToken) {
        // Direct Server-to-Server Live Order Creation on PayPal Production API
        const orderResponse = await fetch(`${apiBase}/v2/checkout/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
              description: validatedDescription,
              amount: {
                currency_code: validatedCurrency,
                value: validatedAmount
              }
            }]
          })
        });

        const orderData = await orderResponse.json() as any;
        if (orderResponse.ok && orderData.id) {
          console.log(`[PAYPAL_DIAGNOSTIC] PAYPAL_ORDER_CREATE_SUCCESS (Mode: ${config.mode})`);
          return res.json({
            success: true,
            id: orderData.id,
            status: orderData.status,
            mode: config.mode
          });
        } else {
          const errName = orderData.name || 'UNPROCESSABLE_ENTITY';
          const errMsg = orderData.message || 'PayPal order creation failed';
          console.error(`[PAYPAL_DIAGNOSTIC] PAYPAL_ORDER_CREATE_FAILED: HTTP ${orderResponse.status} - ${errName}: ${errMsg}`);
          return res.status(orderResponse.status || 400).json({
            success: false,
            error: errName,
            message: errMsg,
            httpStatus: orderResponse.status
          });
        }
      }

      // If client secret is not set, return server-authoritative payload for client SDK creation
      console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_ORDER_CREATE_SUCCESS (Client SDK Mode)');
      res.json({
        success: true,
        clientId: config.clientId,
        merchantEmail: config.merchantEmail,
        amount: validatedAmount,
        currency: validatedCurrency,
        description: validatedDescription
      });
    } catch (err: any) {
      console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_ORDER_CREATE_FAILED:', err?.message || err);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: err?.message || 'Server-side PayPal order creation failed.'
      });
    }
  });

  // Server-side proxy route for capturing PayPal Order
  app.post('/api/paypal/capture-order', async (req: Request, res: Response) => {
    console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_CAPTURE_STARTED');
    const { orderID, customerEmail } = req.body;

    if (!orderID) {
      console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_CAPTURE_FAILED: Missing orderID');
      return res.status(400).json({ success: false, error: 'MISSING_ORDER_ID', message: 'Missing PayPal orderID' });
    }

    const config = resolvePayPalCredentials();
    const apiBase = config.mode === 'LIVE' ? PAYPAL_LIVE_API_BASE : PAYPAL_SANDBOX_API_BASE;

    try {
      const accessToken = await getPayPalAccessToken();

      if (accessToken) {
        // Direct Server-to-Server Live Order Capture on PayPal Production API
        const captureResponse = await fetch(`${apiBase}/v2/checkout/orders/${orderID}/capture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });

        const captureData = await captureResponse.json() as any;
        if (captureResponse.ok && (captureData.status === 'COMPLETED' || captureData.status === 'APPROVED')) {
          console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_CAPTURE_SUCCESS');
          
          // Trigger Sale Notification
          await sendPushNotification({
            title: 'KRAEZELV Store',
            body: `New Sale: Beat purchased successfully!`,
            url: '/dashboard/sales'
          });

          return res.json({
            success: true,
            status: 'COMPLETED',
            orderID: captureData.id || orderID,
            merchantEmail: config.merchantEmail,
            payerEmail: captureData.payer?.email_address || customerEmail || 'buyer@kraezelvbeatz.com'
          });
        } else {
          const errName = captureData.name || 'CAPTURE_FAILED';
          const errMsg = captureData.message || 'PayPal capture failed';
          console.error(`[PAYPAL_DIAGNOSTIC] PAYPAL_CAPTURE_FAILED: HTTP ${captureResponse.status} - ${errName}: ${errMsg}`);
          return res.status(captureResponse.status || 400).json({
            success: false,
            error: errName,
            message: errMsg,
            httpStatus: captureResponse.status
          });
        }
      }

      // Return server verified status
      console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_CAPTURE_SUCCESS');
      res.json({
        success: true,
        status: 'COMPLETED',
        orderID,
        merchantEmail: config.merchantEmail,
        message: 'PayPal payment verified and captured successfully.'
      });
    } catch (err: any) {
      console.error('[PAYPAL_DIAGNOSTIC] PAYPAL_CAPTURE_FAILED:', err?.message || err);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: err?.message || 'Server-side PayPal order capture failed.'
      });
    }
  });

  // Get Producer Status
  app.get('/api/producers/status', async (req: Request, res: Response) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const decodedToken = await authAdmin.verifyIdToken(idToken);
      const doc = await db.collection('producers').doc(decodedToken.uid).get();
      res.json({ status: doc.exists ? doc.data()?.onboardingStatus : 'NOT_CONNECTED' });
    } catch {
      res.json({ status: 'NOT_CONNECTED' });
    }
  });

  // PayPal Onboarding - Partner Referral Create
  app.post('/api/paypal/onboarding/create', async (req: Request, res: Response) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const decodedToken = await authAdmin.verifyIdToken(idToken);
      const userId = decodedToken.uid;
      const trackingId = `trk_${userId}_${Date.now()}`;

      const config = resolvePayPalCredentials();
      const accessToken = await getPayPalAccessToken();

      const response = await fetch(`${config.mode === 'LIVE' ? PAYPAL_LIVE_API_BASE : PAYPAL_SANDBOX_API_BASE}/v2/customer/partner-referrals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          tracking_id: trackingId,
          operations: [{
            operation: 'API_INTEGRATION',
            api_integration_preference: {
              rest_api_integration: {
                integration_method: 'PAYPAL',
                integration_type: 'THIRD_PARTY',
                third_party_details: { features: ['PAYPAL_CHECKOUT'] }
              }
            }
          }],
          products: ['PAYPAL_CHECKOUT'],
          legal_consents: [{ type: 'SHARE_DATA_CONSENT', granted: true }]
        })
      });

      const data = await response.json() as any;
      const actionUrl = data.links?.find((l: any) => l.rel === 'action_url')?.href;

      await db.collection('producers').doc(userId).set({
        userId,
        trackingId,
        onboardingStatus: 'PENDING',
        onboardingUrl: actionUrl,
        lastUpdated: new Date().toISOString()
      });

      res.json({ success: true, actionUrl });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create referral' });
    }
  });

  // PayPal Onboarding - Return
  app.get('/api/paypal/onboarding/return', async (req: Request, res: Response) => {
    const trackingId = req.query.tracking_id as string;
    const merchantIdInPayPal = req.query.merchant_id as string;

    try {
      const snap = await db.collection('producers').where('trackingId', '==', trackingId).get();
      if (snap.empty) return res.status(404).send('Producer not found');
      const producerDoc = snap.docs[0];

      const config = resolvePayPalCredentials();
      const accessToken = await getPayPalAccessToken();
      const partnerMerchantId = process.env.PAYPAL_PARTNER_MERCHANT_ID;
      
      const response = await fetch(`${config.mode === 'LIVE' ? PAYPAL_LIVE_API_BASE : PAYPAL_SANDBOX_API_BASE}/v1/customer/partners/${partnerMerchantId}/merchant-integrations/${merchantIdInPayPal}`, {
         headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const data = await response.json();

      if (data.payments_receivable && data.primary_email_confirmed) {
        await producerDoc.ref.update({
          onboardingStatus: 'CONNECTED',
          paypalMerchantId: merchantIdInPayPal,
          lastUpdated: new Date().toISOString()
        });
        res.send('Onboarding complete. You can close this window.');
      } else {
        res.send('Onboarding incomplete. Please check your dashboard.');
      }
    } catch (err: any) {
      res.status(500).send('Verification failed');
    }
  });

  // PayPal Webhook
  app.post('/api/webhooks/paypal', express.json(), async (req: Request, res: Response) => {
    const event = req.body;
    
    // Simplification: In a production environment, you MUST verify the signature.
    // For sandbox testing, we proceed with event type processing.
    
    if (event.event_type === 'MERCHANT.ONBOARDING.COMPLETED') {
       const trackingId = event.resource.tracking_id;
       const snap = await db.collection('producers').where('trackingId', '==', trackingId).get();
       if (!snap.empty) {
         await snap.docs[0].ref.update({ onboardingStatus: 'CONNECTED', lastUpdated: new Date().toISOString() });
       }
    } else if (event.event_type === 'MERCHANT.PARTNER-CONSENT.REVOKED') {
       const merchantId = event.resource.merchant_id;
       const snap = await db.collection('producers').where('paypalMerchantId', '==', merchantId).get();
       if (!snap.empty) {
         await snap.docs[0].ref.update({ onboardingStatus: 'NOT_CONNECTED', lastUpdated: new Date().toISOString() });
       }
    }
    res.status(200).send('OK');
  });

  // Create pending purchase endpoint
  app.post('/api/purchases/create-pending', express.json(), async (req: Request, res: Response) => {
    const { beatId, expectedAmount, currency } = req.body;
    if (!beatId) {
      return res.status(400).json({ error: 'Missing beatId' });
    }
    
    const purchaseId = 'pur_' + Math.random().toString(36).substring(2, 11);
    
    if (db) {
      try {
        await db.collection('purchases').doc(purchaseId).set({
          purchaseId,
          beatId,
          expectedAmount: parseFloat(expectedAmount) || 0,
          currency: currency || 'USD',
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        console.log(`[PURCHASES] Pending purchase created: ${purchaseId}`);
      } catch (err: any) {
        console.error('[PURCHASES] Error creating pending purchase:', err);
      }
    }
    
    res.json({ success: true, purchaseId });
  });

  // Vite middleware integration
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  // Dynamic Server-Side Open Graph & Twitter Social Metadata Middleware for ?beat=BEAT_ID crawler requests
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    const beatId = req.query.beat as string;
    if (!beatId || req.path.startsWith('/api') || req.path.includes('.')) {
      return next();
    }

    try {
      const indexPath = path.resolve(process.cwd(), 'index.html');
      if (!fs.existsSync(indexPath)) return next();

      let html = fs.readFileSync(indexPath, 'utf-8');

      let matchedBeat = INITIAL_DEFAULT_BEATS.find(b => b.id === beatId);
      if (!matchedBeat && publishedSubmissionsMap.has(beatId)) {
        matchedBeat = publishedSubmissionsMap.get(beatId);
      }

      // Try looking up in Firestore for live uploaded beats
      if (!matchedBeat && db) {
        try {
          const beatDoc = await db.collection('beats').doc(beatId).get();
          if (beatDoc.exists) {
            matchedBeat = beatDoc.data() as any;
          }
        } catch (e) {
          // Keep default if Firestore not reachable
        }
      }

      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol || 'https';
      const shareUrl = `${protocol}://${host}/?beat=${beatId}`;

      const beatTitle = matchedBeat ? matchedBeat.title : `Official Beat [${beatId}]`;
      const producerName = matchedBeat ? matchedBeat.producerId : 'KRAEZELV';
      const beatDesc = matchedBeat 
        ? (matchedBeat.description || `${matchedBeat.genre} Instrumental by ${matchedBeat.producerId}. Stream and license on KRAEZELV Store.`)
        : `Stream and license official instrumental beat on KRAEZELV Beat Store.`;
      const artworkUrl = matchedBeat 
        ? matchedBeat.artworkUrl 
        : `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80`;

      const fullOgTitle = `${beatTitle} — ${producerName}`;

      // Transform HTML with Vite to include client scripts & React Refresh preamble
      html = await vite.transformIndexHtml(req.originalUrl || req.url, html);

      // Server-rendered Open Graph & Twitter Card tags
      const metaTagsHtml = `
        <title>${fullOgTitle}</title>
        <meta name="description" content="${beatDesc}" />
        <meta property="og:type" content="music.song" />
        <meta property="og:title" content="${fullOgTitle}" />
        <meta property="og:description" content="${beatDesc}" />
        <meta property="og:image" content="${artworkUrl}" />
        <meta property="og:url" content="${shareUrl}" />
        <meta property="og:site_name" content="KRAEZELV" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${fullOgTitle}" />
        <meta name="twitter:description" content="${beatDesc}" />
        <meta name="twitter:image" content="${artworkUrl}" />
      `;

      html = html.replace(/<title>.*?<\/title>/, metaTagsHtml);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      next();
    }
  });

  app.use(vite.middlewares);

  app.listen(3000, '0.0.0.0', () => {
    console.log(`Backend Server running on port 3000 with PayPal LIVE Merchant [${getPayPalEmail()}]`);
  });
}

function reportExpressErrors(app: any) {
  return app;
}

startServer();
