const Joi = require('joi');

// Validation schema for STUDENT registration
const studentregisterSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().max(100).required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid('student').required(),
  institute_id: Joi.number().integer().required(),
  department_id: Joi.number().integer().required(),
  phone: Joi.string().trim().min(1).max(15).required(),
  semester: Joi.number().integer().min(1).max(12).required()
});

module.exports = studentregisterSchema;
