const fs = require('fs');
const path = require('path');

const RULE_STAGE = 'login_success';
const RULE_NAME = 'auth0-account-link-extension';

const findIn = rules => rules.find(rule => rule.name === RULE_NAME);

// Allowing partial application to make usage with promises nicer
const persistRule = (api, generatedRule) => (rules = []) => {
  const existingRule = rules.find(rule => rule.name === RULE_NAME);

  if (existingRule) {
    return api.rules.update({ id: existingRule.id }, generatedRule);
  }

  return api.rules.create({ stage: RULE_STAGE, ...generatedRule });
};

const persistConfigRule = (api, config) => (configs = []) =>
  Promise.all(
    Object.keys(config)
      .filter(key => configs.some(c => c.key === key))
      .map(key => api.rulesConfigs.set({ key }, { value: config[key] }))
  );

const destroyRule = api => (rules = []) => {
  const existingRule = findIn(rules);

  if (existingRule) {
    api.rules.delete({ id: existingRule.id });
  }
};

const install = (api, config) => {
  const rule = {
    name: RULE_NAME,
    script: fs.readFileSync(path.join(__dirname, 'rules/link.js')),
    enabled: true
  };

  return Promise.all([
    api.rules.getAll().then(persistRule(api, rule)),
    api.rulesConfigs.getAll().then(persistConfigRule(api, config))
  ]);
};
const uninstall = api => api.getAll().then(destroyRule(api));

module.exports = { install, uninstall };
