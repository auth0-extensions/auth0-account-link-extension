const path = require('path');
const { expect } = require('chai');
const { FileStorageContext } = require('auth0-extension-tools');
const { createServer } = require('../test_helper');
const initStorage = require('../../lib/db').init;

describe('Requesting the linking route', function() {
  describe('With an invalid token', function() {
    let server;

    before(async function() {
      server = await createServer();
      initStorage(new FileStorageContext(path.join(__dirname, '../../data.json')));
    });

    after(function() {
      server.stop();
    });

    it('returns a 400 with an invalid token', async function() {
      const options = { method: 'GET', url: '/?foo=bar', payload: {} }
      const res = await server.inject(options);
      expect(res.statusCode).to.eq(400);
    });
  });
});
