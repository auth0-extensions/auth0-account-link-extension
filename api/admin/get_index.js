import template from '../../templates/server/admin';

module.exports = () => ({
  method: 'GET',
  path: '/admin',
  config: {
    auth: false
  },
  handler: (req, reply) => {
    reply(template);
  }
});
