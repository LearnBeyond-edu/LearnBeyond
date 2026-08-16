const ApiError = require('../utils/ApiError');

/**
 * Middleware to check if the user has the required roles.
 * @param {...string} allowedRoles - Role names allowed to access the route.
 */
const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role_name) {
        return next(new ApiError(403, 'You do not have permission to perform this action'));
      }

      const userRole = req.user.role_name;

      if (!allowedRoles.includes(userRole)) {
        return next(new ApiError(403, `User role ${userRole} is not authorized to access this route`));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { authorize };
