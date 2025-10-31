import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { config } from './config';
import authRouter from './routes/auth';
import couponsRouter from './routes/coupons';
import walletRouter from './routes/wallet';
import tradesRouter from './routes/trades';

const app = express();
app.use(cors({ 
  origin: config.corsOrigin === '*' ? true : config.corsOrigin, 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/coupons', couponsRouter);
app.use('/wallet', walletRouter);
app.use('/trades', tradesRouter);

// Error handling
// app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
//   console.error('Error:', err);
//   res.status(err.status || 500).json({
//     error: err.message || 'Internal server error',
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//   });
// });

export default app;





