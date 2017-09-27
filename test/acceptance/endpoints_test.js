import {expect} from 'chai';
import { request, createServer, createToken } from '../test_helper';
import { sign } from 'jsonwebtoken';
import config from '../../lib/config';
import metadata from '../../webtask.json';

describe('Requesting the metadata route', function() {
  let server;

  before(function() {
    server = createServer();
  });

  after(function() {
    server.stop();
  });

  describe('Regardless of token', function() {
    it('returns content from webtask.json file', function() {
      return server.inject({ method: 'GET', url: '/meta' }).then(res => {
        expect(res.statusCode).to.eq(200);
        expect(res.result).to.eq(metadata);
      });
    });
  });

  describe('With valid token', function() {
    it('returns a 200 on linking page', function() {
      const headers = {
        Authorization: `Bearer ${createToken({user_id: 1, email: 'foo@example.com'})}`
      };

      return server.inject({ method: 'GET', url: '/meta', headers }).then(res => {
        expect(res.statusCode).to.eq(200);
        expect(res.result).to.eq(metadata);
      });
    });
  });
});
