const apiCall = require('./api');

const fetchCustomDomains = () =>
  apiCall({
    path: 'custom-domains'
  });

module.exports = fetchCustomDomains;
