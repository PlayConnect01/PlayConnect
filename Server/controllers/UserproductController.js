const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add a new product and link it to the user
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, discount, image_url, sport_id, rating } = req.body;
    const userId = req.user.id; // Assuming user ID is available in the request

    // Basic validation
    if (!name || !description || !price || !image_url || !sport_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const product = await prisma.marketplaceProduct.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        discount: parseFloat(discount) || 0,
        image_url,
        sport_id: parseInt(sport_id),
        rating: parseFloat(rating) || 0
      }
    });

    // Link product to user
    await prisma.userProduct.create({
      data: {
        user_id: userId,
        product_id: product.product_id
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.marketplaceProduct.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving all products', error: error.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.marketplaceProduct.findUnique({
      where: { product_id: parseInt(id) },
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product', error: error.message });
  }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, discount, image_url, sport_id, rating } = req.body;
    const updatedProduct = await prisma.marketplaceProduct.update({
      where: { product_id: parseInt(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        discount: parseFloat(discount) || 0,
        image_url,
        sport_id: parseInt(sport_id),
        rating: parseFloat(rating) || 0
      }
    });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.userProduct.deleteMany({
      where: { product_id: parseInt(id) }
    });
    await prisma.marketplaceProduct.delete({
      where: { product_id: parseInt(id) }
    });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// Get all products added by the current user
exports.getUserProducts = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is available in the request
    const userProducts = await prisma.userProduct.findMany({
      where: { user_id: userId },
      include: {
        product: true
      }
    });
    res.status(200).json(userProducts.map(up => up.product));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user products', error: error.message });
  }
};
