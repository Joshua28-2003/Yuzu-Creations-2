const express = require('express');
const { list, toggle } = require('../controllers/reactionController');

const router = express.Router();

router.get('/reactions', list);
router.post('/reactions/toggle', toggle);

module.exports = router;