import Hapi from 'hapi';
import config from '../lib/config';
import logger from '../lib/logger';
import routes from './routes';

const createServer = (cb) => {
  const server = new Hapi.Server();

  server.connection({
    host: 'localhost',
    port: config('PORT'),
    routes: {
      cors: true,
      validate: {}
    }
  });

  // TODO: Much more configuration goes here but we'll leave it empty for now

  server.register([routes], (err) => {
    // Use the server logger.
    logger.debug = (...args) => {
      server.log([ 'debug' ], args.join(' '));
    };
    logger.info = (...args) => {
      server.log([ 'info' ], args.join(' '));
    };
    logger.error = (...args) => {
      server.log([ 'error' ], args.join(' '));
    };

    if (err) {
      cb(err);
    }

    cb(null, server);
  });

  return server;
};

export default createServer;
