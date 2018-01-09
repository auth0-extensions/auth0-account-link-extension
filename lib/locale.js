import jsonLocales from '../locales.json';
import { getLocales } from './storage';

export const allLocales = jsonLocales;

export default function resolveLocale(locale) {
  return new Promise((resolve) => {
    getLocales().then((localeObj) => {
      resolve((key) => {
        const locales = localeObj[locale];

        let localeStr = locales[key];

        if (typeof localeStr === 'undefined') {
          localeStr = localeObj.en[key];
        }

        return localeStr;
      });
    });
  });
}
