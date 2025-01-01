const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Payment Processing
const processPayment = async (req, res) => {
  try {
    const { userId, amount, items } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    console.log('Processing payment:', { userId, amount, items });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: { 
        userId,
        eventId: items[0].eventId
      }
    });

    const order = await prisma.order.create({
      data: {
        user_id: parseInt(userId),
        total_amount: amount,
        status: 'pending',
        payment_intent_id: paymentIntent.id
      }
    });

    console.log('Payment intent created:', paymentIntent.id);
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ 
      error: 'Payment processing failed',
      details: error.message 
    });
  }
};

// Payment Confirmation
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID is required'
      });
    }

    console.log('Confirming payment:', paymentIntentId);
    
    // First check if order exists
    const order = await prisma.order.findFirst({
      where: { payment_intent_id: paymentIntentId }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Then check payment status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Update order status
      const updatedOrder = await prisma.order.update({
        where: { order_id: order.order_id },
        data: { 
          status: 'completed'
        }
      });

      console.log('Payment confirmed and order updated:', updatedOrder);

      res.json({
        success: true,
        order: {
          orderId: updatedOrder.order_id,
          status: updatedOrder.status
        }
      });
    } else {
      console.log('Payment not successful:', paymentIntent.status);
      res.status(400).json({
        success: false,
        error: 'Payment not successful',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment',
      details: error.message
    });
  }
};

// Get Stripe configuration
const getConfig = async (req, res) => {
  try {
    res.json({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error('Config retrieval error:', error);
    res.status(500).json({ error: 'Failed to get payment configuration' });
  }
}

// Process marketplace payment
const processMarketplacePayment = async (req, res) => {
  try {
    const { userId, amount, items } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    if (!items || !items.length) {
      return res.status(400).json({ error: 'No items provided' });
    }

    console.log('Processing marketplace payment:', { userId, amount, items });

    // Create payment intent with automatic confirmation
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method_types: ['card'],
      payment_method: 'pm_card_visa', // Test card
      confirm: true, // Automatically confirm the payment
      metadata: { 
        userId,
        orderType: 'marketplace',
        itemCount: items.length.toString()
      }
    });

    // Create order and order items in transaction
    const order = await prisma.$transaction(async (prisma) => {
      // Create the order
      const newOrder = await prisma.order.create({
        data: {
          user_id: parseInt(userId),
          total_amount: amount,
          status: 'pending',
          payment_intent_id: paymentIntent.id,
          order_items: {
            create: items.map(item => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price_at_time: item.price,
              discount_at_time: item.discount || 0
            }))
          }
        }
      });

      // Clear the cart after order creation
      await prisma.cartItem.deleteMany({
        where: {
          cart: {
            user_id: parseInt(userId)
          }
        }
      });

      return newOrder;
    });

    console.log('Marketplace order created:', order);
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: order.order_id,
      status: paymentIntent.status
    });
  } catch (error) {
    console.error('Marketplace payment error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Payment processing failed',
      details: error.message 
    });
  }
};

module.exports = {
  processPayment,
  confirmPayment,
  getConfig,
  processMarketplacePayment
};
