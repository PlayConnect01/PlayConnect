const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const { PrismaClient } = require('@prisma/client'); // Ensure you have Prisma client set up
const nodemailer = require('nodemailer');

dotenv.config();

const prismaClient = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const isValidPassword = (password) => {
  const minLength = 6;
  return password.length >= minLength;
};

module.exports = { isValidEmail, isValidPassword };

// Handle user signup
const signup = async (req, res) => {
  const { email, password, username } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if the user already exists
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in Prisma DB
    const user = await prismaClient.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.user_id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response with user and token (excluding location or extra fields)
    res.status(200).json({
      user: {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
      },
      token, // JWT token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
};

// Handle user login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Find the user by email
    const user = await prismaClient.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.user_id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response with user and token
    res.status(200).json({
      user: {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        location: user.location,
      },
      token, // JWT token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
};



// Handle user logout
const logout = (req, res) => {
  try {
    // If you're using cookies for JWT, clear the token cookie
    res.clearCookie('token'); // Clears token cookie if you're using cookies for JWT
   res.status(200).json({ message: 'Logged out successfully' });
   } catch (error) {
     console.error('Logout error:', error);
     res.status(500).json({ error: 'Error logging out' });
   }
};

module.exports = { signup, login, logout };
