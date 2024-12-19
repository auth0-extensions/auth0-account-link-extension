/* eslint-disable no-param-reassign */

const Boom = require('boom');
const jwksRsa = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const tools = require('auth0-extension-hapi-tools');

const config = require('../lib/config');

const scopes = [{ value: 'openid' }, { value: 'profile' }];

module.exports.register = (server, options, next) => {
  const jwtOptions = {
    dashboardAdmin: {
      key: config('EXTENSION_SECRET'),
      verifyOptions: {
        audience: 'urn:api-account-linking',
        issuer: config('PUBLIC_WT_URL'),
        algorithms: ['HS256']
      }
    },
    resourceServer: {
      key: jwksRsa.hapiJwt2Key({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 2,
        jwksUri: `https://${config('AUTH0_DOMAIN')}/.well-known/jwks.json`
      }),
      verifyOptions: {
        audience: 'urn:auth0-account-linking-api',
        issuer: `https://${config('AUTH0_DOMAIN')}/`,
        algorithms: ['RS256']
      }
    }
  };

  server.auth.strategy('jwt', 'jwt', {
    // Get the complete decoded token, because we need info from the header (the kid)
    complete: true,

    verifyFunc: (decoded, req, callback) => {
      if (!decoded) {
        return callback(null, false);
      }

      const header = req.headers.authorization;
      if (header && header.indexOf('Bearer ') === 0) {
        const token = header.split(' ')[1];
        if (
          decoded &&
          decoded.payload &&
          decoded.payload.iss === `https://${config('AUTH0_DOMAIN')}/`
        ) {
          return jwtOptions.resourceServer.key(decoded, (keyErr, key) => {
            if (keyErr) {
              return callback(Boom.wrap(keyErr), null, null);
            }

            return jwt.verify(token, key, jwtOptions.resourceServer.verifyOptions, (err) => {
              if (err) {
                return callback(Boom.unauthorized('Invalid token', 'Token'), null, null);
              }

              if (decoded.payload.gty && decoded.payload.gty !== 'client-credentials') {
                return callback(Boom.unauthorized('Invalid token', 'Token'), null, null);
              }

              if (!decoded.payload.sub.endsWith('@clients')) {
                return callback(Boom.unauthorized('Invalid token', 'Token'), null, null);
              }

              if (decoded.payload.scope && typeof decoded.payload.scope === 'string') {
                decoded.payload.scope = decoded.payload.scope.split(' '); // eslint-disable-line no-param-reassign
              }

              return callback(null, true, decoded.payload);
            });
          });
        } else if (decoded && decoded.payload && decoded.payload.iss === config('PUBLIC_WT_URL')) {
          return jwt.verify(
            token,
            jwtOptions.dashboardAdmin.key,
            jwtOptions.dashboardAdmin.verifyOptions,
            (err) => {
              if (err) {
                return callback(Boom.unauthorized('Invalid token', 'Token'), null, null);
              }

              if (!decoded.payload.access_token || !decoded.payload.access_token.length) {
                return callback(Boom.unauthorized('Invalid token', 'Token'), null, null);
              }

              decoded.payload.scope = scopes.map(scope => scope.value);
              return callback(null, true, decoded.payload);
            }
          );
        }
      }

      return callback(null, false);
    }
  });
  server.auth.default('jwt');
  const session = {
    register: tools.plugins.dashboardAdminSession,
    options: {
      stateKey: 'account-linking-admin-state',
      sessionStorageKey: 'com.auth0.account_linking.admin_ui.session_token',
      rta: config('AUTH0_RTA').replace('https://', ''),
      domain: config('AUTH0_DOMAIN'),
      scopes: '',
      baseUrl: config('PUBLIC_WT_URL'),
      audience: 'urn:api-account-linking',
      secret: config('EXTENSION_SECRET'),
      clientName: 'auth0-account-link',
      onLoginSuccess: (decoded, req, callback) => {
        if (decoded) {
          decoded.scope = scopes.map(scope => scope.value); // eslint-disable-line no-param-reassign
          return callback(null, true, decoded);
        }

        return callback(null, false);
      }
    }
  };
  server.register(session, (err) => {
    if (err) {
      next(err);
    }

    next();
  });
};

module.exports.register.attributes = {
  name: 'auth'
};
