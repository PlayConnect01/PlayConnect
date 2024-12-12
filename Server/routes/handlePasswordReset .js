const express = require('express');
const { sendPasswordResetCode, updatePassword } = require('../controllers/handlePasswordReset '); // Assuming your password logic is in this controller
const router = express.Router();

// Route to handle password reset requests
router.post('/send-reset-code', sendPasswordResetCode);

// Route to update the password after verification
router.post('/update-password', updatePassword);

module.exports = router;