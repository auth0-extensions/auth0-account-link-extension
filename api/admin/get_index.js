import tools from 'auth0-extension-tools';
import config from '../../lib/config';

module.exports = () => ({
  method: 'GET',
  path: '/admin',
  config: {
    auth: false
  },
  handler: (req, reply) => {
    reply.view('admin');
  }
});
