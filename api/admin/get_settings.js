import { getSettings } from '../../lib/storage';
import locales from '../../lib/locale';

module.exports = () => ({
  method: 'GET',
  config: {
    auth: 'jwt'
  },
  path: '/admin/settings',
  handler: (req, reply) => {
    const availableLocales = Object.keys(locales).map((locale) => {
      return { code: locale, name: locales[locale]._name };
    });
    reply({ ...getSettings(), availableLocales });
  }
});
