import { getSettings } from './storage';
import jsonLocales from '../locales.json';

export const allLocales = jsonLocales;

export default function resolveLocale(locale) {
  return function resolve(key) {
    const locales = allLocales[locale];
    
      let localeStr = locales[key];
    
      if (typeof localeStr === 'undefined') {
        localeStr = allLocales.en[key];
      }
    
      return localeStr;
  }
}
