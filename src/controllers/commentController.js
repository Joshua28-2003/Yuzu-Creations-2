const Comment = require('../models/Comment');

function list(req, res) {
  const projectId = req.query.projectId;
  const items = projectId ? Comment.byProject(Number(projectId)) : Comment.all();
  return res.json(items);
}

function create(req, res) {
  const { projectId, text, name } = req.body || {};
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });
  if (!text || !String(text).trim()) return res.status(400).json({ error: 'Comment text is required' });
  const comment = Comment.create({ projectId, text, name });
  return res.status(201).json(comment);
}

function remove(req, res) {
  const id = Number(req.params.id);
  if (!Comment.findById(id)) return res.status(404).json({ error: 'Comment not found' });
  Comment.remove(id);
  return res.status(204).end();
}

module.exports = { list, create, remove };