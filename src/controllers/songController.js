function uploadAudio(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file provided (field name: audio)' });
  }
  return res.status(201).json({ url: `/uploads/${req.file.filename}`, type: 'audio' });
}

module.exports = { uploadAudio };