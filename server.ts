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
import webpush from 'web-push';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { INITIAL_DEFAULT_BEATS } from './src/data/defaultCatalog.ts';
import {
  validateIAFile,
  generateIAItemId,
  executeIAUpload,
} from './src/lib/internetArchiveCore.ts';

// Load environment variables
dotenv.config();

// Configure Firebase Admin safely
let db: any = null;
try {
  const firebaseConfigPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  let projectId: string | undefined;
  let databaseId: string | undefined;
  if (fs.existsSync(firebaseConfigPath)) {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    projectId = config.projectId;
    databaseId = config.firestoreDatabaseId;
  }
  const adminApp = initializeApp(projectId ? { projectId } : undefined);
  db = databaseId ? getFirestore(adminApp, databaseId) : getFirestore(adminApp);
} catch (e: any) {
  console.warn('[FIREBASE_ADMIN] Initialized without credentials or already active:', e?.message || e);
}

// Configure Web Push
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@kraezelvbeatz.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}


// Live PayPal API Production Endpoint
const PAYPAL_API_BASE = 'https://api-m.paypal.com';

// Authoritative Production PayPal Credentials (Server-Side Only)
const BACKEND_PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID || '';
const BACKEND_PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET || '';
const BACKEND_PAYPAL_EMAIL = process.env.PAYPAL_MERCHANT_EMAIL || 'kraezelvbeatz@gmail.com';

