const bcrypt = require('bcryptjs');
const User = require('../models/User');

function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@yuzu.local').toLowerCase();
  const name = process.env.ADMIN_NAME || 'Yuzu Studio';
  const password = process.env.ADMIN_PASSWORD || 'yuzu123456';
  const bio = process.env.ADMIN_BIO || 'Artist and streamer behind Yuzu Creation.';

  let admin = User.findByEmail(email);

  if (!admin) {
    admin = User.create({
      name,
      email,
      bio,
      role: 'admin',
      verified: true,
      passwordHash: bcrypt.hashSync(String(password), 10),
    });
    console.log(`[seed] Admin account created: ${email} role=admin`);
    if (!process.env.ADMIN_PASSWORD) {
      console.log('[seed] Using default admin password: yuzu123456 (set ADMIN_PASSWORD in .env)');
    }
    return;
  }

  if (admin.role !== 'admin' || admin.verified !== true) {
    const patch = {};
    if (admin.role !== 'admin') patch.role = 'admin';
    if (admin.verified !== true) patch.verified = true;
    User.updateById(admin.id, patch);
    console.log(`[seed] Ensured ${email} is admin & verified.`);
  }
}

module.exports = seedAdmin;