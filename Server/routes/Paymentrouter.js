const express = require('express');
const router = express.Router();
const { processPayment, confirmPayment , getConfig } = require('../controllers/PaymentController');

// Payment routes
router.post('/process', processPayment);
router.post('/confirm', confirmPayment);
router.get('/config', getConfig);


module.exports = router;