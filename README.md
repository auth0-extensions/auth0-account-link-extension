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
nvm use 8
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

## Release Process

Deployment is currently done using this tool: https://auth0-extensions.us8.webtask.io/extensions-deploy

First bump the version in `package.json` and in `webtask.json`

Then build the extension:

```bash
nvm use 8
yarn install
yarn run build
```

Bundle file (`auth0-account-link.extension.VERSION.js` is found in `/dist`
Asset CSS files are found in `/dist/assets`

Before continuing, if you want to quickly test backend-only changes in your production tenant, you can use the webtask editor: https://github.com/auth0-extensions/auth0-webtask-editor-opener. Copy and paste the bundle file file contents into the tab that corresponds with the existing extension to override the backend code. 

Follow the instructions in the deployment tool.  This tool will also automatically generate a PR in the `auth0-extensions` repo.  Only after the PR is merged will the extension be available in production.  Before merging the PR you can use this tool to test the upgrade: https://github.com/auth0-extensions/auth0-extension-update-tester by overriding the `extensions.json` file that is fetched by the dashboard.  You will need to clone this repo: https://github.com/auth0/auth0-extensions, update `extensions.json` locally and then run `npx http-server --port 3000 --cors` to serve up the file.  Then configure the extension with `http://localhost:3000/extensions.json` as the path.