const { verifyAccessToken } = require("../utils/jwtUtils");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      error: "Access token required."
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    //console.log(decoded); // Check karo
    req.user = decoded;
    //console.log(req.user);
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid token"
    });
  }
};

module.exports = authMiddleware;