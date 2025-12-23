// validation/registerSchema.js
const Joi = require('joi');

const registerSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().max(100).required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid('admin', 'department', 'student').required(),
  institute_id: Joi.number().integer().required(),
  department_id: Joi.number().integer().allow(null).optional(),
  phone: Joi.string().max(15).allow(null, '').optional()
});

module.exports = registerSchema;
