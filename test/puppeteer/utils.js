import fs from 'fs';
import path from 'path';
import { ManagementClient } from 'auth0';

const configFileContent = fs.readFileSync(
  path.join(__dirname, '../../server/config.test.json'),
  'utf-8'
);
const config = JSON.parse(configFileContent);

const mgmtApi = new ManagementClient({
  domain: config.AUTH0_DOMAIN,
  clientId: config.AUTH0_CLIENT_ID,
  clientSecret: config.AUTH0_CLIENT_SECRET,
  scope: 'read:users create:users delete:users read:email_provider read:connections'
});

/**
 * Waits X seconds and resolves.
 * @param {number} secs 
 */
export const wait = (secs = 1) => new Promise(cont => setTimeout(cont, secs * 1000));

/**
 * Looks up for the test-created users and
 * removes them from the tenant.
 * @param {string} email 
 */
export const deleteTestUsers = email =>
  new Promise((resolve, reject) => {
    mgmtApi.getUsers({ q: `email:"${email}"` }, (err, users) => {
      if (err) return reject(err);

      if (users.length === 0) {
        resolve();
      }

      users.forEach((user, i) => {
        mgmtApi.deleteUser({ id: user.user_id, page: 1, per_page: 10 }, (delUserErr) => {
          if (delUserErr) return reject(delUserErr);

          if (i === users.length - 1) {
            resolve();
          }
        });
      });
    });
  });

/**
 * Looks for users with the same email 
 * and returns the count of them.
 * @param {string} email 
 */
export const usersWithSameEmailCount = email =>
  new Promise((resolve, reject) => {
    mgmtApi.getUsers({ q: `email:"${email}"` }, (err, users) => {
      if (err) return reject(err);

      return resolve(users.length);
    });
  });
