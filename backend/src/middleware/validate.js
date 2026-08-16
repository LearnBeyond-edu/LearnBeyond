const ApiError = require('../utils/ApiError');

/**
 * Middleware to validate request object (body, query, params) against Joi schemas.
 * @param {Object} schema - Joi schema object containing optional body, query, or params schemas.
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validations = [];

    if (schema.body) {
      validations.push(schema.body.validate(req.body, { abortEarly: false }));
    }
    if (schema.query) {
      validations.push(schema.query.validate(req.query, { abortEarly: false }));
    }
    if (schema.params) {
      validations.push(schema.params.validate(req.params, { abortEarly: false }));
    }

    const errors = [];
    validations.forEach((validation) => {
      if (validation.error) {
        validation.error.details.forEach((detail) => {
          errors.push(detail.message);
        });
      }
    });

    if (errors.length > 0) {
      return next(new ApiError(400, `Validation Error: ${errors.join(', ')}`));
    }

    next();
  };
};

module.exports = { validate };
