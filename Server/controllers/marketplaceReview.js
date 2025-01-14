const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to update product rating
const updateProductRating = async (productId) => {
  const reviews = await prisma.review.findMany({
    where: {
      product_id: productId
    }
  });

  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  const averageRating = reviews.length ? Math.round(totalRating / reviews.length) : 5;

  await prisma.marketplaceProduct.update({
    where: {
      product_id: productId
    },
    data: {
      rating: averageRating,
      review_count: reviews.length
    }
  });
};

// Get all reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: {
        product_id: parseInt(productId)
      },
      include: {
        user: {
          select: {
            username: true,
            profile_picture: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const averageRating = reviews.length
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

    res.json({
      reviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Create a new review
const createProductReview = async (req, res) => {
  try {
    const { product_id, user_id, rating, comment } = req.body;
    console.log('Received review data:', { product_id, user_id, rating, comment });

    // Validate input
    if (!product_id || !user_id) {
      return res.status(400).json({ error: 'Product ID and User ID are required' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        AND: [
          { product_id: parseInt(product_id) },
          { user_id: parseInt(user_id) }
        ]
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // Check if product exists
    const product = await prisma.marketplaceProduct.findUnique({
      where: { product_id: parseInt(product_id) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(user_id) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create the review
    const newReview = await prisma.review.create({
      data: {
        product_id: parseInt(product_id),
        user_id: parseInt(user_id),
        rating: parseInt(rating),
        comment: comment || null
      },
      include: {
        user: {
          select: {
            username: true,
            profile_picture: true
          }
        }
      }
    });

    // Update product rating
    await updateProductRating(parseInt(product_id));

    res.json(newReview);
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ 
      error: 'Failed to create review',
      details: error.message,
      code: error.code
    });
  }
};

// Update a review
const updateProductReview = async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  console.log('Updating review with ID:', reviewId);

  try {
    // Try to update directly
    const updatedReview = await prisma.review.updateMany({
      where: {
        review_id: parseInt(reviewId)
      },
      data: {
        rating: parseInt(rating),
        comment,
        updated_at: new Date()
      }
    });

    if (updatedReview.count === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Get the updated review
    const review = await prisma.review.findFirst({
      where: {
        review_id: parseInt(reviewId)
      }
    });

    await updateProductRating(review.product_id);
    res.status(200).json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// Delete a review
const deleteProductReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    console.log('Deleting review with ID:', reviewId);
    
    // Get the review first to get the product_id
    const review = await prisma.review.findFirst({
      where: {
        review_id: parseInt(reviewId)
      }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const productId = review.product_id;

    // Delete the review
    await prisma.review.deleteMany({
      where: {
        review_id: parseInt(reviewId)
      }
    });

    // Update product rating
    await updateProductRating(productId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

module.exports = {
  getProductReviews,
  createProductReview,
  updateProductReview,
  deleteProductReview
};
