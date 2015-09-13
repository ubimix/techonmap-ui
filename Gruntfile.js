var webpack = require('webpack');

module.exports = function(grunt) {
    var pkg = grunt.file.readJSON('package.json');
    var config = {
        pkg : pkg
    };

    // Webpack
    var webpackConfig = require('./webpack.config');
    config.webpack = {
        main : webpackConfig,
    }
    grunt.loadNpmTasks('grunt-webpack');

    // Uglyfy
    config.uglify = {
        options : {},
        browser : {
            src : "./app/dist/mapapp.js",
            dest : "./app/dist/mapapp.min.js"
        }
    };
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', [ 'webpack', 'uglify' ]);
    grunt.registerTask('default', [ 'build' ]);
    grunt.initConfig(config);
}
