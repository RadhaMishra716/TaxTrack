const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pan: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['taxpayer', 'government'], default: 'taxpayer' },
  officialId: { type: String, sparse: true },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function(pass) {
  return bcrypt.compare(pass, this.password);
};

module.exports = mongoose.model('User', userSchema);
