const {expect} = require('chai');
const { request, createServer, createToken } = require('../test_helper');
const { sign } = require('jsonwebtoken');
const config = require('../../lib/config');
const metadata = require('../../webtask.json');

describe('Requesting the metadata route', function() {
  let server;

  before(async function() {
    server = await createServer();
  });

  after(async function() {
    await server.stop();
  });

  describe('Regardless of token', function() {
    it('returns content from webtask.json file', async function() {
      return await server.inject({ method: 'GET', url: '/meta' }).then(res => {
        expect(res.statusCode).to.eq(200);
        expect(res.result).to.eq(metadata);
      });
    });
  });

  describe('With valid token', function() {
    it('returns a 200 on linking page', async function() {
      const headers = {
        Authorization: `Bearer ${createToken({user_id: 1, email: 'foo@example.com'})}`
      };

      return await server.inject({ method: 'GET', url: '/meta', headers }).then(res => {
        expect(res.statusCode).to.eq(200);
        expect(res.result).to.eq(metadata);
      });
    });
  });
});
