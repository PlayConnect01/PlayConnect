const express = require('express');
const { addToCart } = require('../controllers/cartProducts');
const { getCart } = require('../controllers/Cart');
const { removeFromCart } = require('../controllers/cartProducts');
const { confirmOrder } = require('../controllers/order');


const router = express.Router();

router.get('/itemcart', getCart);
router.post('/add', addToCart);
router.delete('/remove/:productId', removeFromCart);
router.post('/confirm-order', confirmOrder);




module.exports = router;