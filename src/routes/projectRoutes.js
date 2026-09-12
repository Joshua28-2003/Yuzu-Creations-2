const express = require('express');
const { uploadImage, mine, stats } = require('../controllers/projectController');
const { requireAdmin } = require('../middlewares/auth');
const { image } = require('../middlewares/upload');

const router = express.Router();

router.get('/projects/mine', requireAdmin, mine);
router.get('/projects/stats', requireAdmin, stats);
router.post('/upload', requireAdmin, image.single('image'), uploadImage);

module.exports = router;