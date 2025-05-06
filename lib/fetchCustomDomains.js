const apiCall = require('./api');

const fetchCustomDomains = async () => apiCall({ path: 'custom-domains' });

module.exports = fetchCustomDomains;
