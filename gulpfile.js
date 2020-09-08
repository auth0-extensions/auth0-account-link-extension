const gulp = require('gulp');
const util = require('gulp-util');
const ngrok = require('ngrok');
const nodemon = require('gulp-nodemon');
const { install } = require('./modifyRule');
const path = require('path');
const { readFile } = require('fs');
const { promisify } = require('bluebird');
const { ManagementClient } = require('auth0');

async function getCurrentConfig() {
  const configFilePath = path.join(__dirname, './server/config.json');
  return JSON.parse(await promisify(readFile)(configFilePath));
}

gulp.task('run', () => {
  ngrok.connect(3000, (ngrokError, url) => {
    if (ngrokError) {
      throw ngrokError;
    }

    nodemon({
      script: './index.js',
      ext: 'js json',
      env: {
        EXTENSION_SECRET: 'a-random-secret',
        AUTH0_RTA: 'https://auth0.auth0.com',
        NODE_ENV: 'development',
        WT_URL: url,
        PUBLIC_WT_URL: url
      },
      ignore: [
        'assets/app/',
        'build/webpack',
        'server/data.json',
        'client/',
        'tests/',
        'node_modules/'
      ]
    });

    setTimeout(() => {
      const publicUrl = `${url.replace('https://', 'http://')}`;
      util.log('Public Url:', publicUrl);

      util.log('Patching rule on tenant.');
      getCurrentConfig().then((config) => {
        const auth0 = new ManagementClient({
          domain: config.AUTH0_DOMAIN,
          clientId: config.AUTH0_CLIENT_ID,
          clientSecret: config.AUTH0_CLIENT_SECRET,
          scope: 'read:rules update:rules delete:rules create:rules read:rules_configs delete:rules_configs update:rules_configs'
        });
        install(auth0, {
          accountLinkExtentionUrl: publicUrl,
          accountLinkClientId: config.AUTH0_CLIENT_ID,
          accountLinkSecretId: config.AUTH0_CLIENT_SECRET
        })
          .then(() => {
            util.log('Rule patched on tenant.');
          })
          .catch((error) => {
            util.log("Couldn't patch rule in tenant:", error);
          });
      });
    }, 4000);
  });
});
