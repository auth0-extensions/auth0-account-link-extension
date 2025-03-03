/* eslint-disable no-unused-vars */
const tools = require('auth0-extension-tools');
const Boom = require('@hapi/boom');
const logger = require('../lib/logger');

const mgmtClient = (handlerOptions) => {
  if (!handlerOptions || typeof handlerOptions !== 'object') {
    throw new tools.ArgumentError('Must provide the options');
  }

  if (typeof handlerOptions.domain !== 'string' || handlerOptions.domain.length === 0) {
    throw new tools.ArgumentError(`The provided domain is invalid: ${handlerOptions.domain}`);
  }

  return {
    method: async (req, h) => {
      const isAdministrator = req.auth
        && req.auth.credentials
        && req.auth.credentials.access_token
        && req.auth.credentials.access_token.length;
      const options = !isAdministrator ? handlerOptions : {
        domain: handlerOptions.domain,
        accessToken: req.auth.credentials.access_token
      };

      const auth0 = await tools.managementApi.getClient(options);
      return auth0;
    },
    assign: 'auth0'
  };
};


const validateHookToken = (domain, webtaskUrl, extensionSecret) => {
  if (domain === null || domain === undefined) {
    throw new tools.ArgumentError('Must provide the domain');
  }

  if (typeof domain !== 'string' || domain.length === 0) {
    throw new tools.ArgumentError(`The provided domain is invalid: ${domain}`);
  }

  if (webtaskUrl === null || webtaskUrl === undefined) {
    throw new tools.ArgumentError('Must provide the webtaskUrl');
  }

  if (typeof webtaskUrl !== 'string' || webtaskUrl.length === 0) {
    throw new tools.ArgumentError(`The provided webtaskUrl is invalid: ${webtaskUrl}`);
  }

  if (extensionSecret === null || extensionSecret === undefined) {
    throw new tools.ArgumentError('Must provide the extensionSecret');
  }

  if (typeof extensionSecret !== 'string' || extensionSecret.length === 0) {
    throw new tools.ArgumentError(`The provided extensionSecret is invalid: ${extensionSecret}`);
  }

  return (hookPath) => {
    if (hookPath === null || hookPath === undefined) {
      throw new tools.ArgumentError('Must provide the hookPath');
    }

    if (typeof hookPath !== 'string' || hookPath.length === 0) {
      throw new tools.ArgumentError(`The provided hookPath is invalid: ${hookPath}`);
    }

    return {
      method(req, h) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
          const token = req.headers.authorization.split(' ')[1];

          try {
            logger.info(`Validating hook token with signature: ${extensionSecret.substring(0, 4)}...`);
            if (tools.validateHookToken(domain, webtaskUrl, hookPath, extensionSecret, token)) {
              return h.continue;
            }
          } catch (e) {
            logger.error('Invalid token:', token);
            throw Boom(e, { statusCode: 401, message: e.message });
          }
        }

        const err = new tools.HookTokenError(`Hook token missing for the call to: ${hookPath}`);
        throw Boom.unauthorized(err, 401, err.message);
      }
    };
  };
};

module.exports = {
  mgmtClient,
  validateHookToken
};
