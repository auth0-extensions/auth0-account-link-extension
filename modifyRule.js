import generateRule from './generateRule';

const RULE_STAGE = 'login_success';
const RULE_NAME = 'auth0-account-link-extension';

const createRule = (config) => ({ name: RULE_NAME, script: generateRule(config), enabled: true });
const findIn = (rules) => rules.find(rule => rule.name === RULE_NAME);

// Allowing partial application to make usage with promises nicer
const persistRule = ({create, update}, generatedRule) => (rules = []) => {
  const existingRule = rules.find(rule => rule.name === RULE_NAME);

  if (existingRule) {
    return update({ id: existingRule.id }, generatedRule);
  }

  return create({ stage: RULE_STAGE, ...generatedRule });
};

const destroyRule = (api) => (rules = []) => {
  const existingRule = findIn(rules);

  if (existingRule) {
    api.delete({ id: existingRule.id });
  }
};

const install = (api, config) => api.getAll().then(persistRule(api, generateRule(config)));
const uninstall = (api) => api.getAll().then(destroyRule(api));

export { install, uninstall };
