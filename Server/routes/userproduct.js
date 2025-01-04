const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByUserId
} = require('../controllers/UserproductController');

const express = require('express');
const router = express.Router();

// Get all products
router.get('/', getAllProducts);

// Get products by user ID
router.get('/user/:userId', getProductsByUserId);

// Get single product
router.get('/:id', getProductById);

// Add new product
router.post('/', addProduct);

// Update product
router.put('/:id', updateProduct);

// Delete product
router.delete('/:id', deleteProduct);

module.exports = router;