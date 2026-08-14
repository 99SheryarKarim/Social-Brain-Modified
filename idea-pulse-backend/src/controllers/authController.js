const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/databaseModels");
const db = require("../../database/init");
const { sendOTPEmail, sendWelcomeEmail } = require("../services/emailService");

// Generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// STEP 1: Send OTP to email before creating account
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email format" });

  try {
    const userExists = await User.findByEmail(email);
    if (userExists) return res.status(400).json({ message: "Email already registered" });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTP for this email
    db.run(`DELETE FROM otps WHERE email = ?`, [email]);

    // Save new OTP
    db.run(`INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)`,
      [email, otp, expiresAt.toISOString()]);

    await sendOTPEmail(email, otp);

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Send OTP error:", err);
    return res.status(500).json({ message: "Failed to send OTP. Check your email address." });
  }
};

// STEP 2: Verify OTP and create account
exports.verifyOTPAndSignup = async (req, res) => {
  const { email, password, otp } = req.body;
  if (!email || !password || !otp)
    return res.status(400).json({ message: "Email, password and OTP are required" });

  try {
    // Check OTP
    const record = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM otps WHERE email = ? ORDER BY created_at DESC LIMIT 1`,
        [email], (err, row) => err ? reject(err) : resolve(row));
    });

    if (!record) return res.status(400).json({ message: "No OTP found. Please request a new one." });
    if (new Date() > new Date(record.expires_at)) return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    if (record.otp !== otp.trim()) return res.status(400).json({ message: "Incorrect OTP. Please try again." });

    // OTP valid — delete it
    db.run(`DELETE FROM otps WHERE email = ?`, [email]);

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await User.create(email, hashedPassword);

    // Send welcome email
    sendWelcomeEmail(email).catch(console.error);

    const token = jwt.sign(
      { id: createdUser.id, email: createdUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Account created successfully",
      email: createdUser.email,
      userID: createdUser.id,
      token,
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ message: "Error creating account", error: err.message });
  }
};

// Sign In
exports.signin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Please provide email and password" });

  try {
    const user = await User.verifyPassword(email, password);
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ userID: user.id, email: user.email, message: "Login successful", token });
  } catch (err) {
    return res.status(500).json({ message: "Error during login", error: err.message });
  }
};

// Auth middleware
exports.authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token" });
  }
};
