# Auth0 Account Link Extension

This extension provides a rule and interface for giving users the option of linking a new account
with an existing registered with the same email address from a different provider.

> **NOTE:** Please make sure you are using your own social connections (Google, Facebook, etc...) API keys. Using Auth0's keys will result on an 'Unauthorized' error on account linking skip.

## Example:
- You signed up with FooApp with your email, `greatname@example.com`.
- You come back some time later and forget whether you signed in with your email or Google account with the same email address.
- You try to use your Google account
- You're then greeted with the UI presented from this extension, asking you if
  you'd like to link this account created with your Google account with a
  pre-existing account (the original you created with a username and password).

## Running in Development


Update the configuration file under `./server/config.json`:

```json
{
  "EXTENSION_SECRET": "mysecret",
  "AUTH0_DOMAIN": "me.auth0.com",
  "AUTH0_CLIENT_ID": "myclientid",
  "AUTH0_CLIENT_SECRET": "myclientsecret",
  "WT_URL": "http://localhost:3000",
  "AUTH0_CALLBACK_URL": "http://localhost:3000/callback"
}
```

Then you can run the extension:

```bash
yarn install
yarn run build
yarn run serve:dev
```

## Running puppeteer tests

In order to run the tests you'll have to [start the extension server locally](https://github.com/auth0-extensions/auth0-account-link-extension#running-in-development), fill the `config.test.json` file (normally with the same data as the `config.json` file) and run the Sample Test application located in `sample-app/` (create a dedicated client for this app).

Then, you can run the tests running:
```bash
yarn test
```
