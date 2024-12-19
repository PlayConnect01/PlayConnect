const express = require('express');
const { addToFavorites, deleteFromFavorites, getAllFavorites } = require('../controllers/FavoriteController');

const router = express.Router();

// Route to add a product to favorites
router.post('/favorites/add', addToFavorites);

// Route to delete a product from favorites
router.delete('/favorites/item/:favoriteId', deleteFromFavorites);

// Route to get all favorite products for a specific user
router.get('/favorites/user/:userId', getAllFavorites);

module.exports = router;