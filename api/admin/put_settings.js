import { setSettings } from '../../lib/storage';

module.exports = () => ({
  method: 'PUT',
  config: {
    auth: 'jwt'
  },
  path: '/admin/settings',
  handler: (req, reply) => {
    reply(setSettings(req.body));
  }
});
