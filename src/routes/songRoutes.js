const express = require('express');
const { uploadAudio } = require('../controllers/songController');
const { requireAdmin } = require('../middlewares/auth');
const { audio } = require('../middlewares/upload');

const router = express.Router();

router.post('/upload/audio', requireAdmin, audio.single('audio'), uploadAudio);

module.exports = router;