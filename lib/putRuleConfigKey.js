const apiCall = require('./api');

const putRuleConfigKey = async value =>
  apiCall({
    path: 'rules-configs/AUTH0_ACCOUNT_LINKING_EXTENSION_CUSTOM_DOMAIN',
    method: 'PUT',
    body: { value }
  });

module.exports = putRuleConfigKey;
