const express = require('express');
const {
  sendCode,
  verifyCode,
  updatePassword, // Ensure this function matches the actual controller function
} = require('../controllers/handlePasswordReset '); // Corrected file path

const router = express.Router();

// Route to request a password reset code via email
router.post('/request-password-reset', sendCode);

// Route to verify the reset code
router.post('/verify-reset-code', verifyCode);

// Route to update the password after verification
router.post('/update-password', updatePassword);

module.exports = router;
