import nconf from 'nconf';
import path from 'path';
import request from 'request';
import initServer from '../server/init';

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


  return initServer(key => nconf.get(key), null);
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

export {
  startServer,
  createRequest as request,
  createServer
};
