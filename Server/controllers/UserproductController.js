const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add a new product and link it to user
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, image_url, sport_id, user_id } = req.body;
    console.log('Received request body:', req.body);

    // Validate all required fields
    const requiredFields = { name, price, sport_id, user_id };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === null || value === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({
        message: 'Missing required fields',
        missingFields
      });
    }

    // Validate data types
    if (isNaN(parseFloat(price))) {
      return res.status(400).json({
        message: 'Invalid price format',
        error: 'Price must be a number'
      });
    }

    if (isNaN(parseInt(sport_id))) {
      return res.status(400).json({
        message: 'Invalid sport_id format',
        error: 'sport_id must be a number'
      });
    }

    if (isNaN(parseInt(user_id))) {
      return res.status(400).json({
        message: 'Invalid user_id format',
        error: 'user_id must be a number'
      });
    }

    // Create product and link to user in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Verify sport exists
      const sport = await prisma.sport.findUnique({
        where: { sport_id: parseInt(sport_id) }
      });

      if (!sport) {
        throw new Error('Sport not found');
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { user_id: parseInt(user_id) }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Create the marketplace product with default values
      const product = await prisma.marketplaceProduct.create({
        data: {
          name: name.trim(),
          description: description ? description.trim() : '',
          price: parseFloat(price),
          discount: 0, // Default to 0
          image_url: image_url ? image_url.trim() : '',
          sport_id: parseInt(sport_id),
          rating: 5 // Default rating
        }
      });

      console.log('Created product:', product);

      // Link product to user
      const userProduct = await prisma.userProduct.create({
        data: {
          user_id: parseInt(user_id),
          product_id: product.product_id
        }
      });

      console.log('Created user product link:', userProduct);

      return product;
    });

    // Get the complete product with relationships
    const productWithDetails = await prisma.marketplaceProduct.findUnique({
      where: { product_id: result.product_id },
      include: {
        sport: {
          select: {
            name: true,
            description: true,
            icon: true
          }
        },
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

    // Format the response
    const formattedProduct = {
      ...productWithDetails,
      seller: productWithDetails.userProducts[0]?.user || null
    };
    delete formattedProduct.userProducts;

    res.status(201).json(formattedProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    
    // Handle specific errors
    if (error.message === 'Sport not found') {
      return res.status(400).json({ 
        message: 'Invalid sport category',
        error: 'The selected sport category does not exist'
      });
    }
    
    if (error.message === 'User not found') {
      return res.status(400).json({ 
        message: 'Invalid user',
        error: 'The specified user does not exist'
      });
    }

    // Handle Prisma errors
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        message: 'Duplicate entry',
        error: 'A product with these details already exists'
      });
    }

    res.status(400).json({ 
      message: 'Could not add product',
      error: error.message
    });
  }
};

// Get all products with user details
exports.getAllProducts = async (req, res) => {
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
      }
    });

    const formattedProducts = products.map(product => ({
      ...product,
      seller: product.userProducts[0]?.user || null
    }));

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ message: 'Could not get products' });
  }
};

// Get product by ID with user details
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.marketplaceProduct.findUnique({
      where: { 
        product_id: parseInt(id) 
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

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const formattedProduct = {
      ...product,
      seller: product.userProducts[0]?.user || null
    };

    res.status(200).json(formattedProduct);
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ message: 'Could not get product' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image_url, sport_id, user_id } = req.body;
    
    console.log('Update request:', { id, ...req.body });

    // Validate required fields
    if (!name || !price || !sport_id || !user_id) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['name', 'price', 'sport_id', 'user_id']
      });
    }

    // Check if product exists
    const existingProduct = await prisma.marketplaceProduct.findUnique({
      where: { product_id: parseInt(id) },
      include: {
        userProducts: true
      }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns the product
    const userOwnsProduct = existingProduct.userProducts.some(
      up => up.user_id === parseInt(user_id)
    );

    if (!userOwnsProduct) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    // Update the product
    const updatedProduct = await prisma.marketplaceProduct.update({
      where: { 
        product_id: parseInt(id) 
      },
      data: {
        name: name.trim(),
        description: description ? description.trim() : '',
        price: parseFloat(price),
        image_url: image_url ? image_url.trim() : '',
        sport_id: parseInt(sport_id)
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

    console.log('Updated product:', updatedProduct);

    const formattedProduct = {
      ...updatedProduct,
      seller: updatedProduct.userProducts[0]?.user || null
    };

    res.status(200).json(formattedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      message: 'Could not update product',
      error: error.message 
    });
  }
};

// Get products by user ID
exports.getProductsByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const products = await prisma.marketplaceProduct.findMany({
      where: {
        userProducts: {
          some: {
            user_id: userId
          }
        }
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

    const formattedProducts = products.map(product => ({
      ...product,
      seller: product.userProducts[0]?.user || null
    }));

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error('Error getting user products:', error);
    res.status(500).json({ message: 'Could not get user products' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    console.log('Delete request:', { id, user_id });

    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if product exists and user owns it
    const product = await prisma.marketplaceProduct.findUnique({
      where: { product_id: parseInt(id) },
      include: {
        userProducts: true
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const userOwnsProduct = product.userProducts.some(
      up => up.user_id === parseInt(user_id)
    );

    if (!userOwnsProduct) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Delete in transaction to ensure all related records are deleted
    await prisma.$transaction([
      // First delete user-product relationships
      prisma.userProduct.deleteMany({
        where: {
          product_id: parseInt(id)
        }
      }),
      // Then delete the product
      prisma.marketplaceProduct.delete({
        where: {
          product_id: parseInt(id)
        }
      })
    ]);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      message: 'Could not delete product',
      error: error.message 
    });
  }
};

// Get products by status
exports.getProductsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const products = await prisma.userProduct.findMany({
      where: {
        status: status.toUpperCase()
      },
      include: {
        product: {
          include: {
            sport: true
          }
        },
        user: {
          select: {
            username: true,
            email: true,
            profile_picture: true
          }
        }
      }
    });

    const formattedProducts = products.map(({ product, user, ...userProduct }) => ({
      id: userProduct.id,
      status: userProduct.status,
      created_at: userProduct.created_at,
      ...product,
      seller: user
    }));

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products by status:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Update product status
exports.updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedProduct = await prisma.userProduct.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        product: {
          include: {
            sport: true
          }
        },
        user: {
          select: {
            username: true,
            email: true,
            profile_picture: true
          }
        }
      }
    });

    const formattedProduct = {
      id: updatedProduct.id,
      status: updatedProduct.status,
      created_at: updatedProduct.created_at,
      ...updatedProduct.product,
      seller: updatedProduct.user
    };

    res.status(200).json(formattedProduct);
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ error: 'Failed to update product status' });
  }
};
