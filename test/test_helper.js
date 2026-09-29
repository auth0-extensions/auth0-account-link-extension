const nconf = require('nconf');
const os = require('os');
const path = require('path');
const request = require('request');
const { sign } = require('jsonwebtoken');
const { FileStorageContext } = require('auth0-extension-tools');
const handlerUtils = require('../lib/handlerUtils');
const initServer = require('../server/index');
const initDb = require('../lib/db').init;
const config = require('../lib/config');
const certs = require('./acceptance/test_data/certs.json');

const cert = certs.certOne;

const fakeApiClient = () => {
  const defaultUsers = {};

  return {
    users: {
      getAll: () => Promise.resolve({ users: defaultUsers }),
      get: (options) => {
        const id = parseInt(options.id, 10) - 1;
        return Promise.resolve(defaultUsers[id]);
      },
      create: (data) => {
        defaultUsers.push(data);
        return Promise.resolve();
      },
      delete: () => {
        defaultUsers.pop();
        return Promise.resolve();
      },
      update: (options, data) => {
        const id = parseInt(options.id, 10) - 1;
        if (data.email) defaultUsers[id].email = data.email;
        if (data.username) defaultUsers[id].username = data.username;
        if (data.password) defaultUsers[id].password = data.password;
        if (data.blocked !== undefined) defaultUsers[id].blocked = data.blocked;
        return Promise.resolve();
      }
    }
  };
};

const createRequest = options =>
  new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(res);
    });
  });

const mockHandlers = { name: 'handlers', register: async (server, options) => {
  server.decorate('server', 'handlers', {
    managementClient: {
      assign: 'auth0',
      method(req, res) {
        res(fakeApiClient());
      }
    },
    validateHookToken: handlerUtils.validateHookToken(
      config('AUTH0_DOMAIN'),
      config('WT_URL'),
      config('EXTENSION_SECRET')
    )
  });
} };

const createServer = () => {
  nconf
    .argv()
    .env()
    .defaults({
      AUTH0_RTA: 'auth0.auth0.com',
      DATA_CACHE_MAX_AGE: 1000 * 10,
      NODE_ENV: 'test',
      HOSTING_ENV: 'default',
      PORT: 3001,
      USE_OAUTH2: false,
      LOG_COLOR: true,
      AUTH0_DOMAIN: 'test.local.dev',
      AUTH0_CLIENT_ID: 'AUTH0_CLIENT_ID',
      AUTH0_CLIENT_SECRET: 'AUTH0_CLIENT_SECRET',
      WT_URL: 'localhost:3001',
      PUBLIC_WT_URL: 'testWebtask',
      EXTENSION_SECRET: 'EXTENSION_SECRET'
    });

  config.setProvider(key => nconf.get(key));

  const tmpDb = path.join(os.tmpdir(), `auth0-ext-test-${process.pid}.json`);
  initDb(new FileStorageContext(tmpDb, { force: 1 }));

  return initServer(() => {}, mockHandlers);
};

const startServer = () =>
  new Promise((resolve, reject) => {
    const server = createServer();

    server.start((err) => {
      if (err) {
        reject(err);
      }

      resolve(server);
    });
  });

const createAuth0Token = (user) => {
  const options = {
    expiresIn: '5m',
    audience: config('AUTH0_CLIENT_ID'),
    issuer: `https://${config('AUTH0_DOMAIN')}/`
  };

  const userSub = {
    sub: user.user_id,
    email: user.email,
    base: 'auth0.example.com/api/v2',
    scope: []
  };

  return sign(userSub, config('AUTH0_CLIENT_SECRET'), options);
};

const createWebtaskToken = (user) => {
  const options = {
    expiresIn: '5m',
    audience: 'urn:api-account-linking',
    issuer: config('PUBLIC_WT_URL')
  };

  const userSub = {
    sub: user.user_id,
    email: user.email,
    base: 'auth0.example.com/api/v2',
    scope: [],
    access_token: 'abc123'
  };

  return sign(userSub, config('EXTENSION_SECRET'), options);
};

// This token is to test the isApiRequest JWT strategy path
const createApiRequestToken = (gty, sub, scope, kid = 'key2') => {
  const userSub = {
    iss: `https://${config('AUTH0_DOMAIN')}/`,
    aud: 'urn:auth0-account-linking-api',
    sub: `auth0@${sub}`,
    azp: '123',
    email: 'ben1@acme.com',
    gty,
    scope
  };

  const options = { 
    header: { 
      kid 
    }, 
    algorithm: 'RS256', 
    expiresIn: '5m'
  };
  
  return sign(userSub, cert.privateKey, options)
}


module.exports = { 
  startServer, 
  request: createRequest, 
  createServer, 
  createAuth0Token, 
  createWebtaskToken,
  createApiRequestToken
};
