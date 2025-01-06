const express = require('express');
const router = express.Router();
const {
    getProductsByCategory,
    getAllCategories,
    getFeaturedCategoryProducts
} = require('../controllers/CategoryProductController');

// Get all categories
router.get('/categories', getAllCategories);

// Get products by category
router.get('/products/:category', getProductsByCategory);

// Get featured products for each category
router.get('/featured', getFeaturedCategoryProducts);

module.exports = router;
