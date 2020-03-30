const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { resolve } = require('path');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/js/index.js',
  },
  output: {
    filename: 'js/[contenthash:5].js',
    publicPath: '/assets/',
    path: resolve('assets')
  },
  module: {
    rules: [{
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: { localIdentName: '[hash:5]' },
              localsConvention: 'dashesOnly',
            },
          },
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
    new MiniCssExtractPlugin({ filename: 'css/[contenthash:5].css' }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.scss'],
    alias: {
      i18n: resolve('helpers/i18n/client'),
      style: resolve('src/scss'),
    }
  }
};