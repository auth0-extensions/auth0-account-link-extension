require('babel-register')();

const gulp = require('gulp');
const util = require('gulp-util');
const ngrok = require('ngrok');
const nodemon = require('gulp-nodemon');
const patchRule = require('./lib/patchRule').default;

gulp.task('run', () => {
  ngrok.connect(3001, (ngrokError, url) => {
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
      patchRule(publicUrl)
        .then(() => {
          util.log('Rule patched on tenant.');
        })
        .catch((error) => {
          util.log("Couldn't patch rule in tenant:", error);
        });
    }, 4000);
  });
});
