const { verify } = require('jsonwebtoken');
const { promisify } = require('util');
const config = require('./config');
const logger = require('./logger');
const findUsersByEmail = require('./findUsersByEmail');
const fetchCustomDomains = require('./fetchCustomDomains');
const storage = require('./storage');
const { qualifyDomain } = require('./urlHelpers');

const fetchRegisteredCustomDomain = async (customDomain) => {
  const response = await fetchCustomDomains();
  const registeredCustomDomain = response.find(item => item.domain === customDomain);

  if (!registeredCustomDomain) {
    throw new Error(`Custom domain ${customDomain} not found`);
  }

  return registeredCustomDomain.domain;
};

const configureIssuer = async () => {
  const { customDomain = '' } = await storage.getSettings() || {};

  return customDomain ? qualifyDomain(customDomain) : qualifyDomain(config('AUTH0_DOMAIN'));
};

const validateAuth0Token = async (childtoken) => {
  try {
    const jwtVerifyAsync = promisify(verify);
    const issuer = await configureIssuer();
    const key = config('AUTH0_CLIENT_SECRET');

    if (!key) {
      logger.error('AUTH0_CLIENT_SECRET is missing');
      return false;
    }

    const verifyOptions = {
      audience: config('AUTH0_CLIENT_ID'),
      issuer,
      algorithms: ['HS256'],
      complete: true
    };
    const decoded = await jwtVerifyAsync(childtoken, key, verifyOptions);

    return decoded.payload;
  } catch (error) {
    logger.error('An error was encountered while decoding the token: ', error);
    throw new Error('An error was encountered while decoding the token: ', error);
  }
};

const fetchUsersFromToken = async ({ sub, email }) => {
  const users = await findUsersByEmail(email);

  const currentUser = users.find(u => u.user_id === sub);
  const matchingUsers = users
    .filter(u => u.user_id !== sub)
    .sort((prev, next) => new Date(prev.created_at) - new Date(next.created_at));

  return { currentUser, matchingUsers };
};

module.exports = {
  fetchUsersFromToken,
  validateAuth0Token,
  fetchRegisteredCustomDomain
};
