const path = require('path');
const { expect } = require('chai');
const sinon = require('sinon');
const nock = require('nock');
const { FileStorageContext } = require('auth0-extension-tools');
const { createServer, createAuth0Token, createWebtaskToken, createApiRequestToken } = require('../test_helper');
const initStorage = require('../../lib/db').init;
const storage = require('../../lib/storage')
const config = require('../../lib/config');
const certs = require('./test_data/certs.json');
const jwt = require('jsonwebtoken');
const settingsUtils = require('../../lib/settingsUtils');

const certOne = certs.certOne;
const wrongCert = certs.certTwo;

describe('Endpoint Failures', function() {

  let server;
  
  before(async function() {
    server = await createServer();
    initStorage(new FileStorageContext(path.join(__dirname, '../../data.json')));
  });

  after(function() {
    server.stop();
  });
  describe('with correct certificate but failing validation', function() {
    beforeEach(async function() {
      nock.cleanAll();
  
      nock(`https://${config('AUTH0_DOMAIN')}`)
      .get('/.well-known/jwks.json')
      .reply(200, {
        keys: [
          {
            alg: 'RS256',
            use: 'sig',
            kty: 'RSA',
            x5c: [ certOne.cert.match(/-----BEGIN CERTIFICATE-----([\s\S]*)-----END CERTIFICATE-----/i)[1].replace('\n', '') ],
            kid: 'key2',
            n: certOne.modulus,
            e: certOne.exponent,
            x5t: certOne.fingerprint
          }
        ]
      });
    });
    afterEach(async function() {
      nock.cleanAll();
    });
    it('GET /admin/settings returns 401 invalid token isApiRequest token with wrong kid', async function() {
      const token = createApiRequestToken('client-credentials', '@clients', [], 'key1');
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/settings', headers };
  
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
    it('GET /admin/user returns 401 invalid token isApiRequest token with wrong kid', async function() {
      const token = createApiRequestToken('client-credentials', '@clients', [], 'key1');
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/user', headers };
  
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
    it('GET /admin/locales returns 401 invalid token isApiRequest token with wrong kid', async function() {
      const token = createApiRequestToken('client-credentials', '@clients', [], 'key1');
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/locales', headers };
  
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
    it('GET /admin/settings returns 401 for a token with incorrect claims', async function() {
      const token = jwt.sign(
        { sub: 'user@clients', iss: 'https://wrong-issuer/', },
        certOne.privateKey, 
        { algorithm: 'RS256', header: { 
          kid: 'key2'
        }, 
        algorithm: 'RS256', 
        expiresIn: '5m' 
      }
      );
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/settings', headers };
    
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
    it('GET /admin/settings returns 401 for a token with an invalid signature', async function() {
      const token = jwt.sign(
        { sub: 'user@clients', iss: `https://${config('AUTH0_DOMAIN')}/` },
        certOne.privateKey + "123",
        { algorithm: 'RS256', keyid: 'mocked-key-id' }
      );
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/settings', headers };
    
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
    it('GET /admin/settings returns 401 for an expired token', async function() {
      const token = jwt.sign(
        { sub: 'user@clients', iss: `https://${config('AUTH0_DOMAIN')}/`, exp: Math.floor(Date.now() / 1000) - 60 },
        certOne.privateKey, 
        { algorithm: 'RS256', header: { 
          kid: 'key2'
        },
        algorithm: 'RS256', 
      });
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/settings', headers };
    
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
  })
  describe('with wrong certificate and failing validation', function() {
    beforeEach(async function() {
      nock.cleanAll();
  
      nock(`https://${config('AUTH0_DOMAIN')}`)
      .get('/.well-known/jwks.json')
      .reply(200, {
        keys: [
          {
            alg: 'RS256',
            use: 'sig',
            kty: 'RSA',
            x5c: [ wrongCert.cert.match(/-----BEGIN CERTIFICATE-----([\s\S]*)-----END CERTIFICATE-----/i)[1].replace('\n', '') ],
            kid: 'key2',
            n: wrongCert.modulus,
            e: wrongCert.exponent,
            x5t: wrongCert.fingerprint
          }
        ]
      });
    });
    afterEach(async function() {
      nock.cleanAll();
    });
    it('GET /admin/locales returns 401 isApiRequest validating against wrong cert private key', async function() {
      const token = createApiRequestToken('client-credentials', '@clients', [], 'key2');
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/locales', headers };

      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
    it('GET /admin/settings returns 401 invalid token isApiRequest validating against wrong cert private key', async function() {
      const token = createApiRequestToken('client-credentials', '@clients', [], 'key1');
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/settings', headers };
  
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
    it('GET /admin/user returns 401 invalid token isApiRequest validating against wrong cert private key', async function() {
      const token = createApiRequestToken('client-credentials', '@clients', [], 'key1');
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/user', headers };
  
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
    it('GET /admin/locales returns 401 invalid isApiRequest token validating wrong cert private key', async function() {
      const token = createApiRequestToken('client-credentials', '@clients', [], 'key1');
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/locales', headers };
  
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
    it('GET /admin/settings returns 401 for a token with incorrect claims and validating wrong cert private key', async function() {
      const token = jwt.sign(
        { sub: 'user@clients', iss: 'https://wrong-issuer/', },
        certOne.privateKey, 
        { algorithm: 'RS256', header: { 
          kid: 'key2'
        }, 
        algorithm: 'RS256', 
        expiresIn: '5m' 
      }
      );
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/settings', headers };
    
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
    it('GET /admin/settings returns 401 for a token with an invalid signature and validating wrong cert private key', async function() {
      const token = jwt.sign(
        { sub: 'user@clients', iss: `https://${config('AUTH0_DOMAIN')}/` },
        certOne.privateKey + "123",
        { algorithm: 'RS256', keyid: 'mocked-key-id' }
      );
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/settings', headers };
    
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
    it('GET /admin/settings returns 401 for an expired token and validating wrong cert private key', async function() {
      const token = jwt.sign(
        { sub: 'user@clients', iss: `https://${config('AUTH0_DOMAIN')}/`, exp: Math.floor(Date.now() / 1000) - 60 },
        certOne.privateKey, 
        { algorithm: 'RS256', header: { 
          kid: 'key2'
        },
        algorithm: 'RS256', 
      });
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/settings', headers };
    
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
  })
  describe('With an invalid token dashboard admin token', function() {
    it('returns a 400 with an invalid token', async function() {
      const options = { method: 'GET', url: '/?foo=bar', payload: {} }
  
      const res = await server.inject(options);
      expect(res.statusCode).to.eq(400);
    });
    it('GET /admin/locales returns 401 invalid token', async function() {
      const token = createAuth0Token({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/locales', headers };
  
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
    it('GET /admin/settings returns 401 invalid token isDashboardAdminRequest token', async function() {
      const token = createAuth0Token({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/settings', headers };
  
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
    it('GET /admin/user returns 401 invalid isDashboardAdminRequest using HS256 token', async function() {
      const token = createAuth0Token({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/user', headers };
  
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
    it('GET /admin/locales returns 401 invalid isDashboardAdminRequest token using HS256', async function() {
      const token = createAuth0Token({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/locales', headers };

      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
    it('PUT /admin/locales returns 401 invalid isDashboardAdmin token using HS256', async function() {
      const token = createAuth0Token({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
      const headers = { Authorization: `Bearer ${token}` };
      const payload = { locales: { code: 'en', name: 'English' } };
      const options = { method: 'GET', url: '/admin/locales', headers, payload };

      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
    it('PUT /admin/settings returns 401 invalid isDashboardAdmin token using HS256', async function() {
      const token = createAuth0Token({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        template: "template1",
        locale: "en",
        title: "title1",
        color: "#000000",
        logoPath: "https://example.com/logo.png",
        removeOverlay: false
      };
      const options = { method: 'GET', url: '/admin/settings', headers, payload };

      const res = await server.inject(options);
      expect(res.statusCode).to.equal(401);
      expect(res.result).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        attributes: { error: 'Invalid credentials' }
      });
    });
  });
  describe('PUT /admin/settings payload validation', function() {
    it('returns a 400 with an invalid payload - missing template property', async function() {
      const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        locale: "en",
        title: "title1",
        color: "#000000",
        logoPath: "https://example.com/logo.png",
        removeOverlay: false
      };
      const options = { method: 'PUT', url: '/admin/settings', headers, payload };
 
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(400);
      expect(res.result).to.deep.equal({ 
        error: 'Bad Request', 
        message: 'Invalid request payload input', 
        statusCode: 400 
      });
    });
    it('returns a 400 with an invalid payload - missing locale property', async function() {
      const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        template: "template1",
        title: "title1",
        color: "#000000",
        logoPath: "https://example.com/logo.png",
        removeOverlay: false,
        customDomain: 'hey.abc.com'
      };
      const options = { method: 'PUT', url: '/admin/settings', headers, payload };
 
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(400);
      expect(res.result).to.deep.equal({ 
        error: 'Bad Request', 
        message: 'Invalid request payload input', 
        statusCode: 400 
      });
    });
    it('returns a 400 with an invalid payload - missing multiple properties', async function() {
      const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        template: "template1",
        customDomain: 'hey.abc.com'
      };
      const options = { method: 'PUT', url: '/admin/settings', headers, payload };
 
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(400);
      expect(res.result).to.deep.equal({ 
        error: 'Bad Request', 
        message: 'Invalid request payload input', 
        statusCode: 400 
      });
    });
    it('returns a 400 with an invalid payload - missing title property', async function() {
      const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        template: "template1",
        locale: 'en',
        color: "#000000",
        logoPath: "https://example.com/logo.png",
        removeOverlay: false
      };
      const options = { method: 'PUT', url: '/admin/settings', headers, payload };
 
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(400);
      expect(res.result).to.deep.equal({ 
        error: 'Bad Request', 
        message: 'Invalid request payload input', 
        statusCode: 400 
      });
    });
    it('returns a 400 with an invalid payload - missing color property', async function() {
      const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        template: "template1",
        locale: 'en',
        title: "title1",
        logoPath: "https://example.com/logo.png",
        removeOverlay: false
      };
      const options = { method: 'PUT', url: '/admin/settings', headers, payload };
 
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(400);
      expect(res.result).to.deep.equal({ 
        error: 'Bad Request', 
        message: 'Invalid request payload input', 
        statusCode: 400 
      });
    });
    it('returns a 400 with an invalid payload - invalid path on logoPath', async function() {
      const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        template: "template1",
        locale: 'en',
        title: "title1",
        color: "#000000",
        logoPath: "invalid-path",
        removeOverlay: false
      };
      const options = { method: 'PUT', url: '/admin/settings', headers, payload };
 
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(400);
      expect(res.result).to.deep.equal({ 
        error: 'Bad Request', 
        message: 'Invalid request payload input', 
        statusCode: 400 
      });
    });
  });
  describe('GET /admin/locales endpoint failures', function() {
    beforeEach(async function() {
      sinon.stub(storage, 'getLocales').rejects(new Error('Failed to get locales'));
    });

    afterEach(async function() {
      sinon.restore();
    });
    it('returns a 500 on failed database call', async function() {
      const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/locales', headers };
 
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(500);
      expect(res.result).to.deep.equal({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An internal server error occurred'
      });
    });
  });
  describe('GET /admin/settings endpoint failures', function() {
    beforeEach(async function() {
      sinon.stub(storage, 'getLocales').resolves({});
      sinon.stub(storage, 'getSettings').rejects(new Error('Failed to get settings'));
    });

    afterEach(async function() {
      sinon.restore();
    });
    it('returns a 500 on failed database call', async function() {
      const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method: 'GET', url: '/admin/settings', headers };
 
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(500);
      expect(res.result).to.deep.equal({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An internal server error occurred'
      });
    });
  });
  describe('PUT /admin/locales endpoint failures', function() {
    beforeEach(async function() {
      sinon.stub(storage, 'setLocales').rejects(new Error('Failed to set locales'));
    });

    afterEach(async function() {
      sinon.restore();
    });
    it('returns a 500 on failed database call', async function() {
      const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
      const headers = { Authorization: `Bearer ${token}` };
      const payload = { locale: { code: 'en', name: 'English' } };
      const options = { method: 'PUT', url: '/admin/locales', headers, payload };
 
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(500);
      expect(res.result).to.deep.equal({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An internal server error occurred'
      });
    });
  });
  describe('PUT /admin/settings endpoint failures', function() {
    beforeEach(async function() {
      sinon.stub(storage, 'setSettings').rejects(new Error('Failed to set settings'));
      sinon.stub(settingsUtils, 'fetchRegisteredCustomDomain').rejects(new Error('Failed to set settings'));
    });

    afterEach(async function() {
      sinon.restore();
    });
    it('returns a 500 on failed database call', async function() {
      const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        template: "template1",
        locale: "en",
        title: "title1",
        color: "#000000",
        logoPath: "https://example.com/logo.png",
        removeOverlay: false
      };
      const options = { method: 'PUT', url: '/admin/settings', headers, payload };
 
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(500);
      expect(res.result).to.deep.equal({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An internal server error occurred'
      });
    });
  });
  describe('PUT /admin/settings endpoint failures with custom domain check', function() {
    beforeEach(async function() {
      nock.cleanAll();
      nock(`https://${config('AUTH0_DOMAIN')}`)
      .post(`/oauth/token`)
      .reply(200, { 
        access_token: createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' }), 
        token_type: 'Bearer',
        expires_in: 86400
      });
      nock(`https://${config('AUTH0_DOMAIN')}/api/v2`)
      .put(`/rules-configs/AUTH0_ACCOUNT_LINKING_EXTENSION_CUSTOM_DOMAIN`)
      .reply(200, {});
      nock(`https://${config('AUTH0_DOMAIN')}/api/v2`)
      .get(`/custom-domains`)
      .reply(200, [
          {
            domain: 'abc.def.com',
            status: 'active',
            verification_status: 'verified'
          }
        ]
      );
    });
    afterEach(async function() {
      nock.cleanAll();
    });
    it('fails to find a matching custom domain', async function() {
      const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        template: "template1",
        locale: "en",
        title: "title1",
        color: "#000000",
        logoPath: "https://example.com/logo.png",
        removeOverlay: false,
        customDomain: 'abc.defff.com' // This domain does not exist in the mocked response
      };
      const options = { method: 'PUT', url: '/admin/settings', headers, payload };
 
      const res = await server.inject(options);
      console.log(res.result);
      expect(res.statusCode).to.equal(500);
      expect(res.result).to.deep.equal({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An internal server error occurred'
      });
    });
  });
});