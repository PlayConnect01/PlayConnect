const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
require('dotenv').config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("Login attempt for:", email);

    const admin = await prisma.admin.findUnique({ 
      where: { email } 
    });

    if (!admin) {
      console.log("Admin not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    console.log("Password valid:", validPassword);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { 
        admin_id: admin.admin_id, 
        email: admin.email,
        username: admin.username,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ 
      admin: {
        admin_id: admin.admin_id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }, 
      token 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      error: "Login failed",
      message: error.message 
    });
  }
};

const adminSignup = async (req, res) => {
  try {
    const { email, password, username, adminCode } = req.body;

    // Check if admin code matches
    const correctAdminCode = process.env.ADMIN_REGISTRATION_CODE;
    if (!adminCode || adminCode !== correctAdminCode) {
      return res.status(401).json({ 
        error: "Invalid admin registration code",
        message: "The registration code provided is incorrect."
      });
    }

    // Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      return res.status(400).json({ 
        error: "Email already registered",
        message: "This email is already in use."
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        username,
        role: "ADMIN",
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Generate token
    const token = jwt.sign(
      { 
        admin_id: admin.admin_id, 
        email: admin.email,
        username: admin.username,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Return success response
    res.status(201).json({ 
      message: "Admin account created successfully",
      admin: {
        admin_id: admin.admin_id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }, 
      token 
    });
  } catch (error) {
    console.error("Admin signup error:", error);
    res.status(500).json({ 
      error: "Error creating admin account",
      message: error.message 
    });
  }
};

module.exports = { adminLogin, adminSignup };