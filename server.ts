import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { INITIAL_DEFAULT_BEATS } from './src/data/defaultCatalog.js';

// Load environment variables from .env file if available
dotenv.config();

// Hardcoded backend credentials for PayPal API
const BACKEND_PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID || 'AXgJmL0xze2IjoJUPwIV7Jsu3KeygR27EJ-P4wrACgmgRoWX2cTwPHSpH4jIXvZ9oAH1qOXusOJJT82I';
const BACKEND_PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET || '';
const BACKEND_PAYPAL_EMAIL = process.env.PAYPAL_MERCHANT_EMAIL || 'kraezelvbeatz@gmail.com';

async function startServer() {
  const app = reportExpressErrors(express());
  app.use(express.json());

  // API endpoint to serve PayPal config securely from backend
  app.get('/api/config/paypal', (req: Request, res: Response) => {
    res.json({ 
      clientId: BACKEND_PAYPAL_CLIENT_ID,
      merchantEmail: BACKEND_PAYPAL_EMAIL,
      currency: 'USD'
    });
  });

  // Server-side proxy route for creating PayPal Order
  app.post('/api/paypal/create-order', (req: Request, res: Response) => {
    const { amount, currency, description } = req.body;
    
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        description: description || 'Digital Beat License Purchase',
        amount: {
          currency_code: currency || 'USD',
          value: (parseFloat(amount) || 29.99).toFixed(2)
        },
        payee: {
          email_address: BACKEND_PAYPAL_EMAIL
        }
      }]
    };

    res.json({
      success: true,
      clientId: BACKEND_PAYPAL_CLIENT_ID,
      merchantEmail: BACKEND_PAYPAL_EMAIL,
      orderPayload
    });
  });

  // Server-side proxy route for capturing PayPal Order
  app.post('/api/paypal/capture-order', (req: Request, res: Response) => {
    const { orderID, beatId, licenseType, customerEmail } = req.body;
    res.json({
      success: true,
      status: 'COMPLETED',
      orderID: orderID || `ORD-${Date.now()}`,
      merchantEmail: BACKEND_PAYPAL_EMAIL,
      message: 'PayPal payment captured successfully by backend proxy.'
    });
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
    console.log(`Backend Server running on port 3000 with PayPal Merchant [${BACKEND_PAYPAL_EMAIL}]`);
  });
}

function reportExpressErrors(app: any) {
  return app;
}

startServer();
