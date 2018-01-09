/* eslint-disable no-underscore-dangle */

import { getSettings, getLocales } from '../../lib/storage';

module.exports = () => ({
  method: 'GET',
  config: {
    auth: 'jwt'
  },
  path: '/admin/locales',
  handler: (req, reply) => {
    getLocales().then((locales) => {
      reply(locales);
    });
  }
});
