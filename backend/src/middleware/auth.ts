import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthRequest extends Request {
  headers: Request['headers'];
  user?: {
    id: string;
    email?: string;
    name?: string;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ message: 'No token provided' });

  if (!config.jwtSecret) {
    console.error('JWT secret is not configured');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
      const payload = decoded as { id: string; email?: string; name?: string };
      req.user = {
        id: String((payload as any).id),
        email: (payload as any).email,
        name: (payload as any).name,
      };
      return next();
    } else {
      return res.status(401).json({ message: 'Invalid token payload' });
    }
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};


