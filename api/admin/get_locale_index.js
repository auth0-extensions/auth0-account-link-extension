import template from '../../templates/server/locale';
import config from '../../lib/config';
import stylesheet from '../../lib/stylesheet';

module.exports = () => ({
  method: 'GET',
  path: '/admin/locale',
  config: {
    auth: false
  },
  handler: (req, reply) => {
    const stylesheetHelper = stylesheet(config('NODE_ENV') === 'production');

    reply(
      template({ stylesheetTag: stylesheetHelper.tag('admin'), baseURL: config('PUBLIC_WT_URL') })
    );
  }
});
