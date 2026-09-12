const express = require('express');
const { platforms, streams } = require('../controllers/linkController');

const router = express.Router();

router.get('/links/streams', streams);
router.get('/links/platforms', platforms);

module.exports = router;