const _ = require('lodash');
const { expect } = require('chai');
const { init, get } = require('../../lib/db');

describe('DB Tests', () => {
  it('throws an error when fetching from an invalid DB', () => {
    init(null);
    expect(() => get()).to.throw('The DB has not been initialized.');
  });

  it('saves and retrieves the DB object', () => {
    const sampleStorageObject = { find: () => {}, save: () => {} };

    init(sampleStorageObject);

    expect(_.isEqual(sampleStorageObject, get())).to.equal(true);
  });
});
