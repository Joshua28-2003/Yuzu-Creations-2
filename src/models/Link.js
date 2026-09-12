const router = require('../config/db');

const db = () => router.db;

const PLATFORMS = [
  'facebook',
  'tiktok',
  'twitch',
  'instagram',
  'youtube',
  'github',
  'website',
];

module.exports = {
  PLATFORMS,

  all() {
    return db().get('links').value();
  },

  findById(id) {
    return db().get('links').find({ id: Number(id) }).value();
  },

  byPlatform(platform) {
    return db().get('links').filter({ platform }).value();
  },
};