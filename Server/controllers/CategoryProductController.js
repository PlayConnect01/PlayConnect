const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all products for a specific category (sport_id)
const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const sport_id = parseInt(category); // Convert to number since it's a sport_id

        console.log('Fetching products for sport_id:', sport_id);

        // Find the sport first
        const sport = await prisma.sport.findUnique({
            where: {
                sport_id: sport_id
            }
        });

        if (!sport) {
            return res.status(404).json({
                success: false,
                message: `Sport with ID ${sport_id} not found`
            });
        }

        // Get products for this sport
        const products = await prisma.marketplaceProduct.findMany({
            where: {
                sport_id: sport_id
            },
            include: {
                sport: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Transform products to include calculated fields
        const enhancedProducts = products.map(product => ({
            ...product,
            discounted_price: calculateDiscountedPrice(product.price, product.discount),
            savings: calculateSavings(product.price, product.discount),
            formatted_price: formatPrice(product.price),
            formatted_discounted_price: formatPrice(calculateDiscountedPrice(product.price, product.discount)),
            image_url: product.image_url,
            stock_status: 'In Stock' // Since there's no stock field in the schema
        }));

        return res.status(200).json({
            success: true,
            category: sport.name,
            sport_id: sport.sport_id,
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
};

// Get all available categories (sports) with product counts
const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.sport.findMany({
            include: {
                _count: {
                    select: {
                        products: true
                    }
                }
            }
        });

        const enhancedCategories = categories.map(category => ({
            id: category.sport_id,
            name: category.name,
            product_count: category._count.products,
            icon: category.icon || null,
            description: category.description || null
        }));

        return res.status(200).json({
            success: true,
            categories: enhancedCategories
        });

    } catch (error) {
        console.error('Error in getAllCategories:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};

// Get featured products for each category (sport)
const getFeaturedCategoryProducts = async (req, res) => {
    try {
        const sports = await prisma.sport.findMany();
        
        const featuredProducts = await Promise.all(
            sports.map(async (sport) => {
                const products = await prisma.marketplaceProduct.findMany({
                    where: {
                        sport_id: sport.sport_id,
                        rating: {
                            gte: 4 // Consider products with rating >= 4 as featured
                        }
                    },
                    take: 4, // Get top 4 featured products per category
                    orderBy: {
                        rating: 'desc'
                    },
                    include: {
                        sport: true
                    }
                });

                return {
                    sport_id: sport.sport_id,
                    category: sport.name,
                    products: products.map(product => ({
                        ...product,
                        discounted_price: calculateDiscountedPrice(product.price, product.discount),
                        formatted_price: formatPrice(product.price),
                        formatted_discounted_price: formatPrice(calculateDiscountedPrice(product.price, product.discount))
                    }))
                };
            })
        );

        return res.status(200).json({
            success: true,
            featured_products: featuredProducts
        });

    } catch (error) {
        console.error('Error in getFeaturedCategoryProducts:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch featured products',
            error: error.message
        });
    }
};

// Helper functions
const calculateDiscountedPrice = (price, discount) => {
    if (!discount) return price;
    return parseFloat((price * (1 - discount / 100)).toFixed(2));
};

const calculateSavings = (price, discount) => {
    if (!discount) return 0;
    return parseFloat((price * (discount / 100)).toFixed(2));
};

const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
};

module.exports = {
    getProductsByCategory,
    getAllCategories,
    getFeaturedCategoryProducts
};
