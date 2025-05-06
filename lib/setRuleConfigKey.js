const apiCall = require('./api');

const setRuleConfigKey = async (key, value) =>
  apiCall({
    path: `rules-configs/${key}`,
    method: 'PUT',
    body: { value }
  });

module.exports = setRuleConfigKey;
