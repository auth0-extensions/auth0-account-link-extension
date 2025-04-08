const gulp = require('gulp');
const util = require('gulp-util');
const ngrok = require('@ngrok/ngrok');
const nodemon = require('gulp-nodemon');
const { install } = require('./modifyRule');
const managementAdapter = require('./lib/managementAdapter');

const { ManagementClientAdapter, getCurrentConfig } = managementAdapter;

async function connectNgrok() {
  try {
    const config = await getCurrentConfig();
    const listener = await ngrok.forward({ addr: 3000, authtoken: config.NGROK_TOKEN });
    const url = listener.url();
    nodemon({
      script: './index.js',
      ext: 'js json',
      env: {
        EXTENSION_SECRET: config.EXTENSION_SECRET,
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
    setTimeout(async () => {
      try {
        const publicUrl = `${url.replace('https://', 'http://')}`;
        util.log('Public Url:', publicUrl);
        util.log('Patching rule on tenant.');
        const adapter = new ManagementClientAdapter(config);
        await install(adapter, {
          extensionURL: publicUrl,
          username: 'Development',
          clientID: config.AUTH0_CLIENT_ID,
          clientSecret: config.AUTH0_CLIENT_SECRET
        });
        util.log('Rule patched on tenant.');
      } catch (error) {
        util.log("Couldn't patch rule in tenant:", error);
      }
    }, 4000);
  } catch (error) {
    throw error;
  }
}

gulp.task('run', connectNgrok);
