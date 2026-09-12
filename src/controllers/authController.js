const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mailer = require('../services/mailer');
const { JWT_SECRET } = require('../middlewares/auth');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function toPublic(user) {
  return User.serialize(user);
}

function sha(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

function genCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function codeTtlMinutes() {
  return Number(process.env.CODE_TTL_MINUTES) || 10;
}

async function dispatchVerificationCode(user) {
  const code = genCode();
  const minutes = codeTtlMinutes();
  const now = new Date();
  const expires = new Date(now.getTime() + minutes * 60 * 1000);

  User.updateById(user.id, {
    verifyCode: sha(code),
    verifyCodeExpires: expires.toISOString(),
    verifyCodeSentAt: now.toISOString(),
    verifyAttempts: 0,
  });

  await mailer.sendMail({
    to: user.email,
    subject: 'Your Yuzu Creation verification code',
    html: mailer.verificationHtml(code, minutes),
  });
}

async function register(req, res) {
  const { name, email, password } = req.body || {};
  const errors = [];

  if (!name || !String(name).trim()) errors.push('Name is required');
  if (!email || !EMAIL_RE.test(String(email))) errors.push('A valid email is required');
  if (!password || String(password).length < 6) errors.push('Password must be at least 6 characters');

  if (errors.length) return res.status(400).json({ errors });

  const normalizedEmail = String(email).toLowerCase();
  if (User.findByEmail(normalizedEmail)) {
    return res.status(409).json({ error: 'This email is already registered' });
  }

  if (!mailer.configured()) {
    return res.status(500).json({ error: 'Server email service is not configured yet. Set MAIL_USER and MAIL_PASS in .env' });
  }

  const user = User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: bcrypt.hashSync(String(password), 10),
    verified: false,
  });

  try {
    await dispatchVerificationCode(user);
  } catch (err) {
    User.removeByEmail(normalizedEmail);
    return res.status(500).json({ error: 'Could not send the verification email. Please check MAIL_USER/MAIL_PASS in .env and try again.' });
  }

  return res.status(201).json({
    pendingVerify: true,
    email: normalizedEmail,
    message: 'Account created. A 6-digit verification code was sent to your email.',
  });
}

async function verify(req, res) {
  const { email, code } = req.body || {};
  if (!email || !/^\d{6}$/.test(String(code))) {
    return res.status(400).json({ error: 'Enter the 6-digit code sent to your email' });
  }

  const user = User.findByEmail(String(email).toLowerCase());
  if (!user) return res.status(404).json({ error: 'Account not found' });

  if (user.verified) return res.json({ verified: true, message: 'Account is already verified' });

  const expired = !user.verifyCodeExpires || new Date(user.verifyCodeExpires).getTime() < Date.now();

  const attempts = Number(user.verifyAttempts || 0) + 1;

  if (expired) {
    User.updateById(user.id, { verifyAttempts: attempts });
    return res.status(400).json({ error: 'This code has expired. Click "Resend code" to get a new one.' });
  }

  if (sha(String(code).trim()) !== user.verifyCode) {
    User.updateById(user.id, { verifyAttempts: attempts });
    if (attempts >= 10) {
      return res.status(429).json({ error: 'Too many wrong attempts. Click "Resend code" to try again.' });
    }
    return res.status(400).json({ error: 'That code is not correct. Please check your email.' });
  }

  User.updateById(user.id, {
    verified: true,
    verifyCode: null,
    verifyCodeExpires: null,
    verifyCodeSentAt: null,
    verifyAttempts: 0,
  });

  return res.json({ verified: true, message: 'Email verified. You can now log in.' });
}

async function resendCode(req, res) {
  const { email } = req.body || {};
  if (!email || !EMAIL_RE.test(String(email))) {
    return res.status(400).json({ error: 'A valid email is required' });
  }

  const user = User.findByEmail(String(email).toLowerCase());
  if (!user) return res.status(404).json({ error: 'No account found with that email' });
  if (user.verified) return res.json({ message: 'This account is already verified.' });

  if (!mailer.configured()) {
    return res.status(500).json({ error: 'Server email service is not configured yet.' });
  }

  const lastSent = new Date(user.verifyCodeSentAt || 0).getTime();
  if (Date.now() - lastSent < 60 * 1000) {
    return res.status(429).json({ error: 'A code was just sent. Wait about a minute before resending.' });
  }

  await dispatchVerificationCode(user);
  return res.json({ message: 'A new 6-digit code has been sent to your email.' });
}

function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  let user = User.findByEmail(String(email).toLowerCase());
  if (!user || !bcrypt.compareSync(String(password), user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.banned) {
    const ban = User.banState(user);
    if (ban.active) {
      const msg = ban.permanent
        ? 'This account has been permanently banned.'
        : `This account is banned until ${new Date(ban.until).toLocaleString()}.`;
      return res.status(403).json({
        error: 'ACCOUNT_BANNED',
        message: msg,
        email: user.email,
        banUntil: ban.until,
        permanent: ban.permanent,
        banReason: ban.reason,
      });
    }
    user = User.unban(user.id);
  }

  if (user.verified === false) {
    return res.status(403).json({
      error: 'ACCOUNT_NOT_VERIFIED',
      message: 'Please verify your email using the code we sent you.',
      email: user.email,
    });
  }

  return res.json({ token: signToken(user), user: toPublic(user) });
}

function me(req, res) {
  const user = User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.verified === false) {
    return res.status(403).json({ error: 'ACCOUNT_NOT_VERIFIED', email: user.email });
  }
  return res.json({ user: toPublic(user) });
}

module.exports = { register, verify, resendCode, login, me };