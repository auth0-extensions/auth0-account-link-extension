const crypto = require('crypto');

const avatarUrl = (email) => {
  const hashedEmail = crypto.createHash('md5').update(email).digest('hex');
  const letters = email.substr(0, 2);

  return `https://s.gravatar.com/avatar/${hashedEmail}?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2F${letters}.png`;
};

module.exports = avatarUrl;
