const path = require("path");
const { readFile } = require("fs");
const { promisify } = require("bluebird");
const { ManagementClient } = require("auth0");

const readFileAsync = promisify(readFile);

/**
 * Reads the current configuration file and returns its contents.
 */
async function getCurrentConfig(
  configFilePath = path.join(__dirname, "../server/config.json")
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
      audience: `https://${AUTH0_DOMAIN}/api/v2/`,
      scope:
        "read:rules update:rules delete:rules create:rules update:rules_configs",
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

  /**
   * Updates a rules config in Auth0
   * @param {string} key
   * @param {string} value
   */
  async updateRulesConfig(key, value) {
    return this.client.setRulesConfig(key, value);
  }

  /**
   * Deletes a rules config in Auth0
   * @param {string} key
   */
  async deleteRulesConfig(key) {
    return this.client.deleteRulesConfig(key);
  }
}

module.exports = {
  ManagementClientAdapter,
  getCurrentConfig,
};
