/* eslint-disable no-console, import/no-dynamic-require */

const attributeName = process.argv[2] || 'name';
const path = process.argv[3] || '../package.json';
const attributes = require(path);
const value = attributes[attributeName];

if (value !== undefined) {
  console.log(value);
}
