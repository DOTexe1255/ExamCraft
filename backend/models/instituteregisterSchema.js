const Joi = require('joi');

// Validation schema for INSTITUTE registration
const instituteregisterSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
    code: Joi.string().alphanum().min(2).max(20).required(),
    address: Joi.string().max(255).allow(null, '').optional(),
    contact_email: Joi.string().email().max(100).allow(null, '').optional(),
    phone: Joi.string().max(15).allow(null, '').optional()
});
module.exports = instituteregisterSchema;