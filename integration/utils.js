const fs = require('fs');
const path = require('path');
const { ManagementClient } = require('auth0');

const configFileContent = fs.readFileSync(
  path.join(__dirname, '../server/config.test.json'),
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
const wait = (secs = 1) => new Promise(cont => setTimeout(cont, secs * 1000));

/**
 * Looks up for the test-created users and
 * removes them from the tenant.
 * @param {string} email
 */
const deleteTestUsers = email =>
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
const usersWithSameEmailCount = email =>
  new Promise((resolve, reject) => {
    mgmtApi.getUsers({ q: `email:"${email}"` }, (err, users) => {
      if (err) return reject(err);

      return resolve(users.length);
    });
  });

/**
 * Builds the extension site query string
 * from an object with the parameters
 * @param {object} params
 */
const buildQueryString = ({
  childToken = '',
  clientId = '',
  redirectUri = '',
  scope = '',
  responseType = 'code',
  auth0Client = '',
  originalState = '',
  nonce = '',
  errorType = '',
  state = ''
}) =>
  `/?child_token=${childToken}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}&auth0Client=${auth0Client}&original_state=${originalState}&nonce=${nonce}&error_type=${errorType}&state=${state}`;

module.exports = {
  wait,
  deleteTestUsers,
  usersWithSameEmailCount,
  buildQueryString
};

