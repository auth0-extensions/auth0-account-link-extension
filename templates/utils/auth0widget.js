/* eslint-disable arrow-parens */
const { resolveLocale } = require('../../lib/locale');
const { getSettings } = require('../../lib/storage');
const svgDimensions = require('../../lib/svgDimensions');
const lockOverlay = require('./lockOverlay');
const { lockOutlineClass } = require('./lockOverlay');

const identitiesRegex = new RegExp(/\{\{(\s+)?identities(\s+)?\}\}/);

const getLogo = settings => {
  if (settings.logoPath !== '') {
    return `<img src='${settings.logoPath}' class="auth0-lock-header-logo" />`;
  }

  return `
    <svg class="auth0-lock-header-logo" width="52.47px" height="58px" viewBox="0 0 151 172">
        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="logo-grey-horizontal">
                <g id="Group">
                <g id="LogoBadge" fill-opacity="1" fill="rgb(234, 83, 35)">
                    <path d="${svgDimensions.badge}" id="Shape"></path>
                </g>
                </g>
            </g>
        </g>
    </svg>`;
};

const getTitle = (settings, t) => {
  if (settings.title !== '') {
    return settings.title;
  }

  return t('accountLinking');
};

const getSubmitButton = (settings, t) => {
  let colorStyle = '';

  if (settings.color !== '') {
    colorStyle = `style="background-color: ${settings.color}"`;
  }

  return `
    <button class="auth0-lock-submit" ${colorStyle} type="button" id="link">
      <span class="auth0-label-submit">
        <span id="label-value">${t('continue')}</span>
        <span>
          <svg class="icon-text" width="8px" height="12px" viewBox="0 0 8 12" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Web/Submit/Active" transform="translate(-148.000000, -32.000000)" fill="#FFFFFF"><polygon id="Shape" points="148 33.4 149.4 32 155.4 38 149.4 44 148 42.6 152.6 38"></polygon></g></g></svg>
        </span>
      </span>
    </button>`;
};

module.exports = (dynamicSettings, identities, locale = 'en') =>
  getSettings().then(storedSettings => {
    const settings = Object.assign(storedSettings, dynamicSettings);
    return resolveLocale(locale).then(t => `
            <div id="auth0-lock-container-1" class="auth0-lock-container">
                <div class="auth0-lock auth0-lock-opened auth0-lock-with-tabs ${lockOutlineClass(
    settings.removeOverlay
  )}">
                    ${lockOverlay(settings.removeOverlay)}
                    <div class="auth0-lock-center">
                        <form class="auth0-lock-widget">
                        <div class="auth0-lock-widget-container">
                            <div class="auth0-lock-cred-pane auth0-lock-quiet">
                            <div class="auth0-lock-header">
                                <div class="auth0-lock-header-bg auth0-lock-blur-support">
                                <div class="auth0-lock-header-bg-blur"></div>
                                <div class="auth0-lock-header-bg-solid"></div>
                                </div>
                                <div class="auth0-lock-header-welcome">
                                  ${getLogo(settings)}
                                  <div class="auth0-lock-name">${getTitle(settings, t)}</div>
                                </div>
                            </div>
                            <div id="error-message" class="auth0-global-message auth0-global-message-error"></div>
                            <div style="position: relative;">
                                <span>
                                <div class="">
                                    <div style="visibility: inherit;">
                                    <div class="auth0-lock-view-content">
                                        <div style="position: relative;">
                                        <div class="auth0-lock-body-content">
                                            <div class="auth0-lock-content">
                                            <div class="auth0-lock-form" id="content-container">
                                                <div>
                                                <p id="message">
                                                    ${t('introduction')} ${t('identities').replace(identitiesRegex, identities)}.
                                                </p>
                                                <p class="auth0-lock-alternative">
                                                    <a class="auth0-lock-alternative-link" id="skip" href="#">
                                                    ${t('skipAlternativeLink')}
                                                    </a>
                                                </p>
                                                </div>
                                            </div>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                </span>
                            </div>
                            <div class="auth0-lock-actions">
                                ${getSubmitButton(settings, t)}
                            </div>
                            </div>
                        </div>
                        </form>
                    </div>
                </div>
            </div>
            <script>
                window.Auth0AccountLinkingExtension = window.Auth0AccountLinkingExtension || {};
                window.Auth0AccountLinkingExtension.locale = {
                    pageMismatchError: '${t('pageMismatchError')}',
                    sameEmailAddressError: '${t('sameEmailAddressError')}'
                }
            </script>
            `);
  });
