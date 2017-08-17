const linkBtn = document.getElementById('link');
const skipBtn = document.getElementById('skip');
const params = window.Qs.parse(window.location.search, { ignoreQueryPrefix: true });
const token = window.jwt_decode(params.child_token);
const connections = token.targetUsers.reduce(function(acc, user) {
  return acc.concat(user.connections);
}, []);

const onClick = (el, fn) => el.addEventListener('click', fn);
const authorize = (domain, qs) => {
  const query = Object.keys(qs).map((key) => `${key}=${encodeURI(qs[key])}`, []).join('&');

  window.location = `${domain}authorize?${query}`;
};

console.log(params);
console.log(token);
console.log(connections);

onClick(linkBtn, function(e) {
  console.log("Link clicked");
  authorize(token.iss, {
    client_id: params.client,
    redirect_uri: params.redirect_uri,
    response_type: 'code',
    scope: 'openid',
    link_account_token: params.child_token,
    connection: connections[0]
  });
});

onClick(skipBtn, function(e) {
  console.log("Skip clicked");

  window.location.href = token.iss+'continue?state='+params.state;
});
