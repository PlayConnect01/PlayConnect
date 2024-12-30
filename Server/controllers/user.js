const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
dotenv.config();


const prismaClient = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

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

// Enhanced email validation
const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

// Enhanced password validation
const isValidPassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar
  );
};

module.exports = { isValidEmail, isValidPassword };

const signup = async (req, res) => {
  const { email, password, username } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
    });
  }

  try {
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prismaClient.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    const token = jwt.sign(
      { id: user.user_id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Send welcome email
    const mailOptions = {
      from: 'ahmedboukottaya@zohomail.com',
      to: email,
      subject: '🎉 Welcome to Our App!',
      html: `
       <h1>🎉 Welcome, ${username}! 🎉</h1>
<p>Thank you for signing up for our app. We're thrilled to have you on board. 😊</p>
<p>Here are some things you can do next:</p>
<ul>
  <li>🔍 Explore our features</li>
  <li>🤝 Connect with other users</li>
  <li>🎈 Enjoy your experience!</li>
</ul>
<p>If you have any questions, feel free to reach out to our support team. 📧</p>
<p>Best regards,<br>🌟 The Support Team 🌟</p>
      `,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending welcome email:', error);
      } else {
        console.log('Welcome email sent:', info.response);
      }
    });
    res.status(200).json({
      user: {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Error creating user" });
  }
};

// Regular login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prismaClient.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

  
    const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};


const handleSocialAuth = async (req, res) => {
  try {
    const user = req.user;
    const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Authentication failed" });
  }
};

// Handle user logout
const logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Error logging out" });
  }
};

// Fetch a single user by user ID
const getOneUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prismaClient.user.findUnique({
      where: { user_id: Number(id) }, // Ensure 'id' is converted to a number
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Fetch user error:", error);
    res.status(500).json({ error: "Error fetching user" });
  }
};


const updateUserProfile = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { 
      username, 
      email, 
      location, 
      profile_picture,
      birthdate, // Single birthdate field
      phone_number, 
      phone_country_code 
    } = req.body;

    // Validate user exists
    const existingUser = await prismaClient.user.findUnique({
      where: { user_id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create update object
    const updateData = {
      ...(username && { username }),
      ...(email && { email }),
      ...(location && { location }),
      ...(profile_picture && { profile_picture }),
      ...(phone_number && { phone_number }),
      ...(phone_country_code && { phone_country_code }),
      ...(birthdate && { birthdate: new Date(birthdate) }), // Convert string to Date object
    };

    const updatedUser = await prismaClient.user.update({
      where: { user_id: userId },
      data: updateData
    });

    res.json({
      success: true,
      user: {
        ...updatedUser,
        password: undefined,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      error: 'Failed to update user profile',
      details: error.message 
    });
  }
};

module.exports = { signup, login, logout, handleSocialAuth, getOneUser, updateUserProfile};
