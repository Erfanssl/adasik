const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/i,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(html)$/i,
                use: 'html-loader'
            },
            {
                test: /\.(jpe?g|png|gif|svg|mp3|ttf)$/i,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[hash].[ext]',
                        outputPath: 'images'
                    }
                }
            }
        ]
    },
    plugins: [
         new CopyWebpackPlugin({
             patterns: [
                 path.resolve(__dirname, "src", "pwa")
             ]
         })
    ]
};