/* eslint-disable global-require */

const path = require('path');
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Joi = require('@hapi/joi');
const jwt = require('hapi-auth-jwt2');
const config = require('../lib/config');
const logger = require('../lib/logger');
const routes = require('./routes');
const defaultHandlers = require('./handlers');
const auth = require('./auth');

const createServer = async (cb, handlers = defaultHandlers) => {
  const server = new Hapi.Server({
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
  server.validator(Joi);
  await server.register([jwt, Inert]);

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

  await server.register([auth, handlers, routes]);
  
  logger.debug = (...args) => {
    server.log(['debug'], args.join(' '));
  };
  logger.info = (...args) => {
    server.log(['info'], args.join(' '));
  };
  logger.error = (...args) => {
    server.log(['error'], args.join(' '));
  };

  // await server.register([auth, handlers, routes], (err) => {
  //   // Use the server logger.
  //   logger.debug = (...args) => {
  //     server.log(['debug'], args.join(' '));
  //   };
  //   logger.info = (...args) => {
  //     server.log(['info'], args.join(' '));
  //   };
  //   logger.error = (...args) => {
  //     server.log(['error'], args.join(' '));
  //   };

  //   if (err) {
  //     cb(err);
  //   }

  //   cb(null, server);
  // });

  return server;
};

module.exports = createServer;
