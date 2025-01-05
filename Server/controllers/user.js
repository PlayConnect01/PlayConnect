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

const reportUser = async (req, res) => {
  const { reported_user_id, reason } = req.body;
  const reported_by = req.user.user_id; // Assuming you have user info in req.user

  try {
    const report = await prismaClient.report.create({
      data: {
        reported_user_id,
        reported_by,
        reason,
        status: "Pending",
      },
    });

    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error("Error reporting user:", error);
    res.status(500).json({ error: "Failed to report user" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Get query parameters with defaults
    const { 
      includeBanned = 'true', 
      includeBlocked = 'true',
      page = 1,
      limit = 10
    } = req.query;

    // Convert string parameters to boolean
    const showBanned = includeBanned.toLowerCase() === 'true';
    const showBlocked = includeBlocked.toLowerCase() === 'true';

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause based on filters
    let whereClause = {};
    
    if (!showBanned && !showBlocked) {
      whereClause = {
        is_banned: false,
        is_blocked: false
      };
    } else if (!showBanned) {
      whereClause.is_banned = false;
    } else if (!showBlocked) {
      whereClause.is_blocked = false;
    }

    // Get users with pagination
    const users = await prismaClient.user.findMany({
      where: whereClause,
      select: {
        user_id: true,
        username: true,
        email: true,
        location: true,
        profile_picture: true,
        birthdate: true,
        phone_number: true,
        phone_country_code: true,
        is_banned: true,
        is_blocked: true,
        ban_reason: true,
        block_reason: true,
        created_teams: {
          select: {
            team_id: true,
            team_name: true
          }
        }
      },
      skip: skip,
      take: parseInt(limit)
    });

    // Get total count for pagination
    const totalUsers = await prismaClient.user.count({
      where: whereClause
    });

    res.status(200).json({
      users,
      pagination: {
        total: totalUsers,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalUsers / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
};

const banUser = async (req, res) => {
  const { userId } = req.params;
  const { banReason } = req.body;

  try {
    const updatedUser = await prismaClient.user.update({
      where: {
        user_id: parseInt(userId)
      },
      data: {
        is_banned: true,
        ban_reason: banReason
      }
    });

    res.status(200).json({
      message: "User has been banned successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({
      error: "Failed to ban user",
      details: error.message
    });
  }
};

const unbanUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const updatedUser = await prismaClient.user.update({
      where: {
        user_id: parseInt(userId)
      },
      data: {
        is_banned: false
      }
    });

    res.status(200).json({
      message: "User has been unbanned successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({
      error: "Failed to unban user",
      details: error.message
    });
  }
};

const getTotalUsers = async (req, res) => {
  try {
    const count = await prismaClient.user.count();
    res.json({ total: count });
  } catch (error) {
    res.status(500).json({ error: "Error fetching user count", details: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  const parsedUserId = parseInt(userId);

  try {
    await prismaClient.$transaction([
      prismaClient.calendar.deleteMany({
        where: { user_id: parsedUserId }
      }),

      prismaClient.eventParticipant.deleteMany({
        where: { 
          OR: [
            { user_id: parsedUserId },
            { event: { creator_id: parsedUserId } }
          ]
        }
      }),

      prismaClient.event.deleteMany({
        where: { creator_id: parsedUserId }
      }),

      prismaClient.cartItem.deleteMany({
        where: { cart: { user_id: parsedUserId } }
      }),

      prismaClient.cart.deleteMany({
        where: { user_id: parsedUserId }
      }),

      prismaClient.orderItem.deleteMany({
        where: { order: { user_id: parsedUserId } }
      }),

      prismaClient.order.deleteMany({
        where: { user_id: parsedUserId }
      }),

      prismaClient.favorite.deleteMany({
        where: { user_id: parsedUserId }
      }),

      prismaClient.message.deleteMany({
        where: { sender_id: parsedUserId }
      }),

      prismaClient.chatMember.deleteMany({
        where: { user_id: parsedUserId }
      }),

      prismaClient.teamMember.deleteMany({
        where: { 
          OR: [
            { user_id: parsedUserId },
            { team: { created_by: parsedUserId } }
          ]
        }
      }),

      prismaClient.tournamentTeam.deleteMany({
        where: { 
          tournament: { created_by: parsedUserId }
        }
      }),

      prismaClient.team.deleteMany({
        where: { created_by: parsedUserId }
      }),

      prismaClient.tournament.deleteMany({
        where: { created_by: parsedUserId }
      }),

      prismaClient.achievement.deleteMany({
        where: { user_id: parsedUserId }
      }),

      prismaClient.report.deleteMany({
        where: {
          OR: [
            { reported_by: parsedUserId },
            { reported_user_id: parsedUserId }
          ]
        }
      }),

      prismaClient.pointsLog.deleteMany({
        where: { user_id: parsedUserId }
      }),

      prismaClient.notification.deleteMany({
        where: { user_id: parsedUserId }
      }),

      prismaClient.match.deleteMany({
        where: {
          OR: [
            { user_id_1: parsedUserId },
            { user_id_2: parsedUserId }
          ]
        }
      }),

      prismaClient.videoCall.deleteMany({
        where: {
          OR: [
            { initiator_id: parsedUserId },
            { participant_id: parsedUserId }
          ]
        }
      }),

      prismaClient.user.delete({
        where: { user_id: parsedUserId }
      })
    ]);

    res.status(200).json({
      message: "User and all related data have been permanently deleted"
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      error: "Failed to delete user",
      details: error.message
    });
  }
};

module.exports = { 
  signup, 
  login, 
  logout, 
  handleSocialAuth, 
  getOneUser, 
  updateUserProfile, 
  getAllUsers, 
  banUser, 
  unbanUser, 
  getTotalUsers, 
  deleteUser,
  reportUser 
};
