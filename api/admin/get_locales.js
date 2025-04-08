/* eslint-disable no-underscore-dangle */
const Boom = require('@hapi/boom');
const storage = require('../../lib/storage');

module.exports = () => ({
  method: 'GET',
  options: {
    auth: {
      strategies: ['jwt']
    }
  },
  path: '/admin/locales',
  handler: async (req, h) => {
    try {
      const locales = await storage.getLocales();

      return h.response(locales);
    } catch (error) {
      return Boom.serverUnavailable(error);
    }
  }
});
