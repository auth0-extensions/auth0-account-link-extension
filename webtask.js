/* eslint-disable no-useless-escape */
/* eslint-disable prefer-template */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
// const tools = require('auth0-extension-hapi-tools');
const Boom = require('boom');
const Request = require('request');
const hapiApp = require('./server/init');
const logger = require('./lib/logger');
const config = require('./lib/config');
const tools = require('auth0-extension-tools');

const createServer = createWebtaskServer((wtConfig, wtStorage) => {
  logger.info('Starting Account Link Extension - Version:', process.env.CLIENT_VERSION);
  logger.info(' > WT_URL:', wtConfig('WT_URL'));
  logger.info(' > PUBLIC_WT_URL:', wtConfig('PUBLIC_WT_URL'));
  return hapiApp(wtConfig, wtStorage);
});

module.exports = (context, req, res) => {
  const publicUrl = (req.x_wt && req.x_wt.ectx && req.x_wt.ectx.PUBLIC_WT_URL) || false;
  if (!publicUrl) {
    config.setValue('PUBLIC_WT_URL', tools.urlHelpers.getWebtaskUrl(req));
  }

  createServer(context, req, res);
};

function createWebtaskServer(cb) {
  return fromHapi(tools.createServer(cb));
}

// eslint-disable-next-line no-useless-escape
const SANITIZE_RX = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;

function fromHapi(serverFactory) {
  let hapiServer;
  let webtaskContext;

  return (context, req, res) => {
    webtaskContext = attachStorageHelpers(context);

    if (hapiServer == null) {
      hapiServer = serverFactory(webtaskContext);
      hapiServer.ext('onRequest', (hapiRequest, h) => {
        const normalizeRouteRx = createRouteNormalizationRx(hapiRequest.raw.req.x_wt);
        if (normalizeRouteRx) {
          hapiRequest.originalUrl = hapiRequest.url.path;
          hapiRequest.setUrl(hapiRequest.url.path.replace(normalizeRouteRx, '/'));
        }

        /* Fix multi-proto environments, take the first */
        if (hapiRequest.headers['x-forwarded-proto']) {
          hapiRequest.headers['x-forwarded-proto'] = hapiRequest.headers['x-forwarded-proto'].split(',').shift();
        }

        hapiRequest.webtaskContext = webtaskContext;
        return h.continue();
      });
    }

    const dispatch = hapiServer.connections[0]._dispatch();
    dispatch(req, res);
  };
}

const USE_WILDCARD_DOMAIN = 3;
const USE_CUSTOM_DOMAIN = 2;
const USE_SHARED_DOMAIN = 1;

function createRouteNormalizationRx(claims) {
  if (!claims.container) {
    return null;
  }

  const container = claims.container.replace(SANITIZE_RX, '\\$&');
  const name = claims.jtn
    ? claims.jtn.replace(SANITIZE_RX, '\\$&')
    : '';

  if (claims.url_format === USE_SHARED_DOMAIN) {
    return new RegExp('^\/api/run/' + container + '/(?:' + name + '\/?)?');
  } else if (claims.url_format === USE_CUSTOM_DOMAIN) {
    return new RegExp('^\/' + container + '/(?:' + name + '\/?)?');
  } else if (claims.url_format === USE_WILDCARD_DOMAIN) {
    return new RegExp('^\/(?:' + name + '\/?)?');
  }
  throw new Error('Unsupported webtask URL format.');
}

function attachStorageHelpers(context) {
  context.read = context.secrets.EXT_STORAGE_URL
    ? readFromPath
    : readNotAvailable;
  context.write = context.secrets.EXT_STORAGE_URL
    ? writeToPath
    : writeNotAvailable;

  return context;


  function readNotAvailable(path, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    cb(Boom.preconditionFailed('Storage is not available in this context'));
  }

  function readFromPath(path, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    Request({
      uri: context.secrets.EXT_STORAGE_URL,
      method: 'GET',
      headers: options.headers || {},
      qs: { path },
      json: true
    // eslint-disable-next-line consistent-return
    }, (err, res, body) => {
      if (err) return cb(Boom.wrap(err, 502));
      if (res.statusCode === 404 && Object.hasOwnProperty.call(options, 'defaultValue')) return cb(null, options.defaultValue);
      if (res.statusCode >= 400) return cb(Boom.create(res.statusCode, body && body.message));

      cb(null, body);
    });
  }

  function writeNotAvailable(path, data, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    cb(Boom.preconditionFailed('Storage is not available in this context'));
  }

  function writeToPath(path, data, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    Request({
      uri: context.secrets.EXT_STORAGE_URL,
      method: 'PUT',
      headers: options.headers || {},
      qs: { path },
      body: data
    }, (err, res, body) => {
      if (err) return cb(Boom.wrap(err, 502));
      if (res.statusCode >= 400) return cb(Boom.create(res.statusCode, body && body.message));

      cb(null);
    });
  }
}
