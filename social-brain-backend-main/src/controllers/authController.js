const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Sign Up Controller
exports.signup = async (req, res) => {
  console.log("Received request body:", req.body);
  const { name, email, password, profilePic, about, socialLinks } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please fill all required fields." });
  }

  // Check if the user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists!" });
  }

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user object
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    profilePic,
    about,
    socialLinks,
  });

  try {
    // Save the user to the database
    let createdUser = await newUser.save();

    console.log("User created successfully:", createdUser);

    return res.status(201).json({
      message: "User created successfully",
      email: createdUser.email,
      userID: createdUser._id,
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

  // Check if the user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Compare the provided password with the stored hash
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = jwt.sign(
    { userID: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );

  return res
    .status(200)
    .json({ userID: user._id, message: "Login successful", token });
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
