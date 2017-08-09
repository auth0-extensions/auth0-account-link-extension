import linkRoute from '../api/patch_link';

const createRoute = (route, server) => server.route(route(server));

const register = (server, options, next) => {
  createRoute(linkRoute, server);

  next();
};

register.attributes = { name: "routes" };

export default register;
