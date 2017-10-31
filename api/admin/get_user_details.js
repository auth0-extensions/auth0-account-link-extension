import tools from 'auth0-extension-tools';
import config from '../../lib/config';
import avatarUrl from '../../lib/avatar';

module.exports = () => ({
  method: 'GET',
  path: '/admin/user',
  config: {
    auth: 'jwt'
  },
  handler: (req, reply) => {
    reply({
      email: req.auth.credentials.email,
      avatar: avatarUrl(req.auth.credentials.email)
    });
  }
});
