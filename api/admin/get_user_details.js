const Boom = require('@hapi/boom');
const avatarUrl = require('../../lib/avatar');

module.exports = () => ({
  method: 'GET',
  path: '/admin/user',
  options: {
    auth: {
      strategies: ['jwt']
    }
  },
  handler: async (req, h) => {
    try {
      return h.response({
        email: req.auth.credentials.email,
        avatar: avatarUrl(req.auth.credentials.email)
      }).code(200);
    } catch (error) {
      return Boom.serverUnavailable(error);
    }
  }
});
