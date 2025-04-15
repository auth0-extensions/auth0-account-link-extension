const { expect } = require('chai');
const urlHelpers = require('../../lib/urlHelpers');

describe('Url Helpers', () => {
    it('getBasePath should return the base path of the request', async () => {
        const req = {
            headers: {
              host: 'sandbox.it.auth0.com'
            },
            originalUrl: 'https://sandbox.it.auth0.com/api/run/mytenant/abc',
            path: '/users'
          };
        expect(urlHelpers.getBasePath(req)).to.deep.equal('/api/run/mytenant/abc/')
    });
    it('getBasePath should return slash if not running in webtask', async () => {
        const req = {
            headers: {
              host: 'sandbox.it.auth0.com'
            },
            path: '/users'
          };
        expect(urlHelpers.getBasePath(req)).to.deep.equal('/')
    })
    it('getBaseUrl should return the base path of the request', async () => {
        const req = {
            headers: {
              host: 'sandbox.it.auth0.com'
            },
            originalUrl: 'https://sandbox.it.auth0.com/api/run/mytenant/abc',
            path: '/users',
            get: function() {
              return 'sandbox.it.auth0.com';
            }
          };
        expect(urlHelpers.getBaseUrl(req)).to.deep.equal('https://sandbox.it.auth0.com/api/run/mytenant/abc')
    })
    it('getBaseUrl should return slash if not running in webtask', async () => {
        const req = {
            headers: {
              host: 'sandbox.it.auth0.com'
            },
            path: '/users',
            get: function() {
              return 'sandbox.it.auth0.com';
            }
          };
        expect(urlHelpers.getBaseUrl(req)).to.deep.equal('https://sandbox.it.auth0.com')
    })
    it('getBaseUrl should use https by default', async () => {
        const req = {
            headers: {
              host: 'sandbox.it.auth0.com'
            },
            path: '/users',
            get: function() {
              return 'sandbox.it.auth0.com';
            }
          };
        expect(urlHelpers.getBaseUrl(req)).to.deep.equal('https://sandbox.it.auth0.com')
    })
    it('getBaseUrl should allow overwriting the protocol', async () => {
        const req = {
            headers: {
              host: 'sandbox.it.auth0.com'
            },
            path: '/users',
            get: function() {
              return 'sandbox.it.auth0.com';
            }
          };
        expect(urlHelpers.getBaseUrl(req, 'http')).to.deep.equal('http://sandbox.it.auth0.com');
    })
});
