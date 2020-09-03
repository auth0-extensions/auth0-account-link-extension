const generateTemplate = require('./rules/link');

const RULE_STAGE = 'login_success';
const RULE_NAME = 'auth0-account-link-extension';

const findIn = rules => rules.find(rule => rule.name === RULE_NAME);

// Allowing partial application to make usage with promises nicer
const persistRule = (api, generatedRule) => (rules = []) => {
  const existingRule = rules.find(rule => rule.name === RULE_NAME);

  if (existingRule) {
    return api.update({ id: existingRule.id }, generatedRule);
  }

  return api.create({ stage: RULE_STAGE, ...generatedRule });
};

const destroyRule = api => (rules = []) => {
  const existingRule = findIn(rules);

  if (existingRule) {
    api.delete({ id: existingRule.id });
  }
};

const install = (api, config) => {
  const rule = { name: RULE_NAME, script: generateTemplate(config), enabled: true };

  return api.getAll().then(persistRule(api, rule));
};
const uninstall = api => api.getAll().then(destroyRule(api));

module.exports = { install, uninstall };
