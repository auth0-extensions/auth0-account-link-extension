import {expect} from 'chai';
import { request, createServer } from '../test_helper';
import { sign } from 'jsonwebtoken';
import config from '../../lib/config';
import metadata from '../../webtask.json';

describe('Requesting the metadata route', function() {
  describe('With an invalid token', function() {
    let server;

    before(function() {
      server = createServer();
    });

    after(function() {
      server.stop();
    });

    it('returns content from webtask.json file', function() {
      return server.inject({ method: 'GET', url: '/meta' }).then(res => {
        expect(res.statusCode).to.eq(200);
        expect(res.result).to.eq(metadata);
      });
    });
  });
});
