const express = require('express');
const { submit, list, resolve, del } = require('../controllers/feedbackController');
const { requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.post('/feedback', submit);
router.get('/feedback', requireAdmin, list);
router.post('/feedback/:id/resolve', requireAdmin, resolve);
router.delete('/feedback/:id', requireAdmin, del);

module.exports = router;