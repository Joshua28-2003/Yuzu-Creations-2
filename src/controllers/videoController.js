function uploadVideo(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided (field name: video)' });
  }
  return res.status(201).json({ url: `/uploads/${req.file.filename}`, type: 'video' });
}

module.exports = { uploadVideo };