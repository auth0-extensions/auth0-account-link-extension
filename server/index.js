/* eslint-disable global-require */

const path = require('path');
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const jwt = require('hapi-auth-jwt2');
const config = require('../lib/config');
const logger = require('../lib/logger');
const routes = require('./routes');
const defaultHandlers = require('./handlers');
const auth = require('./auth');

const createServer = async (handlers = defaultHandlers) => {
  const server = Hapi.server({
    host: 'localhost',
    port: config('PORT'),
    routes: {
      cors: true,
      files: {
        relativeTo: path.join(__dirname, '../public')
      }
    }
  });

  // Register plugins
  await server.register([jwt, Inert]);

  // Define routes
  server.route([
    {
      method: 'GET',
      path: '/js/{file*}',
      options: { auth: false },
      handler: {
        directory: {
          path: path.join(__dirname, '../public/js')
        }
      }
    },
    {
      method: 'GET',
      path: '/css/{file*}',
      options: { auth: false },
      handler: {
        directory: {
          path: path.join(__dirname, '../public/css')
        }
      }
    }
  ]);

  // Register additional plugins and routes
  await server.register([auth, handlers, routes]);

  // Configure server logging
  logger.debug = (...args) => {
    server.log(['debug'], args.join(' '));
  };
  logger.info = (...args) => {
    server.log(['info'], args.join(' '));
  };
  logger.error = (...args) => {
    server.log(['error'], args.join(' '));
  };

  return server; // Return the server instance directly
};

module.exports = createServer;
