const { install } = require('../../modifyRule');
const config = require('../../lib/config');
const logger = require('../../lib/logger');

module.exports = server => ({
  method: 'POST',
  path: '/.extensions/on-install',
  config: {
    auth: false,
    pre: [
      server.handlers.validateHookToken('/.extensions/on-install'),
      server.handlers.managementClient
    ]
  },
  handler: (req, reply) => {
    logger.info('Starting rule installation...');

    install(req.pre.auth0, {
      accountLinkExtentionUrl: config('PUBLIC_WT_URL'),
      accountLinkClientId: config('AUTH0_CLIENT_ID'),
      accountLinkSecretId: config('AUTH0_CLIENT_SECRET')
    })
      .then(() => reply().code(204))
      .then(() => {
        logger.info('Rule successfully installed');
      })
      .catch((err) => {
        logger.error('Something went wrong, ', err);
        throw err;
      })
      .catch(err => reply.error(err));
  }
});
