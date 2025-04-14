/* eslint-disable consistent-return */
const { promisify } = require('util');
const Boom = require('@hapi/boom');
const jwksRsa = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const config = require('../lib/config');
const plugin = require('../lib/session');

module.exports = {
  name: 'auth',
  async register(server) {
    server.auth.strategy('jwt', 'jwt', {
      complete: true,
      verify: async (decoded, req) => {
        try {
          if (!decoded) {
            return { isValid: false };
          }
          const header = req.headers.authorization;
          if (!header || !header.indexOf('Bearer ') === 0) {
            return { isValid: false };
          }
          const token = header.split(' ')[1];
          const isApiRequest = decoded && decoded.payload && decoded.payload.iss === `https://${config('AUTH0_DOMAIN')}/`;
          const isDashboardAdminRequest = decoded && decoded.payload && decoded.payload.iss === config('PUBLIC_WT_URL');

          if (isApiRequest) {
            if (decoded.payload.gty && decoded.payload.gty !== 'client-credentials') {
              return { isValid: false };
            }

            if (!decoded.payload.sub.endsWith('@clients')) {
              return { isValid: false };
            }

            const client = jwksRsa({
              jwksUri: `https://${config('AUTH0_DOMAIN')}/.well-known/jwks.json`
            });
            const getKey = (jwtHeader, cb) => {
              client.getSigningKey(jwtHeader.kid, (err, key) => {
                if (err) {
                  return cb(err);
                }
                const signingKey = key.publicKey || key.rsaPublicKey;
                cb(null, signingKey);
              });
            };

            return new Promise((resolve) => {
              jwt.verify(
                token,
                getKey,
                {
                  audience: 'urn:auth0-account-linking-api',
                  issuer: `https://${config('AUTH0_DOMAIN')}/`,
                  algorithms: ['RS256'],
                  complete: true
                },
                (err, decodedToken) => {
                  if (err) {
                    return resolve({ isValid: false });
                  }

                  return resolve({ credentials: decodedToken.payload, isValid: true });
                }
              );
            });
          }
          if (isDashboardAdminRequest) {
            const jwtVerifyAsync = promisify(jwt.verify);

            if (!decoded.payload.access_token || !decoded.payload.access_token.length) {
              return { isValid: false };
            }

            // this can throw if there is an error
            await jwtVerifyAsync(
              token,
              config('EXTENSION_SECRET'),
              {
                audience: 'urn:api-account-linking',
                issuer: config('PUBLIC_WT_URL'),
                algorithms: ['HS256'],
                complete: true
              }
            );

            return { credentials: decoded.payload, isValid: true };
          }
          // If the token is not from Auth0, we don't know how to handle it
          return { isValid: false };
        } catch (error) {
          return { isValid: false };
        }
      }
    });
    server.auth.default('jwt');

    const session = {
      plugin,
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
        onLoginSuccess: (decoded) => {
          if (decoded) {
            return decoded;
          }
          throw Boom.unauthorized('Invalid token', 'Token');
        }
      }
    };

    await server.register(session);
  }
};
