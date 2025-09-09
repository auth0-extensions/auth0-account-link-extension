const generateTemplate = require("./rules/link");
const logger = require("./lib/logger");

const RULE_STAGE = "login_success";
const RULE_NAME = "auth0-account-link-extension";
const CLIENT_SECRET_CONFIG_KEY =
  "AUTH0_ACCOUNT_LINKING_EXTENSION_CLIENT_SECRET";

const findIn = (rules) => rules.find((rule) => rule.name === RULE_NAME);

// Allowing partial application to make usage with promises nicer
const persistRule =
  (api, generatedRule) =>
  (rules = []) => {
    const existingRule = rules.find((rule) => rule.name === RULE_NAME);

    if (existingRule) {
      return api.update({ id: existingRule.id }, generatedRule);
    }

    return api.create({ stage: RULE_STAGE, ...generatedRule });
  };

const destroyRule =
  (api) =>
  (rules = []) => {
    const existingRule = findIn(rules);

    if (existingRule) {
      api.delete({ id: existingRule.id });
      api.deleteRulesConfig(CLIENT_SECRET_CONFIG_KEY);
    }
  };

// Normalize different shapes of API objects that might be passed in:
// 1. Our tests/stubs or adapter object exposing rule + rules-config helpers directly.
// 2. A full ManagementClient instance (api.rules + api.setRulesConfig / deleteRulesConfig).
// 3. A raw RulesManager (which would be insufficient – we enhance or throw).
function normalizeApi(input) {
  if (!input || typeof input !== "object") {
    throw new Error("modifyRule: invalid API object passed in");
  }
  // Already in desired shape.
  if (typeof input.updateRulesConfig === "function") return input;
  // Full management client shape.
  if (input.rules && typeof input.setRulesConfig === "function") {
    return {
      getAll: (...a) => input.rules.getAll(...a),
      create: (...a) => input.rules.create(...a),
      update: (...a) => input.rules.update(...a),
      delete: (...a) => input.rules.delete(...a),
      updateRulesConfig: (key, value) => input.setRulesConfig({ key }, { value }),
      deleteRulesConfig: (key) => input.deleteRulesConfig({ key })
    };
  }
  // Raw rules manager – cannot manage rules configs; throw early with clarity.
  if (typeof input.getAll === "function" && input.create && input.update) {
    throw new Error(
      "modifyRule: received a RulesManager without rules-config methods. Pass the full management client instead of '.rules'."
    );
  }
  throw new Error("modifyRule: unsupported API object shape");
}

const install = (rawApi, config) => {
  const api = normalizeApi(rawApi);
  const { clientSecret } = config;
  delete config.clientSecret;

  const rule = {
    name: RULE_NAME,
    script: generateTemplate(config),
    enabled: true,
  };

  if (!clientSecret || typeof clientSecret !== "string") {
    return Promise.reject(
      new Error("modifyRule: clientSecret must be a non-empty string")
    );
  }

  return api.getAll()
    .then(persistRule(api, rule))
    .then(() => api.updateRulesConfig(CLIENT_SECRET_CONFIG_KEY, clientSecret))
    .catch(err => {
      if (logger && process.env.DEBUG_MODIFY_RULE) {
        logger.error("modifyRule install failed", {
          stage: RULE_STAGE,
            ruleName: RULE_NAME,
            hasUpdateRulesConfig: typeof api.updateRulesConfig === 'function',
            originalError: err && err.message
        });
      }
      err.message = `modifyRule install: failed updating rules config: ${err.message}`;
      throw err;
    });
};
const uninstall = (rawApi) => {
  const api = normalizeApi(rawApi);
  return api.getAll().then(destroyRule(api));
};

module.exports = { install, uninstall };
