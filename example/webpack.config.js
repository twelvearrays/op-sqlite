const path = require('path');

module.exports = {
  entry: './index.web.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  mode: 'development',
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
    },
    extensions: ['.web.js', '.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {test: /\.(js|ts)x?$/, use: 'babel-loader', exclude: /node_modules/},
      {test: /\.wasm$/, type: 'webassembly/async'},
    ],
  },
  experiments: {asyncWebAssembly: true},
  devServer: {
    static: './public',
    hot: true,
    historyApiFallback: true,
  },
};
