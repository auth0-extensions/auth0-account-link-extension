import puppeteer from 'puppeteer';
import { expect } from 'chai';
import { deleteTestUsers, usersWithSameEmailCount, wait } from './utils';

const SAMPLE_APP_BASE = 'http://localhost:3000';

let page;
let browser;

const app = pathUrl => `${SAMPLE_APP_BASE}${pathUrl}`;

const testEmail = 'john.doe.auth0.testing@gmail.com';
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

    await wait(1);

    await page.waitForSelector('input[name="email"]');
    await page.click('input[name="email"]');
    await page.type(testEmail);

    await wait(1);

    await page.click('input[name="password"]');
    await page.type(testPassword);

    await wait(1);

    await page.waitForSelector('.auth0-lock-submit');
    await page.click('.auth0-lock-submit');

    await wait(1);

    await page.type(testEmail);

    await page.click('.auth0-lock-submit');

    await wait(1);

    await page.waitForNavigation();
    expect(await usersWithSameEmailCount(testEmail)).equal(1);
    expect(await page.url()).equal(app`/user`);
  });

  it('skips linking', async () => {
    await createUsers();

    await page.evaluate(() => document.querySelector('#skip').click());

    await page.waitForNavigation();
    expect(await usersWithSameEmailCount(testEmail)).equal(2);
    expect(await page.url()).equal(app`/user`);
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
