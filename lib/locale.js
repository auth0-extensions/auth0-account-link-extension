import { getSettings } from './storage';
import jsonLocales from '../locales.json';

export const allLocales = jsonLocales;

let cachedSettings = null;

function resolveLocale(key) {
  const locales = allLocales[cachedSettings.locale];

  let locale = locales[key];

  if (typeof locale === 'undefined') {
    locale = allLocales.en[key];
  }

  return locale;
}

export default () =>
  new Promise((resolve) => {
    getSettings()
      .then((settings) => {
        cachedSettings = settings;
      })
      .then(resolve(resolveLocale));
  });
