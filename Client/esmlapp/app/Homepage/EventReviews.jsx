import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../../Api';
import CustomAlert from '../../Alerts/CustomAlert';

const EventReviews = ({ eventId, navigation, userJoined, userId }) => {
  const [reviews, setReviews] = useState([]);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewStars, setNewReviewStars] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [eventId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/review/events/${eventId}/reviews`);
      setReviews(response.data.reviews);
      setAverageRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
    } catch (error) {
      setAlertTitle('Error');
      setAlertMessage('Unable to load reviews');
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReviewPress = () => {
    if (!userId) {
      setAlertTitle('Error');
      setAlertMessage('Please log in to submit a review');
      setAlertVisible(true);
      return;
    }

    if (!userJoined) {
      setAlertTitle('Notice');
      setAlertMessage('Only participants can write reviews');
      setAlertVisible(true);
      return;
    }

    const hasAlreadyReviewed = reviews.some(review => review.user_id === userId);
    if (hasAlreadyReviewed) {
      setAlertTitle('Notice');
      setAlertMessage('You have already reviewed this event');
      setAlertVisible(true);
      return;
    }

    setIsReviewModalVisible(true);
  };

  const handleReviewSubmit = async () => {
    if (newReviewStars === 0) {
      setAlertTitle('Error');
      setAlertMessage('Please select a star rating');
      setAlertVisible(true);
      return;
    }

    if (!newReviewText.trim()) {
      setAlertTitle('Error');
      setAlertMessage('Please write a review');
      setAlertVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${BASE_URL}/review/events/${eventId}/reviews`, {
        userId,
        rating: newReviewStars,
        comment: newReviewText.trim()
      });

      setNewReviewText('');
      setNewReviewStars(0);
      setIsReviewModalVisible(false);
      fetchReviews();
      setAlertTitle('Success');
      setAlertMessage('Review submitted successfully');
      setAlertVisible(true);
    } catch (error) {
      setAlertTitle('Error');
      setAlertMessage('Failed to submit review');
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    setAlertTitle('Delete Review');
    setAlertMessage('Are you sure you want to delete this review?');
    setAlertVisible(true);
    const deleteReview = async () => {
      try {
        await axios.delete(`${BASE_URL}/review/events/${eventId}/reviews/${reviewId}`);
        fetchReviews();
        setAlertTitle('Success');
        setAlertMessage('Review deleted successfully');
        setAlertVisible(true);
      } catch (error) {
        setAlertTitle('Error');
        setAlertMessage('Failed to delete review');
        setAlertVisible(true);
      }
    };
    const handleAlertPress = (buttonIndex) => {
      if (buttonIndex === 1) {
        deleteReview();
      }
    };
    const alertButtons = [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: handleAlertPress },
    ];
  };

  const renderStars = (rating) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text
          key={star}
          style={[styles.star, { color: star <= rating ? '#FFD700' : '#CCCCCC' }]}
        >
          ★
        </Text>
      ))}
    </View>
  );

  if (isLoading && !reviews.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0095FF" />
      </View>
    );
  }

  const hasUserReviewed = reviews.some(review => review.user_id === userId);

  return (
    <View style={styles.container}>
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
      <View style={styles.header}>
        <Text style={styles.title}>Reviews ({totalReviews})</Text>
        <View style={styles.ratingInfo}>
          {renderStars(averageRating)}
          <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
        </View>
      </View>

      {reviews.map((review) => (
        <View key={review.review_id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <TouchableOpacity
              onPress={() => navigation.navigate('profile/UserProfilePage', { userId: review.user_id })}
              style={styles.userInfo}
            >
              <Ionicons name="person-circle" size={40} color="#0095FF" />
              <Text style={styles.username}>{review.user.username}</Text>
            </TouchableOpacity>
            {renderStars(review.rating)}
          </View>

          <Text style={styles.reviewText}>{review.comment}</Text>

          {review.user_id === userId && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteReview(review.review_id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {!hasUserReviewed && (
        <TouchableOpacity
          style={[styles.addReviewButton, !userJoined && styles.disabledButton]}
          onPress={handleAddReviewPress}
        >
          <Text style={styles.addReviewButtonText}>
            {userJoined ? 'Write a Review' : 'Join Event to Review'}
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={isReviewModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write a Review</Text>

            <View style={styles.starSelection}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setNewReviewStars(star)}
                >
                  <Text
                    style={[styles.star, { color: star <= newReviewStars ? '#FFD700' : '#CCCCCC' }]}
                  >
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              value={newReviewText}
              onChangeText={setNewReviewText}
              placeholder="Share your experience..."
              multiline
              numberOfLines={4}
              maxLength={500}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsReviewModalVisible(false);
                  setNewReviewText('');
                  setNewReviewStars(0);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleReviewSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageRating: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 24,
    marginHorizontal: 2,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reviewHeader: {
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reviewText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
  },
  deleteButton: {
    alignSelf: 'flex-end',
    marginTop: 12,
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addReviewButton: {
    backgroundColor: '#0095FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  addReviewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  starSelection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#0095FF',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default EventReviews;