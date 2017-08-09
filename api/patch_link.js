module.exports = (server) => ({
  method: 'PATCH',
  path: '/api/link',
  /*config: {
    auth: {
      strategies: [ 'jwt' ],
      scope: [ 'update:configuration' ]
    },
    pre: [
      //server.handlers.managementClient
    ]

  },*/
  handler: (req, reply) => {
    reply({ message: 'Nailed it' });
  }
});
