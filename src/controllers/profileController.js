const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');

function publicProfile(req, res) {
  const admin = User.getAdmin();
  if (!admin) return res.status(404).json({ error: 'Profile not found' });

  const { passwordHash, ...safe } = admin;
  res.json({
    profile: {
      ...safe,
      bio: admin.bio || '',
      avatarUrl: admin.avatarUrl || '',
      projectCount: Project.countByUser(admin.id),
    },
  });
}

function me(req, res) {
  const user = User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: User.serialize(user) });
}

function updateMe(req, res) {
  const user = User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, bio, avatarUrl, currentPassword, newPassword } = req.body || {};
  const patch = {};

  if (typeof name === 'string' && name.trim()) patch.name = name.trim();
  if (typeof bio === 'string') patch.bio = bio.trim();
  if (typeof avatarUrl === 'string' && avatarUrl.trim()) patch.avatarUrl = avatarUrl.trim();

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required to change the password' });
    }
    if (!bcrypt.compareSync(String(currentPassword), user.passwordHash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    patch.passwordHash = bcrypt.hashSync(String(newPassword), 10);
  }

  if (!Object.keys(patch).length) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  const updated = User.updateById(user.id, patch);
  return res.json({ user: User.serialize(updated) });
}

module.exports = { publicProfile, me, updateMe };