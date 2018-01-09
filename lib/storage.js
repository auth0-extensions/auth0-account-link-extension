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
  return new Promise((resolve) => {
    getStorage()
      .read()
      .then((data) => {
        if (!data.settings) {
          return resolve(defaultSettingsResponse);
        }

        return resolve(data.settings);
      })
      .catch(() => resolve(defaultSettingsResponse));
  });
}

export function setSettings(settings) {
  return new Promise((resolve) => {
    getStorage()
      .write({
        settings
      })
      .then(() => {
        resolve({
          status: STATUS_SUCCESSFUL
        });
      });
  });
}

export function getLocales() {
  return new Promise((resolve) => {
    getStorage()
      .read()
      .then((data) => {
        if (!data.locales) {
          return resolve(allLocales);
        }

        return resolve(data.locales);
      })
      .catch(() => resolve(allLocales));
  });
}

export function setLocales(locales) {
  return new Promise((resolve) => {
    getStorage()
      .write({
        locales
      })
      .then(() => {
        resolve({
          status: STATUS_SUCCESSFUL
        });
      });
  });
}
