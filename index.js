const nconf = require('nconf');
const path = require('path');
const logger = require('./lib/logger');

nconf
  .argv()
  .env()
  .file(path.join(__dirname, './server/config.json'))
  .defaults({
    AUTH0_RTA: 'auth0.auth0.com',
    DATA_CACHE_MAX_AGE: 1000 * 10,
    NODE_ENV: 'development',
    HOSTING_ENV: 'default',
    PORT: 3000,
    USE_OAUTH2: false,
    LOG_COLOR: true
  });

const createServer = require('./server/init');

const startServer = (server) =>
  new Promise((resolve, reject) => {
    server.start((err) => {
      if (err) {
        console.log(err, "ERERERE")
        reject(err);
      }
      console.log(err, "ERERERE")
      resolve(server);
      console.log(server, 'FSDSFF')
      logger.info(`Server running at: ${server.info.uri}`);
    });
  });

let server;
  (async () => {
    try {
      server = await createServer(key => nconf.get(key), null);
      logger.info("HEYYYYYYYY")

      await startServer(server);
    } catch (err) {
      logger.error(err);
      logger.error('Server could not be started. Aborting...');
      process.exit(1);
    }
  })();
// const server = createServer(key => nconf.get(key), null);
// console.log(server, "SERVER")
// startServer(server).catch((err) => {
//   logger.error(err);
//   logger.error('Server could not be started. Aborting...');

//   process.exit(1);
// });

module.exports = server;
