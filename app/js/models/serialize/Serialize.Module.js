var _ = require('underscore');
var Mosaic = require('mosaic-commons');
var CsvFormatter = require('../../tools/CsvFormatter');
var App = require('mosaic-core').App;
var Api = App.Api;

/**  */
module.exports = Api.extend({

    /**
     * Initializes internal fields.
     */
    _initFields : function() {
    },

    /**
     * 
     */
    start : function() {
        var that = this;
        return that._loadFieldsDescription().then(function(config) {
            var formatter = new CsvFormatter();
            _.each(config, function(options) {
                formatter.addField(options.label, options.field);
            })
            that._formatter = formatter;
            that.notify();
        });
    },

    /** Closes this module. */
    stop : function() {
    },

    // ------------------------------------------------------------------

    /** Returns the specified data serialized in a JSON string. */
    formatAsJson : function(data) {
        data = this._filterData(data);
        return JSON.stringify(data);
    },

    /** Returns the specified data set serialized as CSV text. */
    formatAsCSV : function(data) {
        var fields = [];
        data = this._filterData(data);
        return this._formatter.toCsv({
            objects : data
        });
    },

    _filterData : function(data) {
        var result = [];
        _.each(data, function(r) {
            if (!r.geometry || r.coordinates)
                return;
            r = JSON.parse(JSON.stringify(r));
            r.properties = r.properties || {};
            delete r.sys;
            result.push(r);
        });
        return result;
    },

    /** Loads fields descriptions . */
    _loadFieldsDescription : function() {
        var that = this;
        return Mosaic.P.then(function() {
            return that._getJson({
                path : that.app.options.exportFields
            })
        });
    }
});
