import template from '../../templates/server/admin';
import config from '../../lib/config';
import stylesheet from '../../lib/stylesheet';

module.exports = () => ({
  method: 'GET',
  path: '/admin',
  config: {
    auth: false
  },
  handler: (req, reply) => {
    const stylesheetHelper = stylesheet(config('NODE_ENV') === 'production');

    reply(template({ stylesheetTag: stylesheetHelper.tag('admin') }));
  }
});
