import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { connectMongo } from '../db';
import { requireAuth } from '../middleware/auth';
import { holdAmount, release, settle } from '../services/wallet';
import { CouponModel } from '../models/Coupon';
import { TradeModel } from '../models/Trade';

const router = express.Router();

// Create a trade: place funds in escrow and mark trade as pending
router.post('/', requireAuth, [body('coupon_id').isInt()], async (req, res) => {
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
  } catch (e) {
    if ((e as any).message === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    throw e;
  }
});

// Confirm delivery: move escrow to seller, mark coupon sold
router.post('/:id/confirm', requireAuth, [param('id').isInt()], async (req, res) => {
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
  } catch (e) {
    throw e;
  }
});

// Cancel trade: release escrow back to buyer
router.post('/:id/cancel', requireAuth, [param('id').isInt()], async (req, res) => {
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
  } catch (e) {
    throw e;
  }
});

export default router;


