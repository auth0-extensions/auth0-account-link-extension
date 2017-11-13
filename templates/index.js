import { render } from 'micromustache';
import svgDimensions from '../lib/svgDimensions';
import defaultTemplate from './utils/defaultTemplate';
import { get as getStorage } from '../lib/db';

import buildAuth0Widget from './utils/auth0widget';
import buildExtensionScripts from './utils/extensionScripts';

const stylesheetTag = href => (href ? `<link rel="stylesheet" href="${href}" />` : '');

export default ({ stylesheetLink, customCSS, currentUser, matchingUsers, dynamicSettings }) =>
  new Promise((resolve) => {
    getStorage().read().then((data) => {
      const template = data.settings ? data.settings.template : defaultTemplate;
      
      buildAuth0Widget(dynamicSettings).then((Auth0Widget) => {
        resolve(render(template, {
          ExtensionCSS: stylesheetTag(stylesheetLink),
          CustomCSS: stylesheetTag(customCSS),
          Auth0Widget,
          ExtensionScripts: buildExtensionScripts(currentUser, matchingUsers)
        }));
      });
    });
  })
