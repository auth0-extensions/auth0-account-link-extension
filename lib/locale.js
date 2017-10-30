import { getSettings } from './storage';
import jsonLocales from '../locales.json';

export const allLocales = jsonLocales;

export default () =>
  new Promise((resolve) => {
    getSettings().then(settings => resolve(allLocales[settings.locale]));
  });
