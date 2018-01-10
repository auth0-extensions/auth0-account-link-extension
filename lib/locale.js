import jsonLocales from '../locales.json';
import { getLocales } from './storage';

export const allLocales = jsonLocales;

export default function resolveLocale(locale = 'en', overrideLocales) {
  const returnableFunction = localeObj => (key) => {
    const locales = localeObj[locale];

    let localeStr = locales[key];

    if (typeof localeStr === 'undefined') {
      localeStr = localeObj.en[key];
    }

    return localeStr;
  };

  const action = typeof overrideLocales === 'object' ? Promise.resolve(overrideLocales) : getLocales();

  return action.then(returnableFunction).catch(() => allLocales);
}
