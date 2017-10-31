import path from 'path';
import { expect } from 'chai';
import { sign } from 'jsonwebtoken';
import { FileStorageContext } from 'auth0-extension-tools';
import { request, createServer } from '../test_helper';
import config from '../../lib/config';
import { init as initStorage } from '../../lib/db';

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
      return server.inject({ method: 'GET', url: '/', payload: {} }).then(res => {
        expect(res.statusCode).to.eq(400);
      });
    });
  });
});
