class AppError extends Error {
    constructor(statusCode, message) {
      super();
      this.statusCode = statusCode || 500;
      this.message = message;
    }
}

  module.exports = AppError;