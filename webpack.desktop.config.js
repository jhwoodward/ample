var path = require('path');
var webpack = require('webpack');

var config = {
  watch: true,
  entry: './src/web/app.desktop.js',
  output: {
    path:'./dist/',
    filename: 'bundle-desktop.js',
    path: path.resolve(__dirname, 'dist')
  },
    devServer: { 
      //  hot:true,
      inline:true,
      port:3000,
      historyApiFallback: true
    }
    ,
    plugins: []
    ,
    module: {
        
        loaders:[
            {
                test: /\.js$/,
                exclude:/node_modules/,
                loader:'babel-loader',
                query: {
                    presets:['es2015']
                }
                ,
                plugins: [
                    "add-module-exports"
                ]
            }
            ,
             {
                test: /\.html$/,
                loader:'raw-loader',
                exclude:/node_modules/
            }
             ,
             {
                test: /\.css$/,
                loader:'style!css-loader'
            },
            ,
            {
                test: /\.scss$/,
                loaders: [ 'style', 'css', 'sass' ]
            }
            ,
            { test: /\.(png|jpg|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader' }
        ]
        
    }
    
}
config.devtool='source-map';
//config.plugins.push(new webpack.optimize.UglifyJsPlugin());

module.exports = config;