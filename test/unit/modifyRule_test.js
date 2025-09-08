const { expect } = require("chai");
const { install, uninstall } = require("../../modifyRule");

describe("Modifying Rules", function () {
  describe("Installing a rule", function () {
    it("successfully creates a rule when not found in collection", function () {
      let api = getStubApi();

      return install(api, { clientSecret: "shhh" })
        .then(api.getAll)
        .then(function (rules) {
          expect(rules.map((r) => r.id)).to.contain(1);
        });
    });

    it("successfully updates a rule when found in collection", function () {
      let api = getStubApi();

      return install(api, { clientSecret: "one" })
        .then((_) => install(api, { clientSecret: "two" }))
        .then((x) => api.getAll())
        .then(function (rules) {
          expect(rules.map((r) => r.id)).to.contain(1);
        });
    });

    it("gracefully handles errors with the API", function () {
      let api = getStubApi(true);

      return install(api, {})
        .then(function () {
          throw new Error("Promise should have been rejected");
        })
        .catch(function (err) {
          expect(err.message).to.eq("nope");
        });
    });

    it("stores the client secret as a rule config", function () {
      let api = getStubApi();

      return install(api, { clientSecret: "secret123" })
        .then(() => api.getRulesConfig())
        .then((cfg) => {
          expect(cfg.AUTH0_ACCOUNT_LINKING_EXTENSION_CLIENT_SECRET).to.equal(
            "secret123"
          );
        });
    });
  });

  describe("Uninstalling a rule", function () {
    it("removes rule and associated rule config", function () {
      let api = getStubApi();

      return install(api, { clientSecret: "secret123" })
        .then(() => uninstall(api))
        .then(() => Promise.all([api.getAll(), api.getRulesConfig()]))
        .then(([rules, cfg]) => {
          expect(rules.length).to.equal(0);
          expect(cfg.AUTH0_ACCOUNT_LINKING_EXTENSION_CLIENT_SECRET).to.equal(
            undefined
          );
        });
    });
  });

  function getStubApi(fail = false) {
    const result = (value) =>
      fail ? Promise.reject(new Error("nope")) : Promise.resolve(value);
    let existingRules = [];
    let existingRulesConfig = {};
    let currentId = 1;

    return {
      getAll() {
        return Promise.resolve(existingRules);
      },
      create(rule) {
        existingRules.push({ id: currentId, ...rule });
        currentId = currentId + 1;

        return result(existingRules);
      },
      update(existingRule, updatedRule) {
        const index = existingRules.findIndex((r) => r.id === existingRule.id);

        if (index !== -1) {
          existingRules[index] = Object.assign(
            {},
            existingRules[index],
            updatedRule
          );
        }

        return result(existingRules);
      },
      delete(rule) {
        existingRules = existingRules.filter((r) => r.id !== rule.id);

        return result(existingRules);
      },
      updateRulesConfig(key, value) {
        existingRulesConfig[key] = value;
        return result(existingRulesConfig);
      },
      deleteRulesConfig(key) {
        delete existingRulesConfig[key];
        return result(existingRulesConfig);
      },
      getRulesConfig() {
        return result(existingRulesConfig);
      },
    };
  }
});
