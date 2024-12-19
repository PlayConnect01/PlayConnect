const express = require("express");
const {
  signup,
  login,
  logout,
  handleSocialAuth,
} = require("../controllers/user.js");
const passport = require("passport");

const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/Auth", handleSocialAuth);

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

module.exports = router; // Ensure you are exporting the router here
