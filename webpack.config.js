const path = require('path')
const webpack = require('webpack')

process.env.NODE_ENV = 'production'

module.exports = {
  entry: path.resolve(__dirname, 'tiny-mvvm.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'tiny-mvvm.js',
    libraryTarget: 'umd',
    library: {
      root: 'bindViewToData',
      amd: 'tiny-mvvm',
      commonjs: 'tiny-mvvm',
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          { loader: 'babel-loader' },
        ],
      },
    ],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      comments: false,
      'screw-ie8': true,
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
  ],
}
