const Reaction = require('../models/Reaction');

function list(req, res) {
  const projectId = req.query.projectId;
  const items = projectId ? Reaction.byProject(Number(projectId)) : Reaction.all();
  return res.json(items);
}

function toggle(req, res) {
  const { projectId, visitorKey } = req.body || {};
  if (!projectId || !visitorKey) {
    return res.status(400).json({ error: 'projectId and visitorKey are required' });
  }
  const liked = Reaction.toggle(Number(projectId), String(visitorKey));
  const count = Reaction.byProject(Number(projectId)).length;
  return res.json({ liked, count });
}

module.exports = { list, toggle };