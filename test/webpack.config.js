const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');

module.exports = merge.smart(require('../webpack.config'), {
  target: 'node',
  externals: [nodeExternals()]
});