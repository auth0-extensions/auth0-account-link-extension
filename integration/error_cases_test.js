const { expect } = require('chai');
const { createServer } = require('../test/test_helper');

describe('Account linking HTTP edge cases', function () {
  let server;

  before(async function () {
    // server.inject() works on a stopped server in Hapi; no server.start() needed here.
    server = await createServer();
  });

  after(async function () {
    if (server) await server.stop();
  });

  it('redirects to admin when no parameters are provided', async function () {
    const res = await server.inject({ method: 'GET', url: '/' });

    expect(res.statusCode).to.equal(302);
    expect(res.headers.location).to.include('/admin');
  });
});
