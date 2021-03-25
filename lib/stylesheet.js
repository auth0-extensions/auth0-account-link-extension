const version = require('../package.json').version;

const CDN_BASE = 'https://cdn.auth0.com/extensions/auth0-account-link/assets';
const LOCAL_BASE = '/css';

const getBase = useCDN => (useCDN ? CDN_BASE : LOCAL_BASE);

const generateHelper = (useCDN = false) => {
  const extension = useCDN ? `${version}.min.css` : 'css';
  const link = (filename, isAbsolute) => {
    const name = (filename || '').trim();
    if (isAbsolute) return name;
    return name ? `${getBase(useCDN)}/${name}.${extension}` : '';
  };

  const tag = (name, isAbsolute = false) => {
    const href = link(name, isAbsolute);

    return href ? `<link rel="stylesheet" href="${href}">` : '';
  };

  return { link, tag };
};

module.exports = generateHelper;
