import generateRule from './generateRule';

const RULE_STAGE = 'login_success';
const RULE_NAME = 'auth0-account-link-extension';

const findIn = rules => rules.find(rule => rule.name === RULE_NAME);

// Allowing partial application to make usage with promises nicer
const persistRule = ({create, update}, generatedRule) => (rules = []) => {
  const existingRule = rules.find(rule => rule.name === RULE_NAME);

  if (existingRule) {
    //console.log("Existing rule vs generated", existingRule, generatedRule);
    return update({ id: existingRule.id }, generatedRule);
  }

  console.log("Made it to create",{ stage: RULE_STAGE, ...generatedRule } );

  return create({ stage: RULE_STAGE, ...generatedRule });
};

const destroyRule = (api) => (rules = []) => {
  const existingRule = findIn(rules);

  if (existingRule) {
    api.delete({ id: existingRule.id });
  }
};

const install = (api, config) => {
  console.log("Generating rule and attempting to use API");

  return generateRule({ username: RULE_NAME, ...config })
    .then(rule => {
      console.log("Made it here with the rule: ", rule.substr(0, 30));
      return rule;
    })
    .then(rule => ({ name: RULE_NAME, script: rule, enabled: true }))
    .then(rule => api.getAll().then(persistRule(api, rule)));
};
const uninstall = (api) => api.getAll().then(destroyRule(api));

export { install, uninstall };
