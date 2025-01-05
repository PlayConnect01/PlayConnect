const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all products by category
router.get('/category/:category', async (req, res) => {
    const { category } = req.params;
    
    try {
        // Get products directly with sport included
        const products = await prisma.marketplaceProduct.findMany({
            include: {
                sport: true
            },
            where: {
                sport: {
                    name: category
                },
                is_active: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform products for frontend
        const enhancedProducts = products.map(product => ({
            ...product,
            discounted_price: product.discount > 0 ? 
                parseFloat((product.price * (1 - product.discount / 100)).toFixed(2)) : 
                product.price,
            formatted_price: `$${product.price.toFixed(2)}`,
            formatted_discounted_price: product.discount > 0 ? 
                `$${(product.price * (1 - product.discount / 100)).toFixed(2)}` : 
                `$${product.price.toFixed(2)}`,
            image_url: product.image || 'default-image-url.jpg'
        }));

        return res.status(200).json({
            success: true,
            category: category,
            total: enhancedProducts.length,
            products: enhancedProducts
        });

    } catch (error) {
        console.error('Error in getProductsByCategory:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
});

// Get all sports categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await prisma.sport.findMany({
            select: {
                sport_id: true,
                name: true,
                description: true,
                icon: true,
                _count: {
                    select: {
                        products: true
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            categories: categories.map(cat => ({
                ...cat,
                productCount: cat._count.products
            }))
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
});

module.exports = router;
