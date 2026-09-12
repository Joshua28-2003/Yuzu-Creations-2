const Link = require('../models/Link');

function platforms(req, res) {
  return res.json({ platforms: Link.PLATFORMS });
}

function streams(req, res) {
  const streams = Link.byPlatform('twitch').concat(Link.byPlatform('tiktok'));
  return res.json(streams);
}

module.exports = { platforms, streams };