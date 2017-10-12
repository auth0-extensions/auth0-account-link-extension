import path from 'path';
import { readFile } from 'fs';
import { promisify } from 'bluebird';
import { ManagementClient } from 'auth0';
import generateRule from '../rules/link';

const RULE_NAME = 'account-linking';
const readFileAsync = promisify(readFile);

/**
 * Reads the current configuration file and returns its contents.
 */
async function getCurrentConfig() {
  const configFilePath = path.join(__dirname, '../server/config.json');
  const fileContents = await readFileAsync(configFilePath);

  return JSON.parse(fileContents);
}

/**
 * Updates the current rule in Auth0 with the local rule code.
 * @param {string} extensionURL 
 */
export default async function patchRule(extensionURL) {
  const { AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_DOMAIN } = await getCurrentConfig();
  const auth0 = new ManagementClient({
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    scope: 'read:rules update:rules delete:rules create:rules'
  });

  const rules = await auth0.getRules();
  const accountLinkingRule = rules.find(r => r.name === RULE_NAME);
  const newRuleContent = generateRule({
    extensionURL,
    username: 'Development',
    clientID: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET
  });

  if (!accountLinkingRule) {
    return auth0
      .createRules({
        name: RULE_NAME,
        script: newRuleContent,
        enabled: true
      })
      .catch((ruleCreationError) => {
        throw ruleCreationError;
      });
  }

  return auth0
    .updateRule({ id: accountLinkingRule.id }, { script: newRuleContent })
    .catch((ruleUpdateError) => {
      throw ruleUpdateError;
    });
}
