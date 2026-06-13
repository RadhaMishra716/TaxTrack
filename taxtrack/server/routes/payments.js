const express = require('express');
const Payment = require('../models/Payment');
const TaxPool = require('../models/TaxPool');
const { auth, govOnly } = require('../middleware/auth');
const router = express.Router();

// Generate unique token
function generateToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = 'TXN-';
  for (let i = 0; i < 8; i++) token += chars[Math.floor(Math.random() * chars.length)];
  return token;
}

// Auto-assign pool based on tax type
async function assignPool(taxType) {
  const mapping = {
    income_tax: 'Infrastructure Development Fund',
    property_tax: 'Infrastructure Development Fund',
    gst: 'Healthcare & Welfare Pool',
    corporate_tax: 'Education & Research Fund',
    customs_duty: 'Infrastructure Development Fund',
  };
  const poolName = mapping[taxType] || 'Infrastructure Development Fund';
  let pool = await TaxPool.findOne({ name: poolName });
  if (!pool) pool = await TaxPool.findOne();
  return pool;
}

// POST /api/payments — create payment
router.post('/', auth, async (req, res) => {
  try {
    const { amount, taxType, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const pool = await assignPool(taxType);
    if (!pool) return res.status(400).json({ message: 'No tax pool available' });

    let tokenCode;
    do { tokenCode = generateToken(); } while (await Payment.findOne({ tokenCode }));

    const payment = await Payment.create({
      taxpayer: req.user._id,
      taxpayerName: req.user.name,
      amount,
      taxType,
      description,
      tokenCode,
      pool: pool._id,
      status: 'confirmed'
    });

    // Update pool
    pool.balance += amount;
    pool.totalCollected += amount;
    await pool.save();

    res.json({ payment, pool });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/payments/my — taxpayer's own payments
router.get('/my', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ taxpayer: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/payments/all — government sees all
router.get('/all', auth, govOnly, async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 }).populate('taxpayer', 'name pan');
    res.json(payments.map(p => ({
      ...p.toObject(),
      taxpayerName: p.taxpayer?.name || p.taxpayerName,
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
