const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  amount: { type: Number, required: true },
  department: String,
  description: String,
  allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  allocatedAt: { type: Date, default: Date.now },
});

const taxPoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  taxCategory: String,
  description: String,
  balance: { type: Number, default: 0 },
  totalCollected: { type: Number, default: 0 },
  allocations: [allocationSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('TaxPool', taxPoolSchema);
