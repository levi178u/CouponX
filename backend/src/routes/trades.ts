import express from 'express';
import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { connectMongo } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { holdAmount, release, settle } from '../services/wallet';
import { CouponModel } from '../models/Coupon';
import { TradeModel } from '../models/Trade';

const router = express.Router();

const isMongoId = (value: string) => mongoose.Types.ObjectId.isValid(value);

// Create a trade: place funds in escrow and mark trade as pending
router.post('/', requireAuth, [body('coupon_id').custom(isMongoId).withMessage('Invalid coupon ID format')], async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  await connectMongo();
  const coupon = await CouponModel.findById(req.body.coupon_id);
  if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
  if (coupon.isSold) return res.status(400).json({ error: 'Coupon already sold' });
  if (String(coupon.ownerUserId) === String(req.user!.id)) return res.status(400).json({ error: 'Cannot buy your own coupon' });

  try {
    await holdAmount(req.user!.id as any, coupon.priceCents);
    const trade = await TradeModel.create({
      couponId: coupon._id,
      buyerUserId: req.user!.id,
      sellerUserId: coupon.ownerUserId,
      status: 'PENDING',
      priceCents: coupon.priceCents
    });
    res.status(201).json({ id: trade._id, ...trade.toObject() });
  } catch (e: any) {
    if (e.message === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    console.error('Trade creation error:', e);
    res.status(500).json({ error: 'Failed to create trade' });
  }
});

// Confirm delivery: move escrow to seller, mark coupon sold
router.post('/:id/confirm', requireAuth, [param('id').custom(isMongoId).withMessage('Invalid ID format')], async (req: AuthRequest, res) => {
  await connectMongo();
  const trade = await TradeModel.findById(req.params.id);
  if (!trade) return res.status(404).json({ error: 'Trade not found' });
  if (String(trade.buyerUserId) !== String(req.user!.id)) return res.status(403).json({ error: 'Forbidden' });
  if (trade.status !== 'PENDING') return res.status(400).json({ error: 'Invalid state' });

  try {
    await settle(trade.buyerUserId as any, trade.sellerUserId as any, trade.priceCents);
    trade.status = 'COMPLETED';
    trade.updatedAt = new Date();
    await trade.save();
    await CouponModel.updateOne({ _id: trade.couponId }, { $set: { isSold: true } });
    res.json({ id: trade._id, ...trade.toObject() });
  } catch (e: any) {
    console.error('Trade confirmation error:', e);
    res.status(500).json({ error: 'Failed to confirm trade' });
  }
});

// Cancel trade: release escrow back to buyer
router.post('/:id/cancel', requireAuth, [param('id').custom(isMongoId).withMessage('Invalid ID format')], async (req: AuthRequest, res) => {
  await connectMongo();
  const trade = await TradeModel.findById(req.params.id);
  if (!trade) return res.status(404).json({ error: 'Trade not found' });
  if (String(trade.buyerUserId) !== String(req.user!.id) && String(trade.sellerUserId) !== String(req.user!.id)) return res.status(403).json({ error: 'Forbidden' });
  if (trade.status !== 'PENDING') return res.status(400).json({ error: 'Invalid state' });

  try {
    await release(trade.buyerUserId as any, trade.priceCents);
    trade.status = 'CANCELLED';
    trade.updatedAt = new Date();
    await trade.save();
    res.json({ id: trade._id, ...trade.toObject() });
  } catch (e: any) {
    console.error('Trade cancellation error:', e);
    res.status(500).json({ error: 'Failed to cancel trade' });
  }
});

export default router;


