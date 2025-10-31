import mongoose from 'mongoose';
import { WalletModel } from '../models/Wallet';

export async function getBalances(userId: string | mongoose.Types.ObjectId) {
  const w = await WalletModel.findOne({ userId });
  return { balance_cents: w?.balanceCents || 0, hold_cents: w?.holdCents || 0 };
}

export async function credit(userId: string | mongoose.Types.ObjectId, amountCents: number) {
  await WalletModel.updateOne(
    { userId },
    { $inc: { balanceCents: amountCents } },
    { upsert: true }
  );
}

export async function holdAmount(userId: string | mongoose.Types.ObjectId, amountCents: number) {
  const w = await WalletModel.findOne({ userId });
  if (!w || w.balanceCents < amountCents) throw new Error('INSUFFICIENT_FUNDS');
  w.balanceCents -= amountCents;
  w.holdCents += amountCents;
  await w.save();
}

export async function release(userId: string | mongoose.Types.ObjectId, amountCents: number) {
  const w = await WalletModel.findOne({ userId });
  if (!w) return;
  w.holdCents -= amountCents;
  w.balanceCents += amountCents;
  await w.save();
}

export async function settle(fromUserId: string | mongoose.Types.ObjectId, toUserId: string | mongoose.Types.ObjectId, amountCents: number) {
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    const from = await WalletModel.findOne({ userId: fromUserId }).session(session);
    if (!from || from.holdCents < amountCents) throw new Error('INSUFFICIENT_ESCROW');
    from.holdCents -= amountCents;
    await from.save();

    await WalletModel.updateOne({ userId: toUserId }, { $inc: { balanceCents: amountCents } }, { upsert: true, session });
  });
  session.endSession();
}


