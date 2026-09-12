const express = require('express');
const { publicProfile, me, updateMe } = require('../controllers/profileController');
const { requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', publicProfile);

router.get('/admin/me', requireAdmin, me);
router.patch('/admin/me', requireAdmin, updateMe);

module.exports = router;