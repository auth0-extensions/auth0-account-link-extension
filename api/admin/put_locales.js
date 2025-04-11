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
    const updatedLocales = await storage.setLocales(req.payload);

    return h.response(updatedLocales).code(200);
  }
});
