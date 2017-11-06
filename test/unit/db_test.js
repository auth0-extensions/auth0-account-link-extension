import _ from 'lodash';
import { expect } from 'chai';
import { init, get } from '../../lib/db';

describe('DB Tests', () => {
  it('throws an error if I try to get an nonexistent DB', () => {
    init(null);
    expect(() => get()).to.throw('The DB has not been initialized.');
  });

  it('saves and retrieves the DB object', () => {
    const sampleStorageObject = { find: () => {}, save: () => {} };

    init(sampleStorageObject);

    expect(_.isEqual(sampleStorageObject, get())).to.equal(true);
  });
});
