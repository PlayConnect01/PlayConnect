import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PaymentWrapper } from '../Payment/CheckoutForm';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const navigate = useNavigate();

  // Fetch cart items
  const fetchCartItems = async () => {
    try {
      const { data } = await axios.get('/api/cart');
      setCartItems(data.items);
    } catch (err) {
      setError('Failed to load cart items');
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  // Calculate total
  const total = cartItems.reduce((sum, item) => {
    return sum + (item.product.price * (1 - item.product.discount) * item.quantity);
  }, 0);

  // Handle quantity update
  const updateQuantity = async (itemId, newQuantity) => {
    try {
      await axios.put(`/api/cart/item/${itemId}`, { quantity: newQuantity });
      fetchCartItems();
      toast.success('Cart updated');
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };

  // Handle item removal
  const removeItem = async (itemId) => {
    try {
      await axios.delete(`/api/cart/item/${itemId}`);
      fetchCartItems();
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  // Initialize payment
  const initializePayment = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/payment/marketplace', {
        userId: localStorage.getItem('userId') // Ensure you have the user ID stored
      });

      if (data.success) {
        setPaymentIntent({
          clientSecret: data.clientSecret,
          orderId: data.orderId,
          amount: data.orderDetails.total
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (paymentIntent) {
    return (
      <PaymentWrapper 
        clientSecret={paymentIntent.clientSecret}
        orderId={paymentIntent.orderId}
        amount={paymentIntent.amount}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Your cart is empty</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.cart_item_id} className="flex items-center p-4 bg-white rounded-lg shadow">
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="ml-4 flex-grow">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-gray-600">
                    ${item.product.price * (1 - item.product.discount)}
                    {item.product.discount > 0 && (
                      <span className="ml-2 line-through text-gray-400">
                        ${item.product.price}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.cart_item_id, parseInt(e.target.value))}
                    className="p-2 border rounded"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeItem(item.cart_item_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total:</span>
              <span className="text-xl font-bold">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={initializePayment}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
