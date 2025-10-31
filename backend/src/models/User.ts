import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  googleId: { type: String, index: true },
  email: { type: String, unique: true, sparse: true },
  name: String,
  createdAt: { type: Date, default: Date.now }
});

export type UserDoc = mongoose.InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };
export const UserModel = mongoose.model('User', UserSchema);





