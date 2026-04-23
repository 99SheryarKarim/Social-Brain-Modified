const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/databaseModels");

// Sign Up Controller
exports.signup = async (req, res) => {
  console.log("Received request body:", req.body);
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please fill all required fields." });
  }

  try {
    // Check if the user already exists
    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "User already exists!" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const createdUser = await User.create(email, hashedPassword);

    console.log("User created successfully:", createdUser);

    return res.status(201).json({
      message: "User created successfully",
      email: createdUser.email,
      userID: createdUser.id,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
};

// Sign In Controller
exports.signin = async (req, res) => {
  const { email, password } = req.body;

  console.log("Received request body:", req.body);

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  try {
    // Check if the user exists and verify password
    const user = await User.verifyPassword(email, password);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res
      .status(200)
      .json({ 
        userID: user.id, 
        email: user.email,
        message: "Login successful", 
        token 
      });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error during login", error: err.message });
  }
};

// Middleware to check if the user is authenticated
exports.authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token" });
  }
};

