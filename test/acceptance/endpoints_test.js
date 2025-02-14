const { expect } = require('chai');
const { createServer, createToken } = require('../test_helper');
const metadata = require('../../webtask.json');

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
    it('returns a 200 on linking page', async function() {
      const headers = {
        Authorization: `Bearer ${createToken({user_id: 1, email: 'foo@example.com'})}`
      };
      const options = { method: 'GET', url: '/meta', headers };
      const res = await server.inject(options);
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.deep.equal(metadata);
    });
  });
});
