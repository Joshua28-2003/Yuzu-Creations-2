const Feedback = require('../models/Feedback');

const KINDS = ['report', 'appeal', 'feedback'];

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
}

function submit(req, res) {
  const { kind, name, email, subject, text } = req.body || {};

  if (!KINDS.includes(kind)) {
    return res.status(400).json({ error: 'Choose a type: report, appeal or feedback' });
  }
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'A valid email is required so we can reply to you' });
  }
  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const record = Feedback.create({
    kind,
    name: String(name).trim().slice(0, 60),
    email: String(email).trim().toLowerCase().slice(0, 120),
    subject: String(subject || '').trim().slice(0, 120),
    text: String(text).trim().slice(0, 1500),
    userId: req.user ? req.user.id : null,
  });

  return res.status(201).json(record);
}

function list(req, res) {
  const status = req.query.status;
  let items = Feedback.all();
  if (status) items = items.filter((f) => f.status === status);
  items = items.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json(items);
}

function resolve(req, res) {
  const item = Feedback.find(Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Not found' });
  const next = item.status === 'resolved' ? 'pending' : 'resolved';
  const updated = Feedback.updateStatus(item.id, next);
  return res.json({ feedback: updated });
}

function del(req, res) {
  const item = Feedback.find(Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Not found' });
  Feedback.remove(item.id);
  return res.json({ ok: true });
}

module.exports = { submit, list, resolve, del };