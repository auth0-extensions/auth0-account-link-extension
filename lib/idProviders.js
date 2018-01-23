const providers = {
  'Username-Password-Authentication': 'Username and Password',
  'google-oauth2': 'Google',
  facebook: 'Facebook',
  windowslive: 'Microsoft',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  dropbox: 'Dropbox',
  bitbucket: 'Bitbucket',
  paypal: 'PayPal',
  'paypal-sandbox': 'PayPal (Sandbox)',
  twitter: 'Twitter',
  amazon: 'Amazon',
  vkontakte: 'VK',
  yandex: 'Yandex',
  yahoo: 'Yahoo!',
  thirtysevensignals: '37signals',
  box: 'Box.com',
  salesforce: 'SalesForce',
  'salesforce-sandbox': 'SalesForce (Sandbox)',
  'salesforce-community': 'SalesForce Community',
  fitbit: 'Fitbit',
  baidu: 'Baidu',
  renren: 'Renren',
  weibo: 'Weibo',
  aol: 'AOL',
  shopify: 'Shopify',
  wordpress: 'WordPress',
  dwolla: 'Dwolla',
  miicard: 'MiiCard',
  yammer: 'Yammer',
  soundcloud: 'SoundCloud',
  instagram: 'Instagram',
  thecity: 'The City',
  'thecity-sandbox': 'The City (Sandbox)',
  'planning-center': 'Planning Center',
  evernote: 'Evernote',
  'evernote-sandbox': 'Evernote (Sandbox)',
  exact: 'Exact.com',
  daccount: 'NTT Docomo',
  sms: 'SMS Code',
  email: 'E-mail Code'
};

export default function getIdentityProviderPublicName(slug) {
  const provider = providers[slug];

  return typeof provider !== 'undefined' ? provider : slug;
}
