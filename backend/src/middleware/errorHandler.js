const winston = require('winston');

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
  ],
});

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ message: 'Internal server error' });
};

module.exports = errorHandler;