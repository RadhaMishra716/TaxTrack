const express = require('express');
const TaxPool = require('../models/TaxPool');
const { auth, govOnly } = require('../middleware/auth');
const router = express.Router();

// GET all pools (public for taxpayers to see)
router.get('/', auth, async (req, res) => {
  try {
    const pools = await TaxPool.find().sort({ createdAt: -1 });
    res.json(pools);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST create pool (gov only)
router.post('/', auth, govOnly, async (req, res) => {
  try {
    const { name, taxCategory, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Pool name required' });
    const pool = await TaxPool.create({ name, taxCategory, description, createdBy: req.user._id });
    res.json(pool);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST allocate funds to project
router.post('/:id/allocate', auth, govOnly, async (req, res) => {
  try {
    const { projectName, amount, department, description } = req.body;
    const pool = await TaxPool.findById(req.params.id);
    if (!pool) return res.status(404).json({ message: 'Pool not found' });
    if (amount > pool.balance) return res.status(400).json({ message: 'Insufficient pool balance' });

    pool.balance -= amount;
    pool.allocations.push({ projectName, amount, department, description, allocatedBy: req.user._id });
    await pool.save();

    res.json(pool);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
