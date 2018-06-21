const { decode } = require('jsonwebtoken');
const config = require('../lib/config');
const findUsersByEmail = require('../lib/findUsersByEmail');
const indexTemplate = require('../templates/index');
const logger = require('../lib/logger');
const stylesheet = require('../lib/stylesheet');
const getIdentityProviderPublicName = require('../lib/idProviders');
const humanizeArray = require('../lib/humanize');
const { resolveLocale } = require('../lib/locale');
const { getSettings } = require('../lib/storage');

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
      reply.redirect(`${config('PUBLIC_WT_URL')}/admin`).state('account-linking-admin-state', '');
      return;
    }

    const stylesheetHelper = stylesheet(config('NODE_ENV') === 'production');
    const stylesheetTag = stylesheetHelper.tag('link');
    const customCSSTag = stylesheetHelper.tag(config('CUSTOM_CSS'));

    const dynamicSettings = {};

    if (req.query.locale) dynamicSettings.locale = req.query.locale;
    if (req.query.color) dynamicSettings.color = `#${req.query.color}`;
    if (req.query.title) dynamicSettings.title = req.query.title;
    if (req.query.logoPath) dynamicSettings.logoPath = req.query.logoPath;

    decodeToken(req.query.child_token)
      .then((token) => {
        fetchUsersFromToken(token)
          .then(({ currentUser, matchingUsers }) => {
            getSettings().then((settings) => {
              const userMetadata = (matchingUsers[0] && matchingUsers[0].user_metadata) || {};
              const locale = userMetadata.locale || settings.locale;
              resolveLocale(locale).then((t) => {
                const rawIdentities = matchingUsers.length > 0 ? matchingUsers[0].identities : [];
                const identities = rawIdentities
                  .map(id => id.provider)
                  .map(getIdentityProviderPublicName);
                const humanizedIdentities = humanizeArray(identities, t('or'));

                reply(
                  indexTemplate({
                    dynamicSettings,
                    stylesheetTag,
                    currentUser,
                    matchingUsers,
                    customCSSTag,
                    locale,
                    identities: humanizedIdentities
                  })
                );
              });
            });
          })
          .catch((err) => {
            const state = req.query.state;
            logger.error('An error was encountered: ', err);
            logger.info(
              `Redirecting to failed link to /continue: ${token.iss}continue?state=${
                req.query.state
              }`
            );

            reply.redirect(`${token.iss}continue?state=${state}`);
          });
      })
      .catch((err) => {
        logger.error('An invalid token was provided', err);

        indexTemplate({
          dynamicSettings,
          stylesheetTag,
          currentUser: null,
          matchingUsers: [],
          customCSSTag
        }).then((template) => {
          reply(template).code(400);
        });
      });
  }
});
