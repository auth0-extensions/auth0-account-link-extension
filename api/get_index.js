const _ = require('lodash');
const config = require('../lib/config');
const indexTemplate = require('../templates/index');
const logger = require('../lib/logger');
const stylesheet = require('../lib/stylesheet');
const getIdentityProviderPublicName = require('../lib/idProviders');
const humanizeArray = require('../lib/humanize');
const locales = require('../lib/locale');
const storage = require('../lib/storage');
const linkingJwtUtils = require('../lib/linkingJwtUtils');

module.exports = () => ({
  method: 'GET',
  path: '/',
  options: {
    auth: false
  },
  handler: async (req, h) => {
    if (_.isEmpty(req.query)) {
      return h.redirect(`${config('PUBLIC_WT_URL')}/admin`);
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
    if (params.customDomain) dynamicSettings.customDomain = params.customDomain;
    try {
      const token = await linkingJwtUtils.validateAuth0Token(params.child_token);
      try {
        const { currentUser, matchingUsers } = await linkingJwtUtils.fetchUsersFromToken(token);
        const settings = await storage.getSettings();
        const userMetadata = (matchingUsers[0] && matchingUsers[0].user_metadata) || {};
        const locale = typeof userMetadata.locale === 'string' ? userMetadata.locale : settings.locale;
        const t = await locales.resolveLocale(locale);
        // FIXME: The "continue" button is always poiting to first user's identity
        // connection, so we can't show all available alternatives in the introduction
        // text: "You may sign in with IdP1 or IdP2 or..."
        // A proper fix could be showing multiple "continue" links (one per existing
        // identity) or one "continue" link with a connection selector.
        const rawIdentities = matchingUsers.length > 0 ? [matchingUsers[0].identities[0]] : [];
        const identities = rawIdentities.map(id => id.provider).map(getIdentityProviderPublicName);
        const humanizedIdentities = humanizeArray(identities, t('or'));
        const template = await indexTemplate.renderTemplate({
          dynamicSettings,
          stylesheetTag,
          currentUser,
          matchingUsers,
          customCSSTag,
          locale,
          identities: humanizedIdentities,
          params,
          token
        });

        return h.response(template).type('text/html').code(200);
      } catch (error) {
        const state = req.query.state;
        logger.error('An error was encountered: ', error);
        logger.info(
          `Redirecting to failed link to /continue: ${token.iss}continue?state=${
            req.query.state
          }`
        );

        return h.redirect(`${token.iss}continue?state=${state}`);
      }
    } catch (tokenError) {
      logger.error('An invalid token was provided', tokenError);

      const template = await indexTemplate.renderTemplate({
        dynamicSettings,
        stylesheetTag,
        currentUser: null,
        matchingUsers: [],
        customCSSTag
      });

      return h.response(template).type('text/html').code(400);
    }
  }
});
