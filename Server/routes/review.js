const express = require('express');
const { getEventReviews, getEventReviewStats, createReview, updateReview, deleteReview } = require ('../controllers/review.js');
const router = express.Router();

// Get all reviews for an event
router.get('/events/:eventId/reviews', getEventReviews);

// Get review statistics for an event
router.get('/events/:eventId/reviews/stats', getEventReviewStats);

// Create a new review (requires authentication)
router.post('/events/:eventId/reviews', createReview);

// Update a review (requires authentication)
router.put('/reviews/:reviewId', updateReview);

// Delete a review (requires authentication)
router.delete('/reviews/:reviewId', deleteReview);

module.exports =  router;