const router = require('../config/db');

const db = () => router.db;

module.exports = {
  all() {
    return db().get('videos').orderBy('createdAt', 'desc').value();
  },

  findByUser(userId) {
    return db()
      .get('videos')
      .filter({ userId: Number(userId) })
      .orderBy('createdAt', 'desc')
      .value();
  },

  findById(id) {
    return db().get('videos').find({ id: Number(id) }).value();
  },
};