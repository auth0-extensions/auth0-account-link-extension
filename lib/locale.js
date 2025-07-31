const jsonLocales = require('../locales.json');
const storage = require('./storage');

const allLocales = jsonLocales;

const missingLocaleStr = '(MISSING_LOCALE)';

function resolveLocale(locale = 'en', overrideLocales) {
  const returnableFunction = localeObj => (key) => {
    const locales = localeObj[locale] || {};

    const localeStr = locales[key];

    return localeStr || localeObj.en[key] || allLocales[locale][key] || missingLocaleStr;
  };

  const action = typeof overrideLocales === 'object' ? Promise.resolve(overrideLocales) : storage.getLocales();

  return action.then(returnableFunction).catch(() => allLocales);
}

module.exports = {
  allLocales,
  resolveLocale
};

