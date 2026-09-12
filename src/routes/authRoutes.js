const express = require('express');
const { register, verify, resendCode, login, me } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify', verify);
router.post('/resend-code', resendCode);
router.get('/me', protect, me);

module.exports = router;