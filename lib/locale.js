import { getSettings } from './storage';
import jsonLocales from '../locales.json';

export const allLocales = jsonLocales;

let _settings = null;

function resolveLocale(key) {
  const locales = allLocales[_settings.locale];

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
        _settings = settings;
      })
      .then(resolve(resolveLocale));
  });
