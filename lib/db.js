/* eslint-disable no-underscore-dangle */

let _db = null;

module.exports.init = (db) => {
  _db = db;
};

module.exports.get = () => {
  if (!_db) {
    throw new Error('The DB has not been initialized.');
  }

  return _db;
};
