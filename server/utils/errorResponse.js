/**
 * Custom error class for API errors
 * Extends the built-in Error class to add statusCode property
 */
class ErrorResponse extends Error {
  /**
   * Create an error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse; 