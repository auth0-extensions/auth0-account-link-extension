const apiCall = require('./api');

const deleteRuleConfigKey = async key =>
  apiCall({
    path: `rules-configs/${key}`,
    method: 'DELETE'
  });

module.exports = deleteRuleConfigKey;
