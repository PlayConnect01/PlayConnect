const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Ensure you have your Stripe secret key in your environment variables

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

async function confirmPayment(req, res) {
  try {
    const { paymentIntentId } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Update order status
      await prisma.order.update({
        where: { payment_intent_id: paymentIntentId },
        data: { status: 'completed' }
      });

      console.log('Payment confirmed:', paymentIntentId);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Payment not successful' });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
}

async function getConfig(req, res) {
  try {
    res.json({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error('Config retrieval error:', error);
    res.status(500).json({ error: 'Failed to get payment configuration' });
  }
}

module.exports = {
  processPayment,
  confirmPayment,
  getConfig
}

