import { uninstall } from '../../modifyRule';
import config from '../../lib/config';

module.exports = (server) => ({
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
    console.log("Starting uninstall...");

    Promise.all([
      uninstall(req.pre.auth0.rules),
      req.pre.auth0.deleteClient({ client_id: config('AUTH0_CLIENT_ID')})
    ])
      .then(_ => reply().code(204))
      .catch((err) => {
        console.error("Something went wrong while uninstalling Account Link Extension: ", err);

        // Swallow the error so we do not break the experience for the user
        reply().code(204);
      });
  }
});
