const router = require('../config/db');

const db = () => router.db;

function all() {
  return db().get('reactions').value() || [];
}

function byProject(projectId) {
  return all().filter((r) => r.projectId === Number(projectId));
}

function visitorHasLiked(projectId, visitorKey) {
  return !!db().get('reactions').find({
    projectId: Number(projectId),
    visitorKey: String(visitorKey),
  }).value();
}

function addLike(projectId, visitorKey) {
  const reactions = db().get('reactions');
  const allReactions = reactions.value();
  const id = allReactions.length ? Math.max(...allReactions.map((r) => r.id)) + 1 : 1;
  const reaction = {
    id,
    projectId: Number(projectId),
    type: 'like',
    visitorKey: String(visitorKey),
    createdAt: new Date().toISOString(),
  };
  reactions.push(reaction).write();
  return reaction;
}

function removeLike(projectId, visitorKey) {
  db().get('reactions').remove({
    projectId: Number(projectId),
    visitorKey: String(visitorKey),
  }).write();
}

function toggle(projectId, visitorKey) {
  if (visitorHasLiked(projectId, visitorKey)) {
    removeLike(projectId, visitorKey);
    return false;
  }
  addLike(projectId, visitorKey);
  return true;
}

module.exports = { all, byProject, toggle, visitorHasLiked };