const linkBtn = document.getElementById('link');
const skipBtn = document.getElementById('skip');
const params = window.Qs.parse(window.location.search, { ignoreQueryPrefix: true });
const onClick = (el, fn) => el.addEventListener('click', fn);
const token = window.jwt_decode(params.child_token);

const connections = token.targetUser.identities.map(i => i.connection);

console.log(params);
console.log(token);
console.log(connections);

onClick(linkBtn, function(e) {
  console.log("Link clicked");
  const webAuth = new window.auth0.WebAuth({
    clientID: params.client,
    domain: token.iss,
    redirectUri: params.redirect_uri,
    responseType: 'code',
    scope: 'openid'
  });
  webAuth.authorize({ connection: connections[0] });

});

onClick(skipBtn, function(e) {
  console.log("Skip clicked");

  window.location.href = '//'+token.iss+'/continue?state='+params.state;
});
