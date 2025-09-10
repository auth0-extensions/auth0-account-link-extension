const { uninstall } = require('../../modifyRule');
const config = require('../../lib/config');
const logger = require('../../lib/logger');

module.exports = server => ({
  method: 'DELETE',
  path: '/.extensions/on-uninstall',
  options: {
    auth: false,
    pre: [
      server.handlers.validateHookToken('/.extensions/on-uninstall'),
      server.handlers.managementClient
    ]
  },
  handler: async (req, h) => {
    logger.info('Starting uninstall...');

    try {
      await uninstall({ client: req.pre.auth0 });
      await req.pre.auth0.deleteClient({ client_id: config('AUTH0_CLIENT_ID') });
      return h.response().code(204);
    } catch (err) {
      logger.error('Something went wrong while uninstalling Account Link Extension: ', err);
      return h.response().code(204);
    }
  }
});
