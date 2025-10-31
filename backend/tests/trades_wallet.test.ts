import request from 'supertest';
import app from '../src/app';
import { connectMongo } from '../src/db';
import { UserModel } from '../src/models/User';
import { WalletModel } from '../src/models/Wallet';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

function tokenFor(user: { id: number; email?: string; name?: string }) {
  return jwt.sign(user, config.jwtSecret);
}

describe('Wallet and trade flow', () => {
  beforeAll(async () => {
    await connectMongo();
  });

  it('tops up buyer, creates a trade, confirms it', async () => {
    const seller = await UserModel.create({ email: 'seller@example.com', name: 'Seller' });
    const buyer = await UserModel.create({ email: 'buyer@example.com', name: 'Buyer' });
    await WalletModel.create({ userId: seller._id, balanceCents: 0, holdCents: 0 });
    await WalletModel.create({ userId: buyer._id, balanceCents: 0, holdCents: 0 });
    const sellerToken = tokenFor({ id: seller._id as any, email: 'seller@example.com', name: 'Seller' });
    const buyerToken = tokenFor({ id: buyer._id as any, email: 'buyer@example.com', name: 'Buyer' });

    // Seller lists coupon
    const created = await request(app)
      .post('/coupons')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ platform: 'Amazon', code: 'AMZ-20OFF-TEST', description: '20 off', price_cents: 1200 });
    expect(created.status).toBe(201);
    const couponId = created.body.id;

    // Buyer tops up
    const top = await request(app)
      .post('/wallet/topup')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount_cents: 2000 });
    expect(top.status).toBe(200);
    expect(top.body.balance_cents).toBeGreaterThanOrEqual(2000);

    // Buyer creates trade (escrow)
    const trade = await request(app)
      .post('/trades')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ coupon_id: couponId });
    expect(trade.status).toBe(201);
    const tradeId = trade.body.id;

    // Buyer confirms (settle)
    const confirm = await request(app)
      .post(`/trades/${tradeId}/confirm`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send();
    expect(confirm.status).toBe(200);
    expect(confirm.body.status).toBe('COMPLETED');
  });
});


