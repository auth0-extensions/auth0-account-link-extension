const { createLogger, transports } = require('winston');

const logger = createLogger({
  transports: [
    transports.Console(
      {
        timestamp: true,
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true
      }
    )
  ],
  exitOnError: false
});

module.exports = logger;
