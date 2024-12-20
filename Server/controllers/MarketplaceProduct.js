// path/to/controllers/ProductController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getProductsBySportId(req, res) {
    const { sportId } = req.params; // Get the sport ID from the request parameters

    try {
        const products = await prisma.marketplaceProduct.findMany({
            where: { sport_id: parseInt(sportId) }, // Find products by sport ID
        });

        if (products.length === 0) {
            return res.status(404).json({ error: 'No products found for this sport.' });
        }

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching products.' });
    }
}
async function getLimitedProductsBySport(req, res) {
    try {
        // Fetch all sports
        const sports = await prisma.sport.findMany();

        // Initialize an array to hold the results
        const results = [];

        // Loop through each sport and get up to 2 products
        for (const sport of sports) {
            const products = await prisma.marketplaceProduct.findMany({
                where: { sport_id: sport.sport_id },
                take: 2, // Limit to 2 products per sport
            });

            // Add the sport and its products to the results
            results.push({
                sport: sport,
                products: products,
            });

            // Stop if we have collected 6 products in total
            if (results.reduce((acc, curr) => acc + curr.products.length, 0) >= 6) {
                break;
            }
        }

        // Flatten the results to return only the products
        const limitedProducts = results.flatMap(item => item.products);

        res.json(limitedProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching products.' });
    }
}

async function getLowestPriceProduct(req, res) {
    const { sportId } = req.params; // Get the sport ID from the request parameters

    try {
        const lowestPriceProduct = await prisma.marketplaceProduct.findFirst({
            where: { sport_id: parseInt(sportId) }, // Filter by sport ID
            orderBy: {
                price: 'asc', // Order by price in ascending order
            },
        });

        if (!lowestPriceProduct) {
            return res.status(404).json({ error: 'No products found for this sport.' });
        }

        res.json(lowestPriceProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the lowest price product.' });
    }
}
async function getTwoLowestPriceProducts(req, res) {
    const { sportId } = req.params; // Get the sport ID from the request parameters

    try {
        const lowestPriceProducts = await prisma.marketplaceProduct.findMany({
            where: { sport_id: parseInt(sportId) }, // Filter by sport ID
            orderBy: {
                price: 'asc', // Order by price in ascending order
            },
            take: 2, // Limit to 2 products
        });

        if (lowestPriceProducts.length === 0) {
            return res.status(404).json({ error: 'No products found for this sport.' });
        }

        res.json(lowestPriceProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the lowest price products.' });
    }
}

// Function to get all products with their ratings for a specific sport
async function getAllProductsBySport(req, res) {
    const { sportId } = req.params;

    try {
        const allProducts = await prisma.marketplaceProduct.findMany({
            where: { sport_id: Number(sportId) }, // Filter by sport ID
            orderBy: { rating: 'desc' }, // Order by rating in descending order
        });

        res.json(allProducts);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching all products for the specified sport.' });
    }
}

// Function to get the top two rated products for a specific sport
async function getTopTwoRatedProductsBySport(req, res) {
    const { sportId } = req.params;

    try {
        const topTwoProducts = await prisma.marketplaceProduct.findMany({
            where: { sport_id: Number(sportId) }, // Filter by sport ID
            orderBy: { rating: 'desc' },
            take: 2, // Limit to the top two products
        });

        res.json(topTwoProducts);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching top rated products for the specified sport.' });
    }
}
// Function to get all products with discounts
async function getAllDiscountedProducts(req, res) {
    try {
        const discountedProducts = await prisma.marketplaceProduct.findMany({
            where: {
                discount: {
                    gt: 0, // Only products with a discount greater than 0
                },
            },
            orderBy: {
                discount: 'desc', // Order by discount in descending order
            },
        });

        res.json(discountedProducts);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching discounted products.' });
    }
}
// Function to get the top three products with the highest discounts
async function getTopThreeDiscountedProducts(req, res) {
    try {
        const topDiscountedProducts = await prisma.marketplaceProduct.findMany({
            where: {
                discount: {
                    gt: 0, // Only products with a discount greater than 0
                },
            },
            orderBy: {
                discount: 'desc', // Order by discount in descending order
            },
            take: 3, // Limit to the top three products
        });

        res.json(topDiscountedProducts);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching top discounted products.' });
    }
}

// Function to get products with a specific discount
async function getProductsByDiscount(req, res) {
    const { discount } = req.params;

    try {
        const products = await prisma.marketplaceProduct.findMany({
            where: {
                discount: {
                    gte: Number(discount), // Get products with a discount greater than or equal to the specified value
                },
            },
        });

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching products by discount.' });
    }}

// Export the controller function
module.exports = {
    getProductsBySportId, getLimitedProductsBySport,
    getLowestPriceProduct,
    getTwoLowestPriceProducts,
    getAllProductsBySport,
    getTopTwoRatedProductsBySport,   
    getAllDiscountedProducts,
    getTopThreeDiscountedProducts,
    getProductsByDiscount,
};