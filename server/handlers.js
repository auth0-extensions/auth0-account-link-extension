/* eslint-disable no-unused-vars */
const config = require('../lib/config');
const logger = require('../lib/logger');
const handlerUtils = require('../lib/handlerUtils');

module.exports = {
  name: 'handlers',
  // eslint-disable-next-line no-unused-vars
  async register(server, options) {
    server.decorate('server', 'handlers', {
      managementClient: handlerUtils.mgmtClient({
        domain: config('AUTH0_DOMAIN'),
        clientId: config('AUTH0_CLIENT_ID'),
        clientSecret: config('AUTH0_CLIENT_SECRET'),
        logger: logger.error
      }),
      validateHookToken: handlerUtils.validateHookToken(
        config('AUTH0_DOMAIN'),
        config('WT_URL'),
        config('EXTENSION_SECRET')
      )
    });
  }
};
