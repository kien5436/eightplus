const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        index: './src/js/chat.js',
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
        new MiniCssExtractPlugin({ filename: 'css/[contenthash:7].css' }),
    ],
    optimization: {
        splitChunks: {
            chunks: 'all'
        },
    }
};