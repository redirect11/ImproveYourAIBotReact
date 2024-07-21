const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const developmentConfig = require('./webpack.dev.js');
const productionConfig = require('./webpack.prod.js');
const { merge } = require('webpack-merge');


const commonConfig = (mode) => {
    return {
    entry: {
        settings: './src/ChatbotManager.js', // Entry point per le Impostazioni Admin
    },
    output: {
        path: path.resolve(__dirname, '../assets/js'),
        filename: '[name].bundle.js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            templateParameters: {
                development: mode === 'development',
            },
            template: './src/views/app.html',
            filename: '../app.html'
        })
    ],
    module: {
        rules: [
        {
            test: /\.(css|scss)$/,
            use: [
            'style-loader',
            {
                loader: 'css-loader',
                options: {
                importLoaders: 1,
                modules: {
                    localIdentName: "[name]__[local]___[hash:base64:6]",
                },
                }
            }
            ],
            include: /\.module\.css$/
        },
        {
            test: /\.(css|scss)$/,
            use: [
            'style-loader',
            'css-loader',
            'postcss-loader',
            ],
            exclude: /\.module\.css$/
        },
        {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env', '@babel/preset-react']
            }
            }
        },
        {
            test: /\.svg$/,
            use:  ['@svgr/webpack', 'file-loader'],		
            issuer: {
                and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
            },
        }
    
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css'],
    }
}
};

module.exports = (env, args) => {
    switch(args.mode) {
      case 'development':
        return merge(commonConfig(args.mode), developmentConfig);
      case 'production':
        return merge(commonConfig(args.mode), productionConfig);
      default:
        throw new Error('No matching configuration was found!');
    }
}