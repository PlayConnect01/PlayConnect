const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(bodyParser.json());

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: 'ahmedboukottaya@zohomail.com',
    pass: '53nDUtDC4CKF',
  },
});

// In-memory store for codes (for demonstration purposes)
const recoveryCodes = {};

// Send recovery code via email
const sendCode = async (req, res) => {
  const { email } = req.body;
  const code = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit code

  try {
    // Verify email exists in the database
    const user = await prisma.user.findUnique({
      where: { email },
      select: { username: true }, // Select only the username
    });

    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Store the code with the email as key
    recoveryCodes[email] = code;

    const mailOptions = {
      from: 'ahmedboukottaya@zohomail.com',
      to: email,
  
      subject: '🔒 Password Recovery Code',
      text: `Hello ${user.username},
    
    We have received a request to reset your password. Please use the following recovery code to proceed with resetting your password:
    
    **${code}**
    
    If you did not request a password reset, please disregard this email. Your account security is important to us.
    
    Thank you for your attention.
    
    Best regards,
    The Support Team`,
    };


    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email', error });
      }
      res.status(200).json({ message: 'Recovery code sent successfully via email' });
    });
  } catch (error) {
    console.error('Error sending code:', error);
    res.status(500).json({ message: 'Failed to send recovery code' });
  }
};

// Verify the recovery code
const verifyCode = (req, res) => {
  const { email, code } = req.body;

  try {
    if (recoveryCodes[email] === parseInt(code)) {
      // Code is valid
      delete recoveryCodes[email]; // Remove the code after successful verification
      res.status(200).json({ message: 'Code verified successfully' });
    } else {
      // Code is invalid
      res.status(400).json({ message: 'Invalid recovery code' });
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update password
const updatePassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database using Prisma
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Failed to update password' });
  }
};

// Export all functions
module.exports = {
  sendCode,
  verifyCode,
  updatePassword,
};