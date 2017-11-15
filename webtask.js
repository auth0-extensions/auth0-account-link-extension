import tools from 'auth0-extension-hapi-tools';
import hapiApp from './server/init';
import logger from './lib/logger';
import config from './lib/config';

const createServer = tools.createServer((wtConfig, wtStorage) => {
  logger.info('Starting Account Link Extension - Version:', process.env.CLIENT_VERSION);
  logger.info(' > WT_URL:', wtConfig('WT_URL'));
  logger.info(' > PUBLIC_WT_URL:', config('PUBLIC_WT_URL'));
  return hapiApp(wtConfig, wtStorage);
});

module.exports = (context, req, res) => {
  config.setValue('PUBLIC_WT_URL', tools.urlHelpers.getWebtaskUrl(req));
  createServer(context, req, res);
};
