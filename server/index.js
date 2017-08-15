import Path from 'path';
import Hapi from 'hapi';
import Inert from 'inert';
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
      validate: {},
      files: {
        relativeTo: Path.join(__dirname, '../public')
      }
    }
  });

  server.register(Inert, () => {});

  server.route({
    method: 'GET',
    path: '/js/{file*}',
    handler: {
      directory: {
        path: __dirname + '/../public/js'
      }
    }
  });

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
