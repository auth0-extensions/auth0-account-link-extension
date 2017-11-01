import { getSettings } from '../../lib/storage';
import { allLocales as locales } from '../../lib/locale';

module.exports = () => ({
  method: 'GET',
  config: {
    auth: 'jwt'
  },
  path: '/admin/settings',
  handler: (req, reply) => {
    const availableLocales = Object.keys(locales).map(locale => ({ code: locale, name: locales[locale]._name }));
    
    getSettings().then((settings) => {
      reply({ ...settings, availableLocales });
    });
  }
});
