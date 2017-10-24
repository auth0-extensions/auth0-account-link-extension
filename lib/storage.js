import defTemplate from '../templates/utils/defaultTemplate';

export const STATUS_SUCCESSFUL = 'ok';
export const STATUS_ERRORED = 'error';

// Temporal dummy storage accessor methods
const TEMP_DUMMY_LOCALE = 'en';

export function getSettings() {
  return {
    template: defTemplate,
    locale: TEMP_DUMMY_LOCALE,
    status: STATUS_SUCCESSFUL
  };
}

export function setSettings({ template, locale }) {
  return {
    status: STATUS_SUCCESSFUL
  };
}
