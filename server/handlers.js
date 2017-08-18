import { handlers } from 'auth0-extension-hapi-tools';
import config from '../lib/config';
import logger from '../lib/logger';

const register = (server, options, next) => {
  server.decorate('server', 'handlers', {
    managementClient: handlers.managementApiClient({
      domain: config('AUTH0_DOMAIN'),
      clientId: config('AUTH0_CLIENT_ID'),
      clientSecret: config('AUTH0_CLIENT_SECRET'),
      logger: logger.error
    }),
    validateHookToken: handlers.validateHookToken(
      config('AUTH0_DOMAIN'),
      config('WT_URL'),
      config('EXTENSION_SECRET')
    )
  });

  next();
};

register.attributes = { name: 'handlers' };

export default register;
