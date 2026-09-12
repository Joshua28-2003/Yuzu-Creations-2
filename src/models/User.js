const router = require('../config/db');

const db = () => router.db;

function banState(user) {
  if (!user || !user.banned) return { active: false, permanent: false, until: null, reason: '' };
  if (!user.banUntil) return { active: true, permanent: true, until: null, reason: user.banReason || '' };
  if (new Date(user.banUntil).getTime() <= Date.now()) {
    return { active: false, permanent: false, until: null, reason: '' };
  }
  return { active: true, permanent: false, until: user.banUntil, reason: user.banReason || '' };
}

function serialize(user) {
  if (!user) return null;
  const ban = banState(user);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio || '',
    avatarUrl: user.avatarUrl || '',
    createdAt: user.createdAt,
    banned: ban.active,
    banUntil: ban.until,
    permanentBan: ban.permanent,
    banReason: ban.reason,
  };
}

module.exports = {
  serialize,
  banState,

  create({ name, email, passwordHash, role = 'user', bio = '', avatarUrl = '', verified = true }) {
    const users = db().get('users');
    const all = users.value();
    const id = all.length ? Math.max(...all.map((u) => u.id)) + 1 : 1;
    const user = {
      id,
      name,
      email,
      passwordHash,
      role,
      bio,
      avatarUrl,
      verified,
      createdAt: new Date().toISOString(),
    };
    users.push(user).write();
    return user;
  },

  findByEmail(email) {
    return db().get('users').find({ email }).value();
  },

  findById(id) {
    return db().get('users').find({ id: Number(id) }).value();
  },

  removeByEmail(email) {
    db().get('users').remove({ email }).write();
  },

  getAdmin() {
    return db().get('users').find({ role: 'admin' }).value();
  },

  updateById(id, patch) {
    db().get('users').find({ id: Number(id) }).assign(patch).write();
    return this.findById(id);
  },

  setBan(id, { until, reason }) {
    return this.updateById(id, {
      banned: true,
      banUntil: until,
      banReason: reason || '',
      bannedAt: new Date().toISOString(),
    });
  },

  unban(id) {
    return this.updateById(id, {
      banned: false,
      banUntil: null,
      banReason: null,
      bannedAt: null,
    });
  },
};