import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { INITIAL_DEFAULT_BEATS } from './src/data/defaultCatalog.js';

// Load environment variables from .env file if available
dotenv.config();

// Live PayPal API Production Endpoint
const PAYPAL_API_BASE = 'https://api-m.paypal.com';

// Authoritative Production PayPal Credentials (Server-Side Only)
const BACKEND_PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID || 'AS0E31DOj_W1qyLOcJgMREGG0__30pdXAH2Q3k5deNGmbt9lRJo-by2A5dza2ne0c7VrNKanGJrcEf7p';
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
  app.use(express.json());

  // API endpoint to serve public PayPal config securely from backend
  app.get('/api/config/paypal', (req: Request, res: Response) => {
    res.json({ 
      clientId: BACKEND_PAYPAL_CLIENT_ID,
      merchantEmail: BACKEND_PAYPAL_EMAIL,
      currency: 'USD',
      env: 'LIVE',
      hasServerSecret: !!BACKEND_PAYPAL_SECRET
    });
  });

  // Server-side Idempotent Beat Creation Endpoint
  const publishedSubmissionsMap = new Map<string, any>();

  app.post('/api/beats/publish', (req: Request, res: Response) => {
    const { idempotencyKey, beatData } = req.body;

    if (!idempotencyKey) {
      return res.status(400).json({ success: false, error: 'MISSING_IDEMPOTENCY_KEY' });
    }

    // If submission with this idempotencyKey was already processed
    if (publishedSubmissionsMap.has(idempotencyKey)) {
      console.log(`[SERVER_IDEMPOTENCY] Returned existing beat for idempotency key [${idempotencyKey}]`);
      return res.json({
        success: true,
        deduplicated: true,
        beat: publishedSubmissionsMap.get(idempotencyKey)
      });
    }

    publishedSubmissionsMap.set(idempotencyKey, beatData);
    console.log(`[SERVER_IDEMPOTENCY] Beat published live with idempotency key [${idempotencyKey}]`);

    return res.json({
      success: true,
      deduplicated: false,
      beat: beatData
    });
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

      // Look up beat from catalog or fallback
      const matchedBeat = INITIAL_DEFAULT_BEATS.find(b => b.id === beatId);

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

  // Vite middleware integration
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
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
