import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  platform: { type: String, index: true },
  code: { type: String, unique: true },
  description: String,
  expiresAt: Date,
  faceValueCents: { type: Number, default: 0 },
  priceCents: { type: Number, required: true },
  isSold: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// export type CouponDoc = mongoose.InferSchemaType<typeof CouponSchema> & { _id: mongoose.Types.ObjectId };
export const CouponModel = mongoose.model('Coupon', CouponSchema);




