/* eslint-disable no-console, import/no-dynamic-require */

const attributeName = process.argv[2] || 'name';
const path = process.argv[3] || '../package.json';
const majorMinorVersion = process.argv[4] || false;
const attributes = require(path);
const fullVersion = attributes[attributeName];

function main() {
  // if major minor version is true, return only the major and minor version.
  // for example: 1.2
  if (majorMinorVersion) {
    const split = fullVersion.split('.');
    console.log(`${split[0]}.${split[1]}`);
    return;
  }
  // if major minor version is false and fullVersion is set, return the full version.
  // for example: 1.2.3
  if (fullVersion !== undefined) {
    console.log(fullVersion);
  }
}

main();
