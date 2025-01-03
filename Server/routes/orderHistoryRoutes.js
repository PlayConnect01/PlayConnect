const express = require('express');
const router = express.Router();
const { getOrderHistory, updateOrder } = require('../controllers/orderHistoryController');

// Get complete order history with product details
router.get('/history/:userId', getOrderHistory);

// Update order (status and/or items)
router.patch('/update/:orderId', updateOrder);

module.exports = router;
