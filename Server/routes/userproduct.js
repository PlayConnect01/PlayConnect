const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getUserProducts
} = require('../controllers/UserproductController');

const express = require('express');
const router = express.Router();

// Add a new product
router.post('/product', addProduct);

// Get all products
router.get('/products', getAllProducts);

// Get a single product by ID
router.get('/product/:id', getProductById);

// Update a product by ID
router.put('/product/:id', updateProduct);

// Delete a product by ID
router.delete('/product/:id', deleteProduct);

// Get all products added by the current user
router.get('/user-products', getUserProducts);

module.exports = router;