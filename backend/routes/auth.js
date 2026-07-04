const express = require('express');
const { body, validationResult } = require('express-validator');
const { googleAuth } = require("./../controllers/googleAuthController");
const { register, login, refresh, logout } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { updateProfile } = require("../controllers/authController");
const authMiddleware = require('../middleware/authMiddleware');
const { changePassword } = require("../controllers/authController");

const { deleteAccount } = require("../controllers/authController");

const router = express.Router();


//router.use(authMiddleware);

// Helper to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(err => ({ field: err.path, message: err.msg })) });
  }
  next();
};

// Register
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').trim().isEmail().withMessage('A valid email address is required.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  ],
  validate,
  register
);

// Login
router.post(
  '/login',
  authLimiter,
  [
    body('email').trim().isEmail().withMessage('A valid email address is required.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  login
);

// Refresh Token
router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required.'),
  ],
  validate,
  refresh
);

// Google OAuth
router.post("/google", googleAuth);

// Logout
router.post('/logout', logout);



router.put("/change-password", authMiddleware, changePassword);
router.delete("/delete-account", authMiddleware, deleteAccount);

router.put("/profile",authMiddleware, updateProfile);
module.exports = router;
