import config from '../lib/config';

const CDN_CSS = 'https://cdn.auth0.com/extensions/auth0-account-link-extension/1.0.0/link.min.css';
const stylesheetTag = href => (href ? `<link rel="stylesheet" href="${href}" />` : '');
const auth0SVGDimensions = {
  text: 'M246.517,0.11 C238.439,0.11 231.607,3.916 226.759,11.115 C221.94,18.271 219.393,28.26 219.393,40 C219.393,51.74 221.94,61.729 226.759,68.884 C231.607,76.084 238.439,79.889 246.517,79.889 C254.595,79.889 261.427,76.084 266.275,68.884 C271.093,61.729 273.64,51.74 273.64,40 C273.64,28.26 271.093,18.271 266.275,11.115 C261.427,3.916 254.595,0.11 246.517,0.11 L246.517,0.11 Z M246.517,70.005 C242.655,70.005 239.604,67.82 237.187,63.324 C234.268,57.893 232.66,49.61 232.66,40 C232.66,30.39 234.268,22.106 237.187,16.676 C239.604,12.18 242.655,9.994 246.517,9.994 C250.378,9.994 253.43,12.18 255.847,16.676 C258.766,22.106 260.373,30.389 260.373,40 C260.373,49.611 258.766,57.895 255.847,63.324 C253.43,67.82 250.378,70.005 246.517,70.005 L246.517,70.005 Z M71.45,29.172 L71.45,63.484 C71.45,72.53 78.81,79.889 87.856,79.889 C95.746,79.889 101.707,75.975 103.902,74.291 C104.024,74.197 104.184,74.169 104.331,74.216 C104.478,74.263 104.592,74.379 104.637,74.527 L105.961,78.86 L115.737,78.86 L115.737,29.172 L103.175,29.172 L103.175,66.326 C103.175,66.501 103.076,66.662 102.921,66.743 C100.559,67.961 95.899,70.006 91.231,70.006 C87.252,70.006 84.012,66.768 84.012,62.787 L84.012,29.172 L71.45,29.172 L71.45,29.172 Z M197.237,78.859 L209.8,78.859 L209.8,44.547 C209.8,35.501 202.44,28.141 193.394,28.141 C186.735,28.141 181.393,31.004 178.802,32.71 C178.657,32.805 178.473,32.813 178.322,32.731 C178.171,32.649 178.075,32.491 178.075,32.318 L178.075,1.141 L165.513,1.141 L165.513,78.859 L178.075,78.859 L178.075,41.704 C178.075,41.529 178.174,41.368 178.33,41.288 C180.691,40.069 185.352,38.025 190.019,38.025 C191.947,38.025 193.76,38.776 195.123,40.139 C196.486,41.502 197.236,43.316 197.236,45.243 L197.236,78.859 L197.237,78.859 Z M124.792,39.055 L132.438,39.055 C132.697,39.055 132.907,39.265 132.907,39.524 L132.907,66.858 C132.907,74.043 138.753,79.888 145.938,79.888 C148.543,79.888 151.113,79.512 153.585,78.77 L153.585,69.796 C152.143,69.923 150.485,70.005 149.313,70.005 C147.193,70.005 145.469,68.28 145.469,66.161 L145.469,39.523 C145.469,39.264 145.679,39.054 145.938,39.054 L153.585,39.054 L153.585,29.171 L145.938,29.171 C145.679,29.171 145.469,28.961 145.469,28.702 L145.469,12.295 L132.907,12.295 L132.907,28.702 C132.907,28.961 132.697,29.171 132.438,29.171 L124.792,29.171 L124.792,39.055 L124.792,39.055 Z M51.361,78.859 L64.429,78.859 L44.555,9.55 C42.962,3.992 37.811,0.11 32.029,0.11 C26.247,0.11 21.096,3.992 19.502,9.55 L-0.372,78.859 L12.697,78.859 L18.449,58.798 C18.507,58.597 18.691,58.459 18.9,58.459 L45.158,58.459 C45.367,58.459 45.552,58.597 45.609,58.798 L51.361,78.859 L51.361,78.859 Z M42.056,48.576 L22.004,48.576 C21.857,48.576 21.718,48.507 21.629,48.388 C21.541,48.272 21.513,48.119 21.553,47.978 L31.579,13.012 C31.637,12.811 31.821,12.673 32.03,12.673 C32.239,12.673 32.423,12.811 32.48,13.012 L42.507,47.978 C42.547,48.12 42.519,48.272 42.43,48.388 C42.342,48.507 42.203,48.576 42.056,48.576 L42.056,48.576 Z',
  badge: 'M119.555,135.861 L102.705,83.997 L146.813,51.952 L92.291,51.952 L75.44,0.09 L75.435,0.076 L129.965,0.076 L146.82,51.947 L146.821,51.946 L146.835,51.938 C156.623,82.03 146.542,116.256 119.555,135.861 L119.555,135.861 Z M31.321,135.861 L31.307,135.871 L75.426,167.924 L119.555,135.862 L75.44,103.808 L31.321,135.861 L31.321,135.861 Z M4.052,51.939 L4.052,51.939 C-6.252,83.66 5.709,117.272 31.312,135.867 L31.316,135.851 L48.168,83.99 L4.07,51.951 L58.579,51.951 L75.431,0.089 L75.435,0.075 L20.902,0.075 L4.052,51.939 L4.052,51.939 Z'
};

module.exports = _ => ({
  method: 'GET',
  path: '/',
  handler: (req, reply) => {
    const stylesheetLink = config('NODE_ENV') === 'production' ? CND_CSS : '/css/link.css';
    reply(`
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
    ${stylesheetTag(config('CUSTOM_CSS'))}
    <style type="text/css">
      /* Make changes to CSS here */
    </style>
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
                        <path d="${auth0SVGDimensions.text}" id="Shape"></path>
                      </g>
                      <g id="LogoBadge" fill-opacity="0.4" fill="#FFFFFF">
                        <path d="${auth0SVGDimensions.badge}" id="Shape"></path>
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
                              <path d="${auth0SVGDimensions.badge}" id="Shape"></path>
                            </g>
                          </g>
                        </g>
                      </g>
                    </svg>
                    <div class="auth0-lock-name">Link Accounts</div>
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

      try {
        loadLinkPage(window.jwt_decode(params.child_token));
      } catch(e) {
        console.error(e);
        loadInvalidTokenPage();
      }

      function loadLinkPage(token) {
        var linkEl = document.getElementById('link');
        var skipEl = document.getElementById('skip');
        var connections = token.targetUsers.reduce(function(acc, user) {
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
            connection: connections[0]
          });
        });

        updateContinueUrl(skipEl, token.iss, params.state);

        if (params.errorType === 'accountMismatch') {
          loadAccountMismatchError();
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
`);
  }
});
