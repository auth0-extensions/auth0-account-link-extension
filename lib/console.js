/* eslint-disable no-console */

const logger = {
  log: (message, ...args) => console.log(message, ...args),
  error: (message, ...args) => console.error(message, ...args),
  info: (message, ...args) => console.info(message, ...args)
};

module.exports = { default: logger };
