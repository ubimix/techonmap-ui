var _ = require('underscore');
var Mosaic = require('mosaic-commons');
var ResourceUtils = require('../../tools/ResourceUtilsMixin');
var App = require('mosaic-core').App;
var Api = App.Api;

/** This module manages resource statistics. */
module.exports = Api.extend({

    /**
     * Initializes internal fields.
     */
    _initFields : function() {
        this._fullStats = this._newStatsObject();
        this._stats = this._newStatsObject();
    },

    /**
     * Loads information about selected/active entities.
     */
    start : function() {
        this.app.res.addChangeListener(this._onUpdate, this);
        this._onUpdate();
    },

    /** Closes this module. */
    stop : function() {
        this.app.res.removeChangeListener(this._onUpdate, this);
    },

    /** Returns statistics about the whole resource set. */
    getFullStats : function() {
        return this._fullStats;
    },

    /** Returns statistics about resource corresponding to the search criteria. */
    getStats : function() {
        return this._stats;
    },

    /**
     * This method is called when resources are changed. It is responsible for
     * statistics updates.
     */
    _onUpdate : function() {
        this._fullStats = this._calculateStats(this.app.res.getAllResources());
        this._stats = this._calculateStats(this.app.res.getResources());
        this.notify();
    },

    /** Calculates and returns statistics about the specified set of resources. */
    _calculateStats : function(list) {
        var result = this._newStatsObject();
        _.each(list, function(resource) {
            var tags = ResourceUtils.getResourceTags(resource);
            this._updateStats(result.tags, tags);

            var categories = ResourceUtils.getResourceCategories(resource);
            this._updateStats(result.categories, categories);

            var zone = ResourceUtils.getResourceZone(resource);
            this._updateStats(result.zones, [ zone ]);
        }, this);
        return result;
    },

    /**
     * Creates and returns a new object with statistics about individual
     * resource fields.
     */
    _newStatsObject : function() {
        return {
            zones : {},
            tags : {},
            categories : {}
        }
    },

    /** Updates object statistics using the specified fields. */
    _updateStats : function(stats, values) {
        _.each(values, function(value) {
            var number = stats[value] || 0;
            stats[value] = number + 1;
        });
    }

});
