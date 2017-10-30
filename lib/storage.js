import { get as getStorage } from './db';
import defTemplate from '../templates/utils/defaultTemplate';

export const STATUS_SUCCESSFUL = 'ok';
export const STATUS_ERRORED = 'error';

// Temporal dummy storage accessor methods
const DEFAULT_LOCALE = 'en';
const defaultResponse = {
  template: defTemplate,
  locale: DEFAULT_LOCALE,
  status: STATUS_SUCCESSFUL,
  color: '#eb5424',
  title: '',
  logoPath: ''
};

export function getSettings() {
  return new Promise((resolve) => {
    getStorage()
      .read()
      .then((data) => {
        if (!data.settings) {
          return resolve(defaultResponse);
        }

        return resolve(data.settings);
      })
      .catch(() => resolve(defaultResponse));
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
