const nconf = require('nconf');
const path = require('path');

// Load babel
require('./lib/babel')();


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

const { createServer, startServer } = require('./server/index');

startServer(createServer()).catch((err) => {
  console.error(err);
  console.error('Server could not be started. Aborting...');

  process.exit(1);
});
