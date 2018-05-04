import { install } from '../../modifyRule';
import config from '../../lib/config';
import logger from '../../lib/logger';

module.exports = server => ({
  method: 'PUT',
  path: '/.extensions/on-update',
  config: {
    auth: false,
    pre: [
      server.handlers.validateHookToken('/.extensions/on-update'),
      server.handlers.managementClient
    ]
  },
  handler: (req, reply) => {
    logger.info('Updating rule...');

    install(req.pre.auth0.rules, {
      extensionURL: config('PUBLIC_WT_URL'),
      clientID: config('AUTH0_CLIENT_ID'),
      clientSecret: config('AUTH0_CLIENT_SECRET')
    })
      .then(() => reply().code(204))
      .then(() => {
        logger.info('Rule successfully updated');
      })
      .catch((err) => {
        logger.error('Something went wrong, ', err);
        throw err;
      })
      .catch(err => reply.error(err));
  }
});
