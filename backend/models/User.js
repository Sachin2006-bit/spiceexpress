import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  phone: { type: String },
  company: { type: String },
  address: { type: String },
  avatar: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;


