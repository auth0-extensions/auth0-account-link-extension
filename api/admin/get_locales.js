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
    const locales = await storage.getLocales();

    return h.response(locales);
  }
});
