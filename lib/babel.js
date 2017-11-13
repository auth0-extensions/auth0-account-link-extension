/* eslint-disable global-require */
// Initialize Babel for the rest of the app

module.exports = function loadBabel() {
  require('babel-register')({
    sourceMaps: !(process.env.NODE_ENV === 'production')
  });
  require('babel-polyfill');
};
