/* eslint-disable no-underscore-dangle */

const { expect } = require('chai');
const { resolveLocale, allLocales } = require('../../lib/locale');

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
  it('returns a function on initialization', (done) => {
    resolveLocale('en', sampleLocales).then((t) => {
      expect(typeof t).to.equal('function')
      done();
    });
  });

  it('returns the correct string', (done) => {
    resolveLocale('es', sampleLocales).then((t) => {;
      expect(t('a')).to.equal('es-a');
      done();
    });
  });

  it('fallbacks to first locale if single string not found', (done) => {
    resolveLocale('es', sampleLocales).then((t) => {;
      expect(t('c')).to.equal('en-c');
      done();
    });
  });

  it("each locale has a '_name' field", () => {
    const locales = Object.keys(allLocales);
    const localesWithName = locales.filter(l => allLocales[l]._name !== undefined);

    expect(localesWithName.length).to.equal(locales.length);
  });
});
