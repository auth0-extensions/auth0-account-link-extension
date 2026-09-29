/* eslint-disable no-prototype-builtins */

const { expect } = require('chai');
const { ManagementClientWrapper } = require('../../lib/managementWrapper');

const fakeConfig = {
  AUTH0_DOMAIN: 'example.auth0.com',
  AUTH0_CLIENT_ID: 'fake-client-id',
  AUTH0_CLIENT_SECRET: 'fake-client-secret',
};

describe('Management API wrapper', () => {
  it('Management client wrapper initializes correctly', () => {
    const wrapper = new ManagementClientWrapper(fakeConfig);

    expect(typeof wrapper.client).to.equal('object');

    const clientOptions = wrapper.client.configuration;

    expect(clientOptions.domain).to.equal(fakeConfig.AUTH0_DOMAIN);
    expect(clientOptions.clientId).to.equal(fakeConfig.AUTH0_CLIENT_ID);
    expect(clientOptions.clientSecret).to.equal(fakeConfig.AUTH0_CLIENT_SECRET);
    expect(clientOptions.audience).to.equal(`https://${fakeConfig.AUTH0_DOMAIN}/api/v2/`);
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
