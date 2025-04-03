/* eslint-disable no-console, import/no-dynamic-require */

const attributeName = process.argv[2] || 'name';
const path = process.argv[3] || '../package.json';
const attributes = require(path);
const value = attributes[attributeName];

function main() {
  if (process.argv[4]) {
    const split = value.split('.');
    console.log(`${split[0]}.${split[1]}`);
    return;
  }
  if (value !== undefined) {
    console.log(value);
  }
}

main();
