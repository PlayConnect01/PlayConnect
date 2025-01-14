import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  TextInput,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { Rating } from 'react-native-ratings';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../Api';
import * as Haptics from 'expo-haptics';

const styles = StyleSheet.create({
  reviewsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderRadius: 25,
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F7FAFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
  },
  addReviewButton: {
    backgroundColor: '#4FA5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addReviewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewsList: {
    maxHeight: 400,
  },
  reviewItem: {
    backgroundColor: '#F7FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#718096',
  },
  reviewRating: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  noReviewsText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginVertical: 24,
    backgroundColor: '#F7FAFF',
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
  },
  ratingContainer: {
    marginBottom: 20,
    backgroundColor: '#F7FAFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 8,
    fontWeight: '500',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  reviewInput: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 14,
    color: '#2D3748',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  submitButton: {
    backgroundColor: '#4FA5F5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#4FA5F5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
});

const ReviewSection = ({ 
  productId, 
  reviews, 
  averageRating, 
  totalReviews, 
  userId,
  onReviewsUpdate,
  showNotification,
  navigation 
}) => {
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [userReview, setUserReview] = useState('');
  const [rating, setRating] = useState(5);
  const [editingReview, setEditingReview] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [localReviews, setLocalReviews] = useState(reviews || []);

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' });
    }, 2500);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setUserReview(review.comment);
    setRating(review.rating);
    setReviewModalVisible(true);
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/marketplacereview/product/${productId}`);
      setLocalReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showToast('Failed to load reviews', 'error');
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleAddReview = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token || !userId) {
        showToast('Please login to write a review', 'error');
        navigation.navigate('Login');
        return;
      }

      if (!userReview.trim()) {
        showToast('Please write a review comment', 'warning');
        return;
      }

      if (rating < 1 || rating > 5) {
        showToast('Rating must be between 1 and 5', 'warning');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const reviewData = {
        product_id: productId,
        user_id: parseInt(userId),
        rating: rating,
        comment: userReview.trim()
      };

      if (editingReview) {
        await axios.put(`${BASE_URL}/marketplacereview/${editingReview.review_id}`, reviewData, config);
        showToast('Review updated successfully', 'success');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await axios.post(`${BASE_URL}/marketplacereview`, reviewData, config);
        showToast('Review added successfully', 'success');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setReviewModalVisible(false);
      setUserReview('');
      setRating(5);
      setEditingReview(null);
      
      // Fetch updated reviews
      fetchReviews();
      if (onReviewsUpdate) {
        onReviewsUpdate();
      }
    } catch (error) {
      console.error('Error saving review:', error);
      showToast(error.response?.data?.error || 'Failed to save review', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        showToast('Please login to delete a review', 'error');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.delete(`${BASE_URL}/marketplacereview/${reviewId}`, config);
      showToast('Review deleted successfully', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Fetch updated reviews
      fetchReviews();
      if (onReviewsUpdate) {
        onReviewsUpdate();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast('Failed to delete review', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <View>
      <View style={styles.reviewsSection}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.reviewsTitle}>Reviews</Text>
          {(!localReviews.some(review => review.user_id === parseInt(userId))) && (
            <TouchableOpacity
              style={styles.addReviewButton}
              onPress={() => {
                if (!userId) {
                  showToast('Please login to write a review', 'error');
                  navigation.navigate('Login');
                  return;
                }
                setReviewModalVisible(true);
              }}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
              <Text style={styles.addReviewButtonText}>Write Review</Text>
            </TouchableOpacity>
          )}
        </View>

        {localReviews.length === 0 ? (
          <View style={styles.noReviewsText}>
            <Text>No reviews yet. Be the first to review!</Text>
          </View>
        ) : (
          localReviews.map((review) => (
            <View key={review.review_id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Image
                  source={
                    review.user?.profile_picture
                      ? { uri: review.user.profile_picture }
                      : { uri: 'https://ui-avatars.com/api/?name=' + (review.user?.username || 'User') }
                  }
                  style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                />
                <View style={styles.reviewerInfo}>
                  <Text style={styles.reviewerName}>{review.user?.username || 'Anonymous'}</Text>
                  <Rating
                    readonly
                    startingValue={review.rating}
                    imageSize={16}
                  />
                  <Text style={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
                {parseInt(userId) === review.user_id && (
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      style={{ padding: 5, marginLeft: 10 }}
                      onPress={() => handleEditReview(review)}
                    >
                      <MaterialIcons name="edit" size={20} color="#4FA5F5" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ padding: 5, marginLeft: 10 }}
                      onPress={() => handleDeleteReview(review.review_id)}
                    >
                      <MaterialIcons name="delete" size={20} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <Text style={styles.reviewText}>{review.comment}</Text>
            </View>
          ))
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={reviewModalVisible}
        onRequestClose={() => {
          setReviewModalVisible(false);
          setUserReview('');
          setRating(5);
          setEditingReview(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingReview ? 'Edit Review' : 'Write a Review'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setReviewModalVisible(false);
                  setUserReview('');
                  setRating(5);
                  setEditingReview(null);
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.ratingContainer}>
              <Rating
                startingValue={rating}
                onFinishRating={(value) => setRating(value)}
                style={{ paddingVertical: 10 }}
                imageSize={35}
              />
            </View>

            <TextInput
              style={styles.reviewInput}
              multiline
              numberOfLines={4}
              value={userReview}
              onChangeText={setUserReview}
              placeholder="Write your review here..."
              placeholderTextColor="#666"
            />
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddReview}
            >
              <Text style={styles.submitButtonText}>
                {editingReview ? 'Update' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ReviewSection;
