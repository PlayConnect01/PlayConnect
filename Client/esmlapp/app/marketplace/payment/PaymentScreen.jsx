import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { CardField } from '@stripe/stripe-react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from "../../../Api";
import AsyncStorage from '@react-native-async-storage/async-storage';

const PaymentScreen = ({ route, navigation }) => {
  const { cartTotal = 0, deliveryFee = 0, cartItems = [], userDetails: routeUserDetails = {} } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [saveCard, setSaveCard] = useState(false);
  const [userId, setUserId] = useState(null);
  const { confirmPayment } = useStripe();

  // Get user details from AsyncStorage
  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem('userData');
        console.log('AsyncStorage userData:', userDataStr);
        
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          console.log('Parsed user data:', userData);
          
          const id = userData.user_id;
          if (id) {
            console.log('Setting user ID from AsyncStorage:', id);
            setUserId(id);
          } else {
            console.error('No user_id found in userData');
            Alert.alert('Error', 'Please log in to continue with payment');
            navigation.navigate('Login');
          }
        } else {
          console.error('No userData found in AsyncStorage');
          Alert.alert('Error', 'Please log in to continue with payment');
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Error', 'Failed to load user data. Please try logging in again.');
        navigation.navigate('Login');
      }
    };

    getUserDetails();
  }, [navigation]);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Validate cart items
      if (!cartItems || cartItems.length === 0) {
        Alert.alert('Error', 'Your cart is empty');
        return;
      }

      console.log('Cart validation passed:', cartItems);
      console.log('Current userId:', userId);

      // Validate user ID and token
      const userDataStr = await AsyncStorage.getItem('userData');
      const token = await AsyncStorage.getItem('userToken');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const id = userData?.user_id;

      if (!id || !token) {
        Alert.alert('Error', 'Please log in to continue');
        navigation.navigate('Login');
        return;
      }
      setUserId(id);

      console.log('Processing payment with details:', {
        userId: id,
        cartTotal,
        deliveryFee,
        itemCount: cartItems.length
      });

      // Show order summary before proceeding
      const proceed = await new Promise((resolve) => {
        Alert.alert(
          'Confirm Order',
          `Total Amount: $${(cartTotal + deliveryFee).toFixed(2)}\nNumber of Items: ${cartItems.length}\n\nProceed with payment?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(false)
            },
            {
              text: 'Proceed',
              onPress: () => resolve(true)
            }
          ]
        );
      });

      if (!proceed) {
        setLoading(false);
        return;
      }

      // First get Stripe config
      const configResponse = await axios.get(`${BASE_URL}/payments/config`);
      const { publishableKey } = configResponse.data;

      if (!publishableKey) {
        throw new Error('Stripe configuration not available');
      }

      // Prepare items for backend
      const items = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        discount: 0
      }));

      console.log('Sending payment request:', {
        userId,
        amount: cartTotal + deliveryFee,
        items
      });

      // Create payment intent
      const response = await axios.post(`${BASE_URL}/payments/marketplace/process`, {
        userId,
        amount: cartTotal + deliveryFee,
        items
      });

      console.log('Payment intent response:', response.data);

      const { clientSecret, paymentIntentId, orderId, status } = response.data;

      if (!clientSecret || !paymentIntentId) {
        throw new Error('Payment initialization failed');
      }

      // If payment needs confirmation
      if (status !== 'succeeded') {
        console.log('Confirming payment with Stripe...');
        
        // Confirm payment with Stripe
        const { paymentIntent, error } = await confirmPayment(clientSecret, {
          paymentMethodType: 'Card'
        });

        if (error) {
          throw new Error(error.message);
        }

        console.log('Payment confirmed with Stripe, confirming with backend...');

        // Confirm on backend
        const confirmResponse = await axios.post(`${BASE_URL}/payments/confirm`, {
          paymentIntentId: paymentIntent.id
        });

        if (!confirmResponse.data.success) {
          throw new Error('Payment confirmation failed');
        }

        console.log('Payment fully confirmed:', confirmResponse.data);

        // Clear cart and navigate to success
        navigation.reset({
          index: 0,
          routes: [
            { 
              name: 'PaymentSuccess',
              params: {
                amount: cartTotal + deliveryFee,
                orderId
              }
            }
          ],
        });

      } else {
        // Clear cart and navigate to success
        navigation.reset({
          index: 0,
          routes: [
            { 
              name: 'PaymentSuccess',
              params: {
                amount: cartTotal + deliveryFee,
                orderId
              }
            }
          ],
        });
      }

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Failed',
        error.message || 'Something went wrong with your payment'
      );
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'credit-card',
      iconType: 'FontAwesome5'
    },
    {
      id: 'apple',
      name: 'Apple Pay',
      icon: 'apple1',
      iconType: 'AntDesign',
      disabled: true
    },
    {
      id: 'google',
      name: 'Google Pay',
      icon: 'google-pay',
      iconType: 'FontAwesome5',
      disabled: true
    }
  ];

  const renderPaymentMethod = (method) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethod,
        selectedMethod === method.id && styles.selectedMethod,
        method.disabled && styles.disabledMethod
      ]}
      onPress={() => !method.disabled && setSelectedMethod(method.id)}
      disabled={method.disabled}
    >
      <FontAwesome5 
        name={method.icon} 
        size={24} 
        color={method.disabled ? '#ccc' : '#4FA5F5'} 
      />
      <Text style={[
        styles.methodText,
        method.disabled && styles.disabledText
      ]}>
        {method.name}
      </Text>
      {method.disabled && (
        <Text style={styles.comingSoon}>Coming Soon</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Order Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        
        {/* Cart Items */}
        {cartItems && cartItems.map((item, index) => (
          <View key={index} style={styles.cartItemContainer}>
            {item.image && (
              <Image 
                source={{ uri: item.image }} 
                style={styles.itemImage} 
                resizeMode="cover"
              />
            )}
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={styles.itemPriceRow}>
                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                <Text style={styles.itemPrice}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Price Breakdown */}
        <View style={styles.priceBreakdown}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
          </View>
          {/* Tax if applicable */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
        </View>

        {/* Total */}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalText}>Total Amount</Text>
          <Text style={styles.totalAmount}>
            ${(cartTotal + deliveryFee).toFixed(2)}
          </Text>
        </View>

        {/* Estimated Delivery */}
        <View style={styles.deliveryInfo}>
          <MaterialIcons name="local-shipping" size={20} color="#4FA5F5" />
          <Text style={styles.deliveryText}>
            Estimated delivery: 2-4 business days
          </Text>
        </View>
      </View>

      {/* Payment Methods */}
      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.methodsContainer}>
        {paymentMethods.map(renderPaymentMethod)}
      </View>

      {/* Card Input */}
      {selectedMethod === 'card' && (
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Card Details</Text>
            <View style={styles.secureChip}>
              <MaterialIcons name="lock" size={14} color="#4FA5F5" />
              <Text style={styles.secureText}>Secure</Text>
            </View>
          </View>

          <View style={styles.cardPreview}>
            <View style={styles.cardPreviewInner}>
              <MaterialIcons name="credit-card" size={24} color="#4FA5F5" />
              <Text style={styles.cardPreviewText}>
                {cardDetails?.complete ? '•••• •••• •••• ' + (cardDetails?.last4 || '****') : 'Enter card details'}
              </Text>
            </View>
          </View>

          <View style={styles.cardFieldContainer}>
            <CardField
              postalCodeEnabled={true}
              placeholder={{
                number: '4242 4242 4242 4242',
                expiry: 'MM/YY',
                cvc: 'CVC',
                postalCode: 'ZIP',
              }}
              cardStyle={styles.cardStyle}
              style={styles.cardField}
              onCardChange={(details) => {
                setCardDetails(details);
                console.log('Card Details:', details); // Debugging log
                if (details?.complete) {
                  // Add subtle animation or feedback here
                }
              }}
            />
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.cardInfoRow}>
              <MaterialIcons name="info-outline" size={16} color="#6B7280" />
              <Text style={styles.cardInfoText}>
                We accept Visa, Mastercard, and American Express
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.saveCardRow}
            onPress={() => setSaveCard(!saveCard)}
          >
            <View style={styles.checkboxContainer}>
              <MaterialIcons
                name={saveCard ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color="#4FA5F5"
              />
            </View>
            <View style={styles.saveCardTextContainer}>
              <Text style={styles.saveCardText}>
                Save card for future payments
              </Text>
              <Text style={styles.saveCardSubtext}>
                Securely store your card with our payment provider
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Pay Button */}
      <TouchableOpacity
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.payButtonText}>
              Pay ${(cartTotal + deliveryFee).toFixed(2)}
            </Text>
            <MaterialIcons name="lock" size={20} color="#fff" />
          </>
        )}
      </TouchableOpacity>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <MaterialIcons name="security" size={20} color="#666" />
        <Text style={styles.securityText}>
          Your payment information is secure and encrypted
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 24,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#4FA5F5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  cartItemContainer: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4FA5F5',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(79, 165, 245, 0.1)',
    marginVertical: 16,
  },
  priceBreakdown: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(79, 165, 245, 0.1)',
    marginTop: 8,
    paddingTop: 16,
    marginHorizontal: -4,
    paddingHorizontal: 4,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4FA5F5',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  deliveryText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  methodsContainer: {
    marginBottom: 24,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#4FA5F5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  selectedMethod: {
    borderColor: '#4FA5F5',
    borderWidth: 2,
    backgroundColor: 'rgba(79, 165, 245, 0.05)',
    transform: [{ scale: 1.02 }],
  },
  disabledMethod: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  methodText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
  },
  disabledText: {
    color: '#9CA3AF',
  },
  comingSoon: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#4FA5F5',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  secureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 165, 245, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  secureText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#4FA5F5',
  },
  cardPreview: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardPreviewInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardPreviewText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
    letterSpacing: 1,
  },
  cardFieldContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  cardStyle: {
    backgroundColor: '#F9FAFB',
    textColor: '#1F2937',
    placeholderColor: '#9CA3AF',
    borderWidth: 0,
    borderRadius: 12,
    fontSize: 16,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 4,
  },
  cardInfo: {
    marginBottom: 20,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardInfoText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  saveCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 165, 245, 0.04)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 165, 245, 0.1)',
  },
  checkboxContainer: {
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    shadowColor: '#4FA5F5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  saveCardTextContainer: {
    flex: 1,
  },
  saveCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 2,
  },
  saveCardSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  payButton: {
    backgroundColor: '#4FA5F5',
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4FA5F5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    transform: [{ scale: 1 }],
  },
  payButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#93C5F8',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(79, 165, 245, 0.05)',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  securityText: {
    marginLeft: 8,
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});

export default PaymentScreen;
