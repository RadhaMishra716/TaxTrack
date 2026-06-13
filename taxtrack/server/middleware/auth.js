const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const govOnly = (req, res, next) => {
  if (req.user?.role !== 'government') return res.status(403).json({ message: 'Government access only' });
  next();
};

module.exports = { auth, govOnly };
