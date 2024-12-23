
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


async   function processPayment(req, res) {
    try {
      const { userId, amount, items } = req.body;
      
      console.log('Processing payment for user:', userId);

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: { userId }
      });

      // Create order record
      const order = await prisma.order.create({
        data: {
          user_id: parseInt(userId),
          total_amount: amount,
          status: 'pending',
          payment_intent_id: paymentIntent.id
        }
      });

      console.log('Created payment intent:', paymentIntent.id);
      
      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        orderId: order.order_id
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      res.status(500).json({ error: 'Payment processing failed' });
    }
  }

  async function  confirmPayment(req, res) {
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

  module.exports = {
    processPayment,confirmPayment
 }