const ErrorResponse = require('../utils/errorResponse');

/**
 * Error handling middleware
 * Processes different types of errors and sends a structured response
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error for debugging (not in production)
  console.error('Error details:', {
    name: err.name,
    code: err.code,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? 'Hidden in production' : err.stack
  });
  
  // Handle different error types
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: ${field} = ${value}. Please use another value.`;
    error = new ErrorResponse(message, 400);
  }
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ErrorResponse('Invalid token. Please log in again.', 401);
  }
  
  if (err.name === 'TokenExpiredError') {
    error = new ErrorResponse('Token expired. Please log in again.', 401);
  }
  
  // Send standardized error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: err.stack,
      type: err.name
    })
  });
};

module.exports = errorHandler; 