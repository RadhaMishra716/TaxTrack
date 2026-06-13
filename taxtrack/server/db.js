/**
 * db.js — In-memory database for TaxTrack (no MongoDB required)
 * All data lives in memory; resets on server restart.
 */

const JWT_SECRET = 'taxtrack_local_secret_2024';
const DEFAULT_PASSWORD = '12345678';

// ── Helpers ─────────────────────────────────────────────────────────────────
let _id = 1000;
function newId() { return String(++_id); }

function generateToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let t = 'TXN-';
  for (let i = 0; i < 8; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}

// ── Collections ──────────────────────────────────────────────────────────────
const users    = [];   // { _id, name, email, password, pan, role, officialId }
const payments = [];   // { _id, taxpayerId, taxpayerName, amount, taxType, tokenCode, poolId, status, createdAt }
const pools    = [];   // { _id, name, taxCategory, description, balance, totalCollected, allocations[], createdAt }

// ── Seed data ────────────────────────────────────────────────────────────────
// Government officer
users.push({
  _id: 'gov-001',
  name: 'Finance Ministry',
  email: 'gov001@india.gov.in',
  password: DEFAULT_PASSWORD,
  role: 'government',
  officialId: 'GOV001',
});

// Default tax pools
pools.push(
  { _id: 'pool-001', name: 'Infrastructure Development Fund', taxCategory: 'Income Tax',
    description: 'Road, bridge and railway projects', balance: 0, totalCollected: 0,
    allocations: [], createdAt: new Date().toISOString() },
  { _id: 'pool-002', name: 'Healthcare & Welfare Pool', taxCategory: 'GST',
    description: 'Public health schemes and hospitals', balance: 0, totalCollected: 0,
    allocations: [], createdAt: new Date().toISOString() },
  { _id: 'pool-003', name: 'Education & Research Fund', taxCategory: 'Corporate Tax',
    description: 'Schools, colleges and R&D initiatives', balance: 0, totalCollected: 0,
    allocations: [], createdAt: new Date().toISOString() },
);

// ── Tax type → pool mapping ───────────────────────────────────────────────────
const TAX_POOL_MAP = {
  income_tax:    'pool-001',
  property_tax:  'pool-001',
  customs_duty:  'pool-001',
  gst:           'pool-002',
  corporate_tax: 'pool-003',
};

// ── DB API ────────────────────────────────────────────────────────────────────
const db = {
  DEFAULT_PASSWORD,
  JWT_SECRET,

  // Users
  findUserByEmail(email) { return users.find(u => u.email === email) || null; },
  findUserById(id)        { return users.find(u => u._id === id) || null; },
  findUserByOfficialId(id){ return users.find(u => u.officialId === id) || null; },
  findUserByEmailAndRole(email, role) {
    return users.find(u => u.email === email && u.role === role) || null;
  },
  createUser({ name, email, password, pan, role, officialId }) {
    if (users.find(u => u.email === email)) throw new Error('Email already registered');
    if (pan && users.find(u => u.pan === pan)) throw new Error('PAN already registered');
    const user = { _id: newId(), name, email, password, pan, role: role||'taxpayer', officialId, createdAt: new Date().toISOString() };
    users.push(user);
    return user;
  },
  safeUser(u) {
    if (!u) return null;
    const { password: _, ...safe } = u;
    return safe;
  },

  // Payments
  createPayment({ taxpayerId, taxpayerName, amount, taxType, description }) {
    const poolId = TAX_POOL_MAP[taxType] || 'pool-001';
    const pool = pools.find(p => p._id === poolId);
    if (!pool) throw new Error('Tax pool not found');

    // Unique token
    let tokenCode;
    do { tokenCode = generateToken(); }
    while (payments.find(p => p.tokenCode === tokenCode));

    const payment = {
      _id: newId(), taxpayerId, taxpayerName, amount, taxType,
      description: description || '', tokenCode, poolId,
      poolName: pool.name, status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    payments.push(payment);

    pool.balance += amount;
    pool.totalCollected += amount;

    return { payment, pool };
  },
  getPaymentsByUser(taxpayerId) {
    return payments.filter(p => p.taxpayerId === taxpayerId)
      .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  getAllPayments() {
    return [...payments].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  getPaymentByToken(token) {
    return payments.find(p => p.tokenCode === token) || null;
  },

  // Pools
  getAllPools() { return [...pools]; },
  getPoolById(id) { return pools.find(p => p._id === id) || null; },
  createPool({ name, taxCategory, description }) {
    const pool = { _id: newId(), name, taxCategory: taxCategory||'', description: description||'',
      balance: 0, totalCollected: 0, allocations: [], createdAt: new Date().toISOString() };
    pools.push(pool);
    return pool;
  },
  allocateFunds(poolId, { projectName, amount, department, description }) {
    const pool = pools.find(p => p._id === poolId);
    if (!pool) throw new Error('Pool not found');
    if (amount > pool.balance) throw new Error('Insufficient pool balance');
    pool.balance -= amount;
    const alloc = { _id: newId(), projectName, amount, department: department||'',
      description: description||'', allocatedAt: new Date().toISOString() };
    pool.allocations.push(alloc);
    return pool;
  },

  // Fund flow: given a payment, return pool + relevant allocations
  getFundFlow(paymentId) {
    const payment = payments.find(p => p._id === paymentId);
    if (!payment) return null;
    const pool = pools.find(p => p._id === payment.poolId);
    return { payment, pool };
  },
};

module.exports = db;
