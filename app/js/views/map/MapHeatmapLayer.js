var _ = require('underscore');
var L = require('leaflet');
require('leaflet.heat');
var AbstractMapLayer = require('./AbstractMapLayer');
var ResourceUtilsMixin = require('../../tools/ResourceUtilsMixin');
var React = require('react');

/** */
module.exports = AbstractMapLayer.extend({

    initialize : function(options) {
        AbstractMapLayer.prototype.initialize.apply(this, arguments)
    },

    // -----------------------------------------------------------------------

    /** This method is called when this layer is added to the map. */
    onAdd : function(map) {
        this._map = map;
        this._registerHandlers();
        this._redrawHeatmap();
    },

    /**
     * Removes all registered layers from the map. Cleans up all map listeners.
     */
    onRemove : function(map) {
        this._removeHeatmap();
        this._removeHandlers();
        delete this._map;
    },

    // -----------------------------------------------------------------------

    _getApp : function() {
        return this.options.app;
    },

    /**
     * Returns map options from the global application options.
     */
    _getMapOptions : function() {
        var app = this._getApp();
        var mapOptions = app.options.map;
        return mapOptions;
    },

    // -----------------------------------------------------------------------

    /**
     * Registers handlers (listeners) responsible for marker redrawing and
     * selected item highlighting.
     */
    _registerHandlers : function() {
        var app = this._getApp();
        app.res.addChangeListener(this._redrawHeatmap, this);
    },

    /**
     * Removes handlers (listeners) responsible for marker redrawing and
     * selected item highlighting.
     */
    _removeHandlers : function(map) {
        var app = this._getApp();
        app.res.removeChangeListener(this._redrawHeatmap, this);
    },

    // -----------------------------------------------------------------------

    /** Remove the heatmap from the map. */
    _removeHeatmap : function() {
        if (this._heatmap) {
            this._map.removeLayer(this._heatmap);
            delete this._heatmap;
        }
    },

    /**
     * This method is called when search results are updated.
     */
    _redrawHeatmap : function() {
        var app = this._getApp();
        var data = app.res.getResources();
        if (data && data.length) {
            this._removeHeatmap();
            var points = [];
            _.each(data, function(d) {
                var coords = d.geometry.coordinates;
                var point = [ coords[1], coords[0], 100 ];
                points.push(point);
            }, this);
            this._heatmap = L.heatLayer(points, {
                radius : 25,
                blur : 50
            });
            this._map.addLayer(this._heatmap);
        }
    },

});
