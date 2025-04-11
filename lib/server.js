/* eslint-disable no-param-reassign */
const Boom = require('@hapi/boom');
const request = require('superagent');
const tools = require('auth0-extension-tools');
const { createRouteNormalizationRx } = require('./urlHelpers');

module.exports.createServer = cb => fromHapi(tools.createServer(cb));

function fromHapi(serverFactory) {
  let hapiServer;
  let webtaskContext;

  return async (context, req, res) => {
    webtaskContext = attachStorageHelpers(context);

    if (hapiServer == null) {
      hapiServer = await serverFactory(webtaskContext);

      if (!hapiServer) {
        throw new Error('Server factory did not return a server instance');
      }

      hapiServer.ext('onRequest', (hapiRequest, h) => {
        const normalizeRouteRx = createRouteNormalizationRx(hapiRequest.raw.req.x_wt);

        if (normalizeRouteRx) {
          hapiRequest.originalUrl = hapiRequest.path;
          // need to remove the protocol + domain etc for the route matching to work,
          // however, need to keep the query string for it to be passed to the route handlers
          hapiRequest.setUrl(`${hapiRequest.path}${hapiRequest.url.search}`.replace(normalizeRouteRx, '/'));
        }

        /* Fix multi-proto environments, take the first */
        if (hapiRequest.headers['x-forwarded-proto']) {
          hapiRequest.headers['x-forwarded-proto'] = hapiRequest.headers['x-forwarded-proto'].split(',').shift();
        }

        hapiRequest.webtaskContext = webtaskContext;

        return h.continue;
      });
    }

    hapiServer.listener.emit('request', req, res);
  };
}

function attachStorageHelpers(context) {
  context.read = context.secrets.EXT_STORAGE_URL
    ? readFromPath
    : readNotAvailable;
  context.write = context.secrets.EXT_STORAGE_URL
    ? writeToPath
    : writeNotAvailable;

  return context;


  async function readNotAvailable() {
    throw Boom.preconditionFailed('Storage is not available in this context');
  }

  async function readFromPath(path, options = {}) {
    try {
      const res = await request
        .get(context.secrets.EXT_STORAGE_URL)
        .set(options.headers || {})
        .query({ path });

      if (res.statusCode === 404 && Object.hasOwnProperty.call(options, 'defaultValue')) {
        return options.defaultValue;
      }
      if (res.statusCode >= 400) {
        throw Boom.create(res.statusCode, res.body && res.body.message);
      }

      return res.body;
    } catch (err) {
      throw Boom.boomify(err, 502);
    }
  }

  async function writeNotAvailable() {
    throw Boom.preconditionFailed('Storage is not available in this context');
  }

  async function writeToPath(path, data, options = {}) {
    try {
      const res = await request
        .put(context.secrets.EXT_STORAGE_URL)
        .set(options.headers || {})
        .query({ path })
        .send(data);

      if (res.statusCode >= 400) {
        throw Boom.create(res.statusCode, res.body && res.body.message);
      }

      return null;
    } catch (err) {
      throw Boom.boomify(err, 502);
    }
  }
}
