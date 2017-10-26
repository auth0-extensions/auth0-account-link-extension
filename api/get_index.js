import config from '../lib/config';
import { decode } from 'jsonwebtoken';
import findUsersByEmail from '../lib/findUsersByEmail';
import indexTemplate from '../templates/index';

const version = require('../package.json').version;

const CDN_CSS = `https://cdn.auth0.com/extensions/auth0-account-link-extension/${version}/link.min.css`;

const decodeToken = (token) => (
  new Promise((resolve, reject) => {
    try {
      resolve(decode(token));
    } catch(e) {
      reject(e);
    }
  })
);

const fetchUsersFromToken = ({sub, email}) => (
  findUsersByEmail(email).then(users => ({
    currentUser: users.find(u => u.user_id === sub),
    matchingUsers: users.filter(u => u.user_id !== sub)
  }))
);

module.exports = _ => ({
  method: 'GET',
  path: '/',
  config: {
    auth: false
  },
  handler: (req, reply) => {
  
    const state = req.state['account-linking-admin-state'];
    console.log(state);
    if (typeof state !== 'undefined' && state !== '') {
      reply.redirect('/admin');
    }

    const stylesheetLink = config('NODE_ENV') === 'production' ? CDN_CSS : '/css/link.css';

    decodeToken(req.query.child_token).then(token => {
      fetchUsersFromToken(token).then(({currentUser, matchingUsers}) => {
        reply(indexTemplate({
          stylesheetLink,
          currentUser,
          matchingUsers,
          customCSS: config('CUSTOM_CSS')
        }));
      })
      .catch(err => {
        const state = req.query.state;
        console.error("An error was encountered: ", err);
        console.info(`Redirecting to failed link to /continue: ${token.iss}continue?state=${req.query.state}`);

        reply.redirect(`${token.iss}continue?state=${state}`);
      });
    }).catch(err => {
      console.error("An invalid token was provided", err);

      reply(indexTemplate({
        stylesheetLink,
        currentUser: null,
        matchingUsers: [],
        customCSS: config('CUSTOM_CSS')
      })).code(400);
    });
  }
});
