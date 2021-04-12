const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    }),
    new winston.transports.File({ filename: 'log/info.log', level: 'info' }),
    new winston.transports.File({ filename: 'log/error.log', level: 'error' }),
  ],
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.simple(),
  ),
  exitOnError: false,
});

module.exports = logger;
module.exports.stream = {
  write(message, encoding) {
    logger.info(message);
  },
};
