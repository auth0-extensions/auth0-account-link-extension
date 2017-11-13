import path from 'path';
import { FileStorageContext, WebtaskStorageContext } from 'auth0-extension-tools';
import config from '../lib/config';
import createServer from './index';
import logger from '../lib/console';
import { init as initStorage } from '../lib/db';

const defaultCallback = (err) => {
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

  // Initialize the storage context
  initStorage(
    storageContext
      ? new WebtaskStorageContext(storageContext, { force: 0 })
      : new FileStorageContext(path.join(__dirname, '../data.json'))
  );

  // Start the server.
  return createServer(cb || defaultCallback);
};

module.exports = initServer;
