const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByUserId,
  getProductsByStatus,
  updateProductStatus
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

// Get products by status
router.get('/status/:status', getProductsByStatus);

// Update product status
router.put('/status/:id', updateProductStatus);

module.exports = router;