// path/to/routes/cartRoutes.js

const express = require('express');
const {   addToCart,
    deleteFromCart,
    getAllCartItems,
    getCartCount,
    clearCart,
    updateCartItem,} = require('../controllers/CartController');


const router = express.Router();

// Route to add a product to the cart
router.post('/cart/add', addToCart);  // te5demm jwha behy 

// Route to delete a product from the cart
router.delete('/cart/item/:cartItemId', deleteFromCart);

// Route to get all items in the cart for a specific user
router.get('/cart/user/:userId', getAllCartItems); // te5demm 

// Route to get cart count
router.get('/count/:userId', getCartCount);  // te5dem 


// Update cart item quantity
router.patch('/items/:cartItemId', updateCartItem);

// Clear cart
router.delete('/clear/:userId', clearCart);    /// rahy te5demm 


module.exports = router;