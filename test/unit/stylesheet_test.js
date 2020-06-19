const { expect } = require('chai');
const stylesheet = require('../../lib/stylesheet');

describe('Stylesheet helper', () => {
  it('generates a tag when filename provided', () => {
    const { tag } = stylesheet();
    const result = tag('test');

    expect(result).to.match(/^<link/);
  });

  it('creates proper href for filename', () => {
    const { tag } = stylesheet();
    const result = tag('test');

    expect(result).to.match(/"\/css\/test\.css/);
  });

  it('generates nothing when no filename provided', () => {
    const { tag } = stylesheet();
    const result = tag('');

    expect(result).to.be.empty;
  });

  describe('When using cdn', () => {
    const { tag } = stylesheet(true);

    it('adds CDN path to file', () => {
      const result = tag('test');

      expect(result).to.match(/"https:/);
    });

    it('links to minified version of file', () => {
      const result = tag('test');

      expect(result).to.match(/\/test\.\d+\.\d+\.\d+\.min\.css/);
    });
  });
});
