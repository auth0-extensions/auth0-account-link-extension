const apiCall = require('./api');

const updateRuleConfigKey = async ({ path, method, ...options }) =>
  apiCall({
    path,
    method,
    ...options
  });

module.exports = updateRuleConfigKey;
