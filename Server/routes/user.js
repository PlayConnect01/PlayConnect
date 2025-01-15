const passport = require("passport");
const express = require("express");
const {
  signup,
  login,
  logout,
  getOneUser,
  updateUserProfile,
  handleSocialAuth,
  getAllUsers,
  banUser,
  unbanUser,
  getTotalUsers,
  deleteUser,
  reportUser,
  getUserProfile
} = require('../controllers/user.js');

const router = express.Router();

// Base user routes
router.get("/AllUsers", getAllUsers);           // Get all users
router.get("/:id", getOneUser);         // Get single user
router.get('/profile/:id', getUserProfile); // Get user profile with points
router.put("/:id", updateUserProfile);  // Update user
router.put('/ban/:userId', banUser);
router.put('/unban/:userId', unbanUser);

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/auth", handleSocialAuth);

// Social auth routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  handleSocialAuth
);

router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  handleSocialAuth
);

router.get("/count/total", getTotalUsers);

router.post("/reports", reportUser);
router.delete('/delete/:userId', deleteUser);

router.post('/updatePoints', async (req, res) => {
  const { userId, points, activity } = req.body;
  
  try {
    // Update user points
    const updatedUser = await prisma.user.update({
      where: { user_id: parseInt(userId) },
      data: {
        points: {
          increment: points
        }
      }
    });

    // Log the points transaction
    await prisma.pointsLog.create({
      data: {
        user_id: parseInt(userId),
        points: points,
        activity: activity
      }
    });

    // Create a notification for the user
    await prisma.notification.create({
      data: {
        user_id: parseInt(userId),
        title: "Points Awarded!",
        content: `Congratulations! You received ${points} points for your event being approved.`,
        type: "GENERAL",
        is_read: false
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating points:', error);
    res.status(500).json({ error: 'Failed to update points' });
  }
});

module.exports = router;
