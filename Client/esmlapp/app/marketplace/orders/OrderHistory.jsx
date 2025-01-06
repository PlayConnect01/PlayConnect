import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../../../Api";
import PageContainer from '../../components/PageContainer';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrderHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.user_id;

      if (!token || !userId) {
        throw new Error('Please login to view order history');
      }

      const response = await fetch(`${BASE_URL}/orderHistory/history/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order history');
      }

      const data = await response.json();
      setOrders(data.orders); 
    } catch (error) {
      console.error('Error fetching order history:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('userToken');

      const response = await fetch(`${BASE_URL}/orderHistory/update/${orderId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      await fetchOrderHistory(); 
      Alert.alert('Success', 'Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', error.message);
    } finally {
      setUpdating(false);
    }
  };

  const updateItemQuantity = async (orderId, orderItemId, newQuantity) => {
    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('userToken');

      const response = await fetch(`${BASE_URL}/orderHistory/update/${orderId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [{
            order_item_id: orderItemId,
            quantity: newQuantity
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update item quantity');
      }

      await fetchOrderHistory(); 
      Alert.alert('Success', 'Item quantity updated successfully');
    } catch (error) {
      console.error('Error updating item quantity:', error);
      Alert.alert('Error', error.message);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#F6E05E'; 
      case 'processing':
        return '#4299E1'; 
      case 'completed':
        return '#48BB78'; 
      case 'cancelled':
        return '#F56565'; 
      default:
        return '#A0AEC0'; 
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'clock-o';
      case 'processing':
        return 'cog';
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'times-circle';
      default:
        return 'question-circle';
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading || updating) {
    return (
      <PageContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4FA5F5" />
        </View>
      </PageContainer>
    );
  }

  const renderStatusOptions = (order) => {
    if (order.status === 'completed' || order.status === 'cancelled') {
      return null;
    }

    const statuses = ['pending', 'processing', 'completed', 'cancelled'];
    return (
      <View style={styles.statusOptions}>
        {statuses.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusOption,
              order.status === status && styles.statusOptionSelected
            ]}
            onPress={() => updateOrderStatus(order.order_id, status)}
          >
            <Text style={[
              styles.statusOptionText,
              order.status === status && styles.statusOptionTextSelected
            ]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <PageContainer>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Order History</Text>
        {orders.length === 0 ? (
          <Text style={styles.emptyText}>No orders found</Text>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order.order_id}
              style={styles.orderCard}
              onPress={() => setExpandedOrder(
                expandedOrder === order.order_id ? null : order.order_id
              )}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>Order #{order.order_id}</Text>
                  <Text style={styles.orderDate}>
                    {formatDate(order.created_at)}
                  </Text>
                </View>
                <View style={styles.statusContainer}>
                  <FontAwesome
                    name={getStatusIcon(order.status)}
                    size={16}
                    color={getStatusColor(order.status)}
                    style={styles.statusIcon}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(order.status) }
                    ]}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                </View>
              </View>

              {expandedOrder === order.order_id && (
                <View style={styles.orderDetails}>
                  {renderStatusOptions(order)}
                  <View style={styles.divider} />
                  {order.items.map((item) => (
                    <View key={item.order_item_id} style={styles.itemContainer}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.product.name}</Text>
                        <Text style={styles.itemDescription}>{item.product.description}</Text>
                      </View>
                      <View style={styles.itemDetails}>
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                          <View style={styles.quantityControls}>
                            <TouchableOpacity
                              onPress={() => updateItemQuantity(
                                order.order_id,
                                item.order_item_id,
                                Math.max(1, item.quantity - 1)
                              )}
                              style={styles.quantityButton}
                            >
                              <Text>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.itemQuantity}>{item.quantity}</Text>
                            <TouchableOpacity
                              onPress={() => updateItemQuantity(
                                order.order_id,
                                item.order_item_id,
                                item.quantity + 1
                              )}
                              style={styles.quantityButton}
                            >
                              <Text>+</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        <Text style={styles.itemPrice}>
                          ${item.subtotal.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                  <View style={styles.divider} />
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalAmount}>
                      ${order.total_amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginTop: 32,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#4FA5F5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#718096',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    marginBottom: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F7FAFF',
  },
  statusOptionSelected: {
    backgroundColor: '#4FA5F5',
  },
  statusOptionText: {
    fontSize: 12,
    color: '#4A5568',
  },
  statusOptionTextSelected: {
    color: '#FFFFFF',
  },
  orderDetails: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  itemDescription: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  itemDetails: {
    alignItems: 'flex-end',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  quantityButton: {
    width: 24,
    height: 24,
    backgroundColor: '#F7FAFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#718096',
    marginHorizontal: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#48BB78',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#48BB78',
  },
});

export default OrderHistory;