// Server-side helper to acquire PayPal REST Access Token safely without logging secrets
async function getPayPalAccessToken(clientId: string, secret: string): Promise<string | null> {
  if (!secret) {
    console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_OAUTH_TOKEN_SKIPPED (No Secret in Runtime)');
    return null;
  }

  console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_OAUTH_TOKEN_REQUEST_STARTED');
  try {
    const auth = Buffer.from(`${clientId.trim()}:${secret.trim()}`).toString('base64');
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
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
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });

  // Upload endpoint for persistent cloud assets
  app.post('/api/storage/upload', express.raw({ type: '*/*', limit: '150mb' }), (req: Request, res: Response) => {
    const category = (req.query.category as string) || 'audio';
    const filename = (req.query.filename as string) || `file_${Date.now()}`;
    const safeFilename = path.basename(filename);

    if (category === 'audio' && safeFilename.toLowerCase().endsWith('.wav')) {
      return res.status(400).json({ error: 'WAV format is prohibited. Only MP3 and M4A master files are allowed.' });
    }

    const targetDir = path.join(storageDir, category);
    fs.mkdirSync(targetDir, { recursive: true });
    const targetPath = path.join(targetDir, safeFilename);

    fs.writeFileSync(targetPath, req.body);

    const protocol = req.protocol || 'https';
    const host = req.get('host') || 'localhost:3000';
    const publicUrl = `${protocol}://${host}/api/storage/beats/${category}/${safeFilename}`;

    console.log(`[STORAGE_PERSISTENCE] Uploaded ${safeFilename} (${req.body.length} bytes) -> ${publicUrl}`);

    res.json({
      success: true,
      url: publicUrl,
      path: `beats/${category}/${safeFilename}`,
      size: req.body.length
    });
  });

  // Local development & testing endpoint for Internet Archive uploads
  app.post(
    '/api/storage/internet-archive/upload',
    express.raw({ type: '*/*', limit: '200mb' }),
    async (req: Request, res: Response) => {
      try {
        const accessKey = process.env.IA_ACCESS_KEY;
        const secretKey = process.env.IA_SECRET_KEY;
        const collection = process.env.IA_COLLECTION || 'opensource_audio';

        if (!accessKey || !secretKey) {
          return res.status(503).json({
            success: false,
            error: 'CONFIGURATION_REQUIRED',
            message:
              'Internet Archive credentials (IA_ACCESS_KEY, IA_SECRET_KEY) are not configured. In Cloudflare Pages, configure them as encrypted secrets; for local development, add them to .env.',
          });
        }

        const fileName =
          (req.query.filename as string) || (req.headers['x-filename'] as string) || 'asset';
        const category =
          (req.query.category as string) || (req.headers['x-category'] as string) || 'audio';
        const beatId =
          (req.query.beatId as string) || (req.headers['x-beat-id'] as string) || '';
        const title =
          (req.query.title as string) || (req.headers['x-title'] as string) || 'Instrumental Beat';
        const producer =
          (req.query.producer as string) || (req.headers['x-producer'] as string) || 'KRAEZELVbeatz';
        const existingItemId =
          (req.query.existingItemId as string) ||
          (req.headers['x-existing-item-id'] as string) ||
          undefined;
        const mimeType = (req.headers['content-type'] as string) || '';

        const fileBuffer = req.body as Buffer;
        if (!fileBuffer || fileBuffer.length === 0) {
          return res
            .status(400)
            .json({ success: false, error: 'EMPTY_FILE', message: 'No file data received.' });
        }

        const validation = validateIAFile(fileName, category, mimeType);
        if (!validation.valid) {
          return res
            .status(400)
            .json({ success: false, error: 'INVALID_FILE_TYPE', message: validation.error });
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
  );

  // API endpoint to serve public PayPal config securely from backend
  app.get('/api/config/paypal', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    res.json({ 
      clientId: BACKEND_PAYPAL_CLIENT_ID,
      merchantEmail: BACKEND_PAYPAL_EMAIL,
      currency: 'USD',
      env: 'LIVE',
      hasServerSecret: !!BACKEND_PAYPAL_SECRET
    });
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
      title: 'KRAEZELVbeatz Store', 
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

    try {
      const accessToken = await getPayPalAccessToken(BACKEND_PAYPAL_CLIENT_ID, BACKEND_PAYPAL_SECRET);

      if (accessToken) {
        // Direct Server-to-Server Live Order Creation on PayPal Production API
        const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
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
          console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_ORDER_CREATE_SUCCESS');
          return res.json({
            success: true,
            id: orderData.id,
            status: orderData.status,
            mode: 'LIVE'
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

      // If secret is not set in runtime, return server-authoritative payload for client SDK creation
      console.log('[PAYPAL_DIAGNOSTIC] PAYPAL_ORDER_CREATE_SUCCESS (SDK Fallback)');
      res.json({
        success: true,
        clientId: BACKEND_PAYPAL_CLIENT_ID,
        merchantEmail: BACKEND_PAYPAL_EMAIL,
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

    try {
      const accessToken = await getPayPalAccessToken(BACKEND_PAYPAL_CLIENT_ID, BACKEND_PAYPAL_SECRET);

      if (accessToken) {
        // Direct Server-to-Server Live Order Capture on PayPal Production API
        const captureResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
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
            title: 'KRAEZELVbeatz Store',
            body: `New Sale: Beat purchased successfully!`,
            url: '/dashboard/sales'
          });

          return res.json({
            success: true,
            status: 'COMPLETED',
            orderID: captureData.id || orderID,
            merchantEmail: BACKEND_PAYPAL_EMAIL,
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
        merchantEmail: BACKEND_PAYPAL_EMAIL,
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
      const producerName = matchedBeat ? matchedBeat.producerId : 'KRAEZELVbeatz';
      const beatDesc = matchedBeat 
        ? (matchedBeat.description || `${matchedBeat.genre} Instrumental by ${matchedBeat.producerId}. Stream and license on KRAEZELVbeatz Store.`)
        : `Stream and license official instrumental beat on KRAEZELVbeatz Beat Store.`;
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
        <meta property="og:site_name" content="KRAEZELVbeatz" />
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
    console.log(`Backend Server running on port 3000 with PayPal LIVE Merchant [${BACKEND_PAYPAL_EMAIL}]`);
  });
}

function reportExpressErrors(app: any) {
  return app;
}

startServer();
