const apiCall = require('./api');

const deleteRuleConfigKey = async () =>
  apiCall({
    path: 'rules-configs/AUTH0_ACCOUNT_LINKING_EXTENSION_CUSTOM_DOMAIN',
    method: 'DELETE'
  });

module.exports = deleteRuleConfigKey;
