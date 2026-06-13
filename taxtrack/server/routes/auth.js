const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TaxPool = require('../models/TaxPool');
const router = express.Router();

const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Taxpayer register
router.post('/taxpayer/register', async (req, res) => {
  try {
    const { name, email, password, pan } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, pan, role: 'taxpayer' });
    const token = makeToken(user._id);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, pan: user.pan, role: user.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Taxpayer login
router.post('/taxpayer/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'taxpayer' });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = makeToken(user._id);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, pan: user.pan, role: user.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Government login
router.post('/gov/login', async (req, res) => {
  try {
    const { officialId, password } = req.body;
    // Demo gov user
    if (officialId === 'GOV001' && password === 'gov123') {
      let govUser = await User.findOne({ officialId: 'GOV001' });
      if (!govUser) {
        govUser = await User.create({
          name: 'Finance Ministry', email: 'gov001@india.gov.in',
          password: 'gov123', role: 'government', officialId: 'GOV001'
        });
        // Seed default pools
        await TaxPool.create([
          { name: 'Infrastructure Development Fund', taxCategory: 'Income Tax', description: 'Road, bridge and railway projects', balance: 0, totalCollected: 0, createdBy: govUser._id },
          { name: 'Healthcare & Welfare Pool', taxCategory: 'GST', description: 'Public health schemes and hospitals', balance: 0, totalCollected: 0, createdBy: govUser._id },
          { name: 'Education & Research Fund', taxCategory: 'Corporate Tax', description: 'Schools, colleges and R&D', balance: 0, totalCollected: 0, createdBy: govUser._id },
        ]);
      }
      const token = makeToken(govUser._id);
      return res.json({ token, user: { _id: govUser._id, name: govUser.name, role: govUser.role, officialId: govUser.officialId } });
    }
    const user = await User.findOne({ officialId, role: 'government' });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid official credentials' });
    const token = makeToken(user._id);
    res.json({ token, user: { _id: user._id, name: user.name, role: user.role, officialId: user.officialId } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
