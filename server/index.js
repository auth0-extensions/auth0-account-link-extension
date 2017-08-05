import Hapi from 'hapi';
import nconf from 'nconf';
import config from '../lib/config';

config.setProvider(key => nconf.get(key) || process.env[key]);

const createServer = function createServer() {
  const server = new Hapi.Server();

  server.connection({
    host: 'localhost',
    port: config('PORT'),
    routes: {
      cors: true,
      validate: {}
    }
  });

  // TODO: Much more configuration goes here but we'll leave it empty for now

  return server;
};

const startServer = function startServer(server) {
  return new Promise((resolve, reject) => {
    server.start((err) => {
      if (err) {
        reject(err);
      }

      resolve(server);

      console.info(`Server running at: ${server.info.uri}`);
    });
  });
};

export { createServer, startServer };
