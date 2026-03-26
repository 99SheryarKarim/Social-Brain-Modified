const express = require("express");
const { signup, signin, authMiddleware } = require("../controllers/authController");
const router = express.Router();

// Sign Up Route
router.post("/signup", signup);

// Sign In Route
router.post("/signin", signin);

router.get('/protected', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'You have access to this protected route', user: req.user });
  });
  

module.exports = router;
