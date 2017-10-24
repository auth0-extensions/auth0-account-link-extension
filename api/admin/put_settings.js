import { setSettings } from '../../lib/storage';

module.exports = () => ({
  method: 'PUT',
  path: '/admin/settings',
  handler: (req, reply) => {
    reply(setSettings(req.body));
  }
});
