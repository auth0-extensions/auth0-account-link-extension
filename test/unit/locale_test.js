/* eslint-disable no-underscore-dangle */

import { expect } from 'chai';
import resolveLocale, { allLocales } from '../../lib/locale';

const sampleLocales = {
  en: {
    _name: 'English',
    a: 'en-a',
    b: 'en-b',
    c: 'en-c'
  },
  es: {
    _name: 'Spanish',
    a: 'es-a',
    b: 'es-b'
  }
};

describe('Locale tests', () => {
  it('returns a function on initialization', () => {
    const t = resolveLocale('en', sampleLocales);

    expect(typeof t).to.equal('function');
  });

  it('returns the correct string', () => {
    const t = resolveLocale('es', sampleLocales);

    expect(t('a')).to.equal('es-a');
  });

  it('fallbacks to first locale if single string not found', () => {
    const t = resolveLocale('es', sampleLocales);

    expect(t('c')).to.equal('en-c');
  });

  it("each locale has a '_name' field", () => {
    const locales = Object.keys(allLocales);
    const localesWithName = locales.filter(l => allLocales[l]._name !== undefined);

    expect(localesWithName.length).to.equal(locales.length);
  });
});
