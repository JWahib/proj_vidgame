const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error caught by error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error
  let error = {
    statusCode: 500,
    message: 'Internal Server Error'
  };

  // Validation error
  if (err.name === 'ValidationError') {
    error.statusCode = 400;
    error.message = 'Validation Error';
    error.details = err.details;
  }

  // Database errors
  if (err.name === 'RequestError') {
    error.statusCode = 500;
    error.message = 'Database Error';
    if (process.env.NODE_ENV === 'development') {
      error.details = err.message;
    }
  }

  // Rate limiting errors
  if (err.status === 429) {
    error.statusCode = 429;
    error.message = 'Too Many Requests';
  }

  // Send error response
  res.status(error.statusCode).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;