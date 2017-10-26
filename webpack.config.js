const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    index: './src/index.ts',
    message: './src/message.ts',
    commands: './src/commands/index.ts',
    effects: './src/effects/index.ts',
    dispatcher: './src/dispatcher.ts'
  },
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    library: 'architecture',
    libraryTarget: 'umd',
  },
  devtool: 'source-map',
  externals: {
    react: 'react',
    ramda: 'ramda',
    axios: 'axios',
    'js-cookie': 'js-cookie'
  },
  module: {
    loaders: [{
      test: [/\.tsx?$/],
      loader: 'awesome-typescript-loader',
      exclude: /node_modules/
    }, {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['env', 'stage-0', 'react']
      }
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
};
