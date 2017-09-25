var path = require('path');

module.exports = {
  entry: './src/index.js',

  output: {
    path: `${__dirname}/dist`,
    filename: 'index.js',
    library: 'architecture',
    libraryTarget: 'umd',
  },
  externals: {
    react: 'react',
    ramda: 'ramda',
    axios: 'axios',
    'js-cookie': 'js-cookie'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['env', 'stage-0', 'react']
      }
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
