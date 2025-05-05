const storage = require('./storage');
const fetchCustomDomains = require('./fetchCustomDomains');
const putRuleConfigKey = require('./putRuleConfigKey');
const deleteRuleConfigKey = require('./deleteRuleConfigKey');

const fetchRegisteredCustomDomain = async (customDomain) => {
  const response = await fetchCustomDomains();
  const registeredCustomDomain = response.find(item => item.domain === customDomain);

  if (!registeredCustomDomain) {
    throw new Error(`Custom domain ${customDomain} not found`);
  }

  return registeredCustomDomain.domain;
};

const setRuleConfig = async (registeredCustomDomain) => {
  try {
    await putRuleConfigKey(registeredCustomDomain);
  } catch (error) {
    throw new Error(`Failed to set rule config key: ${error.message}`);
  }
};

const handleRuleConfigCleanup = async () => {
  try {
    const settings = await storage.getSettings();
    const { customDomain } = settings;
    if (customDomain && customDomain !== '') {
      await deleteRuleConfigKey();
    }
  } catch (error) {
    throw new Error(`Failed to delete rule config key: ${error.message}`);
  }
};

const configureSettingsPayload = async (payload) => {
  const { customDomain } = payload;

  if (customDomain) {
    const registeredCustomDomain = await fetchRegisteredCustomDomain(customDomain);
    if (!registeredCustomDomain) {
      throw new Error(`Custom domain ${customDomain} not found`);
    }

    await setRuleConfig(registeredCustomDomain);

    return storage.setSettings({
      ...payload,
      customDomain: registeredCustomDomain
    });
  }

  await handleRuleConfigCleanup();

  return storage.setSettings(payload);
};


module.exports = {
  fetchRegisteredCustomDomain,
  configureSettingsPayload
};
