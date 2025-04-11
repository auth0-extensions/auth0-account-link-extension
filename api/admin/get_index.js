const template = require('../../templates/server/admin');
const config = require('../../lib/config');
const stylesheet = require('../../lib/stylesheet');

module.exports = () => ({
  method: 'GET',
  path: '/admin',
  options: {
    auth: false
  },
  handler: async (req, h) => {
    const stylesheetHelper = stylesheet(config('NODE_ENV') === 'production');
    const html = template({
      stylesheetTag: stylesheetHelper.tag('admin'),
      baseURL: config('PUBLIC_WT_URL')
    });

    return h.response(html).type('text/html');
  }
});
