/* eslint-disable no-underscore-dangle */

import { getSettings } from '../../lib/storage';
import { allLocales } from '../../lib/locale';

module.exports = () => ({
  method: 'GET',
  config: {
    auth: 'jwt'
  },
  path: '/admin/locales',
  handler: (req, reply) => {
    getSettings().then((settings) => {
      reply(allLocales);
    });
  }
});
