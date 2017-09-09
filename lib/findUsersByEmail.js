import request from 'request';
import apiCall from './api';

const findUsersByEmail = (email, excludeID = null) => {
  let q = `email:"${email}"`;

  if (excludeID) {
    q = `${q} -user_id:"${excludeID}"`;
  }

  return apiCall({
    path: 'users',
    qs: { q, search_engine: 'v2' }
  });
};

export default findUsersByEmail;
