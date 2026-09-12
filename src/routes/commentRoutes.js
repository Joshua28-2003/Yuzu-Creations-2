const express = require('express');
const { list, create, remove } = require('../controllers/commentController');
const { requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/comments', list);
router.post('/comments', create);
router.delete('/comments/:id', requireAdmin, remove);

module.exports = router;