import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file if available
dotenv.config();

// Hardcoded backend credentials for PayPal API
const BACKEND_PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID || 'AXgJmL0xze2IjoJUPwIV7Jsu3KeygR27EJ-P4wrACgmgRoWX2cTwPHSpH4jIXvZ9oAH1qOXusOJJT82I';
const BACKEND_PAYPAL_EMAIL = process.env.PAYPAL_MERCHANT_EMAIL || 'kraezelvbeatz@gmail.com';

async function startServer() {
  const app = reportExpressErrors(express());
  app.use(express.json());

  // API endpoint to serve PayPal config securely from backend
  app.get('/api/config/paypal', (req: Request, res: Response) => {
    res.json({ 
      clientId: BACKEND_PAYPAL_CLIENT_ID,
      merchantEmail: BACKEND_PAYPAL_EMAIL
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

  // Dynamic Open Graph & Twitter Social Metadata Middleware for ?beat=BEAT_ID crawler requests
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    const beatId = req.query.beat as string;
    if (!beatId || req.path.startsWith('/api') || req.path.includes('.')) {
      return next();
    }

    try {
      const indexPath = path.resolve(process.cwd(), 'index.html');
      if (!fs.existsSync(indexPath)) return next();

      let html = fs.readFileSync(indexPath, 'utf-8');

      // Default or dynamic fallback metadata for beat ID
      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol || 'https';
      const shareUrl = `${protocol}://${host}/?beat=${beatId}`;
      const beatTitle = `Official Beat [${beatId}]`;
      const beatDesc = `Stream and license official instrumental beat on KRAEZELVbeatz Beat Store.`;
      const artworkUrl = `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80`;

      // Replace generic title and meta tags with beat-specific OpenGraph & Twitter tags
      const metaTagsHtml = `
        <title>${beatTitle} — KRAEZELVbeatz</title>
        <meta name="description" content="${beatDesc}" />
        <meta property="og:type" content="music.song" />
        <meta property="og:title" content="${beatTitle} — KRAEZELVbeatz" />
        <meta property="og:description" content="${beatDesc}" />
        <meta property="og:image" content="${artworkUrl}" />
        <meta property="og:url" content="${shareUrl}" />
        <meta property="og:site_name" content="KRAEZELVbeatz" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${beatTitle} — KRAEZELVbeatz" />
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
