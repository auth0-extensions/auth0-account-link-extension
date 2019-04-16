const tools = require('auth0-extension-hapi-tools');
const hapiApp = require('./server/init');
const logger = require('./lib/logger');
const config = require('./lib/config');

const createServer = tools.createServer((wtConfig, wtStorage) => {
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
