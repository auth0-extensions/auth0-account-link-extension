const { decode } = require('jsonwebtoken');
const _ = require('lodash');
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
    matchingUsers: users
      .filter(u => u.user_id !== sub)
      .sort((prev, next) => new Date(prev.created_at) - new Date(next.created_at))
  }));

module.exports = () => ({
  method: 'GET',
  path: '/',
  config: {
    auth: false
  },
  handler: (req, reply) => {
    if (_.isEmpty(req.query)) {
      reply.redirect(`${config('PUBLIC_WT_URL')}/admin`);
      return;
    }
    const stylesheetHelper = stylesheet(config('NODE_ENV') === 'production');
    const stylesheetTag = stylesheetHelper.tag('link');
    const customCSSTag = stylesheetHelper.tag(config('CUSTOM_CSS'), true);
    const params = req.query;

    const dynamicSettings = {};

    if (params.locale) dynamicSettings.locale = params.locale;
    if (params.color) dynamicSettings.color = `#${params.color}`;
    if (params.title) dynamicSettings.title = params.title;
    if (params.logoPath) dynamicSettings.logoPath = params.logoPath;

    decodeToken(params.child_token)
      .then((token) => {
        fetchUsersFromToken(token)
          .then(({ currentUser, matchingUsers }) => {
            getSettings().then((settings) => {
              // if there are multiple matching users, take the oldest one
              const userMetadata = (matchingUsers[0] && matchingUsers[0].user_metadata) || {};
              const locale = typeof userMetadata.locale === 'string' ? userMetadata.locale : settings.locale;
              resolveLocale(locale).then((t) => {
                // FIXME: The "continue" button is always poiting to first user's identity
                // connection, so we can't show all available alternatives in the introduction
                // text: "You may sign in with IdP1 or IdP2 or..."
                // A proper fix could be showing multiple "continue" links (one per existing
                // identity) or one "continue" link with a connection selector.
                const rawIdentities =
                  matchingUsers.length > 0 ? [matchingUsers[0].identities[0]] : [];
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
                    identities: humanizedIdentities,
                    params,
                    token
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
