// path/to/controllers/ProductController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getProductsBySportId(req, res) {
    const { sportId } = req.params;

    try {
        const products = await prisma.marketplaceProduct.findMany({
            where: { sport_id: parseInt(sportId) },
            include: {
                sport: true,
                reviews: true
            },
            orderBy: {
                rating: 'desc'
            }
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
                take: 2,
                orderBy: {
                    rating: 'desc'
                },
                include: {
                    sport: true,
                    reviews: true
                }
            });

            if (products.length > 0) {
                results.push({
                    sport: sport,
                    products: products,
                });
            }

            // Stop if we have collected 6 products in total
            if (results.reduce((acc, curr) => acc + curr.products.length, 0) >= 6) {
                break;
            }
        }

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching products.' });
    }
}

async function getLowestPriceProduct(req, res) {
    const { sportId } = req.params;

    try {
        const lowestPriceProduct = await prisma.marketplaceProduct.findFirst({
            where: { sport_id: parseInt(sportId) },
            orderBy: {
                price: 'asc'
            },
            include: {
                sport: true,
                reviews: true
            }
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
    const { sportId } = req.params;

    try {
        const lowestPriceProducts = await prisma.marketplaceProduct.findMany({
            where: { sport_id: parseInt(sportId) },
            orderBy: {
                price: 'asc'
            },
            take: 2,
            include: {
                sport: true,
                reviews: true
            }
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
        const allProducts = await prisma.product.findMany({
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
        const topTwoProducts = await prisma.product.findMany({
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
                    gt: 0
                }
            },
            orderBy: {
                discount: 'desc'
            },
            include: {
                sport: true,
                reviews: true
            }
        });

        if (discountedProducts.length === 0) {
            return res.status(404).json({ error: 'No discounted products found.' });
        }

        res.json(discountedProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching discounted products.' });
    }
}

// Function to get the top three products with the highest discounts
async function getTopThreeDiscountedProducts(req, res) {
    try {
        const topDiscountedProducts = await prisma.marketplaceProduct.findMany({
            where: {
                discount: {
                    gt: 0
                }
            },
            orderBy: {
                discount: 'desc'
            },
            take: 3,
            include: {
                sport: true,
                reviews: true
            }
        });

        if (topDiscountedProducts.length === 0) {
            return res.status(404).json({ error: 'No discounted products found.' });
        }

        res.json(topDiscountedProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching top discounted products.' });
    }
}

// Function to get products with a specific discount
async function getProductsByDiscount(req, res) {
    const { discount } = req.params;

    try {
        const products = await prisma.product.findMany({
            where: {
                discount: {
                    gte: Number(discount), // Get products with a discount greater than or equal to the specified value
                },
            },
        });

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching products by discount.' });
    }
}

// Function to get a product by its ID
async function getProductById(req, res) {
    const { id } = req.params;

    try {
        const product = await prisma.marketplaceProduct.findUnique({
            where: { product_id: parseInt(id) },
            include: {
                sport: true,
                reviews: true,
                userProducts: true
            }
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
  const { productName } = req.query;
  
  if (!productName) {
    return res.status(400).json({ error: "Product name is required" });
  }

  try {
    const products = await prisma.marketplaceProduct.findMany({
      where: {
        OR: [
          { name: { contains: productName } },
          { name: { startsWith: productName } }
        ]
      },
      take: 10,
      orderBy: [
        { rating: 'desc' },
        { review_count: 'desc' }
      ],
      include: {
        sport: true,
        reviews: true
      }
    });

    return res.json(products);
  } catch (error) {
    console.error('Error searching for products:', error);
    return res.status(500).json({ error: "An error occurred while searching for products." });
  }
}

// Function to get discounted products by category
async function getDiscountedProductsByCategory(req, res) {
    const { category } = req.params;

    try {
        // First find the sport by category
        const sport = await prisma.sport.findFirst({
            where: {
                name: {
                    equals: category,
                    mode: 'insensitive'
                }
            }
        });

        if (!sport && category.toLowerCase() !== 'all') {
            return res.status(404).json({ error: 'Sport category not found.' });
        }

        let products;
        
        if (category.toLowerCase() === 'all') {
            products = await prisma.marketplaceProduct.findMany({
                where: {
                    discount: {
                        gt: 0
                    }
                },
                orderBy: {
                    discount: 'desc'
                },
                include: {
                    sport: true,
                    reviews: true
                }
            });
        } else {
            products = await prisma.marketplaceProduct.findMany({
                where: {
                    AND: [
                        { sport_id: sport.sport_id },
                        { discount: { gt: 0 } }
                    ]
                },
                orderBy: {
                    discount: 'desc'
                },
                include: {
                    sport: true,
                    reviews: true
                }
            });
        }

        if (products.length === 0) {
            return res.status(404).json({ error: 'No discounted products found in this category.' });
        }

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching discounted products by category.' });
    }
}

// Function to get all products by category
async function getProductsByCategory(req, res) {
    const { category } = req.params;

    try {
        // First find the sport by category
        const sport = await prisma.sport.findFirst({
            where: {
                name: {
                    equals: category,
                    mode: 'insensitive'
                }
            }
        });

        if (!sport) {
            return res.status(404).json({ error: 'Sport category not found.' });
        }

        // Get products for this sport
        const products = await prisma.marketplaceProduct.findMany({
            where: {
                sport_id: sport.sport_id
            },
            orderBy: [
                { rating: 'desc' },
                { review_count: 'desc' }
            ],
            include: {
                sport: true,
                reviews: true
            }
        });

        if (products.length === 0) {
            return res.status(404).json({ error: 'No products found in this category.' });
        }

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching products by category.' });
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
            user: true
          }
        },
        reviews: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (products.length === 0) {
      return res.status(404).json({ error: 'No products found.' });
    }

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching products.' });
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
            user: true
          }
        },
        reviews: {
          include: {
            user: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching product details.' });
  }
};

// Add this new function before module.exports
const updateProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert string numbers to actual numbers
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.discount) updateData.discount = parseFloat(updateData.discount);
    if (updateData.rating) updateData.rating = parseInt(updateData.rating);
    if (updateData.sport_id) updateData.sport_id = parseInt(updateData.sport_id);

    const updatedProduct = await prisma.marketplaceProduct.update({
      where: { product_id: parseInt(id) },
      data: updateData,
      include: {
        sport: true,
        reviews: true,
        userProducts: {
          include: {
            user: true
          }
        }
      }
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the product.' });
  }
};

// Add the delete function
const deleteProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete related records first
    await prisma.$transaction([
      prisma.cartItem.deleteMany({
        where: { product_id: parseInt(id) }
      }),
      prisma.favorite.deleteMany({
        where: { product_id: parseInt(id) }
      }),
      prisma.userProduct.deleteMany({
        where: { product_id: parseInt(id) }
      }),
      prisma.review.deleteMany({
        where: { product_id: parseInt(id) }
      }),
      prisma.marketplaceProduct.delete({
        where: { product_id: parseInt(id) }
      })
    ]);

    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the product.' });
  }
};

const getTrendingProducts = async (req, res) => {
  try {
    const trendingProducts = await prisma.product.findMany({
      take: 5,
      orderBy: [
        { review_count: 'desc' },
        { rating: 'desc' }
      ],
      select: {
        product_id: true,
        name: true,
        price: true,
        image_url: true,
        description: true,
        rating: true,
        review_count: true
      }
    });

    res.json(trendingProducts);
  } catch (error) {
    console.error('Error fetching trending products:', error);
    res.status(500).json({ error: 'Failed to fetch trending products' });
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
    deleteProductAdmin,
    getTrendingProducts
};