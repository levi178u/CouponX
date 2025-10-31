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

describe('Coupon flows', () => {
  beforeAll(async () => {
    await connectMongo();
  });

  it('lists coupons (empty set initially)', async () => {
    const res = await request(app).get('/coupons');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('creates coupon then fetches it', async () => {
    const user = await UserModel.create({ email: 'test1@example.com', name: 'Test1' });
    await WalletModel.create({ userId: user._id, balanceCents: 0, holdCents: 0 });
    const token = tokenFor({ id: user._id as any, email: 'test1@example.com', name: 'Test1' });

    const create = await request(app)
      .post('/coupons')
      .set('Authorization', `Bearer ${token}`)
      .send({ platform: 'Myntra', code: 'MYN10-TEST', description: '10% off', price_cents: 500 });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const fetch = await request(app).get(`/coupons/${id}`);
    expect(fetch.status).toBe(200);
    expect(fetch.body.code).toBe('MYN10-TEST');
  });
});


