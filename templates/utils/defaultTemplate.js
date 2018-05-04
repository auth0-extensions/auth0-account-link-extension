module.exports = `
<!doctype html>
<html class="auth0-lock-html">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
    <meta name="author" content="Auth0">
    <meta name="description" content="Easily link two accounts into one">
    <title>Auth0 Account Linking Extension</title>
    <link rel="shortcut icon" href="https://auth0.com/auth0-styleguide/img/favicon.png" />
    {{ ExtensionCSS }}
    {{ CustomCSS }}
  </head>
  <body>
    
    {{ Auth0Widget }}
    {{ ExtensionScripts }}
  </body>
</html>
`;
