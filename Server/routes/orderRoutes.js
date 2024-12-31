const express = require('express');
const { getUserOrders, getOrderById } = require('../controllers/OrderController');

const router = express.Router();

// Get all orders for a user
router.get('/user/:userId', getUserOrders);

// Get a single order by ID
router.get('/:orderId', getOrderById);

module.exports = router;
