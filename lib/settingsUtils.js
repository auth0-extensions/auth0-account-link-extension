const storage = require('./storage');
const fetchCustomDomains = require('./fetchCustomDomains');

const fetchRegisteredCustomDomain = async (customDomain) => {
  const response = await fetchCustomDomains();
  const registeredCustomDomain = response.find(item => item.domain === customDomain);

  if (!registeredCustomDomain) {
    throw new Error(`Custom domain ${customDomain} not found`);
  }

  return registeredCustomDomain.domain;
};

const configureSettingsPayload = async (payload) => {
  const { customDomain } = payload;

  if (customDomain) {
    const registeredCustomDomain = await fetchRegisteredCustomDomain(customDomain);
    if (!registeredCustomDomain) {
      throw new Error(`Custom domain ${customDomain} not found`);
    }

    return storage.setSettings({
      ...payload,
      customDomain: registeredCustomDomain
    });
  }

  return storage.setSettings(payload);
};


module.exports = {
  fetchRegisteredCustomDomain,
  configureSettingsPayload
};
