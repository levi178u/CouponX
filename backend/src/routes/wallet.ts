import express from 'express';
import { body } from 'express-validator';
import { connectMongo } from '../db';
import { requireAuth } from '../middleware/auth';
import { credit, getBalances } from '../services/wallet';

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  await connectMongo();
  const bal = await getBalances(req.user!.id as any);
  res.json(bal);
});

// Simulated top-up for MVP
router.post('/topup', requireAuth, [body('amount_cents').isInt({ min: 100 })], async (req, res) => {
  await connectMongo();
  await credit(req.user!.id as any, req.body.amount_cents);
  const bal = await getBalances(req.user!.id as any);
  res.json(bal);
});

export default router;


