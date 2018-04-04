const defaultTemplate = require('./utils/defaultTemplate');
const getStorage = require('../lib/db').get;

const buildAuth0Widget = require('./utils/auth0widget');
const buildExtensionScripts = require('./utils/extensionScripts');

const VAR_REGEX = /\{\{\s*(.*?)\s*\}\}/g;
const render = (template, locals = {}) => {
  if (!template || typeof template !== 'string') {
    throw new Error('Invalid template provided');
  }

  return template.replace(VAR_REGEX, (match, name) => locals[name] || '');
};

module.exports = ({
  stylesheetTag, customCSSTag, currentUser, matchingUsers, dynamicSettings, identities, locale
}) =>
  Promise.all([buildAuth0Widget(dynamicSettings, identities, locale), getStorage().read()])
    .then(([widget, data]) => {
      const template = data.settings ? data.settings.template : defaultTemplate;

      return render(template, {
        ExtensionCSS: stylesheetTag,
        CustomCSS: customCSSTag,
        Auth0Widget: widget,
        ExtensionScripts: buildExtensionScripts(currentUser, matchingUsers)
      });
    });
