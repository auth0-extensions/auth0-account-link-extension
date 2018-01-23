/* eslint-disable no-underscore-dangle */

import { getLocales } from '../../lib/storage';

module.exports = () => ({
  method: 'GET',
  config: {
    auth: 'jwt'
  },
  path: '/admin/locales',
  handler: (req, reply) => getLocales().then(reply)
});
