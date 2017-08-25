import linkRoute from '../api/get_index';
import onInstall from '../api/hooks/post_install';
import onUninstall from '../api/hooks/delete_uninstall';

const createRoute = (route, server) => server.route(route(server));

const register = (server, options, next) => {
  createRoute(linkRoute, server);
  createRoute(onInstall, server);
  createRoute(onUninstall, server);

  next();
};

register.attributes = { name: 'routes' };

export default register;
