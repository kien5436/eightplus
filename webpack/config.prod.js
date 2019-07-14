const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
        index: './src/js/login.js',
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
        }]
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