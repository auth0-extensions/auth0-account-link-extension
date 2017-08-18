import { install } from '../../modifyRule';
import config from '../../lib/config';

module.exports = (server) => ({
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
    console.log("Starting install...")
    install(req.pre.auth0.rules, { extensionURL: config('PUBLIC_WT_URL') })
      .then(_ => reply().code(204))
      .catch((err) => {
        console.error("Something went wrong, ", err);
        throw err;
      })
      .catch((err) => reply.error(err));
  }
});
