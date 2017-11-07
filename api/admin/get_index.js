module.exports = () => ({
  method: 'GET',
  path: '/admin',
  config: {
    auth: false
  },
  handler: (req, reply) => {
    reply.view('admin');
  }
});
