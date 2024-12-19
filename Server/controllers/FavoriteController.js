// path/to/controller/FavoriteController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Function to add a product to favorites
async function addToFavorites(req, res) {
    const { userId, productId } = req.body;

    try {
        // Check if the favorite already exists
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                user_id_product_id: {
                    user_id: userId,
                    product_id: productId,
                },
            },
        });

        if (existingFavorite) {
            return res.status(400).json({ error: 'Product is already in favorites.' });
        }

        // Create a new favorite
        const favorite = await prisma.favorite.create({
            data: {
                user_id: userId,
                product_id: productId,
            },
        });

        res.status(201).json(favorite);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while adding to favorites.' });
    }
}

// Function to delete a product from favorites
async function deleteFromFavorites(req, res) {
    const { favoriteId } = req.params;

    try {
        const deletedFavorite = await prisma.favorite.delete({
            where: { favorite_id: Number(favoriteId) },
        });

        res.json(deletedFavorite);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting from favorites.' });
    }
}

// Function to get all favorite products for a specific user
async function getAllFavorites(req, res) {
    const { userId } = req.params;

    try {
        const favorites = await prisma.favorite.findMany({
            where: { user_id: Number(userId) },
            include: { product: true }, // Include product details
        });

        res.json(favorites);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching favorite products.' });
    }
}

// Export the functions
module.exports = {
    addToFavorites,
    deleteFromFavorites,
    getAllFavorites,
};