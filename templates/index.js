import defaultTemplate from './utils/defaultTemplate';
import { get as getStorage } from '../lib/db';

import buildAuth0Widget from './utils/auth0widget';
import buildExtensionScripts from './utils/extensionScripts';

const VAR_REGEX = /\{\{\s*(.*?)\s*\}\}/g;
const render = (template, locals = {}) => {
  if (!template || typeof template !== 'string') {
    throw new Error('Invalid template provided');
  }

  return template.replace(VAR_REGEX, (match, name) => locals[name] || '');
};

export default ({ stylesheetTag, customCSSTag, currentUser, matchingUsers, dynamicSettings, identities, locale }) =>
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
