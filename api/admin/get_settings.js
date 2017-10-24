import { getSettings } from '../../lib/storage';

module.exports = () => ({
  method: 'GET',
  path: '/admin/settings',
  handler: (req, reply) => {
    reply(getSettings());
  }
});
