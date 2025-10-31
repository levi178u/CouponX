import express from 'express';
import { body, validationResult } from 'express-validator';
import { connectMongo } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { credit, getBalances } from '../services/wallet';

const router = express.Router();

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    await connectMongo();
    const bal = await getBalances(req.user!.id as any);
    res.json(bal);
  } catch (e: any) {
    console.error('Get wallet error:', e);
    res.status(500).json({ error: 'Failed to get wallet balance' });
  }
});

router.post('/topup', requireAuth, [body('amount_cents').isInt({ min: 100 })], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    await connectMongo();
    await credit(req.user!.id as any, req.body.amount_cents);
    const bal = await getBalances(req.user!.id as any);
    res.json(bal);
  } catch (e: any) {
    console.error('Top-up error:', e);
    res.status(500).json({ error: 'Failed to top-up wallet' });
  }
});

export default router;


