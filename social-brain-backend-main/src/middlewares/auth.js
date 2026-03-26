const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Access denied. No JWT-token provided." });
  }

  // Tshould be sent as: "Bearer <token>"
  const token = authHeader.split(" ")[1]; // Extract token part

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. JWT-token missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid JWT-token" });
  }
};

module.exports = authMiddleware;
