const router = require('../config/db');

const db = () => router.db;

function visit() {
  const visits = db().get('visits').value() || [];
  let record = visits[0];
  if (!record) {
    record = { id: 1, count: 0, updatedAt: new Date().toISOString() };
    db().get('visits').push(record).write();
  }
  record.count = Number(record.count || 0) + 1;
  record.updatedAt = new Date().toISOString();
  db().get('visits').find({ id: record.id }).assign(record).write();
  return record.count;
}

function get() {
  const visits = db().get('visits').value() || [];
  return Number((visits[0] && visits[0].count) || 0);
}

module.exports = { visit, get };