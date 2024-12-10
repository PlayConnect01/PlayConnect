const nodemailer = require('nodemailer');
const db = require('../database');
const jwt = require('jsonwebtoken');


const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: 'ahmedboukottaya@zohomail.com',
      pass: '53nDUtDC4CKF'
    }
  })
  
  const confirmOrder = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const { id: userId } = jwt.verify(token, 'ascefbth,plnihcdxuwy');
        const user = await db.user.findOne({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const cart = await db.cart.findOne({
            where: { UserId: userId },
            include: [{ model: db.products, attributes: ['id', 'title', 'price', 'image'], through: { attributes: ['quantity', 'priceAtPurchase'] } }]
        });

        if (!cart?.Products?.length) return res.status(400).json({ message: 'Cart is empty' });

        await transporter.sendMail({
            from: 'ahmedboukottaya@zohomail.com',
            to: user.email,
            subject: 'Order Confirmation - Meta Fashion',
            html: `
                <h1>Order Confirmation</h1>
                <p>Dear ${user.firstName || 'Customer'},</p>
                <p>Thank you for your order!</p>
                <table>
                    <tr><th>Product</th><th>Quantity</th><th>Price</th></tr>
                    ${cart.Products.map(product => `
                        <tr>
                            <td>${product.title}</td>
                            <td>${product.CartProducts.quantity}</td>
                            <td>${product.CartProducts.priceAtPurchase} ETH</td>
                        </tr>
                    `).join('')}
                </table>
                <p>Total Items: ${cart.totalItems}</p>
                <p>Total Amount: ${cart.totalAmount} ETH</p>
            `
        });

        cart.totalItems = 0;
        cart.totalAmount = 0;
        await cart.save();

        res.status(200).json({ message: 'Order confirmed and email sent' });
    } catch (error) {
        console.error('Failed to process order:', error);
        res.status(500).json({ message: 'Failed to process order', error: error.message });
    }
};
  module.exports = { confirmOrder }