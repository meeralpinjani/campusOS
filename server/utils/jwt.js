const jwt = require('jsonwebtoken');

const getJWTSecret = () => process.env.JWT_SECRET || 'campus_connect_jwt_secret_key_2026_super_secure';
const getJWTRefreshSecret = () => process.env.JWT_REFRESH_SECRET || 'campus_connect_refresh_secret_key_2026_super_secure';

/**
 * Generate short-lived Access Token (15 minutes) and long-lived Refresh Token (7 days)
 */
const generateTokens = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, getJWTSecret(), {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ id: user._id }, getJWTRefreshSecret(), {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, getJWTSecret());
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, getJWTRefreshSecret());
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
};
