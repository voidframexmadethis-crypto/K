import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

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

  // Server-side proxy route for creating PayPal Order with payee email kraezelvbeatz@gmail.com
  app.post('/api/paypal/create-order', (req: Request, res: Response) => {
    const { amount, currency, description } = req.body;
    
    // Construct order payload with explicit payee email
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
