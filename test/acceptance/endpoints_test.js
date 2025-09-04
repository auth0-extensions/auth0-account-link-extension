const { expect } = require('chai');
const sinon = require('sinon');
const queryString = require('querystring');
const nock = require('nock');
const metadata = require('../../webtask.json');
const linkingJwtUtils = require('../../lib/linkingJwtUtils')
const settingsUtils = require('../../lib/settingsUtils');
const storage = require('../../lib/storage')
const { createAuth0Token, createServer, createWebtaskToken, createApiRequestToken } = require('../test_helper');
const users = require('./test_data/users.json')
const indexTemplate = require('../../templates');
const allLocales = require('../../locales.json');
const config = require('../../lib/config');
const certs = require('./test_data/certs.json');

const cert = certs.certOne;
describe('Endpoint tests', function() {
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

  describe('With valid token isDashbardAdminRequest token', function() {
    describe('/ (account linking) endpoint', function() {
      beforeEach(async function() {
        sinon.stub(linkingJwtUtils, 'fetchUsersFromToken').resolves({ currentUser: users.usersByEmail[0], matchingUsers: [users.usersByEmail[1]] });
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
      it('returns a 200 on meta page DashboardAdminRequest', async function() {
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

      it('GET /admin/locales returns 200 dashboardAdminRequest', async function() {
        const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
        const headers = { Authorization: `Bearer ${token}` };
        const options = { method: 'GET', url: '/admin/locales', headers };

        const res = await server.inject(options);
        expect(res.statusCode).to.equal(200);
      });
      it('PUT /admin/locales returns 200 dashboardAdminRequest', async function() {
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
      describe('PUT /admin/settings endpoint success unset custom domain', function() {
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
          .delete(`/rules-configs/AUTH0_ACCOUNT_LINKING_EXTENSION_CUSTOM_DOMAIN`)
          .reply(204, {});
        });
        afterEach(async function() {
          nock.cleanAll();
        });
        beforeEach(async function() {
          sinon.stub(storage, 'getSettings').resolves({ customDomain: 'abc.def.com'});
          sinon.stub(storage, 'setSettings').resolves({ status: 'ok' });
        });
  
        afterEach(async function() {
          sinon.restore();
        });
        it('successfully unsets custom domain and deletes settings config key', async function() {
          const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
          const headers = { Authorization: `Bearer ${token}` };
          const payload = {
            template: "template1",
            locale: "en",
            title: "title1",
            color: "#000000",
            logoPath: "https://example.com/logo.png",
            removeOverlay: false,
            customDomain: '' // unsetting custom domain
          };
          const options = { method: 'PUT', url: '/admin/settings', headers, payload };
     
          const res = await server.inject(options);
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.deep.equal({ status: 'ok' });
        });
      });
    describe('PUT /admin/settings endpoint success without custom domain', async function () {
      beforeEach(async function() {
        sinon.stub(storage, 'getLocales').resolves(allLocales);
        sinon.stub(storage, 'getSettings').resolves({});
        sinon.stub(storage, 'setSettings').resolves({ status: 'ok' });
      });

      afterEach(async function() {
        sinon.restore();
      });

      it('GET /admin/settings returns 200 isDashboardAdminRequest', async function() {
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
            { code: 'nl', name: 'Dutch' },
            { code: 'sv', name: 'Swedish' },
            { code: 'pl', name: 'Polish' },
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
    });

      describe('PUT /admin/settings with customDomain', function() {
        beforeEach(async function() {
          sinon.stub(settingsUtils, 'fetchRegisteredCustomDomain').resolves('abc.example.com');
          sinon.stub(settingsUtils, 'configureSettingsPayload').resolves({ status: 'ok'});
        });
  
        afterEach(async function() {
          sinon.restore();
        });
        it('PUT /admin/settings returns 200 and satisfies endpoint with only customDomain', async function() {
          const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
          const headers = { Authorization: `Bearer ${token}` };
          const payload = {
            customDomain: "abc.example.com"
          };
          const options = { method: 'PUT', url: '/admin/settings', headers, payload };
     
          const res = await server.inject(options);
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.deep.equal({ status: 'ok' });
        });
      })
      describe('/admin/user endpoint', function() {
        it('returns 200 isDashboardAdminRequest', async function() {
          const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
          const headers = { Authorization: `Bearer ${token}` };
          const options = { method: 'GET', url: '/admin/user', headers };
  
          const res = await server.inject(options);
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.have.keys(['email', 'avatar'])
        });
      });
        describe('PUT /admin/settings endpoint success with custom domain check', function() {
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
          beforeEach(async function() {
            sinon.stub(storage, 'getSettings').resolves({});
            sinon.stub(storage, 'setSettings').resolves({ status: 'ok' });
          });
    
          afterEach(async function() {
            sinon.restore();
          });
          it('successfully finds custom domain and sets it with correct rule config setting key', async function() {
            const token = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
            const headers = { Authorization: `Bearer ${token}` };
            const payload = {
              template: "template1",
              locale: "en",
              title: "title1",
              color: "#000000",
              logoPath: "https://example.com/logo.png",
              removeOverlay: false,
              customDomain: 'abc.def.com' // This domain matches domain in the mocked response
            };
            const options = { method: 'PUT', url: '/admin/settings', headers, payload };
       
            const res = await server.inject(options);
            expect(res.statusCode).to.equal(200);
            expect(res.result).to.deep.equal({ status: 'ok' });
          });
        });
    });
  });
  describe('With valid API request token validating against correct cert', function() {
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
            x5c: [ cert.cert.match(/-----BEGIN CERTIFICATE-----([\s\S]*)-----END CERTIFICATE-----/i)[1].replace('\n', '') ],
            kid: 'key2',
            n: cert.modulus,
            e: cert.exponent,
            x5t: cert.fingerprint
          }
        ]
      });
    });
    afterEach(async function() {
      nock.cleanAll();
    });
    describe('meta endpoint', function() {
      it('returns a 200 on meta page isApiRequest', async function() {
        const token = createApiRequestToken('client-credentials', '@clients', [], 'key2');
        const headers = { Authorization: `Bearer ${token}` };
        const options = { method: 'GET', url: '/meta', headers };
        const res = await server.inject(options);
        expect(res.statusCode).to.equal(200);
        expect(res.result).to.deep.equal(metadata);
      });
    })
    describe('admin/locales endpoint', function() {
      beforeEach(async function() {
        sinon.stub(storage, 'getLocales').resolves(allLocales);
        sinon.stub(storage, 'setLocales').resolves({ status: 'ok' });
      });

      afterEach(async function() {
        sinon.restore();
      });
      it('GET /admin/locales returns 200 isApiRequest', async function() {
        const token = createApiRequestToken('client-credentials', '@clients', [], 'key2');
        const headers = { Authorization: `Bearer ${token}` };
        const options = { method: 'GET', url: '/admin/locales', headers };

        const res = await server.inject(options);
        expect(res.statusCode).to.equal(200);
      });
    })
    describe('admin/settings endpoint', function() {
      beforeEach(async function() {
        sinon.stub(storage, 'getLocales').resolves(allLocales);
        sinon.stub(storage, 'getSettings').resolves({});
        sinon.stub(storage, 'setSettings').resolves({ status: 'ok' });
      });

      afterEach(async function() {
        sinon.restore();
      });
      it('GET /admin/settings returns 200 isApiRequest', async function() {
        const token = createApiRequestToken('client-credentials', '@clients', [], 'key2');
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
            { code: 'nl', name: 'Dutch' },
            { code: 'sv', name: 'Swedish' },
            { code: 'pl', name: 'Polish' },
          ]
        })
      });
    })
    describe('admin/user endpoint', function() {
      it('returns 200 isApiRequest', async function() {
        const token = createApiRequestToken('client-credentials', '@clients', [], 'key2');
        const headers = { Authorization: `Bearer ${token}` };
        const options = { method: 'GET', url: '/admin/user', headers };

        const res = await server.inject(options);
        expect(res.statusCode).to.equal(200);
        expect(res.result).to.have.keys(['email', 'avatar'])
      });
    })
  })
});
