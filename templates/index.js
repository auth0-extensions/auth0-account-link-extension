import { render } from 'micromustache';
import svgDimensions from '../lib/svgDimensions';
import defaultTemplate from './utils/defaultTemplate';

import buildAuth0Widget from './utils/auth0widget';
import buildExtensionScripts from './utils/extensionScripts';

const stylesheetTag = href => (href ? `<link rel="stylesheet" href="${href}" />` : '');

export default ({ stylesheetLink, customCSS, currentUser, matchingUsers }) =>
  render(defaultTemplate, {
    ExtensionCSS: stylesheetTag(stylesheetLink),
    CustomCSS: stylesheetTag(customCSS),
    Auth0Widget: buildAuth0Widget(),
    ExtensionScripts: buildExtensionScripts(currentUser, matchingUsers)
  });
