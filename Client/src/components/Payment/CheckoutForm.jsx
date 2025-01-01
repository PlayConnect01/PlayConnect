import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Initialize Stripe
let stripePromise;
const getStripe = async () => {
  if (!stripePromise) {
    const { data } = await axios.get('/api/payment/config');
    stripePromise = loadStripe(data.publishableKey);
  }
  return stripePromise;
};

// Checkout Form Component
const CheckoutForm = ({ orderId, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!stripe || !elements) {
        throw new Error('Stripe has not been initialized');
      }

      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (paymentError) {
        throw paymentError;
      }

      if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        navigate('/orders');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Complete Your Purchase</h2>
        <p className="text-gray-600">Amount to pay: ${amount}</p>
      </div>

      <PaymentElement className="mb-6" />

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !stripe}
        className={`w-full py-2 px-4 rounded ${
          isLoading
            ? 'bg-gray-400'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white font-semibold transition-colors`}
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

// Wrapper component to handle Stripe initialization
export const PaymentWrapper = ({ clientSecret, orderId, amount }) => {
  const [stripe, setStripe] = useState(null);

  useEffect(() => {
    const initStripe = async () => {
      const stripeInstance = await getStripe();
      setStripe(stripeInstance);
    };
    initStripe();
  }, []);

  if (!stripe || !clientSecret) {
    return <div>Loading payment form...</div>;
  }

  return (
    <Elements stripe={stripe} options={{ clientSecret }}>
      <CheckoutForm orderId={orderId} amount={amount} />
    </Elements>
  );
};

export default PaymentWrapper;
