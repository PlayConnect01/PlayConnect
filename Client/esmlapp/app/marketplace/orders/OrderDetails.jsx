import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from "../../../Api";

const OrderDetails = ({ route, navigation }) => {
  const { orderId } = route?.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/orders/${orderId}`);
      
      // Fetch product details for each item
      if (response.data?.items) {
        const itemsWithProducts = await Promise.all(
          response.data.items.map(async (item) => {
            try {
              const productResponse = await axios.get(`${BASE_URL}/product/products/${item.product_id}`);
              return {
                ...item,
                product: {
                  ...item.product,
                  ...productResponse.data,
                  image_url: productResponse.data.image_url || 
                           productResponse.data.image || 
                           'https://res.cloudinary.com/sportsmate/image/upload/v1705330085/placeholder-image.jpg'
                }
              };
            } catch (error) {
              console.error(`Error fetching product ${item.product_id}:`, error.message);
              return {
                ...item,
                product: {
                  ...item.product,
                  image_url: 'https://res.cloudinary.com/sportsmate/image/upload/v1705330085/placeholder-image.jpg'
                }
              };
            }
          })
        );
        response.data.items = itemsWithProducts;
      }
      
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#4CAF50';
      case 'processing':
        return '#4FA5F5';
      case 'cancelled':
        return '#F44336';
      default:
        return '#6B7280';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4FA5F5" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <FontAwesome5 name="exclamation-circle" size={50} color="#F44336" />
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <FontAwesome5 name="arrow-left" size={20} color="#4FA5F5" />
      </TouchableOpacity>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Order Details</Text>

        <View style={styles.orderCard}>
          <View style={styles.headerTop}>
            <Text style={styles.orderId}>Order #{orderId}</Text>
            <View style={[styles.statusContainer, { backgroundColor: getStatusColor(order.status) + '15' }]} >
              <FontAwesome5 
                name={order.status === 'completed' ? 'check-circle' : 'clock'} 
                size={16} 
                color={getStatusColor(order.status)}
                style={styles.statusIcon}
              />
              <Text style={[styles.status, { color: getStatusColor(order.status) }]} >
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.date} >
            Placed on {formatDate(order.created_at)}
          </Text>
        </View>

        <View style={styles.section} >
          <Text style={styles.sectionTitle} >Items</Text>
          {order?.items?.map((item, index) => (
            <View key={index} style={styles.itemCard} >
              <View style={styles.itemImageContainerNew} >
                <Image
                  source={{ 
                    uri: item?.product?.image_url || 
                         item?.product?.image || 
                         'https://res.cloudinary.com/sportsmate/image/upload/v1705330085/placeholder-image.jpg'
                  }}
                  style={styles.itemImageNew}
                  resizeMode="cover"
                  onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
                />
              </View>
              <View style={styles.itemDetails} >
                <Text style={styles.itemName} >{item?.product?.name || 'Unknown Product'}</Text>
                <Text style={styles.itemQuantity} >Quantity: {item?.quantity || 0}</Text>
                <Text style={styles.itemPrice} >${(item?.price || 0).toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.summaryContainer} >
          <View style={styles.summaryRow} >
            <Text style={styles.summaryLabel} >Items Total</Text>
            <Text style={styles.summaryValue} >
              ${(order?.total_amount || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow} >
            <Text style={styles.summaryLabel} >Delivery Fee</Text>
            <Text style={styles.summaryValue} >$0.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]} >
            <Text style={styles.totalLabel} >Total Amount</Text>
            <Text style={styles.totalValue} >
              ${(order?.total_amount || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('Cart', { orderId })}
        >
          <View style={styles.buttonContent} >
            <FontAwesome5 name="history" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.continueButtonText} >View History & Comments</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 80, // Add padding for navbar
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 24,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusIcon: {
    marginRight: 6,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  itemImageContainerNew: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  itemImageNew: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F8FAFF',
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4FA5F5',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEF2FF',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4FA5F5',
  },
  continueButton: {
    backgroundColor: '#4FA5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default OrderDetails;