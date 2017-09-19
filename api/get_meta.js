import config from '../lib/config';
import metadata from '../webtask.json';

module.exports = _ => ({
  method: 'GET',
  path: '/meta',
  config: { auth: false },
  handler: (req, reply) => reply(metadata)
});
