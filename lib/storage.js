import { get as getStorage } from './db';
import { allLocales } from './locale';
import defTemplate from '../templates/utils/defaultTemplate';

export const STATUS_SUCCESSFUL = 'ok';
export const STATUS_ERRORED = 'error';

// Temporal dummy storage accessor methods
const defaultSettingsResponse = {
  template: defTemplate,
  locale: DEFAULT_LOCALE,
  status: STATUS_SUCCESSFUL,
  color: '#eb5424',
  title: '',
  logoPath: '',
  removeOverlay: false
};

const DEFAULT_LOCALE = 'en';

export function getSettings() {
  return getStorage()
    .read()
    .then((data) => {
      if (!data.settings) {
        return defaultSettingsResponse;
      }

      return data.settings;
    });
}

export function setSettings(settings) {
  return getStorage()
    .write({
      settings
    })
    .then(() => ({ status: STATUS_SUCCESSFUL }));
}

export function getLocales() {
  return getStorage()
    .read()
    .then((data) => {
      if (!data.locales) {
        return allLocales;
      }

      return data.locales;
    });
}

export function setLocales(locales) {
  return getStorage()
    .write({
      locales
    })
    .then(() => ({ status: STATUS_SUCCESSFUL }));
}
