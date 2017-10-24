import path from 'path';
import Hapi from 'hapi';
import Inert from 'inert';
import config from '../lib/config';
import logger from '../lib/logger';
import routes from './routes';
import defaultHandlers from './handlers';

const createServer = (cb, handlers = defaultHandlers) => {
  const server = new Hapi.Server();

  server.connection({
    host: 'localhost',
    port: config('PORT'),
    routes: {
      cors: true,
      validate: {},
      files: {
        relativeTo: path.join(__dirname, '../public')
      }
    }
  });

  server.register(Inert, () => {});

  server.register(require('vision'), (err) => {
    server.views({
      engines: {
        hbs: require('handlebars')
      },
      relativeTo: path.join(__dirname, '../templates'),
      path: 'server'
    });
  });

  server.route({
    method: 'GET',
    path: '/js/{file*}',
    handler: {
      directory: {
        path: path.join(__dirname, '../public/js')
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/css/{file*}',
    handler: {
      directory: {
        path: path.join(__dirname, '../public/css')
      }
    }
  });

  server.register([handlers, routes], (err) => {
    // Use the server logger.
    logger.debug = (...args) => {
      server.log(['debug'], args.join(' '));
    };
    logger.info = (...args) => {
      server.log(['info'], args.join(' '));
    };
    logger.error = (...args) => {
      server.log(['error'], args.join(' '));
    };

    if (err) {
      cb(err);
    }

    cb(null, server);
  });

  return server;
};

export default createServer;
