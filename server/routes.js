const linkRoute = require('../api/get_index');
const onInstall = require('../api/hooks/post_install');
const onUninstall = require('../api/hooks/delete_uninstall');
const metaRoute = require('../api/get_meta');
const getAdminIndex = require('../api/admin/get_index');
const getLocaleAdminIndex = require('../api/admin/get_locale_index');
const getLocales = require('../api/admin/get_locales');
const putLocales = require('../api/admin/put_locales');
const getAdminSettings = require('../api/admin/get_settings');
const putAdminSettings = require('../api/admin/put_settings');
const getUserDetails = require('../api/admin/get_user_details');

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
  createRoute(getLocaleAdminIndex, server);
  createRoute(getLocales, server);
  createRoute(putLocales, server);

  next();
};

register.attributes = { name: 'routes' };

module.exports = register;
