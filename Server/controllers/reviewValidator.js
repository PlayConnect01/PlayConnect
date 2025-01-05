// validators/reviewValidator.js
 const validateReview = ({ rating, comment }) => {
    // Validate rating
    if (!rating || typeof rating !== 'number') {
      return 'Rating is required and must be a number';
    }
  
    if (rating < 1 || rating > 5) {
      return 'Rating must be between 1 and 5';
    }
  
    // Validate comment (optional)
    if (comment && typeof comment !== 'string') {
      return 'Comment must be a string';
    }
  
    if (comment && comment.length > 1000) {
      return 'Comment must be less than 1000 characters';
    }
  
    return null;
  };

  module.exports = { validateReview };