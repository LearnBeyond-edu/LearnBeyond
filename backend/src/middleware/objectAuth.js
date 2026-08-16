const ApiError = require('../utils/ApiError');
const { query } = require('../config/db');

/**
 * Object-level Authorization to prevent IDOR.
 * Example usages:
 * checkOwnership('lessons', 'id', 'class_id')
 * checkInstitutionBound('users', 'id', 'institution_id')
 */
const checkObjectOwnership = (tableName, paramKey = 'id', foreignKey = 'user_id') => {
  return async (req, res, next) => {
    try {
      if (req.user.role_name === 'Platform Admin') {
        return next(); // Platform Admins bypass object-level auth
      }

      const resourceId = req.params[paramKey];
      if (!resourceId) return next(new ApiError(400, 'Resource ID missing'));

      const result = await query(
        `SELECT ${foreignKey} FROM ${tableName} WHERE id = $1 AND deleted_at IS NULL`,
        [resourceId]
      );

      if (result.rowCount === 0) {
        return next(new ApiError(404, 'Resource not found'));
      }

      const resourceOwnerId = result.rows[0][foreignKey];

      // Logic based on foreign key being an institution vs a direct user
      if (foreignKey === 'institution_id') {
        if (resourceOwnerId !== req.user.institution_id) {
          return next(new ApiError(403, 'You are not authorized to access this institution resource'));
        }
      } else {
        // Direct ownership
        if (resourceOwnerId !== req.user.id) {
          return next(new ApiError(403, 'You are not authorized to access this resource'));
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { checkObjectOwnership };
