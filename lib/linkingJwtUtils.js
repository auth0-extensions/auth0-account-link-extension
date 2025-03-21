/* eslint-disable no-unused-vars */
const { decode, verify } = require('jsonwebtoken');
const { promisify } = require('util');
const config = require('./config');
const logger = require('./logger');
const findUsersByEmail = require('./findUsersByEmail');

const validateAuth0Token = async (childtoken) => {
  try {
    const decoded = decode(childtoken, { complete: true });
    const jwtVerifyAsync = promisify(verify);
    const key = config('AUTH0_CLIENT_SECRET');
    if (!key) {
      return false;
    }

    const verifyOptions = {
      audience: config('AUTH0_CLIENT_ID'),
      issuer: `https://${config('AUTH0_DOMAIN')}/`,
      algorithms: ['HS256']
    };
    await jwtVerifyAsync(childtoken, key, verifyOptions);

    return decoded.payload;
  } catch (error) {
    logger.error('An error was encountered while decoding the token: ', error);
    throw new Error('An error was encountered while decoding the token: ', error);
  }
};

const fetchUsersFromToken = ({ sub, email }) =>
  findUsersByEmail(email).then(users => ({
    currentUser: users.find(u => u.user_id === sub),
    matchingUsers: users
      .filter(u => u.user_id !== sub)
      .sort((prev, next) => new Date(prev.created_at) - new Date(next.created_at))
  }));

module.exports = {
  fetchUsersFromToken,
  validateAuth0Token
};
