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

// Function to get a product by its ID
async function getProductById(req, res) {
    const { id } = req.params; // Get the product ID from the request parameters

    try {
        const product = await prisma.marketplaceProduct.findUnique({
            where: { product_id: parseInt(id) }, // Find the product by ID
            include: {
                sport: true, // Include related sport data if needed
                cart_items: true, // Include cart items if needed
                favorites: true, // Include favorites if needed
            },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the product.' });
    }
}
async function searchProductByName(req, res) {
const { productName } = req.query; // Extract productName from query parameters
try {
    const products = await prisma.marketplaceProduct.findMany({
        where: {
            name: {
                contains: productName, // Search for product name
                // Remove the mode option
            },
        },
        select: {
            product_id: true,
            name: true,
            image_url: true,// Include sport details if needed
        },
    });
    return res.json(products); // Return the found products as JSON
} catch (error) {
    console.error("Error searching products:", error); // Log the error
    return res.status(500).json({ error: "An error occurred while searching for products." });
}}

// Function to get discounted products by category
async function getDiscountedProductsByCategory(req, res) {
    const { category } = req.params;
    
    try {
        let products;
        
        if (category.toLowerCase() === 'all') {
            products = await prisma.marketplaceProduct.findMany({
                where: {
                    discount: {
                        gt: 0
                    }
                },
                include: {
                    sport: true
                },
                orderBy: {
                    discount: 'desc'
                }
            });
        } else {
            // Get the sport ID for the category name
            const sport = await prisma.sport.findFirst({
                where: {
                    name: {
                        equals: category,
                        mode: 'insensitive'
                    }
                }
            });

            if (!sport) {
                return res.status(404).json({ 
                    success: false,
                    message: `Sport category '${category}' not found`
                });
            }

            products = await prisma.marketplaceProduct.findMany({
                where: {
                    AND: [
                        { sport_id: sport.sport_id },
                        { discount: { gt: 0 } }
                    ]
                },
                include: {
                    sport: true
                },
                orderBy: {
                    discount: 'desc'
                }
            });
        }

        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No discounted products found in ${category}`
            });
        }

        // Add additional product information
        const enhancedProducts = products.map(product => ({
            ...product,
            discounted_price: parseFloat((product.price * (1 - product.discount / 100)).toFixed(2)),
            savings: parseFloat((product.price * (product.discount / 100)).toFixed(2)),
            formatted_price: `$${product.price.toFixed(2)}`,
            formatted_discounted_price: `$${(product.price * (1 - product.discount / 100)).toFixed(2)}`
        }));

        res.json({
            success: true,
            count: enhancedProducts.length,
            category: category,
            products: enhancedProducts
        });
    } catch (error) {
        console.error('Error getting discounted products by category:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to get discounted products for this category',
            error: error.message
        });
    }
}

// Function to get all products by category
async function getProductsByCategory(req, res) {
    const { category } = req.params;
    
    try {
        let products;
        
        if (category.toLowerCase() === 'all') {
            products = await prisma.marketplaceProduct.findMany({
                include: {
                    sport: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } else {
            // Get the sport ID for the category name
            const sport = await prisma.sport.findFirst({
                where: {
                    name: {
                        equals: category,
                        mode: 'insensitive'
                    }
                }
            });

            if (!sport) {
                return res.status(404).json({ 
                    success: false,
                    message: `Sport category '${category}' not found`
                });
            }

            products = await prisma.marketplaceProduct.findMany({
                where: {
                    sport_id: sport.sport_id
                },
                include: {
                    sport: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        }

        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No products found in ${category}`
            });
        }

        // Add additional product information
        const enhancedProducts = products.map(product => ({
            ...product,
            discounted_price: product.discount > 0 ? parseFloat((product.price * (1 - product.discount / 100)).toFixed(2)) : product.price,
            savings: product.discount > 0 ? parseFloat((product.price * (product.discount / 100)).toFixed(2)) : 0,
            formatted_price: `$${product.price.toFixed(2)}`,
            formatted_discounted_price: product.discount > 0 ? 
                `$${(product.price * (1 - product.discount / 100)).toFixed(2)}` : 
                `$${product.price.toFixed(2)}`
        }));

        res.json({
            success: true,
            count: enhancedProducts.length,
            category: category,
            products: enhancedProducts
        });
    } catch (error) {
        console.error('Error getting products by category:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to get products for this category',
            error: error.message
        });
    }
}

// Get all products for admin dashboard
const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await prisma.marketplaceProduct.findMany({
      include: {
        sport: true,
        userProducts: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
                profile_picture: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const formattedProducts = products.map(product => ({
      ...product,
      seller: product.userProducts[0]?.user || null,
      userProducts: undefined
    }));

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get product details for admin
const getProductDetailsAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.marketplaceProduct.findUnique({
      where: { product_id: parseInt(id) },
      include: {
        sport: true,
        userProducts: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
                profile_picture: true
              }
            }
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                username: true,
                profile_picture: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const formattedProduct = {
      ...product,
      seller: product.userProducts[0]?.user || null,
      userProducts: undefined,
      total_reviews: product.reviews.length,
      average_rating: product.reviews.length > 0 
        ? (product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / product.reviews.length).toFixed(1)
        : 0
    };

    res.status(200).json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
};

// Add this new function before module.exports
const updateProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate and convert numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.discount) updateData.discount = parseFloat(updateData.discount);
    if (updateData.rating) updateData.rating = parseFloat(updateData.rating);
    if (updateData.sport_id) updateData.sport_id = parseInt(updateData.sport_id);

    const updatedProduct = await prisma.marketplaceProduct.update({
      where: { product_id: parseInt(id) },
      data: {
        ...updateData,
        updated_at: new Date()
      },
      include: {
        sport: true,
        userProducts: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
                profile_picture: true
              }
            }
          }
        }
      }
    });

    const formattedProduct = {
      ...updatedProduct,
      seller: updatedProduct.userProducts[0]?.user || null,
      userProducts: undefined
    };

    res.status(200).json(formattedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Add the delete function
const deleteProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // First delete related records
    await prisma.cartItem.deleteMany({
      where: { product_id: parseInt(id) }
    });

    await prisma.favorite.deleteMany({
      where: { product_id: parseInt(id) }
    });

    await prisma.orderItem.deleteMany({
      where: { product_id: parseInt(id) }
    });

    await prisma.userProduct.deleteMany({
      where: { product_id: parseInt(id) }
    });

    // Then delete the product
    await prisma.marketplaceProduct.delete({
      where: { product_id: parseInt(id) }
    });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// Export the controller functions
module.exports = {
    getProductsBySportId,
    getLimitedProductsBySport,
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
};