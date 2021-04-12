/* eslint-disable eol-last */
class StandardException extends require('./app.error.exception') {
  constructor(statusCode, message) {
    super(statusCode || 500, message || 'Error');
  }
}

module.exports = StandardException;