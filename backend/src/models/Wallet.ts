import mongoose from 'mongoose';

const WalletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true },
  balanceCents: { type: Number, default: 0 },
  holdCents: { type: Number, default: 0 }
});

// export type WalletDoc = mongoose.InferSchemaType<typeof WalletSchema> & { _id: mongoose.Types.ObjectId };
export const WalletModel = mongoose.model('Wallet', WalletSchema);




