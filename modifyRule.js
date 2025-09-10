const generateTemplate = require('./rules/link');

const RULE_STAGE = 'login_success';
const RULE_NAME = 'auth0-account-link-extension';
const CLIENT_SECRET_CONFIG_KEY =
  'AUTH0_ACCOUNT_LINKING_EXTENSION_CLIENT_SECRET';

const findIn = rules => rules.find(rule => rule.name === RULE_NAME);

// Allowing partial application to make usage with promises nicer
const persistRule =
  (api, generatedRule, clientSecret) =>
  (rules = []) => {
    const existingRule = rules.find((rule) => rule.name === RULE_NAME);

    if (existingRule) {
      return api.client.updateRule({ id: existingRule.id }, generatedRule);
    }

    return api.client
      .createRule({ stage: RULE_STAGE, ...generatedRule })
      .then(() =>
        api.client.setRulesConfig(
          { key: CLIENT_SECRET_CONFIG_KEY },
          { value: clientSecret }
        )
      );
  };

const destroyRule =
  (api) =>
  (rules = []) => {
    const existingRule = findIn(rules);

    if (existingRule) {
      api.client.deleteRule({ id: existingRule.id });
      api.client.deleteRulesConfig({ key: CLIENT_SECRET_CONFIG_KEY });
    }
  };

const install = (api, config) => {
  const { clientSecret } = config;
  delete config.clientSecret;

  const rule = {
    name: RULE_NAME,
    script: generateTemplate(config),
    enabled: true,
  };

  return api.client
    .getRules()
    .then(persistRule(api, rule, clientSecret))
};
const uninstall = (api) => {
  return api.client.getRules().then(destroyRule(api));
};

module.exports = { install, uninstall };
