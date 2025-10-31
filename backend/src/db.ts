import mongoose from 'mongoose';
import { config } from './config';

export async function connectMongo(): Promise<void> {
  const uri = config.mongodbUri;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection failed', err);
    throw err;
  }
}