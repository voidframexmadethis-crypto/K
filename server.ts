import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Load environment variables from .env file if available
dotenv.config();

async function startServer() {
  const app = reportExpressErrors(express());

  // API endpoint to serve config securely
  app.get('/api/config/paypal', (req: Request, res: Response) => {
    // Robust check for various credential formats configured in AI Studio Secrets
    const clientId = process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID || null;
    res.json({ clientId });
  });

  // Vite integration
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on port 3000');
  });
}

function reportExpressErrors(app: any) {
  return app;
}

startServer();
