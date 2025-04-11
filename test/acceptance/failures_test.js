const path = require('path');
const { expect } = require('chai');
const sinon = require('sinon');
const { FileStorageContext } = require('auth0-extension-tools');
const { createServer, createAuth0Token, createWebtaskToken, createApiRequestToken } = require('../test_helper');
const initStorage = require('../../lib/db').init;
const storage = require('../../lib/storage')

describe('Endpoint Failures', function() {
  let server;
  
  before(async function() {
    server = await createServer();
    initStorage(new FileStorageContext(path.join(__dirname, '../../data.json')));
  });

  after(function() {
    server.stop();
  });
  describe('With an invalid token', function() {
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
    it('GET /admin/settings returns 401 invalid token isDashboardAdminRequest', async function() {
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
    it('GET /admin/settings returns 401 invalid token isApiRequest with wrong kid', async function() {
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
    it('GET /admin/user returns 401 invalid token isDashboardAdminRequest', async function() {
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
    it('GET /admin/user returns 401 invalid token isApiRequest with wrong kid', async function() {
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
    it('GET /admin/locales returns 401 invalid token isDashboardAdminRequest', async function() {
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
    it('GET /admin/locales returns 401 invalid token isApiRequest with wrong kid', async function() {
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
    it('PUT /admin/locales returns 401 invalid token', async function() {
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
    it('PUT /admin/settings returns 401 invalid token', async function() {
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
});