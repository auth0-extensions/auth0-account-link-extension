/* global configuration, auth0, jwt */
/**
 *  Do NOT execute this code from anywhere within this extension.
 *  It is the rule that gets pushed up to the Auth0 Server.
 *  I want this code to be analyzable and readable, so putting
 *  it into a string early is a show-stopper. Since JavaScript
 *  is more than happy to let me grab the string representation
 *  of the function, we'll export it as the string to push up to
 *  the server.
 */

module.exports = function (user, context, callback) {
  var request = require('request@2.56.0');
  var Promise = require('native-or-bluebird@1.2.0');

  var CONTINUE_PROTOCOL = 'redirect-callback';

  var config = {
    endpoints: {
      linking: 'http://localhost:3000/link',
      userApi: auth0.baseUrl + '/users'
    },
    token: {
      clientId: configuration.AUTH0_CLIENT_ID,
      clientSecret: configuration.AUTH0_CLIENT_SECRET,
      issuer: configuration.ISSUER || "machuga-auth0.auth0.com"
    }
  };

  var strategy;

  if (shouldLink()) {
    strategy = linkAccounts();
  } else if (shouldPrompt()) {
    strategy = promptUser();
  } else {
    strategy = continueAuth();
  }

  strategy.then(callbackWithSuccess).catch(callbackWithFailure);

  /**
   *
   * Functions
   *
   */
  function linkAccounts() {
    var secondAccountToken = context.request.query.link_account_token;
    var primaryToken = createToken(config.token, {});
    var token = jwt.decode(secondAccountToken);
    var uri = config.endpoints.userApi+'/'+user.user_id+'/identities';

    var reqOptions = {
      method: 'POST',
      url: uri,
      headers: {
        Authorization: 'Bearer ' + primaryToken,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Accept: 'application/json'
      },
      json: {
        link_with: secondAccountToken
      }
    };
    return new Promise(function(resolve, reject) {
      request(reqOptions, function(err, response, body) {
        if (err) {
          reject(err);
        } else if (response.statusCode !== 201) {
          console.error("Linking failed", body);
          reject(new Error(body));
        } else {
          resolve(response.body);
        }
      });
    });
  }

  function continueAuth() {
    console.log('moving to continue');
    //return searchUsersWithSameEmail().then(function(users) {
    //  return users[0];
    //}).then(function(user) {
    //  if (user) {
    //    context.primaryUser = user.user_id;
    //  }
    //});
  }

  function promptUser() {
    return searchUsersWithSameEmail()
      .then(function(users) {
        // If not empty, we need attempt to auth them to ensure they're who they say they are

        // Will we only ever have one?  Skip iteration if so
        users.forEach(function(targetUser) {
          var token = createToken(config.token, targetUser);

          // Overwriting every time...why?
          context.redirect = { url: buildRedirectUrl(token) };
        });
      });
  }

  function callbackWithSuccess(_) {
    callback(null, user, context);

    return _;
  }

  function callbackWithFailure(err) {
    console.error(err.message);
    console.error(err.stack);
    callback(err, user, context);
  }

  function onlyVerifiedUsers(users) {
    return users.filter(function(u) {
      return u.email_verified;
    });
  }

  function createToken(tokenInfo, targetUser) {
    var options = {
      expiresInMinutes: 5,
      audience: tokenInfo.clientId,
      issuer: qualifyDomain(tokenInfo.issuer)
    };

    var userSub = {
      sub: user.user_id,
      email: user.email,
      targetUser: targetUser,
      base: auth0.baseUrl
    };

    return jwt.sign(userSub, tokenInfo.clientSecret, options);
  }

  function searchUsersWithSameEmail() {
    return new Promise(function(resolve, reject) {
      request({
        url: config.endpoints.userApi,
        headers: {
          Authorization: 'Bearer ' + auth0.accessToken,
          Accept: 'application/json'
        },
        qs: {
          search_engine: 'v2',
          q: 'email:"' + user.email + '" -user_id:"' + user.user_id + '"'
        }
      }, function(err, response, body) {
        if (err) {
          reject(err);
        } else if (response.statusCode !== 200) {
          console.error("Searching failed", body);
          reject(new Error(body));
        } else {
          resolve(response);
        }
      });
    }).then(function(response) {
      return JSON.parse(response.body);
    });
  }

  // Consider moving this logic out of the rule and into the extension
  function buildRedirectUrl(token) {
    return config.endpoints.linking + '?' +
      [
        'child_token=' + token,
        'client=' + context.request.query.client_id,
        'redirect_uri=' + context.request.query.redirect_uri,
        'scope=' + context.request.query.scope,
        'response_type=' + context.request.query.response_type,
        'auth0Client=' + context.request.query.auth0Client
      ].join('&');
  }

  function shouldLink() {
    return !!context.request.query.link_account_token;
  }

  function shouldPrompt() {
    // Check if we're inside a redirect
    // in order to avoid a redirect loop
    // TODO: Do the linking when inside a request? Will be primary user at this point, perhaps?
    var insideRedirect = function() {
      return context.request.query.redirect_uri &&
        context.request.query.redirect_uri.indexOf(config.endpoints.linking) !== -1;
    };

    // Check if this is not the first login of the user
    // since merging already active accounts can be a
    // destructive action
    var firstLogin = function() {
      return context.stats.loginsCount === 0;
    };

    // Check if we're coming back from a redirect
    // in order to avoid a redirect loop. User will
    // be sent to /continue at this point. We need
    // to assign them to their primary user if so.
    var redirectingToContinue = function() {
      return context.protocol === CONTINUE_PROTOCOL;
    };

    return !insideRedirect() && !redirectingToContinue(); /*emailNotVerified() || */  //|| notFirstLogin();
  }

  function qualifyDomain(domain) {
    return 'https://'+domain+'/';
  }
}.toString();
