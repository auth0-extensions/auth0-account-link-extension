import tools from 'auth0-extension-tools';
import config from '../../lib/config';

module.exports = () => ({
  method: 'GET',
  path: '/admin',
  handler: (req, reply) => {
    const sessionManager = new tools.SessionManager('auth0.auth0.com', config('AUTH0_DOMAIN'), config('WT_URL'));
    const url = sessionManager.createAuthorizeUrl({
      redirectUri: `${config('WT_URL')}/admin`,
      scopes: 'openid profile',
      expiration: 360000
    });

    reply.view('admin', { authorizationUrl: `${url}` });
  }
});
