const { PrismaClient } = require('@prisma/client');
const { validateReview } = require('../controllers/reviewValidator');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Get all reviews for an event
const getEventReviews = async (req, res) => {
  try {
    const { eventId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        event_id: parseInt(eventId),
      },
      include: {
        user: {
          select: {
            username: true,
            profile_picture: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const averageRating = reviews.length
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

    res.json({
      reviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Create a new review
const createReview = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId, rating, comment } = req.body;

    console.log('Received data:', { eventId, userId, rating, comment });

    const validationError = validateReview({ rating, comment });
    if (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({ error: validationError });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const isParticipant = await prisma.eventParticipant.findFirst({
      where: {
        event_id: parseInt(eventId),
        user_id: parseInt(userId),
      },
    });

    if (!isParticipant) {
      return res.status(403).json({ error: 'Only event participants can leave reviews' });
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        event_id: parseInt(eventId),
        user_id: parseInt(userId),
      },
    });

    if (existingReview) {
      const updatedReview = await prisma.review.update({
        where: { review_id: existingReview.review_id },
        data: { rating: parseInt(rating), comment, updated_at: new Date() },
        include: { user: { select: { username: true, profile_picture: true } } },
      });
      return res.json(updatedReview);
    }

    const newReview = await prisma.review.create({
      data: {
        event_id: parseInt(eventId),
        user_id: parseInt(userId),
        rating: parseInt(rating),
        comment,
      },
      include: { user: { select: { username: true, profile_picture: true } } },
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const validationError = validateReview({ rating, comment });
    if (validationError) return res.status(400).json({ error: validationError });

    const existingReview = await prisma.review.findFirst({
      where: {
        review_id: parseInt(reviewId),
        user_id: req.user.id,
      },
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    const updatedReview = await prisma.review.update({
      where: { review_id: parseInt(reviewId) },
      data: { rating: parseInt(rating), comment, updated_at: new Date() },
      include: { user: { select: { username: true, profile_picture: true } } },
    });

    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const existingReview = await prisma.review.findUnique({
      where: {
        review_id: parseInt(reviewId)
      }
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await prisma.review.delete({
      where: {
        review_id: parseInt(reviewId)
      }
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// Get review statistics for an event
const getEventReviewStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { event_id: parseInt(eventId) },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
      : 0;

    const ratingDistribution = [1, 2, 3, 4, 5].reduce((acc, rating) => {
      acc[rating] = reviews.filter(r => r.rating === rating).length;
      return acc;
    }, {});

    res.json({ totalReviews, averageRating: parseFloat(averageRating.toFixed(1)), ratingDistribution });
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    res.status(500).json({ error: 'Failed to fetch review statistics' });
  }
};

module.exports = {
  getEventReviews,
  createReview,
  updateReview,
  deleteReview,
  getEventReviewStats,
};
