import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import authRouter from './routes/auth';
import couponsRouter from './routes/coupons';
import walletRouter from './routes/wallet';
import tradesRouter from './routes/trades';

const app = express();
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/coupons', couponsRouter);
app.use('/wallet', walletRouter);
app.use('/trades', tradesRouter);

export default app;




