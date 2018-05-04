const metadata = require('../webtask.json');

module.exports = () => ({
  method: 'GET',
  path: '/meta',
  config: { auth: false },
  handler: (req, reply) => reply(metadata)
});
