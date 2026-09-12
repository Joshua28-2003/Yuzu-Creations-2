const express = require('express');
const { uploadVideo } = require('../controllers/videoController');
const { requireAdmin } = require('../middlewares/auth');
const { video } = require('../middlewares/upload');
const Video = require('../models/Video');

const router = express.Router();

router.post('/upload/video', requireAdmin, video.single('video'), uploadVideo);
router.get('/videos/mine', requireAdmin, (req, res) => res.json(Video.findByUser(req.user.id)));

module.exports = router;