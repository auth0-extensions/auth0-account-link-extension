const generateTemplate = require("./rules/link");

const RULE_STAGE = "login_success";
const RULE_NAME = "auth0-account-link-extension";
const CLIENT_SECRET_CONFIG_KEY =
  "AUTH0_ACCOUNT_LINKING_EXTENSION_CLIENT_SECRET";

const findIn = (rules) => rules.find((rule) => rule.name === RULE_NAME);

// Allowing partial application to make usage with promises nicer
const persistRule =
  (api, generatedRule) =>
  (rules = []) => {
    const existingRule = rules.find((rule) => rule.name === RULE_NAME);

    if (existingRule) {
      return api.update({ id: existingRule.id }, generatedRule);
    }

    return api.create({ stage: RULE_STAGE, ...generatedRule });
  };

const destroyRule =
  (api) =>
  (rules = []) => {
    const existingRule = findIn(rules);

    if (existingRule) {
      api.delete({ id: existingRule.id });
      api.deleteRulesConfig(CLIENT_SECRET_CONFIG_KEY);
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

  return api
    .getAll()
    .then(persistRule(api, rule))
    .then(() => {
      api.updateRulesConfig(CLIENT_SECRET_CONFIG_KEY, clientSecret);
    });
};
const uninstall = (api) => api.getAll().then(destroyRule(api));

module.exports = { install, uninstall };
