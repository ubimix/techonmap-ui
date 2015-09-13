module.exports = {
    entry : "./app/js/index.js",
    output : {
        path : __dirname + '/app/dist',
        filename : "./mapapp.js",
        publicPath : 'dist/'
    },
    module : {
        loaders : [ {
            test : /\.less$/,
            loader : "style!css!less"
        }, {
            test : /\.css$/,
            loader : "style!css"
        }, {
            test : /\.jsx$/,
            loader : "jsx"
        }, {
            test : /react-typeahead.*$/,
            loader : "jsx"
        }, {
            test : /\.(png|svg|woff|eot|ttf)/,
            loader : 'url-loader?limit=8192'
        } ]
    },
    resolve : {
        alias : {
            react : __dirname + '/node_modules/react',
            underscore : __dirname + '/node_modules/underscore/underscore',
            leaflet : __dirname + '/node_modules/leaflet/dist',
            'bootstrap-css-only' : __dirname
                    + '/node_modules/bootstrap/dist/css',
        }
    }
};
