'use client';

import { useState, useEffect } from 'react';
import { Rating } from '@mui/material';
import { getProductReviews, createProductReview, updateProductReview, deleteProductReview } from '../api/reviews';

const ReviewSection = ({ productId, userId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getProductReviews(productId);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const reviewData = {
        product_id: productId,
        user_id: userId,
        rating: newReview.rating,
        comment: newReview.comment
      };

      await createProductReview(reviewData);
      setNewReview({ rating: 5, comment: '' });
      loadReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateReview = async (reviewId, updatedData) => {
    try {
      await updateProductReview(reviewId, updatedData);
      loadReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteProductReview(reviewId);
      loadReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading reviews...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="my-6">
      <h2 className="text-2xl font-bold mb-4">Reviews</h2>
      
      {/* Average Rating */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Rating value={averageRating} readOnly precision={0.5} />
          <span className="text-lg">({reviews.length} reviews)</span>
        </div>
      </div>

      {/* New Review Form */}
      <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
        <div className="mb-4">
          <Rating
            value={newReview.rating}
            onChange={(_, value) => setNewReview(prev => ({ ...prev, rating: value }))}
          />
        </div>
        <div className="mb-4">
          <textarea
            value={newReview.comment}
            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="Write your review here..."
            className="w-full p-2 border rounded-md"
            rows="4"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Submit Review
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.review_id} className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {review.user.profile_picture && (
                  <img
                    src={review.user.profile_picture}
                    alt={review.user.username}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold">{review.user.username}</p>
                  <Rating value={review.rating} readOnly size="small" />
                </div>
              </div>
              {review.user_id === userId && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteReview(review.review_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <p className="mt-2 text-gray-700">{review.comment}</p>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
