const puppeteer = require('puppeteer');
const { expect } = require('chai');
const { deleteTestUsers, usersWithSameEmailCount, wait, buildQueryString } = require('./utils');

const SAMPLE_APP_BASE = 'http://localhost:3000';

let page;
let browser;

const app = pathUrl => `${SAMPLE_APP_BASE}${pathUrl}`;

const testEmail = 'jane.doe.auth0.testing@gmail.com';
const testPassword = 'Passw0rdLe55!';

describe('Account linking tests', () => {
  beforeEach(async () => {
    browser = await puppeteer.launch({ headless: false, width: 1366, height: 768 });
    page = await browser.newPage();

    await deleteTestUsers(testEmail).catch((e) => {
      console.log("Couldn't delete test users. Details:", e);
    });
  });

  afterEach(async () => {
    browser.close();
  });

  it('detects repeated email and links account', async () => {
    await createUsers();

    await page.waitForSelector('#link');
    await page.click('#link');
    await wait(3);

    expect(await usersWithSameEmailCount(testEmail)).equal(1);
    expect(await page.url()).equal(app`/user`);
  });

  it('skips linking', async () => {
    await createUsers();

    await page.evaluate(() => document.querySelector('#skip').click());

    await page.waitForNavigation();
    await page.click('#allow');

    await page.waitForNavigation();
    expect(await usersWithSameEmailCount(testEmail)).equal(2);
    expect(await page.url()).equal(app`/user`);
  });

  it('shows an error when invalid token is provided', async () => {
    const path = buildQueryString({
      childToken: '',
      clientId: 'som3-s3cr37-1d',
      redirectUri: 'http://localhost:3000/callback',
      scope: 'openid profile',
      responseType: 'code',
      auth0Client: '',
      originalState: 's0m3-0riginal-s7473',
      nonce: 's0m3-n0nc3',
      errorType: '',
      state: 's0m3-s7473'
    });

    await page.goto(`http://localhost:3001${path}`);
    await wait(1);

    const text = await page.evaluate(
      () =>
        document.querySelector('#content-container > div:nth-child(1) > p:nth-child(1)').textContent
    );

    expect(text).equal('You seem to have reached this page in error. Please try logging in again');
  });

  it('shows an error when no parameters are provided', async () => {
    await page.goto('http://localhost:3001');
    await wait(1);

    const text = await page.evaluate(
      () =>
        document.querySelector('#content-container > div:nth-child(1) > p:nth-child(1)').textContent
    );

    expect(text).equal('You seem to have reached this page in error. Please try logging in again');
  });
});

/**
 * Creates two users with the same email address.
 * This procedure should result in a redirect to the
 * account linking extension.
 */
async function createUsers() {
  await page.goto(app`/`);
  await page.waitForSelector('#login-button');
  await page.click('#login-button');
  await page.waitForNavigation();

  await wait(2);

  await page.click(
    '#auth0-lock-container-1 > div > div.auth0-lock-center > form > div > div > div:nth-child(3) > span > div > div > div > div > div > div > div > div > div.auth0-lock-tabs-container > ul > li:nth-child(2) > a'
  );

  await wait(0.5);

  await page.waitForSelector('input[name="email"]');
  await page.click('input[name="email"]');
  await page.type(testEmail);

  await page.click('input[name="password"]');
  await page.type(testPassword);

  await page.waitForSelector('.auth0-lock-submit');
  await page.click('.auth0-lock-submit');

  await page.waitForNavigation();
  await page.click('#allow');

  await page.waitForNavigation();
  await page.click('#logout-button');
  await page.waitForNavigation();
  await page.click('#login-button');

  await page.waitForNavigation();
  await page.waitForSelector('.auth0-lock-alternative-link');
  await wait(1);
  await page.click('.auth0-lock-alternative-link');

  await page.evaluate(() =>
    document.querySelector('div.auth-lock-social-buttons-pane > div > button').click()
  );

  await page.waitForSelector('#identifierId');
  await page.click('#identifierId');
  await page.type(testEmail);

  await page.click('#identifierNext');
  await wait(1.5);

  await page.click('input[name="password"]');
  await page.type(testPassword);

  await page.click('#passwordNext');

  await page.waitForNavigation();
}
