const path = require('path');
const { readFile } = require('fs');
const { promisify } = require('bluebird');
const { ManagementClient } = require('auth0');

const readFileAsync = promisify(readFile);

/**
 * Reads the current configuration file and returns its contents.
 */
async function getCurrentConfig(
  configFilePath = path.join(__dirname, '../server/config.json')
) {
  const fileContents = await readFileAsync(configFilePath);
  return JSON.parse(fileContents);
}

class ManagementClientWrapper {
  /**
   * Creates a new Auth0 ManagementClient using the provided credentials.
   */
  constructor({ AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_DOMAIN }) {
    this.client = new ManagementClient({
      domain: AUTH0_DOMAIN,
      clientId: AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`,
      scope: 'read:rules update:rules delete:rules create:rules create:rules update:rules_configs'
    });
  }
}

module.exports = {
  ManagementClientWrapper,
  getCurrentConfig
};

