import nconf from 'nconf';
import path from 'path';
import request from 'request';
import { sign } from 'jsonwebtoken';
import { handlers } from 'auth0-extension-hapi-tools';
import initServer from '../server/index';
import config from '../lib/config';

const fakeApiClient = () => {
  let defaultUsers = {};

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

const createRequest = (options) => (
  new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(res);
    });
  })
);

const mockHandlers = (server, options, next) => {
  server.decorate('server', 'handlers', {
    managementClient: {
      assign: 'auth0',
      method: function(req, res) {
        res(fakeApiClient());
      }
    },
    validateHookToken: handlers.validateHookToken(
      config('AUTH0_DOMAIN'),
      config('WT_URL'),
      config('EXTENSION_SECRET')
    )
  });

  next();
};

mockHandlers.attributes = { name: 'handlers' };

const createServer = (configFile =  '../server/config.test.json') => {
  nconf.argv().env().file(path.join(__dirname, configFile)).defaults({
    AUTH0_RTA: 'auth0.auth0.com',
    DATA_CACHE_MAX_AGE: 1000 * 10,
    NODE_ENV: 'test',
    HOSTING_ENV: 'default',
    PORT: 3001,
    USE_OAUTH2: false,
    LOG_COLOR: true,
    AUTH0_DOMAIN: 'test.local.dev',
    AUTH0_CLIENT_ID: 'AUTHO_CLIENT_ID',
    AUTH0_CLIENT_SECRET: 'AUTHO_CLIENT_SECRET',
    WT_URL: 'localhost:3001',
    EXTENSION_SECRET: 'EXTENSION_SECRET'
  });


  config.setProvider(key => nconf.get(key));

  return initServer(() => {}, mockHandlers);
};

const startServer = (configFile =  '../server/config.test.json') => {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.start((err) => {
      if (err) {
        reject(err);
      }

      resolve(server);
    });
  });
};

const createToken = (user) => {
  const options = {
    expiresIn: '5m',
    audience: config('AUTH0_CLIENT_ID'),
    issuer: 'https://auth0.example.com'
  };

  var userSub = {
    sub: user.user_id,
    email: user.email,
    base: 'auth0.example.com/api/v2'
  };

  return sign(userSub, config('AUTH0_CLIENT_SECRET'), options);
}

export {
  startServer,
  createRequest as request,
  createServer,
  createToken
};
