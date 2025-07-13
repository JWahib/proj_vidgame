const Joi = require('joi');

const validateSearch = (req, res, next) => {
  const schema = Joi.object({
    q: Joi.string().min(1).max(255).optional(),
    genre: Joi.string().min(1).max(100).optional(),
    rating: Joi.string().min(1).max(50).optional(),
    publisher: Joi.string().min(1).max(255).optional()
  });
  
  const { error } = schema.validate(req.query);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  next();
};

module.exports = {
  validateSearch
};