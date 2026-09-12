const router = require('../config/db');

const db = () => router.db;

function all() {
  return db().get('feedback').value() || [];
}

function find(id) {
  return db().get('feedback').find({ id: Number(id) }).value();
}

function create({ kind, name, email, subject, text, userId }) {
  const items = all();
  const id = items.length ? Math.max(...items.map((x) => x.id)) + 1 : 1;
  const record = {
    id,
    kind,
    name,
    email,
    subject: subject || '',
    text,
    userId: userId || null,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  db().get('feedback').push(record).write();
  return record;
}

function updateStatus(id, status) {
  db().get('feedback').find({ id: Number(id) }).assign({ status, updatedAt: new Date().toISOString() }).write();
  return find(id);
}

function remove(id) {
  db().get('feedback').remove({ id: Number(id) }).write();
}

module.exports = { all, find, create, updateStatus, remove };