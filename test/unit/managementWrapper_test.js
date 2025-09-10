/* eslint-disable no-prototype-builtins */

const path = require('path');
const { expect } = require('chai');
const { ManagementClientWrapper, getCurrentConfig } = require('../../lib/managementWrapper');

const configPath = path.join(__dirname, '../../server/config.test.json');

describe('Management API wrapper', () => {
  it('Config has needed properties', (done) => {
    getCurrentConfig(configPath).then((config) => {
      expect(config.hasOwnProperty('AUTH0_DOMAIN')).to.equal(true);
      expect(config.hasOwnProperty('AUTH0_CLIENT_ID')).to.equal(true);
      expect(config.hasOwnProperty('AUTH0_CLIENT_SECRET')).to.equal(true);

      done();
    });
  });

  it('Management client wrapper initializes correctly', (done) => {
    getCurrentConfig(configPath).then((config) => {
      const wrapper = new ManagementClientWrapper(config);

      expect(typeof wrapper.client).to.equal('object');

      const clientOptions = wrapper.client.configuration;

      expect(clientOptions.domain).to.equal(config.AUTH0_DOMAIN);
      expect(clientOptions.clientId).to.equal(config.AUTH0_CLIENT_ID);
      expect(clientOptions.clientSecret).to.equal(config.AUTH0_CLIENT_SECRET);
      expect(clientOptions.audience).to.equal(`https://${config.AUTH0_DOMAIN}/api/v2/`);

      done();
    });
  });
});
