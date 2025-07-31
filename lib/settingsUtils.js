const storage = require('./storage');
const fetchCustomDomains = require('./fetchCustomDomains');
const setRuleConfigKey = require('./setRuleConfigKey');
const deleteRuleConfigKey = require('./deleteRuleConfigKey');

const CUSTOM_DOMAIN_SETTING_KEY = 'AUTH0_ACCOUNT_LINKING_EXTENSION_CUSTOM_DOMAIN';

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
    await setRuleConfigKey(CUSTOM_DOMAIN_SETTING_KEY, registeredCustomDomain);
  } catch (error) {
    throw new Error(`Failed to set rule config key: ${error.message}`);
  }
};

const handleRuleConfigCleanup = async () => {
  try {
    const settings = await storage.getSettings();
    const { customDomain } = settings;
    if (customDomain && customDomain !== '') {
      await deleteRuleConfigKey(CUSTOM_DOMAIN_SETTING_KEY);
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
