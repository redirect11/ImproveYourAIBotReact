var LiveReloadPlugin = require('webpack-livereload-plugin');

module.exports =  {
    plugins: [
        new LiveReloadPlugin()
      ],
      mode: 'development',
      watch: true,
      devtool: 'inline-source-map',
      watchOptions: {
        ignored: "node_modules/**/*",
      }
  };