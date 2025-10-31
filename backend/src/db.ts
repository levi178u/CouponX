import mongoose from 'mongoose';
import { config } from './config';

let isConnected = false;

export async function connectMongo(): Promise<typeof mongoose> {
  if (isConnected) return mongoose;
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri, { dbName: uri.split('/').pop() });
  isConnected = true;
  return mongoose;
}



