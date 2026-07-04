const jwt = require("jsonwebtoken");
require("dotenv").config();

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15d";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "30d";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are missing in .env");
}

const generateAccessToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    }
  );

const verifyAccessToken = (token) =>
  jwt.verify(token, JWT_SECRET);

const verifyRefreshToken = (token) =>
  jwt.verify(token, JWT_REFRESH_SECRET);

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};