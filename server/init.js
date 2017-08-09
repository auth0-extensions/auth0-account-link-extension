import config from '../lib/config';
import createServer from './index';
import logger from '../lib/logger';

const defaultCallback = err => {
  if (err) {
    logger.error('Hapi initialization failed.');
    logger.error(err);
  } else {
    logger.info('Hapi initialization completed.');
  }
};

const initServer = (cfg, storageContext, cb) => {
  // Set configuration provider.
  config.setProvider(key => cfg(key) || process.env[key]);

  // Start the server.
  return createServer(cb || defaultCallback);
};

module.exports = initServer;
