/* eslint-disable no-underscore-dangle */
const storage = require('../../lib/storage');

module.exports = () => ({
  method: 'GET',
  options: {
    auth: {
      strategies: ['jwt']
    }
  },
  path: '/admin/settings',
  handler: async (req, h) => {
    const locales = await storage.getLocales();
    const availableLocales = Object.keys(locales).map(locale => ({
      code: locale,
      name: locales[locale]._name
    }));
    const settings = await storage.getSettings();

    return h.response({ ...settings, availableLocales }).code(200);
  }
});
