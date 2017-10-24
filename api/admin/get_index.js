module.exports = () => ({
  method: 'GET',
  path: '/admin',
  handler: (req, reply) => {
    reply('200 OK');
  }
});
