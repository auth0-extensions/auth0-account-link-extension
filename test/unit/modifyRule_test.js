const {expect} = require('chai');
const { install, uninstall } = require('../../modifyRule');

describe('Modifying Rules', function() {
  describe('Installing a rule', function() {
    it('successfully creates a rule when not found in collection', function() {
      let api = getStubApi();

      return install(api, {})
        .then(api.getAll)
        .then(function(rules) {
          expect(rules.map(r => r.id)).to.contain(1);
        });
    });

    it('successfully updates a rule when found in collection', function() {
      let api = getStubApi();

      return install(api, {})
        .then(_ => install(api, {}))
        .then(x => api.getAll())
        .then(function(rules) {
          expect(rules.map(r => r.id)).to.contain(1);
        });
    });

    it('gracefully handles errors with the API', function() {
      let api = getStubApi(true);

      return install(api, {})
        .then(function() {
          throw new Error('Promise should have been rejected');
        }).catch(function(err) {
          expect(err.message).to.eq('nope');
        });
    });
  });

  function getStubApi(fail = false) {
    const result = (value) => fail ? Promise.reject(new Error('nope')) : Promise.resolve(value);
    let existingRules = [];
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
        const index = existingRules.findIndex(r => r.id === existingRule.id);

        if (index !== -1) {
          existingRules[index] = Object.assign({}, existingRules[index], updatedRule);
        }

        return result(existingRules);
      },
      delete(rule) {
        existingRules = existingRules.filter(r => r.id !== rule.id);

        return result(existingRules);
      }
    };
  };
});
