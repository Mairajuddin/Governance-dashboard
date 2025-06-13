import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  otp_code: { type: String, default: null },
  role: { type: String, enum: ['admin', 'governance','project-manager','finance-manager'], default: 'governance' }, 
  updated_at: { type: Date, default: Date.now },
});

const USER = model('user', userSchema);

export default USER;
