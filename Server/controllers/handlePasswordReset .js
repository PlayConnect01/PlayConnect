const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();
const prismaClient = new PrismaClient();

// In-memory store for reset codes (use something like Redis in production)
const resetCodes = new Map();

// Set up the email transporter with Zoho SMTP details
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER, // Ensure this is set in your .env file
    pass: process.env.EMAIL_PASS  // Ensure this is set in your .env file
  }
});

// Helper function for email validation
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Controller 1: Send Password Reset Code to Email
const sendPasswordResetCode = async (req, res) => {
  const { email } = req.body;

  // Basic email validation
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    // Check if the user exists
    const user = await prismaClient.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ message: 'No user found with this email' });
    }

    // Generate a random 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code

    // Store the verification code and expiration time temporarily in memory
    const resetData = {
      code: verificationCode,
      expiresAt: new Date(Date.now() + 3600000) // Valid for 1 hour
    };

    // Store the reset code temporarily (for example, in-memory or in a database)
    resetCodes.set(email, resetData);

    // Send the reset code via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Code',
      html: `
        <h1>Password Reset Request</h1>
        <p>We received a request to reset your password. Please use the following code to reset your password:</p>
        <h2>${verificationCode}</h2>
        <p>This code will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `
    });

    return res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error in sending password reset email:', error);
    return res.status(500).json({ message: 'Failed to send password reset email', error: error.message });
  }
};

// Controller 2: Update Password after Verification
const updatePassword = async (req, res) => {
  const { email, verificationCode, newPassword, confirmPassword } = req.body;

  // Basic email validation
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Validate that the password meets the criteria
  if (newPassword && !isValidPassword(newPassword)) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    // Retrieve the stored reset code and expiration time from memory
    const resetData = resetCodes.get(email);

    if (!resetData) {
      return res.status(400).json({ message: 'No password reset request found for this email' });
    }

    // Check if the verification code matches and has not expired
    if (resetData.code !== parseInt(verificationCode)) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (new Date() > new Date(resetData.expiresAt)) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    // Validate that passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await prismaClient.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    // Clear the reset data from memory after successful password update
    resetCodes.delete(email);

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error in updating password:', error);
    return res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
};

module.exports = { sendPasswordResetCode, updatePassword };
