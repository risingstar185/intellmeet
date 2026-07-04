const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtUtils');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Google token is required.' });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) return res.status(400).json({ error: 'Could not retrieve email from Google.' });

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) { user.googleId = googleId; await user.save(); }
    } else {
      const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'GU';
      user = new User({ name: name || 'Google User', email, googleId, passwordHash: '', avatar: initials });
      await user.save();
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      message: 'Google authentication successful.',
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { googleAuth };
