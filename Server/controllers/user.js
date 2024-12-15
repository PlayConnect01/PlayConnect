const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client"); // Ensure you have Prisma client set up

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

const signup = async (req, res) => {
  const { email, password, username } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!isValidPassword(password)) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
  }

  try {
    // Check if the user already exists
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in Prisma DB
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

    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

// Social auth handler
const handleSocialAuth = async (req, res) => {
  try {
    const user = req.user;
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
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
    // If you're using cookies for JWT, clear the token cookie
    res.clearCookie("token"); // Clears token cookie if you're using cookies for JWT
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Error logging out" });
  }
};

module.exports = { signup, login, logout, handleSocialAuth };
