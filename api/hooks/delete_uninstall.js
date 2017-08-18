import { uninstall } from '../../modifyRule';

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
    console.log("Starting uninstall...")
    uninstall(req.pre.auth0.rules)
      .then(_ => reply().code(204))
      .catch((err) => {
        console.error("Something went wrong, ", err);
        throw err;
      })
      .catch((err) => reply.error(err));
  }
});
