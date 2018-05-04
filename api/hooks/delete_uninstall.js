const { uninstall } = require('../../modifyRule');
const config = require('../../lib/config');
const logger = require('../../lib/logger');

module.exports = server => ({
  method: 'DELETE',
  path: '/.extensions/on-uninstall',
  config: {
    auth: false,
    pre: [
      server.handlers.validateHookToken('/.extensions/on-uninstall'),
      server.handlers.managementClient
    ]
  },
  handler: (req, reply) => {
    logger.info('Starting uninstall...');

    Promise.all([
      uninstall(req.pre.auth0.rules),
      req.pre.auth0.deleteClient({ client_id: config('AUTH0_CLIENT_ID') })
    ])
      .then(() => reply().code(204))
      .catch((err) => {
        logger.error('Something went wrong while uninstalling Account Link Extension: ', err);

        // Swallow the error so we do not break the experience for the user
        reply().code(204);
      });
  }
});
