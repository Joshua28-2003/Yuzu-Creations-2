const Project = require('../models/Project');

function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided (field name: image)' });
  }
  return res.status(201).json({ url: `/uploads/${req.file.filename}` });
}

function mine(req, res) {
  return res.json(Project.findByUser(req.user.id));
}

function stats(req, res) {
  const projects = Project.findByUser(req.user.id);
  return res.json({
    userId: req.user.id,
    projectCount: projects.length,
    latestProject: projects[0] || null,
  });
}

module.exports = { uploadImage, mine, stats };