/* eslint-disable global-require */

import path from 'path';
import Hapi from 'hapi';
import Inert from 'inert';
import jwt from 'hapi-auth-jwt2';
import config from '../lib/config';
import logger from '../lib/console';
import routes from './routes';
import defaultHandlers from './handlers';
import auth from './auth';

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

  server.register([jwt, Inert], () => {});

  server.route({
    method: 'GET',
    path: '/js/{file*}',
    config: { auth: false },
    handler: {
      directory: {
        path: path.join(__dirname, '../public/js')
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/css/{file*}',
    config: { auth: false },
    handler: {
      directory: {
        path: path.join(__dirname, '../public/css')
      }
    }
  });

  server.register([auth, handlers, routes], (err) => {
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
