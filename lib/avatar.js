import md5 from 'md5';

export default (email) => {
    const md5email = md5(email);
    const letters = email.substr(0, 2);
    
    return `https://s.gravatar.com/avatar/${md5email}?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2F${letters}.png`;
}