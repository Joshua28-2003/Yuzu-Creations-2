const Project = require('../models/Project');

const MUTATIONS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function isMutation(req) {
  return MUTATIONS.includes(req.method);
}

function enforceOwnership(req, res, next) {
  if (!isMutation(req)) return next();

  const match = String(req.path).match(/^\/(projects|links|songs|videos|comments|reactions)(?:\/([^/]+))?$/);
  if (!match) return next();

  const resource = match[1];
  const id = match[2];

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only the site admin can edit content' });
  }

  if ((resource === 'projects' || resource === 'videos') && id) {
    const Model = resource === 'projects' ? Project : require('../models/Video');
    const item = Model.findById(Number(id));
    if (!item) return res.status(404).json({ error: `${resource.slice(0, -1)} not found` });
    if (item.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own content' });
    }
  }

  return next();
}

module.exports = enforceOwnership;