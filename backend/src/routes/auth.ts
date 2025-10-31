import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { connectMongo } from '../db';
import { UserModel } from '../models/User';
import { WalletModel } from '../models/Wallet';

const router = express.Router();

interface SerializedUser {
  id: string;
  email?: string;
  name?: string;
}

passport.serializeUser((user: SerializedUser, done: (error: any, id?: string) => void) => {
  done(null, user.id);
});

interface DeserializedUser {
  email?: string;
  name?: string;
}

passport.deserializeUser(async (id: string, done: (error: any, user?: DeserializedUser | false) => void) => {
  try {
    await connectMongo();
    const user = await UserModel.findById(id).select('email name').lean();
    done(null, user);
  } catch (e) {
    done(e);
  }
});

if (config.googleClientId && config.googleClientSecret) {
  passport.use(new GoogleStrategy({
    clientID: config.googleClientId,
    clientSecret: config.googleClientSecret,
    callbackURL: config.googleCallbackUrl
  }, async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
    try {
      await connectMongo();
      const email = profile.emails && profile.emails[0]?.value;
      const name = profile.displayName;
      const avatar = profile.photos && profile.photos[0]?.value; 

      let user = await UserModel.findOne({ $or: [{ googleId: profile.id }, { email }] });
      if (!user) {
        user = await UserModel.create({ googleId: profile.id, email, name });
        await WalletModel.create({ userId: user._id, balanceCents: 0, holdCents: 0 });
      }
      return done(null, { id: user._id, email: user.email, name: user.name });
    } catch (e) {
      done(e);
    }
  }));
}

router.get('/google', (
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
) => {
  if (!config.googleClientId) return res.status(501).json({ error: 'Google OAuth not configured' });
  return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!config.googleClientId) return res.status(501).json({ error: 'Google OAuth not configured' });
  return passport.authenticate('google', { session: false }, async (err: Error | null, user: SerializedUser | false, info?: any) => {
    if (err || !user) return res.redirect(`${config.corsOrigin}/login?error=oauth_failed`);
    const token: string = jwt.sign({ id: user.id, email: user.email, name: user.name }, config.jwtSecret, { expiresIn: '7d' });
    const target: string = `${config.corsOrigin}/auth/callback#token=${token}`;
    return res.redirect(target);
  })(req, res, next);
});

interface DevLoginRequest {
  email: string;
  name?: string;
}

interface DevLoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  }
}

router.post('/dev-login', async (
  req: express.Request<{}, {}, DevLoginRequest>,
  res: express.Response<DevLoginResponse | { error: string }>
) => {
  const { email, name } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });
  await connectMongo();
  let user = await UserModel.findOne({ email });
  if (!user) {
    user = await UserModel.create({ email, name: name || email.split('@')[0] });
    await WalletModel.create({ userId: user._id, balanceCents: 0, holdCents: 0 });
  }
  const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, config.jwtSecret, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
});

export default router;


