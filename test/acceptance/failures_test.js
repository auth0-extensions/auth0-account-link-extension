import {expect} from 'chai';
import { request, startServer } from '../test_helper';


describe('Requesting the linking route', function() {
  describe('With an invalid token', function() {
    let server;
    let baseUrl;

    before(function() {
      return startServer().then(s => {
        server = s;
        baseUrl = s.info.uri;
      });
    });

    after(function() {
      server.stop();
    });

    it('returns a 400 with an invalid token', function() {
      return request({ url: baseUrl }).then(res => {
        expect(res.statusCode).to.eq(400);
      });
    });
  });
});
