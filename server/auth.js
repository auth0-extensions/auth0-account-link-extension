/* eslint-disable no-param-reassign */

const Boom = require('@hapi/boom');
const jwksRsa = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const tools = require('auth0-extension-hapi-tools');
const config = require('../lib/config');

const scopes = [{ value: 'openid' }, { value: 'profile' }];

const register = async (server, options) => {
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
    complete: true,
    verify: async (decoded, req, h) => {
      if (!decoded) {
        throw Boom.unauthorized('Invalid token', 'Token');
      }

      const header = req.headers.authorization;
      if (header && header.startsWith('Bearer ')) {
        const token = header.split(' ')[1];
        
        if (decoded.payload.iss === `https://${config('AUTH0_DOMAIN')}/`) {
          try {
            const key = await jwtOptions.resourceServer.key(decoded);
            jwt.verify(token, key, jwtOptions.resourceServer.verifyOptions);

            if (decoded.payload.gty && decoded.payload.gty !== 'client-credentials') {
              throw Boom.unauthorized('Invalid token', 'Token');
            }

            if (!decoded.payload.sub.endsWith('@clients')) {
              throw Boom.unauthorized('Invalid token', 'Token');
            }

            if (decoded.payload.scope && typeof decoded.payload.scope === 'string') {
              decoded.payload.scope = decoded.payload.scope.split(' '); // eslint-disable-line no-param-reassign
            }

            return { isValid: true, credentials: decoded.payload };
          } catch (err) {
            throw Boom.unauthorized('Invalid token', 'Token');
          }
        } else if (decoded.payload.iss === config('PUBLIC_WT_URL')) {
          try {
            jwt.verify(token, jwtOptions.dashboardAdmin.key, jwtOptions.dashboardAdmin.verifyOptions);

            if (!decoded.payload.access_token || !decoded.payload.access_token.length) {
              throw Boom.unauthorized('Invalid token', 'Token');
            }

            decoded.payload.scope = scopes.map(scope => scope.value);
            return { isValid: true, credentials: decoded.payload };
          } catch (err) {
            throw Boom.unauthorized('Invalid token', 'Token');
          }
        }
      }

      return { isValid: false };
    }
  });

  server.auth.default('jwt');

  const session = {
    plugin: {
      name: 'auth0-account-link',
      ...tools.plugins.dashboardAdminSession,
    },
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
      onLoginSuccess: async (decoded, req, h) => {
        if (decoded) {
          decoded.scope = scopes.map(scope => scope.value); // eslint-disable-line no-param-reassign
          return { isValid: true, credentials: decoded };
        }
        return { isValid: false };
      }
    }
  };

  await server.register(session);
};

module.exports = { 
  name: 'auth',
  register
};
