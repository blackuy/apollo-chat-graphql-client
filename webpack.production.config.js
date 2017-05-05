var webpack = require('webpack')
var path = require('path')
var loaders = require('./webpack.loaders')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var WebpackCleanupPlugin = require('webpack-cleanup-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

loaders.push({
  test: /\.(scss|sass)$/,
  loader: ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: 'css-loader?sourceMap&localIdentName=[local]___[hash:base64:5]!sass-loader?outputStyle=expanded'
  }),
  exclude: ['node_modules']
})

module.exports = {
  entry: ['./src/index.jsx'],
  output: {
    publicPath: './',
    path: path.join(__dirname, 'dist'),
    filename: '[chunkhash].js'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    loaders
  },
  target: 'web',
  plugins: [
    new WebpackCleanupPlugin(
      { exclude: ['CNAME', 'CNAME.example'] }
    ),
    new webpack.NamedModulesPlugin(),
    new webpack.EnvironmentPlugin([
      'APOLLO_HTTP_ENDPOINT',
      'APOLLO_WS_ENDPOINT',
      'NODE_ENV'
    ]),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
        drop_console: true,
        drop_debugger: true
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new ExtractTextPlugin({
      filename: '[chunkhash].css',
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      template: './src/template.ejs',
      googleAnalytics: {
        trackingId: process.env.GA,
        pageViewOnLoad: true
      },
      files: {
        css: ['style.css'],
        js: ['bundle.js']
      }
    })
  ]
}
