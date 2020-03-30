const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
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
    path: path.resolve('assets'),
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
        test: /\.(png|ico|jpe?g)$/,
        use: [{
          loader: 'file-loader',
          options: { name: 'images/[hash:5].[ext]' }
        }]
      },
      {
        test: /\.(woff2?|ttf|eot|svg)$/,
        use: [{
          loader: 'file-loader',
          options: { name: 'fonts/[hash:5].[ext]' }
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
    new CleanWebpackPlugin(),
    new ManifestPlugin({
      fileName: __dirname + '/manifest.json',
      generate: (seed, files) => {

        const manifest = {};

        for (file of files) {

          const name = file.name.replace(/(\.css|\.js)$/, '');

          manifest[name] = manifest[name] || [];
          manifest[name].push(file.path);
        }

        return manifest;
      }
    }),
    new MiniCssExtractPlugin({ filename: 'css/[contenthash:7].css' }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    minimizer: [
      new TerserJSPlugin({
        cache: true,
        parallel: true,
      }),
      new OptimizeCSSAssetsPlugin()
    ],
  }
};