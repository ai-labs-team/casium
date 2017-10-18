var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    index: './src/index.js',
    message: './src/message.js',
    commands: './src/commands/index.js',
    effects: './src/effects/index.js'
  },
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
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
