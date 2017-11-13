import apiCall from './api';

const findUsersByEmail = email =>
  apiCall({
    path: 'users-by-email',
    qs: { email }
  });

export default findUsersByEmail;
