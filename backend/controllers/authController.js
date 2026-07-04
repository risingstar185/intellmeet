const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Meeting = require("../models/Meeting");
const Task = require("../models/Task");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} = require('../utils/jwtUtils');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email address already exists.' });
    }

    // Hash password with bcrypt (salt 12)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Initial avatar based on initials
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
 

    const newUser = new User({
      name,
      email,
      passwordHash,
      avatar: initials || 'US',
    });
const accessToken = generateAccessToken(newUser);
const refreshToken = generateRefreshToken(newUser);

newUser.refreshToken = refreshToken;

await newUser.save();
res.cookie("accessToken", accessToken, {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 15 * 24 * 60 * 60 * 1000
});

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

return res.status(201).json({
  message: "Registration successful.",
  user: {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    avatar: newUser.avatar,
    role: newUser.role,
  }
});

  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

   const accessToken = generateAccessToken(user);
const refreshToken = generateRefreshToken(user);

user.refreshToken = refreshToken;
await user.save();

res.cookie("accessToken", accessToken, {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
 maxAge: 15 * 24 * 60 * 60 * 1000
});

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

return res.status(200).json({
  message: "Login successful.",
     accessToken,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
  }
});
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required.' });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(403).json({ error: 'Invalid or expired refresh token. Please sign in again.' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: 'Refresh token is invalid or revoked.' });
    }

    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      accessToken: newAccessToken
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = '';
        await user.save();
      }
    }

    return res.status(200).json({ message: 'Logout successful.' });
  } catch (error) {
    next(error);
  }
};


const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // JWT middleware se aayega

    const { name, role } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name: name.trim(),
        role,
      },
      {
        new: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.userId);
//console.log(req.user);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

///account delete
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await Task.deleteMany({
      assigneeName: user.name,
    });

    await Meeting.updateMany(
      {},
      {
        $pull: {
          participantEmails: user.email,
        },
      }
    );

    await Meeting.deleteMany({
      hostId: userId,
    });

    await User.findByIdAndDelete(userId);

    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  register,
  login,
  refresh,
   deleteAccount,
  logout,
  updateProfile,
  changePassword,
};
