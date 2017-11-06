import { getSettings } from './storage';
import jsonLocales from '../locales.json';

export const allLocales = jsonLocales;

export default function resolveLocale(locale, localeObj = allLocales) {
  return function resolve(key) {
    const locales = localeObj[locale];

    let localeStr = locales[key];

    if (typeof localeStr === 'undefined') {
      localeStr = localeObj.en[key];
    }

    return localeStr;
  };
}
