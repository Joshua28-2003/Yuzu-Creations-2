const router = require('../config/db');

const db = () => router.db;

function create({ projectId, text, name = '' }) {
  const comments = db().get('comments');
  const all = comments.value();
  const id = all.length ? Math.max(...all.map((c) => c.id)) + 1 : 1;
  const comment = {
    id,
    projectId: Number(projectId),
    name: String(name).trim().slice(0, 60) || 'Anonymous',
    text: String(text).trim().slice(0, 500),
    createdAt: new Date().toISOString(),
  };
  comments.push(comment).write();
  return comment;
}

function all() {
  return db().get('comments').value() || [];
}

function byProject(projectId) {
  return all().filter((c) => c.projectId === Number(projectId));
}

function findById(id) {
  return db().get('comments').find({ id: Number(id) }).value();
}

function remove(id) {
  db().get('comments').remove({ id: Number(id) }).write();
  return id;
}

module.exports = { create, all, byProject, findById, remove };