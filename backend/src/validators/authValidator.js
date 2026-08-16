const Joi = require('joi');

const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  })
};

const registerSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role_id: Joi.string().uuid().optional(),
    role: Joi.string().optional(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    phone: Joi.string().allow('', null),
    institution_id: Joi.string().uuid().allow('', null),
    assigned_class: Joi.string().allow('', null),
    assigned_section: Joi.string().allow('', null),
    student_id: Joi.string().uuid().allow('', null),
    relation: Joi.string().allow('', null)
  })
};

module.exports = {
  loginSchema,
  registerSchema
};
