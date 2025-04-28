const path = require('path');
const { FileStorageContext, WebtaskStorageContext } = require('auth0-extension-tools');
const config = require('../lib/config');
const createServer = require('./index');
const logger = require('../lib/logger');
const initStorage = require('../lib/db').init;

const defaultCallback = (err) => {
  if (err) {
    logger.error('Hapi initialization failed.');
    logger.error(err);
  } else {
    logger.info('Hapi initialization completed.');
  }
};

const initServer = async (cfg, storageContext, cb) => {
  // Set configuration provider.
  config.setProvider(key => cfg(key) || process.env[key]);

  // Initialize the storage context
  initStorage(
    storageContext
      ? new WebtaskStorageContext(storageContext, { force: 1 })
      : new FileStorageContext(path.join(__dirname, '../data.json'))
  );

  storageContext.get((error, data) => {
    console.log('Here is what we currently have in data:', JSON.stringify(data, null, 2));
  });

  // Start the server.
  return createServer(cb || defaultCallback);
};

module.exports = initServer;
