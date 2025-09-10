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

  describe('Unwrapping behavior', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = new ManagementClientWrapper({
        AUTH0_CLIENT_ID: 'fake',
        AUTH0_CLIENT_SECRET: 'fake',
        AUTH0_DOMAIN: 'example.auth0.com'
      });
    });

    it('unwraps async promise resolving to { data: value }', async () => {
      wrapper.client.fakePromise = () => Promise.resolve({ data: { answer: 42 } });
      const res = await wrapper.client.fakePromise();
      expect(res).to.deep.equal({ answer: 42 });
    });

    it('passes through async promise resolving to plain value', async () => {
      const arr = [1, 2, 3];
      wrapper.client.plainPromise = () => Promise.resolve(arr);
      const res = await wrapper.client.plainPromise();
      expect(res).to.equal(arr);
    });

    it('unwraps sync method returning { data: value }', () => {
      wrapper.client.syncMethod = () => ({ data: 'sync-ok' });
      const res = wrapper.client.syncMethod();
      expect(res).to.equal('sync-ok');
    });

    it('unwraps nested object methods', async () => {
      wrapper.client.nested = { deep: { get: () => Promise.resolve({ data: 'nested-ok' }) } };
      const res = await wrapper.client.nested.deep.get();
      expect(res).to.equal('nested-ok');
    });

    it('preserves falsy data values (0)', async () => {
      wrapper.client.zero = () => Promise.resolve({ data: 0 });
      const res = await wrapper.client.zero();
      expect(res).to.equal(0);
    });

    it('does not unwrap objects without a data key', async () => {
      const obj = { value: 7 };
      wrapper.client.noData = () => Promise.resolve(obj);
      const res = await wrapper.client.noData();
      expect(res).to.equal(obj);
    });
  });
});
