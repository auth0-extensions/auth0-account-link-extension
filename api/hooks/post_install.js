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
    console.log("Starting rule installation...");

    install(req.pre.auth0.rules, {
      extensionURL: config('PUBLIC_WT_URL'),
      clientID: config('AUTH0_CLIENT_ID'),
      clientSecret: config('AUTH0_CLIENT_SECRET')
    })
      .then(_ => reply().code(204))
      .then(_ => { console.log("Rule successfully installed"); })
      .catch((err) => {
        console.error("Something went wrong, ", err);
        throw err;
      })
      .catch((err) => reply.error(err));
  }
});
