const path = require('path');
const { expect } = require('chai');
const { sign } = require('jsonwebtoken');
const { FileStorageContext } = require('auth0-extension-tools');
const { request, createServer } = require('../test_helper');
const config = require('../../lib/config');
const initStorage = require('../../lib/db').init;

describe('Requesting the linking route', function() {
  describe('With an invalid token', function() {
    let server;

    before(function() {
      server = createServer();
      initStorage(new FileStorageContext(path.join(__dirname, '../../data.json')));
    });

    after(function() {
      server.stop();
    });

    it('returns a 400 with an invalid token', function() {
      return server.inject({ method: 'GET', url: '/?foo=bar', payload: {} }).then(res => {
        expect(res.statusCode).to.eq(400);
      });
    });
  });
});
