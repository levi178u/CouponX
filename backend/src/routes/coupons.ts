import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { connectMongo } from '../db';
import { CouponModel } from '../models/Coupon';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

const isMongoId = (value: string) => mongoose.Types.ObjectId.isValid(value);

router.get('/',
  [
    query('platform').optional().isString(),
    query('q').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      await connectMongo();
      const { platform, q } = req.query as any;
      const filter: any = { isSold: false };
      if (platform) filter.platform = platform;
      if (q) filter.$or = [{ description: { $regex: q, $options: 'i' } }, { code: { $regex: q, $options: 'i' } }];
      const items = await CouponModel.find(filter).sort({ createdAt: -1 }).limit(100).lean();
      res.json({ items: items.map(mapCoupon) });
    } catch (e: any) {
      console.error('List coupons error:', e);
      res.status(500).json({ error: 'Failed to list coupons' });
    }
  }
);

router.get('/:id', [param('id').custom(isMongoId).withMessage('Invalid ID format')], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    await connectMongo();
    const coupon = await CouponModel.findById(req.params.id).lean();
    if (!coupon) return res.status(404).json({ error: 'Not found' });
    res.json(mapCoupon(coupon));
  } catch (e: any) {
    console.error('Get coupon error:', e);
    res.status(500).json({ error: 'Failed to get coupon' });
  }
});

router.post('/', requireAuth, [
  body('platform').isString().trim().notEmpty(),
  body('code').isString().trim().notEmpty(),
  body('description').optional().isString(),
  body('expires_at').optional().isISO8601(),
  body('face_value_cents').optional().isInt({ min: 0 }),
  body('price_cents').isInt({ min: 0 })
], async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  await connectMongo();
  try {
    const doc = await CouponModel.create({
      ownerUserId: req.user!.id,
      platform: req.body.platform,
      code: req.body.code,
      description: req.body.description || undefined,
      expiresAt: req.body.expires_at || undefined,
      faceValueCents: req.body.face_value_cents || 0,
      priceCents: req.body.price_cents
    });
    res.status(201).json(mapCoupon(doc.toObject()));
  } catch (e: any) {
    if (String(e?.message || '').includes('duplicate key') && String(e?.message || '').includes('code')) {
      return res.status(409).json({ error: 'Coupon code already listed' });
    }
    console.error('Coupon creation error:', e);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

router.delete('/:id', requireAuth, [param('id').custom(isMongoId).withMessage('Invalid ID format')], async (req: AuthRequest, res) => {
  try {
    await connectMongo();
    const coupon = await CouponModel.findById(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Not found' });
    if (String(coupon.ownerUserId) !== String(req.user!.id)) return res.status(403).json({ error: 'Forbidden' });
    if (coupon.isSold) return res.status(400).json({ error: 'Already sold' });
    await CouponModel.deleteOne({ _id: coupon._id });
    res.json({ ok: true });
  } catch (e: any) {
    console.error('Delete coupon error:', e);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

function mapCoupon(c: any) {
  return {
    id: c._id,
    owner_user_id: c.ownerUserId,
    platform: c.platform,
    code: c.code,
    description: c.description,
    expires_at: c.expiresAt,
    face_value_cents: c.faceValueCents,
    price_cents: c.priceCents,
    is_sold: c.isSold,
    created_at: c.createdAt
  };
}

export default router;


