const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const redis = require('../config/redis');

const authenticate = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'Not authenticated, no token provided'));
    }

    // Check blocklist
    const isBlocklisted = await redis.get(`blocklist:${token}`);
    if (isBlocklisted) {
      return next(new ApiError(401, 'Token has been revoked. Please log in again.'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // In stateless auth, the token payload contains all necessary user claims.
    req.user = {
      id: decoded.id,
      role_name: decoded.role_name,
      institution_id: decoded.institution_id
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token. Please log in again.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Your token has expired! Please log in again.'));
    }
    next(error);
  }
};

module.exports = { authenticate };
