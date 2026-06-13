const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const db      = require('./db');

const app = express();
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'] }));
app.use(express.json());

const PORT = 5000;
const { JWT_SECRET } = db;

// ── Auth middleware ──────────────────────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findUserById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = db.safeUser(user);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

function govOnly(req, res, next) {
  if (req.user?.role !== 'government')
    return res.status(403).json({ message: 'Government access only' });
  next();
}

function makeJWT(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
}

// ── Auth routes ──────────────────────────────────────────────────────────────

// Taxpayer register
app.post('/api/auth/taxpayer/register', (req, res) => {
  try {
    const { name, email, password, pan } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (password !== db.DEFAULT_PASSWORD)
      return res.status(400).json({ message: `Password must be ${db.DEFAULT_PASSWORD}` });
    const user = db.createUser({ name, email, password, pan, role: 'taxpayer' });
    const token = makeJWT(user._id);
    res.json({ token, user: db.safeUser(user) });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Taxpayer login
app.post('/api/auth/taxpayer/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.findUserByEmailAndRole(email, 'taxpayer');
  if (!user || user.password !== password)
    return res.status(401).json({ message: 'Invalid email or password' });
  const token = makeJWT(user._id);
  res.json({ token, user: db.safeUser(user) });
});

// Government login
app.post('/api/auth/gov/login', (req, res) => {
  const { officialId, password } = req.body;
  const user = db.findUserByOfficialId(officialId);
  if (!user || user.role !== 'government' || user.password !== password)
    return res.status(401).json({ message: 'Invalid official ID or password' });
  const token = makeJWT(user._id);
  res.json({ token, user: db.safeUser(user) });
});

// ── Payment routes ───────────────────────────────────────────────────────────

// Pay tax
app.post('/api/payments', auth, (req, res) => {
  try {
    const { amount, taxType, description } = req.body;
    if (!amount || Number(amount) <= 0) return res.status(400).json({ message: 'Invalid amount' });
    const result = db.createPayment({
      taxpayerId: req.user._id,
      taxpayerName: req.user.name,
      amount: Number(amount),
      taxType, description
    });
    res.json(result);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// My payments
app.get('/api/payments/my', auth, (req, res) => {
  res.json(db.getPaymentsByUser(req.user._id));
});

// All payments (gov)
app.get('/api/payments/all', auth, govOnly, (req, res) => {
  res.json(db.getAllPayments());
});

// Fund flow for a single payment
app.get('/api/payments/:id/flow', auth, (req, res) => {
  const flow = db.getFundFlow(req.params.id);
  if (!flow) return res.status(404).json({ message: 'Payment not found' });
  res.json(flow);
});

// ── Pool routes ──────────────────────────────────────────────────────────────

// Get all pools
app.get('/api/pools', auth, (req, res) => {
  res.json(db.getAllPools());
});

// Create pool (gov)
app.post('/api/pools', auth, govOnly, (req, res) => {
  try {
    const { name, taxCategory, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Pool name required' });
    res.json(db.createPool({ name, taxCategory, description }));
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Allocate funds (gov)
app.post('/api/pools/:id/allocate', auth, govOnly, (req, res) => {
  try {
    const { projectName, amount, department, description } = req.body;
    if (!projectName || !amount) return res.status(400).json({ message: 'Project name and amount required' });
    const pool = db.allocateFunds(req.params.id, { projectName, amount: Number(amount), department, description });
    res.json(pool);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// ── Health ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'TaxTrack API running (local in-memory mode)' }));

app.listen(PORT, () => {
  console.log(`\n✅ TaxTrack server running on http://localhost:${PORT}`);
  console.log(`📋 Default password for all users: ${db.DEFAULT_PASSWORD}`);
  console.log(`🏛️  Government login: GOV001 / ${db.DEFAULT_PASSWORD}`);
  console.log(`👤 Taxpayer: register with any email, password = ${db.DEFAULT_PASSWORD}\n`);
});
