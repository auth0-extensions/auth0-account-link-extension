import {expect} from 'chai';
import { request, createServer } from '../test_helper';
import { sign } from 'jsonwebtoken';
import config from '../../lib/config';

describe('Requesting the linking route', function() {
  describe('With an invalid token', function() {
    let server;

    before(function() {
      server = createServer();
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
