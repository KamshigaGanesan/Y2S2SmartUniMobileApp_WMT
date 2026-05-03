const express = require('express');
const {
  registerUser,
  loginUser,
  forgotPassword,
  googleLogin,
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/google', googleLogin);

module.exports = router;