const Joi = require('joi');
// Validation schema for INSTITUTE registration
const departmentregisterSchema = Joi.object({
  institute_id: Joi.number().integer().required(),
    name: Joi.string().min(2).max(100).required(),
    code: Joi.string().alphanum().min(1).max(20).required(),
    head_email: Joi.string().email().max(100).allow(null, '').optional()
});
module.exports = departmentregisterSchema;