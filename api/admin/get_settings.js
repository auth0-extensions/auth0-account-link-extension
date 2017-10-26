import { getSettings } from '../../lib/storage';

module.exports = () => ({
  method: 'GET',
  config: {
    auth: 'jwt'
  },
  path: '/admin/settings',
  handler: (req, reply) => {
    reply(getSettings());
  }
});
