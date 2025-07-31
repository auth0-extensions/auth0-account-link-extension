const { expect } = require('chai');
const sinon = require('sinon');
const linkingJwtUtils = require('../../lib/linkingJwtUtils')
const { createAuth0Token, createWebtaskToken } = require('../test_helper');
const storage = require('../../lib/storage');

describe('Linking JWT Utils Tests', () => {
  beforeEach(async function() {
    sinon.stub(storage, 'getSettings').resolves({ customDomain: '' });
  });

  afterEach(async function() {
    sinon.restore();
  });
    it('validates a token successfully', async () => {
        const token = createAuth0Token({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
        const decoded = await linkingJwtUtils.validateAuth0Token(token);

        expect(decoded.sub).to.deep.equal('auth0|67d304a8b5dd1267e87c53ba');
        expect(decoded.email).to.deep.equal('ben1@acme.com');
        expect(decoded.base).to.deep.equal('auth0.example.com/api/v2');
        expect(decoded.aud).to.deep.equal('22qApOBZ9BkEf3WDIYetEiJPXswpQdmY');
        expect(decoded.iss).to.deep.equal('https://account-linking-testing.auth0.com/');
    })
    it('throws an error on validation for an a token not issued by auth0', async () => {
        try {
          const invalidToken = createWebtaskToken({ user_id: 'auth0|67d304a8b5dd1267e87c53ba', email: 'ben1@acme.com' });
          await linkingJwtUtils.validateAuth0Token(invalidToken);
        } catch (error) {
          expect(error).to.be.an('error');
          expect(error.message).to.include('An error was encountered while decoding the token');
        }
    });
    it('throws an error on validation for an a token that is not valid', async () => {
        try {
          const invalidToken = {iss: '123', aud: '123', sub: '123', email: '123'};
          await linkingJwtUtils.validateAuth0Token(invalidToken);
        } catch (error) {
          expect(error).to.be.an('error');
          expect(error.message).to.include('An error was encountered while decoding the token');
        }
    });
});
