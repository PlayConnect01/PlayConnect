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
  deleteUser
} = require('../controllers/user.js');

const router = express.Router();

// Base user routes
router.get("/AllUsers", getAllUsers);           // Get all users
router.get("/:id", getOneUser);         // Get single user
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

router.delete('/delete/:userId', deleteUser);

module.exports = router;
