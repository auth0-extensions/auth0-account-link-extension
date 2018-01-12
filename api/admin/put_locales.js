/* eslint-disable no-useless-escape */

import { setLocales } from '../../lib/storage';

module.exports = () => ({
  method: 'PUT',
  config: {
    auth: 'jwt'
  },
  path: '/admin/locales',
  handler: (req, reply) => setLocales(req.payload).then(reply)
});
