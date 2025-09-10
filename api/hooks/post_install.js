const { install } = require('../../modifyRule');
const config = require('../../lib/config');
const logger = require('../../lib/logger');

module.exports = server => ({
  method: 'POST',
  path: '/.extensions/on-install',
  options: {
    auth: false,
    pre: [
      server.handlers.validateHookToken('/.extensions/on-install'),
      server.handlers.managementClient
    ]
  },
  handler: async (req, h) => {
    logger.info('Starting rule installation...');
    try {
      await install({ client: req.pre.auth0 }, {
        extensionURL: config('PUBLIC_WT_URL'),
        clientID: config('AUTH0_CLIENT_ID'),
        clientSecret: config('AUTH0_CLIENT_SECRET')
      });
      logger.info('Rule successfully installed');
      return h.response().code(204);
    } catch (error) {
      logger.error('Something went wrong, ', error);
      return h.response(error);
    }
  }
});
