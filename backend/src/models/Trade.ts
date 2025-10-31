import mongoose from 'mongoose';

const TradeSchema = new mongoose.Schema({
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', index: true },
  buyerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  sellerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'CANCELLED'], index: true },
  priceCents: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// export type TradeDoc = mongoose.InferSchemaType<typeof TradeSchema> & { _id: mongoose.Types.ObjectId };
export const TradeModel = mongoose.model('Trade', TradeSchema);




