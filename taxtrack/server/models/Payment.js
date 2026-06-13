const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  taxpayer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taxpayerName: String,
  amount: { type: Number, required: true },
  taxType: {
    type: String,
    enum: ['income_tax', 'gst', 'property_tax', 'corporate_tax', 'customs_duty'],
    required: true
  },
  description: String,
  tokenCode: { type: String, unique: true, required: true },
  pool: { type: mongoose.Schema.Types.ObjectId, ref: 'TaxPool' },
  status: { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'confirmed' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
