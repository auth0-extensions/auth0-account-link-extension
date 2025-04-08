/* eslint-disable no-useless-escape */
const Boom = require('@hapi/boom');
const storage = require('../../lib/storage');

module.exports = () => ({
  method: 'PUT',
  options: {
    auth: {
      strategies: ['jwt']
    }
  },
  path: '/admin/locales',
  handler: async (req, h) => {
    try {
      const updatedLocales = await storage.setLocales(req.payload);

      return h.response(updatedLocales).code(200);
    } catch (error) {
      return Boom.serverUnavailable(error);
    }
  }
});
