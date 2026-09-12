const express = require('express');
const { ban, unban } = require('../controllers/banController');
const { requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.post('/users/:id/ban', requireAdmin, ban);
router.post('/users/:id/unban', requireAdmin, unban);

module.exports = router;