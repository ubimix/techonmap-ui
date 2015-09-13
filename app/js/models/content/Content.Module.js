var _ = require('underscore');
var Mosaic = require('mosaic-commons');
var App = require('mosaic-core').App;
var ContentResource = require('./ContentResource');
var Teleport = require('mosaic-teleport');

var Api = App.Api;

/** Navigation module. Manages search criteria applied to resources. */
module.exports = Api.extend({}, {

    /** Initializes fields */
    _initFields : function() {
    },

    // ------------------------------------------------------------------

    /** Pre-loads map-related information. */
    start : function() {
    },

    stop : function() {
    },

    // ------------------------------------------------------------------
    // Data loading

    loadContent : function(options) {
        var that = this;
        var href;
        if (_.isString(options)) {
            href = options;
        } else {
            href = options.url;
        }
        return that._loadText(href).then(function(text) {
            var obj = new ContentResource(text);
            obj.setOptions(options);
            return obj;
        });
    },

    // ------------------------------------------------------------------
    // Private methods

    _loadText : function(path) {
        var that = this;
        return Mosaic.P.then(function() {
            var baseUrl = that.app.options.contentBaseUrl;
            var client = Teleport.HttpClient.newInstance({
                baseUrl : baseUrl
            });
            return client.exec({
                path : path,
                method : 'GET'
            });
        });
    }

});
