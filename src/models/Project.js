const router = require('../config/db');

const db = () => router.db;

module.exports = {
  all() {
    return db().get('projects').orderBy('createdAt', 'desc').value();
  },

  findByUser(userId) {
    return db()
      .get('projects')
      .filter({ userId: Number(userId) })
      .orderBy('createdAt', 'desc')
      .value();
  },

  findById(id) {
    return db().get('projects').find({ id: Number(id) }).value();
  },

  countByUser(userId) {
    return db()
      .get('projects')
      .filter({ userId: Number(userId) })
      .value().length;
  },
};