const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'yuzu-super-secret-change-me-in-production';

function getToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  if (req.headers['x-access-token']) return req.headers['x-access-token'];
  return null;
}

function verifyToken(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Not authorized, token missing' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const fresh = User.findById(payload.id);
    if (!fresh) {
      return res.status(401).json({ error: 'Not authorized, account no longer exists' });
    }
    if (User.banState(fresh).active) {
      return res.status(403).json({
        error: 'ACCOUNT_BANNED',
        message: 'Your account has been suspended. See the email on file for details or send an appeal.',
        email: fresh.email,
        banUntil: fresh.banUntil || null,
        banReason: fresh.banReason || '',
      });
    }
    const { passwordHash, ...safe } = fresh;
    req.user = safe;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Not authorized, token invalid or expired' });
  }
}

function protect(req, res, next) {
  return verifyToken(req, res, next);
}

function requireAdmin(req, res, next) {
  return verifyToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access only' });
    }
    return next();
  });
}

function protectApi(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  return verifyToken(req, res, next);
}

module.exports = { protect, requireAdmin, protectApi, getToken, JWT_SECRET };