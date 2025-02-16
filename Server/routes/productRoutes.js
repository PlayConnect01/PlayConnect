const express = require('express');
const { 
  getProductsBySportId, getLimitedProductsBySport,
  getLowestPriceProduct,
  getTwoLowestPriceProducts,
  getAllProductsBySport,
  getTopTwoRatedProductsBySport,
  getAllDiscountedProducts,
  getTopThreeDiscountedProducts,
  getProductsByDiscount,
  getProductById,
  searchProductByName,
  getDiscountedProductsByCategory,
  getProductsByCategory,
  getAllProductsAdmin,
  getProductDetailsAdmin,
  updateProductAdmin,
  deleteProductAdmin
} = require('../controllers/MarketplaceProduct');


const router = express.Router();
// Route to search products
router.get('/search', searchProductByName);

router.get('/products/sport/:sportId', getProductsBySportId);

router.get('/products/limited', getLimitedProductsBySport);
// Route to get the lowest price product by sport ID
router.get('/products/lowest-price/:sportId', getLowestPriceProduct);

// Route to get two products with the lowest prices by sport ID
router.get('/products/two-lowest-prices/:sportId', getTwoLowestPriceProducts);

router.get('/products/sport/:sportId', getAllProductsBySport);


router.get('/products/sport/:sportId/top-rated', getTopTwoRatedProductsBySport);

// Route to get all products with discounts
router.get('/discounted', getAllDiscountedProducts);

// Route to get the top three products with the highest discounts
router.get('/discounted/top-three', getTopThreeDiscountedProducts);

// Route to get products by a specific discount
router.get('/discounted/:discount', getProductsByDiscount);

// Route to get all products by category
router.get('/category/:category', getProductsByCategory);

// Route to get discounted products by category
router.get('/discounted/category/:category', getDiscountedProductsByCategory);

router.get('/products/:id',getProductById);

// Admin routes
router.get('/products', getAllProductsAdmin);
router.get('/products/:id', getProductDetailsAdmin);

router.put('/products/:id', updateProductAdmin);
router.delete('/products/:id', deleteProductAdmin);

module.exports = router;