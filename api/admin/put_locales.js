/* eslint-disable no-useless-escape */

const { setLocales } = require('../../lib/storage');

module.exports = () => ({
  method: 'PUT',
  config: {
    auth: 'jwt'
  },
  path: '/admin/locales',
  handler: (req, h) => setLocales(req.payload).then(h.response)
});
