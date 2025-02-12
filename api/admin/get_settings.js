/* eslint-disable no-underscore-dangle */

const { getSettings, getLocales } = require('../../lib/storage');

module.exports = () => ({
  method: 'GET',
  config: {
    auth: 'jwt'
  },
  path: '/admin/settings',
  handler: async (req, h) => {
    const locales = await getLocales();
    const availableLocales = Object.keys(locales).map(locale => ({
      code: locale,
      name: locales[locale]._name
    }));
    const settings = await getSettings();
    return h.response({ ...settings, availableLocales }).code(200);
  }
});
