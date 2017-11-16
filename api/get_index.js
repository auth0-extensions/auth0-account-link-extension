import { decode } from 'jsonwebtoken';
import config from '../lib/config';
import findUsersByEmail from '../lib/findUsersByEmail';
import indexTemplate from '../templates/index';
import logger from '../lib/logger';

const version = require('../package.json').version;

const CDN_CSS = `https://cdn.auth0.com/extensions/auth0-account-link-extension/${version}/link.min.css`;

const decodeToken = token =>
  new Promise((resolve, reject) => {
    try {
      resolve(decode(token));
    } catch (e) {
      reject(e);
    }
  });

const fetchUsersFromToken = ({ sub, email }) =>
  findUsersByEmail(email).then(users => ({
    currentUser: users.find(u => u.user_id === sub),
    matchingUsers: users.filter(u => u.user_id !== sub)
  }));

module.exports = () => ({
  method: 'GET',
  path: '/',
  config: {
    auth: false
  },
  handler: (req, reply) => {
    const linkingState = req.state['account-linking-admin-state'];
    if (typeof linkingState !== 'undefined' && linkingState !== '') {
      reply.redirect('/admin').state('account-linking-admin-state', '');
      return;
    }

    const stylesheetLink = config('NODE_ENV') === 'production' ? CDN_CSS : '/css/link.css';

    const dynamicSettings = {};

    if (req.query.locale) dynamicSettings.locale = req.query.locale;
    if (req.query.color) dynamicSettings.color = `#${req.query.color}`;
    if (req.query.title) dynamicSettings.title = req.query.title;
    if (req.query.logoPath) dynamicSettings.logoPath = req.query.logoPath;

    decodeToken(req.query.child_token)
      .then((token) => {
        fetchUsersFromToken(token)
          .then(({ currentUser, matchingUsers }) => {
            reply(
              indexTemplate({
                dynamicSettings,
                stylesheetLink,
                currentUser,
                matchingUsers,
                customCSS: config('CUSTOM_CSS')
              })
            );
          })
          .catch((err) => {
            const state = req.query.state;
            logger.error('An error was encountered: ', err);
            logger.info(
              `Redirecting to failed link to /continue: ${token.iss}continue?state=${req.query
                .state}`
            );

            reply.redirect(`${token.iss}continue?state=${state}`);
          });
      })
      .catch((err) => {
        logger.error('An invalid token was provided', err);

        indexTemplate({
          dynamicSettings,
          stylesheetLink,
          currentUser: null,
          matchingUsers: [],
          customCSS: config('CUSTOM_CSS')
        }).then((template) => {
          reply(template).code(400);
        });
      });
  }
});
