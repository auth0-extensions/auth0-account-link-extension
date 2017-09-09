import { managementApi } from 'auth0-extension-tools';
import config from './config';
import request from 'request';

// Memoized because config unavailable at this point
const urlHelper = {
  base: undefined,
  getBaseUrl() {
    if (!this.base) {
      this.base = `https://${config('AUTH0_DOMAIN')}/api/v2`;
    }

    return this.base;
  },
  endpoint(path) {
    return `${this.getBaseUrl()}/${path}`;
  }
};

const getToken = () => (
  managementApi.getAccessTokenCached(
    config('AUTH0_DOMAIN'),
    config('AUTH0_CLIENT_ID'),
    config('AUTH0_CLIENT_SECRET')
  )
);

const apiCall = ({ path, ...options } = {}) => (
  getToken().then(token => {
    return new Promise((resolve, reject) => {
      request({
        url: urlHelper.endpoint(path),
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        },
        json: true,
        ...options
      }, (err, response, body) => {
        if (err) {
          reject(err);
        } else if (response.statusCode < 200 || response.statusCode >= 300) {
          console.error('API call failed: ', response.status, body);
          reject(new Error(body));
        } else {
          resolve(response.body);
        }
      });
    });
  })
);

export default apiCall;
