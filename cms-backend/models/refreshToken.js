import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema({
  jti: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  revoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  ip: { type: String },
  userAgent: { type: String },
});

// TTL index to automatically remove expired refresh tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('RefreshToken', RefreshTokenSchema);
