const apiCall = require('./api');

const findUsersByEmail = email =>
  apiCall({
    path: 'users',
    qs: {
      q: `email:"${email}"`
    }
  });

module.exports = findUsersByEmail;
