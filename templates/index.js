import svgDimensions from '../lib/svgDimensions';

const stylesheetTag = href => (href ? `<link rel="stylesheet" href="${href}" />` : '');

export default ({stylesheetLink, customCSS, currentUser, matchingUsers}) => {
  return `
<!doctype html>
<html class="auth0-lock-html">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
    <meta name="author" content="Auth0">
    <meta name="description" content="Easily link two accounts into one">
    <title>Auth0 Account Linking Extension</title>
    <link rel="shortcut icon" href="https://auth0.com/auth0-styleguide/img/favicon.png" />
    ${stylesheetTag(stylesheetLink)}
    ${stylesheetTag(customCSS)}
  </head>
  <body>
    <div id="auth0-lock-container-1" class="auth0-lock-container">
      <div class="auth0-lock auth0-lock-opened auth0-lock-with-tabs">
        <div class="auth0-lock-overlay">
          <span class="auth0-lock-badge-bottom">
            <a href="https://auth0.com/?utm_source=lock&amp;utm_campaign=badge&amp;utm_medium=widget" target="_blank" class="auth0-lock-badge">
              <svg width="58px" height="21px" viewBox="0 0 462 168">
                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g id="logo-grey-horizontal">
                    <g id="Group">
                      <g id="LogoText" transform="translate(188.000000, 41.500000)" fill="#D0D2D3">
                        <path d="${svgDimensions.text}" id="Shape"></path>
                      </g>
                      <g id="LogoBadge" fill-opacity="0.4" fill="#FFFFFF">
                        <path d="${svgDimensions.badge}" id="Shape"></path>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </a>
          </span>
        </div>
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
                    </svg>
                    <div class="auth0-lock-name">Account Linking</div>
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
                                      It looks like you have another account
                                      with the same email address. We recommend
                                      you link these accounts.
                                    </p>
                                    <p class="auth0-lock-alternative">
                                      <a class="auth0-lock-alternative-link" id="skip" href="#">
                                        I want to skip this and create a new account. (Not recommended)
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
                  <button class="auth0-lock-submit" type="button" id="link">
                    <span class="auth0-label-submit">
                      <span id="label-value">Continue</span>
                      <span>
                        <svg class="icon-text" width="8px" height="12px" viewBox="0 0 8 12" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Web/Submit/Active" transform="translate(-148.000000, -32.000000)" fill="#FFFFFF"><polygon id="Shape" points="148 33.4 149.4 32 155.4 38 149.4 44 148 42.6 152.6 38"></polygon></g></g></svg>
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <script src="https://unpkg.com/jwt-decode@2.2.0/build/jwt-decode.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qs/6.5.0/qs.min.js"></script>
    <script type="text/javascript">
      var params = window.Qs.parse(window.location.search, { ignoreQueryPrefix: true });
      var currentUser = ${JSON.stringify(currentUser)};
      var matchingUsers = ${JSON.stringify(matchingUsers)};

      try {
        loadLinkPage(window.jwt_decode(params.child_token));
      } catch(e) {
        console.error(e);
        loadInvalidTokenPage();
      }

      function loadLinkPage(token) {
        var linkEl = document.getElementById('link');
        var skipEl = document.getElementById('skip');
        var connections = matchingUsers.reduce(function(acc, user) {
          return acc.concat(user.connections);
        }, []);

        var authorize = function(domain, qs) {
          var query = Object.keys(qs)
            .filter(function(key) {
              return !!qs[key];
            })
            .map(function (key) {
              return key + '=' + encodeURI(qs[key]);
            }).join('&');

          window.location = domain + 'authorize?' + query;
        };

        var updateContinueUrl = function(linkEl, domain, state) {
          linkEl.href = domain + 'continue?state=' + state;
        };

        linkEl.addEventListener('click', function(e) {
          authorize(token.iss, {
            client_id: params.client_id,
            redirect_uri: params.redirect_uri,
            response_type: params.response_type,
            scope: params.scope,
            state: params.original_state,
            nonce: params.nonce,
            link_account_token: params.child_token,
            prevent_sign_up: true,
            connection: connections[0]
          });
        });

        updateContinueUrl(skipEl, token.iss, params.state);

        if (params.error_type === 'accountMismatch') {
          loydAccountMismatchError();
        }
      }

      function loadInvalidTokenPage() {
        var containerEl = document.getElementById('content-container');
        var labelEl = document.getElementById('label-value');
        var linkEl = document.getElementById('link');

        containerEl.innerHTML = '';
        containerEl.appendChild(
          el('div', {}, [
            el('p', {}, [
              text('You seem to have reached this page in error. Please try logging in again')
            ])
          ])
        );

        linkEl.disabled = true;
      };

      function loadAccountMismatchError() {
        var messageEl = document.getElementById('error-message');
        var msg = "Accounts must have matching email addresses. Please try again.";

        messageEl.innerHTML = msg;
        messageEl.style.display = 'block';
      };

      function el(tagName, attrs, childEls) {
        var element = document.createElement(tagName);
        var children = childEls || [];

        for (var i in Object.keys(attrs || {})) {
          element.setAttribute(i, attrs[i]);
        }

        for (var i in children) {
          element.appendChild(children[i]);
        }

        return element;
      }

      function text(content) {
        return document.createTextNode(content);
      }
    </script>
  </body>
</html>
`;
};
