const Joi = require('joi');
// Validation schema for departmetn admin registration
const departmentAdminRegisterSchema = Joi.object({
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().max(100).required(),
    password: Joi.string().min(6).max(100).required(),
    role: Joi.string().valid('department').optional(), // hardcoded in INSERT, optional here
    institute_id: Joi.number().integer().required(),
    department_id: Joi.number().integer().required(),
    phone: Joi.string().max(15).allow(null, '').optional()
});
module.exports = departmentAdminRegisterSchema;
