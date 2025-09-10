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
    const rawClient = new ManagementClient({
      domain: AUTH0_DOMAIN,
      clientId: AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`,
      scope: 'read:rules update:rules delete:rules create:rules create:rules update:rules_configs delete:rules_configs'
    });

    /**
     * auth0-extension-tools requires an older version of the auth0 SDK which returns `value` rather than
     * the current structure with { data: value }. This unwraps the response to the older format.
     */
    const unwrapProxy = (obj) => new Proxy(obj, {
      get(target, prop) {
        const value = target[prop];
        if (typeof value === 'function') {
          return (...args) => {
            const result = value.apply(target, args);
            if (result && typeof result.then === 'function') {
              return result.then((r) => (r && r.data !== undefined ? r.data : r));
            }
            return (result && result.data !== undefined) ? result.data : result;
          };
        }
        if (value && typeof value === 'object') return unwrapProxy(value);
        return value;
      }
    });

    this.client = unwrapProxy(rawClient);
  }
}

module.exports = {
  ManagementClientWrapper,
  getCurrentConfig
};

