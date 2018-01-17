import jsonLocales from '../locales.json';
import { getLocales } from './storage';

export const allLocales = jsonLocales;

const missingLocaleStr = "(MISSING_LOCALE)";

export default function resolveLocale(locale = 'en', overrideLocales) {
  const returnableFunction = localeObj => (key) => {
    const locales = localeObj[locale];

    const localeStr = locales[key];

    return localeStr || localeObj.en[key] || allLocales[locale][key] || missingLocaleStr;
  };

  const action = typeof overrideLocales === 'object' ? Promise.resolve(overrideLocales) : getLocales();

  return action.then(returnableFunction).catch(() => allLocales);
}
