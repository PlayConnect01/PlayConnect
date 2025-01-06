import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../../../Api";

const OrdersScreen = ({ route, navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { orderId: highlightedOrderId } = route.params || {};

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        console.error('No user data found');
        setOrders([]);
        return;
      }

      const userData = JSON.parse(userDataString);
      const userId = userData.user_id;

      if (!userId) {
        console.error('No user ID found in user data');
        setOrders([]);
        return;
      }

      console.log('Fetching orders for user:', userId);
      const response = await axios.get(`${BASE_URL}/orders/user/${userId}`);
      console.log('Orders response:', response.data);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data || error.message);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
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

  const renderOrderItem = ({ item }) => {
    const isHighlighted = item.order_id === highlightedOrderId;

    return (
      <TouchableOpacity
        style={[
          styles.orderCard,
          isHighlighted && styles.highlightedCard
        ]}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item.order_id })}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <Ionicons name="receipt-outline" size={20} color="#4FA5F5" style={styles.orderIcon} />
            <Text style={styles.orderId}>Order #{item.order_id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.orderInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>
              {formatDate(item.created_at)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="wallet-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>
              ${item.total_amount.toFixed(2)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cube-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>
              {item.items?.length || 0} items
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FA5F5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#4FA5F5" />
        </TouchableOpacity>

        <Text style={styles.title}>My Orders</Text>

        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.order_id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4FA5F5"
              colors={['#4FA5F5']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt" size={64} color="#4FA5F5" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No orders yet</Text>
              <Text style={styles.emptySubtext}>Your order history will appear here</Text>
            </View>
          }
        />
      </View>
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
  listContainer: {
    padding: 8,
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
  highlightedCard: {
    borderColor: '#4FA5F5',
    borderWidth: 2,
    backgroundColor: '#F8FAFF',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIcon: {
    marginRight: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFF',
    padding: 10,
    borderRadius: 8,
  },
  infoText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#6B7280',
    fontSize: 14,
  },
});

export default OrdersScreen;
