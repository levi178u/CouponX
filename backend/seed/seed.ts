import { connectMongo } from '../src/db';
import { UserModel } from '../src/models/User';
import { WalletModel } from '../src/models/Wallet';
import { CouponModel } from '../src/models/Coupon';

async function run() {
  await connectMongo();
  const priya = await UserModel.create({ email: 'priya@example.com', name: 'Priya' });
  const anshuman = await UserModel.create({ email: 'anshuman@example.com', name: 'Anshuman' });
  await WalletModel.create({ userId: priya._id, balanceCents: 10000, holdCents: 0 });
  await WalletModel.create({ userId: anshuman._id, balanceCents: 5000, holdCents: 0 });

  await CouponModel.create({ ownerUserId: priya._id, platform: 'Swiggy', code: 'SWIG50OFF-Priya', description: '50% off Swiggy - max 200', faceValueCents: 20000, priceCents: 1000 });
  await CouponModel.create({ ownerUserId: anshuman._id, platform: 'Zomato', code: 'ZOMA30-Anshuman', description: '30% off Zomato - max 150', faceValueCents: 15000, priceCents: 800 });

  console.log('Seed complete');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


