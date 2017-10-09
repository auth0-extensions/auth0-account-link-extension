import puppeteer from 'puppeteer';
import { expect } from 'chai';
import { ManagementClient } from 'auth0';

let page;
let server;
let browser;
const mgmtApi = new ManagementClient({
  domain: 'account-linking-testing.auth0.com',
  clientId: '22qApOBZ9BkEf3WDIYetEiJPXswpQdmY',
  clientSecret: 'jxrEwGhh0IXfi8t9a84SWi6eIt3yqVaJqADzZ9zuKVb7I3LC1F_RAZLM6mFU4jMa',
  scope: 'read:users create:users delete:users read:email_provider read:connections'
});

const app = path => `http://localhost:3000${path}`;
const wait = secs => new Promise(cont => setTimeout(cont, secs * 1000));

const testEmail = 'john.doe.auth0.testing@gmail.com';
const testPassword = 'Passw0rdLe55!';

const deleteTestUsers = () =>
  new Promise((resolve, reject) => {
    mgmtApi.getUsers({ q: `email:"${testEmail}"` }, (err, users) => {
      if (err) return reject(err);

      if (users.length === 0) {
        resolve();
      }

      users.forEach((user, i) => {
        mgmtApi.deleteUser({ id: user.user_id, page: 1, per_page: 10 }, (err) => {
          if (err) return reject(err);
          console.log(`Test user ${user.user_id} deleted from tenant`);

          if (i === users.length - 1) {
            resolve();
          }
        });
      });
    });
  });

describe('Account linking tests', () => {
  before(async () => {
    browser = await puppeteer.launch({ headless: false, width: 1366, height: 768 });
    page = await browser.newPage();
  });

  after(async () => {
    browser.close();

    await deleteTestUsers().catch((e) => {
      console.log("Couldn't delete test users. Details:", e);
    });
  });

  it('Rule detects repeated email', async () => {
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
    expect(await page.url()).equal('http://localhost:3000/user');
  });
});
