const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createProductReview,
  updateProductReview,
  deleteProductReview
} = require('../controllers/marketplaceReview');

// Get all reviews for a product
router.get('/product/:productId', getProductReviews);

// Create a new review
router.post('/', createProductReview);

// Update a review
router.put('/:reviewId', updateProductReview);

// Delete a review
router.delete('/:reviewId', deleteProductReview);

module.exports = router;
