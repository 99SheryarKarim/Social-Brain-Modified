const express = require("express");
const jwt = require("jsonwebtoken");
const { sendOTP, verifyOTPAndSignup, signin, authMiddleware } = require("../controllers/authController");
const passport = require("../config/googleAuth");

const router = express.Router();

// Email/Password routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTPAndSignup);
router.post("/signin", signin);
router.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({ message: "You have access", user: req.user });
});

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/#/profile?error=google_failed", session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.redirect(`http://localhost:5173/#/profile?token=${token}&email=${encodeURIComponent(req.user.email)}`);
  }
);

module.exports = router;
