const { expect } = require('chai');
const sinon = require('sinon');
const queryString = require('querystring');
const metadata = require('../../webtask.json');
const handlerUtils = require('../../lib/handlerUtils')
const storage = require('../../lib/storage')
const { createAuth0Token, createServer, createWebtaskToken } = require('../test_helper');
const users = require('./test_data/users.json')
const indexTemplate = require('../../templates');
const allLocales = require('../../locales.json');

describe('Requesting the metadata route', function() {
  let server;

  before(async function() {
    server = await createServer();
  });

  after(function() {
    server.stop();
  });

  describe('Regardless of token', function() {
    it('returns content from webtask.json file', async function() {
      const options = { method: 'GET', url: '/meta' };
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.deep.equal(metadata);
    });
  });

  describe('With valid token', function() {
    describe('/ (account linking) endpoint', function() {
      beforeEach(async function() {
        sinon.stub(handlerUtils, 'fetchUsersFromToken').resolves({ currentUser: users.usersByEmail[0], matchingUsers: [users.usersByEmail[1]] });
        sinon.stub(storage, 'getSettings').resolves('en');
        sinon.stub(storage, 'getLocales').resolves({ en: { 'or': 'or'}});
        sinon.stub(indexTemplate, 'renderTemplate').resolves('<html>Mock Template</html>');
      });

      afterEach(async function() {
        sinon.restore();
      });

      it('decodes and verifies token, finds matching users and returns html template', async function() {
        const token = createAuth0Token({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
        const headers = { Authorization: `Bearer ${token}` };
        const params = queryString.encode({
          child_token: token,
          client_id: "wAhB6ROk321a2I3WKWK6OOpGTiBBauLV",
          redirect_uri: "localhost:3000/tester/callback?connection=test1",
          scope: "openid profile phone",
          response_type: "code",
          state: "hKFo2SBvNnV6SmliLVZ5NkI5eGlzVHVjMDd0TUs5a0ZpSTNWNKFuqHJlZGlyZWN0o3RpZNkgcENwNWY5UXA5NEFKLXh1d3RNQ0xFWVg1eXJOVmVqeHqjY2lk2SB3QWhCNlJPazMyMWEySTNXS1dLNk9PcEdUaUJCYXVMVg"
        });
        const options = { method: 'GET', url: `/?${params}`, headers };
        const res = await server.inject(options);
        expect(res.statusCode).to.equal(200);
        expect(res.result).to.deep.equal('<html>Mock Template</html>');
      });
    });

    describe('/meta endpoint', function() {
      it('returns a 200 on linking page', async function() {
        const headers = {
          Authorization: `Bearer ${createAuth0Token({ user_id: 1, email: 'foo@example.com' })}`
        };
        const options = { method: 'GET', url: '/meta', headers };
        const res = await server.inject(options);
        expect(res.statusCode).to.equal(200);
        expect(res.result).to.deep.equal(metadata);
      });
    });
    describe('/admin/locales endpoint', function() {
      beforeEach(async function() {
        sinon.stub(storage, 'getLocales').resolves(allLocales);
        sinon.stub(storage, 'setLocales').resolves({ status: 'ok' });
      });

      afterEach(async function() {
        sinon.restore();
      });

      it('GET /admin/locales returns 200 and satisfies endpoint scope', async function() {
        const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
        const headers = { Authorization: `Bearer ${token}` };
        const options = { method: 'GET', url: '/admin/locales', headers };

        const res = await server.inject(options);
        expect(res.statusCode).to.equal(200);
      });
      it('PUT /admin/locales returns 200 and satisfies endpoint scope', async function() {
        const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
        const headers = { Authorization: `Bearer ${token}` };
        const payload = { locale: { code: 'en', name: 'English' } };
        const options = { method: 'PUT', url: '/admin/locales', headers, payload };
   
        const res = await server.inject(options);
        expect(res.statusCode).to.equal(200);
        expect(res.result).to.deep.equal({ status: 'ok' });
      });
    });
    describe('/admin/settings endpoint', function() {
      beforeEach(async function() {
        sinon.stub(storage, 'getLocales').resolves(allLocales);
        sinon.stub(storage, 'getSettings').resolves({});
        sinon.stub(storage, 'setSettings').resolves({ status: 'ok' });
      });

      afterEach(async function() {
        sinon.restore();
      });

      it('GET /admin/settings returns 200 and satisfies scope', async function() {
        const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
        const headers = { Authorization: `Bearer ${token}` };
        const options = { method: 'GET', url: '/admin/settings', headers };

        const res = await server.inject(options);
        expect(res.statusCode).to.equal(200);
        expect(res.result).to.deep.equal({
          availableLocales: [
            { code: 'en', name: 'English' },
            { code: 'es', name: 'Spanish' },
            { code: 'ja', name: 'Japanease' },
            { code: 'fr', name: 'French' },
            { code: 'nl', name: 'Dutch' }
          ]
        })
      });
      it('PUT /admin/settings returns 200 and satisfies endpoint scope', async function() {
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
        expect(res.statusCode).to.equal(200);
        expect(res.result).to.deep.equal({ status: 'ok' });
      });
      describe('/admin/user endpoint', function() {
        it('returns 200 and satisfies /admin/user endpoint scope', async function() {
          const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
          const headers = { Authorization: `Bearer ${token}` };
          const options = { method: 'GET', url: '/admin/user', headers };
  
          const res = await server.inject(options);
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.have.keys(['email', 'avatar'])
        });
      });
    });
  });
});
