const getStorage = require('./db').get;
const { allLocales } = require('./locale');
const defTemplate = require('../templates/utils/defaultTemplate');

export const STATUS_SUCCESSFUL = 'ok';
export const STATUS_ERRORED = 'error';
const DEFAULT_LOCALE = 'en';

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

function getSettings() {
  return getStorage()
    .read()
    .then(data => data.settings || defaultSettingsResponse);
}

function setSettings(settings) {
  return getStorage()
    .write({
      settings
    })
    .then(() => ({ status: STATUS_SUCCESSFUL }));
}

function getLocales() {
  return getStorage()
    .read()
    .then(data => data.locales || allLocales);
}

function setLocales(locales) {
  return getStorage()
    .write({
      locales
    })
    .then(() => ({ status: STATUS_SUCCESSFUL }));
}

module.exports = {
  getSettings,
  setSettings,
  getLocales,
  setLocales
};
