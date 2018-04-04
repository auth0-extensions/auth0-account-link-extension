const svgDimensions = require('../../lib/svgDimensions');

const lockOutlineClass = (hide = false) => (hide ? 'auth0-lock-outlined' : '');

function lockOverlay(hide = false) {
  if (hide) {
    return '';
  }

  return `
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
    </div>`;
}

module.exports = lockOverlay;
module.exports.lockOutlineClass = lockOutlineClass;
