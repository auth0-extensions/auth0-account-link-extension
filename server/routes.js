import linkRoute from '../api/get_index';
import onInstall from '../api/hooks/post_install';
import onUninstall from '../api/hooks/delete_uninstall';
import metaRoute from '../api/get_meta';
import getAdminIndex from '../api/admin/get_index';
import getAdminSettings from '../api/admin/get_settings';
import putAdminSettings from '../api/admin/put_settings';
import getUserDetails from '../api/admin/get_user_details';

const createRoute = (route, server) => server.route(route(server));

const register = (server, options, next) => {
  createRoute(linkRoute, server);
  createRoute(onInstall, server);
  createRoute(onUninstall, server);
  createRoute(metaRoute, server);
  createRoute(getAdminIndex, server);
  createRoute(getAdminSettings, server);
  createRoute(putAdminSettings, server);
  createRoute(getUserDetails, server);

  next();
};

register.attributes = { name: 'routes' };

export default register;
