const puppeteer = require('puppeteer');
const { expect } = require('chai');
const nock = require('nock');
const { sign } = require('jsonwebtoken');
const { createServer } = require('../test/test_helper');
const config = require('../lib/config');

let DOMAIN, CLIENT_ID, CLIENT_SECRET, ISSUER;

const primaryUser = {
  user_id: 'auth0|primary001',
  email: 'jane.doe@example.com',
  email_verified: true,
  identities: [{ connection: 'Username-Password-Authentication', user_id: 'primary001', provider: 'auth0', isSocial: false }],
  created_at: '2024-01-01T00:00:00.000Z',
};

const secondaryUser = {
  user_id: 'auth0|secondary001',
  email: 'jane.doe@example.com',
  email_verified: true,
  identities: [{ connection: 'google-oauth2', user_id: 'secondary001', provider: 'google-oauth2', isSocial: true }],
  created_at: '2024-01-02T00:00:00.000Z',
};

// Replaces createUsers() from the original tests: forges the signed child_token that
// the real Auth0 OAuth flow would have produced, letting us drive the extension UI
// directly without a live tenant.
const makeChildToken = (user) =>
  sign(
    { sub: user.user_id, email: user.email },
    CLIENT_SECRET,
    { audience: CLIENT_ID, issuer: ISSUER, expiresIn: '5m' }
  );

const makeQueryString = (childToken, overrides = {}) => {
  const params = {
    child_token: childToken,
    client_id: CLIENT_ID,
    redirect_uri: 'http://localhost:3000/callback',
    scope: 'openid profile',
    response_type: 'code',
    state: 'test-state-123',
    original_state: 'test-original-state-456',
    nonce: 'test-nonce',
    ...overrides,
  };
  return new URLSearchParams(params).toString();
};

// Returns a properly signed JWT so getAccessTokenCached (auth0-extension-tools) can
// decode exp and cache the token consistently across platforms. Without a valid JWT
// the TTL is NaN, which Node.js/V8 treats inconsistently on different OSes — the
// token may or may not be cached, causing flaky "pending mock" failures in afterEach.
const nockMgmtToken = () =>
  nock(`https://${DOMAIN}`)
    .post('/oauth/token', {
      audience: `https://${DOMAIN}/api/v2/`,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials',
    })
    .reply(200, {
      access_token: sign({}, CLIENT_SECRET, { expiresIn: '1h' }),
      token_type: 'Bearer',
      expires_in: 3600,
    });

const nockUsersByEmail = (users, email = primaryUser.email) =>
  nock(`https://${DOMAIN}`)
    .get('/api/v2/users-by-email')
    .query({ email })
    .reply(200, users);

describe('Account linking tests', function () {
  let server, browser, page, baseUrl;

  before(async function () {
    server = await createServer();
    DOMAIN = config('AUTH0_DOMAIN');
    CLIENT_ID = config('AUTH0_CLIENT_ID');
    CLIENT_SECRET = config('AUTH0_CLIENT_SECRET');
    ISSUER = `https://${DOMAIN}/`;

    await server.start();
    baseUrl = server.info.uri;

    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  });

  after(async function () {
    if (browser) await browser.close();
    if (server) await server.stop();
    nock.cleanAll();
  });

  beforeEach(async function () {
    page = await browser.newPage();
  });

  afterEach(async function () {
    if (page) await page.close();
    expect(nock.pendingMocks()).to.be.empty;
    nock.cleanAll();
  });

  it('detects repeated email and links account', async function () {
    nockMgmtToken();
    nockUsersByEmail([primaryUser, secondaryUser]);

    await page.goto(`${baseUrl}/?${makeQueryString(makeChildToken(primaryUser))}`, {
      waitUntil: 'networkidle0',
    });

    await page.waitForSelector('#link');

    // Intercept the client-side authorize redirect triggered by clicking #link.
    // The extension builds the authorize URL entirely in the browser (public/index.js)
    // so no additional server-side API calls are made after the page loads.
    await page.setRequestInterception(true);
    const authorizeUrlPromise = new Promise((resolve) => {
      page.on('request', (req) => {
        const url = req.url();
        if (url.includes('/authorize?')) {
          req.abort();
          resolve(url);
        } else {
          req.continue();
        }
      });
    });

    await page.click('#link').catch(() => {});
    const authorizeUrl = await authorizeUrlPromise;

    const params = new URL(authorizeUrl).searchParams;
    expect(params.get('link_account_token')).to.be.a('string').and.not.be.empty;
    expect(params.get('connection')).to.equal('google-oauth2');
    expect(params.get('client_id')).to.equal(CLIENT_ID);
  });

  it('skips linking', async function () {
    // Token was cached after test 1; only nock the Management API users call.
    nockUsersByEmail([primaryUser, secondaryUser]);

    await page.goto(`${baseUrl}/?${makeQueryString(makeChildToken(primaryUser))}`, {
      waitUntil: 'networkidle0',
    });

    await page.waitForSelector('#skip');

    // The skip href is set by JS on page load to `${token.iss}continue?state=`.
    // Intercept after page load so the initial requests aren't affected.
    await page.setRequestInterception(true);
    const continueUrlPromise = new Promise((resolve) => {
      page.on('request', (req) => {
        const url = req.url();
        if (url.includes('/continue?')) {
          req.abort();
          resolve(url);
        } else {
          req.continue();
        }
      });
    });

    await page.evaluate(() => document.querySelector('#skip').click());
    const continueUrl = await continueUrlPromise;

    expect(new URL(continueUrl).searchParams.get('state')).to.equal('test-state-123');
  });

  it('shows an error when invalid token is provided', async function () {
    await page.goto(`${baseUrl}/?${makeQueryString('')}`, {
      waitUntil: 'networkidle0',
    });

    const text = await page.evaluate(
      () =>
        document.querySelector('#content-container > div:nth-child(1) > p:nth-child(1)').textContent
    );
    expect(text).to.equal('You seem to have reached this page in error. Please try logging in again');
  });

  it('shows an error when no parameters are provided', async function () {
    // Empty query redirects to admin (server/routes GET / handler).
    // Puppeteer follows the redirect; we verify the final URL is the admin page.
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    expect(page.url()).to.include('/admin');
  });

  it('shows error message when upstream API fails', async function () {
    // Token is still cached from test 1; only nock the failing users-by-email call.
    nock(`https://${DOMAIN}`)
      .get('/api/v2/users-by-email')
      .query({ email: primaryUser.email })
      .reply(500, { error: 'server_error', message: 'Internal server error' });

    // When the Management API fails the server redirects to /continue?state= rather
    // than rendering an error page (api/get_index.js catch block). Intercept that
    // redirect to assert the server handled the failure and preserved the state.
    await page.setRequestInterception(true);
    const continueUrlPromise = new Promise((resolve) => {
      page.on('request', (req) => {
        const url = req.url();
        if (url.includes('/continue?')) {
          req.abort();
          resolve(url);
        } else {
          req.continue();
        }
      });
    });

    page.goto(`${baseUrl}/?${makeQueryString(makeChildToken(primaryUser))}`).catch(() => {});
    const continueUrl = await continueUrlPromise;

    expect(new URL(continueUrl).searchParams.get('state')).to.equal('test-state-123');
  });
});
