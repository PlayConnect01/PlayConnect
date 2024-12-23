const express = require('express');
const {     processPayment,confirmPayment} = require('../controllers/PaymentController');// Adjust path as needed
const router = express.Router();

// Route to process payment
router.post('/process', processPayment);

// Route to confirm payment
router.post('/confirm', confirmPayment);

module.exports = router;