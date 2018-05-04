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

class ManagementClientAdapter {
  /**
   * Creates a new management client
   */
  constructor({ AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_DOMAIN }) {
    this.client = new ManagementClient({
      domain: AUTH0_DOMAIN,
      clientId: AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
      scope: 'read:rules update:rules delete:rules create:rules'
    });
  }

  /**
   * Gets all rules from Auth0
   */
  async getAll() {
    return this.client.getRules();
  }

  /**
   * Creates a new rule in Auth0
   * @param {object} rule
   */
  async create(rule) {
    return this.client.createRule(rule);
  }

  /**
   * Updates a rule in Auth0
   * @param {object} options
   * @param {object} generatedRule
   */
  async update({ id }, { name, script, enabled }) {
    return this.client.updateRule({ id }, { name, script, enabled });
  }
}

module.exports = {
  ManagementClientAdapter,
  getCurrentConfig
};

