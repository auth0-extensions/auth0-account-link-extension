import linkRoute from '../api/get_index';
import onInstall from '../api/hooks/post_install';
import onUpdate from '../api/hooks/put_update';
import onUninstall from '../api/hooks/delete_uninstall';
import metaRoute from '../api/get_meta';
import getAdminIndex from '../api/admin/get_index';
import getLocaleAdminIndex from '../api/admin/get_locale_index';
import getLocales from '../api/admin/get_locales';
import putLocales from '../api/admin/put_locales';
import getAdminSettings from '../api/admin/get_settings';
import putAdminSettings from '../api/admin/put_settings';
import getUserDetails from '../api/admin/get_user_details';

const createRoute = (route, server) => server.route(route(server));

const register = (server, options, next) => {
  createRoute(linkRoute, server);
  createRoute(onInstall, server);
  createRoute(onUpdate, server);
  createRoute(onUninstall, server);
  createRoute(metaRoute, server);
  createRoute(getAdminIndex, server);
  createRoute(getAdminSettings, server);
  createRoute(putAdminSettings, server);
  createRoute(getUserDetails, server);
  createRoute(getLocaleAdminIndex, server);
  createRoute(getLocales, server);
  createRoute(putLocales, server);

  next();
};

register.attributes = { name: 'routes' };

export default register;
