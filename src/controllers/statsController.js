const router = require('../config/db');
const Stats = require('../models/Stats');
const User = require('../models/User');

function totals(req, res) {
  const db = router.db;
  return res.json({
    users: (db.get('users').value() || []).length,
    projects: (db.get('projects').value() || []).length,
    links: (db.get('links').value() || []).length,
    songs: (db.get('songs').value() || []).length,
    videos: (db.get('videos').value() || []).length,
    comments: (db.get('comments').value() || []).length,
    reactions: (db.get('reactions').value() || []).length,
    visits: Stats.get(),
  });
}

function visit(req, res) {
  return res.json({ count: Stats.visit() });
}

function usersList(req, res) {
  const users = (router.db.get('users').value() || []).map((u) => User.serialize(u));
  return res.json(users);
}

module.exports = { totals, visit, usersList };