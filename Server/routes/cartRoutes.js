// path/to/routes/cartRoutes.js

const express = require('express');
const { addToCart, deleteFromCart, getAllCartItems } = require('../controllers/CartController');

const router = express.Router();

// Route to add a product to the cart
router.post('/cart/add', addToCart);

// Route to delete a product from the cart
router.delete('/cart/item/:cartItemId', deleteFromCart);

// Route to get all items in the cart for a specific user
router.get('/cart/user/:userId', getAllCartItems);

module.exports = router;