import request from 'request';
import apiCall from './api';

const findUsersByEmail = (email, excludeID = null) => {
  return apiCall({
    path: 'users-by-email',
    qs: { email }
  });
};

export default findUsersByEmail;
