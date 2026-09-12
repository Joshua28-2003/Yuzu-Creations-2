const User = require('../models/User');

const DAY_MS = 24 * 60 * 60 * 1000;

const PERIODS = {
  days: { label: 'days', ms: DAY_MS, min: 1, max: 30 },
  months: { label: 'months', ms: 30 * DAY_MS, min: 1, max: 12 },
  years: { label: 'years', ms: 365 * DAY_MS, min: 1, max: 10 },
};

function ban(req, res) {
  const id = Number(req.params.id);
  const target = User.findById(id);
  if (!target) return res.status(404).json({ error: 'Account not found' });
  if (target.role === 'admin') {
    return res.status(403).json({ error: 'Admin accounts cannot be banned.' });
  }
  if (target.id === req.user.id) {
    return res.status(403).json({ error: 'You cannot ban your own account.' });
  }

  const { period, amount, reason } = req.body || {};
  let until = null;

  if (period === 'forever') {
    until = null;
  } else if (PERIODS[period]) {
    const p = PERIODS[period];
    const n = Number(amount);
    if (!Number.isInteger(n) || n < p.min || n > p.max) {
      return res.status(400).json({ error: `Amount must be a number between ${p.min} and ${p.max} ${p.label}.` });
    }
    until = new Date(Date.now() + n * p.ms).toISOString();
  } else {
    return res.status(400).json({ error: 'Choose a duration: days (1-30), months (1-12), years (1-10) or forever.' });
  }

  const updated = User.setBan(id, { until, reason });
  return res.json({ user: User.serialize(updated) });
}

function unban(req, res) {
  const id = Number(req.params.id);
  const target = User.findById(id);
  if (!target) return res.status(404).json({ error: 'Account not found' });
  const updated = User.unban(id);
  return res.json({ user: User.serialize(updated) });
}

module.exports = { ban, unban };