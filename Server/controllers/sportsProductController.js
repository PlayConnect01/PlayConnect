const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sportsProductController = {
    // Get all products by sport category
    getProductsByCategory: async (req, res) => {
        try {
            const { category } = req.params;
            const products = await prisma.marketplaceProduct.findMany({
                where: {
                    sport: {
                        name: category
                    },
                },
                include: {
                    sport: true,
                    order_items: true,
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

            const productsWithDetails = products.map(product => ({
                ...product,
                final_price: product.discount > 0 
                    ? product.price - (product.price * product.discount / 100)
                    : product.price,
                discount_percentage: product.discount,
                average_rating: product.rating
            }));

            res.json(productsWithDetails);
        } catch (error) {
            console.error('Error getting products by category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Get featured products by category
    getFeaturedProductsByCategory: async (req, res) => {
        try {
            const { category } = req.params;
            const products = await prisma.marketplaceProduct.findMany({
                where: {
                    sport: {
                        name: category
                    },
                    rating: {
                        gte: 4
                    }
                },
                include: {
                    sport: true,
                    order_items: true,
                },
                orderBy: {
                    rating: 'desc'
                },
                take: 5
            });

            const productsWithDetails = products.map(product => ({
                ...product,
                final_price: product.discount > 0 
                    ? product.price - (product.price * product.discount / 100)
                    : product.price,
                discount_percentage: product.discount,
                average_rating: product.rating
            }));

            res.json(productsWithDetails);
        } catch (error) {
            console.error('Error getting featured products:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Get discounted products by category
    getDiscountedProductsByCategory: async (req, res) => {
        try {
            const { category } = req.params;
            const products = await prisma.marketplaceProduct.findMany({
                where: {
                    sport: {
                        name: category
                    },
                    discount: {
                        gt: 0
                    }
                },
                include: {
                    sport: true,
                    order_items: true,
                },
                orderBy: {
                    discount: 'desc'
                },
                take: 10
            });

            const productsWithDetails = products.map(product => ({
                ...product,
                final_price: product.price - (product.price * product.discount / 100),
                discount_percentage: product.discount,
                average_rating: product.rating
            }));

            res.json(productsWithDetails);
        } catch (error) {
            console.error('Error getting discounted products:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Get trending products by category (based on recent orders and rating)
    getTrendingProductsByCategory: async (req, res) => {
        try {
            const { category } = req.params;
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            const products = await prisma.marketplaceProduct.findMany({
                where: {
                    sport: {
                        name: category
                    },
                    order_items: {
                        some: {
                            order: {
                                created_at: {
                                    gte: sevenDaysAgo
                                }
                            }
                        }
                    }
                },
                include: {
                    sport: true,
                    order_items: {
                        where: {
                            order: {
                                created_at: {
                                    gte: sevenDaysAgo
                                }
                            }
                        },
                        include: {
                            order: true
                        }
                    },
                },
                orderBy: [
                    {
                        rating: 'desc'
                    }
                ],
                take: 8
            });

            const productsWithDetails = products.map(product => ({
                ...product,
                final_price: product.discount > 0 
                    ? product.price - (product.price * product.discount / 100)
                    : product.price,
                discount_percentage: product.discount,
                average_rating: product.rating,
                recent_sales: product.order_items.length
            }));

            res.json(productsWithDetails);
        } catch (error) {
            console.error('Error getting trending products:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Get all discounted products
    getAllDiscountedProducts: async (req, res) => {
        try {
            const products = await prisma.product.findMany({
                where: {
                    discount: {
                        gt: 0
                    }
                },
                include: {
                    sport: true,
                    user: {
                        select: {
                            user_id: true,
                            username: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    discount: 'desc'
                }
            });

            res.json(products);
        } catch (error) {
            console.error('Error getting discounted products:', error);
            res.status(500).json({ 
                message: 'Failed to get discounted products',
                error: error.message 
            });
        }
    },

    // Get discounted products by sport ID
    getDiscountedProductsBySport: async (req, res) => {
        const { sportId } = req.params;

        if (!sportId || isNaN(parseInt(sportId))) {
            return res.status(400).json({ 
                message: 'Invalid sport ID provided' 
            });
        }

        try {
            const products = await prisma.product.findMany({
                where: {
                    sport_id: parseInt(sportId),
                    discount: {
                        gt: 0
                    }
                },
                include: {
                    sport: true,
                    user: {
                        select: {
                            user_id: true,
                            username: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    discount: 'desc'
                }
            });

            res.json(products);
        } catch (error) {
            console.error('Error getting discounted products by sport:', error);
            res.status(500).json({ 
                message: 'Failed to get discounted products for this sport',
                error: error.message 
            });
        }
    }
};


module.exports = sportsProductController;
