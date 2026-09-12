const express = require('express');
const { totals, visit, usersList } = require('../controllers/statsController');
const { requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/stats', totals);
router.post('/stats/visit', visit);
router.get('/stats/users', requireAdmin, usersList);

module.exports = router;