const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    'login-register': './src/js/users/login-register.js',
    home: './src/js/users/home.js',
    chat: './src/js/users/chat.js',
    // contacts: './src/js/users/contacts.js',
    profile: './src/js/users/profile.js',
    '404': './src/js/404.js',
  },
  output: {
    filename: 'js/[contenthash:7].js',
    publicPath: '/assets/',
    path: path.resolve('assets')
  },
  module: {
    rules: [{
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(woff2?|ttf|eot|svg)$/,
        use: [{
          loader: 'file-loader',
          options: { name: 'fonts/[name].[ext]' }
        }]
      },
      {
        test: /\.(png|ico|jpe?g)$/,
        use: [{
          loader: 'file-loader',
          options: { name: 'images/[hash:5].[ext]' }
        }]
      },
      {
        test: /(browserconfig\.xml|site.webmanifest)/,
        use: [{
          loader: 'file-loader',
          options: { name: '[hash:5].[ext]' }
        }]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'css/[contenthash:7].css' }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
  },
};