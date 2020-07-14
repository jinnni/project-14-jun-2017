var chalk = require("chalk");
var fs = require('fs');
var path = require('path');
var useDefaultConfig = require('@ionic/app-scripts/config/webpack.config.js');

console.log("webpack.config custom called");

var env = process.env.ENV;
console.log("ENV: " + env);

useDefaultConfig.prod.resolve.alias = {
  "@app/env": path.resolve(environmentPath('prod'))
};

useDefaultConfig.dev.resolve.alias = {
  "@app/env": path.resolve(environmentPath('dev'))
};

if (env !== 'prod' && env !== 'dev') {
  // Default to dev config
  console.log("reading for env: " + env)
  useDefaultConfig[env] = useDefaultConfig.dev;
  useDefaultConfig[env].resolve.alias = {
    "@app/env": path.resolve(environmentPath(env))
  };
}

function environmentPath(env) {
  var filePath = './src/environments/environment' + (env === 'prod' ? '.prod' : '.' + env) + '.ts';
  console.log("Reading path " + filePath);
  if (!fs.existsSync(filePath)) {
    console.log(chalk.red('\n' + filePath + ' does not exist! Will use config from environment.ts'));
    return filePath = './src/environments/environment.ts';
  } else {
    return filePath;
  }
}

module.exports = function () {
  return useDefaultConfig;
};



