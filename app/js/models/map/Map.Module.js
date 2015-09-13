var _ = require('underscore');
var Mosaic = require('mosaic-commons');
var App = require('mosaic-core').App;
var Api = App.Api;

/** An API allowing to manage Map layers visibility. */
module.exports = Api.extend({

    /**
     * This initializes internal fields of this object.
     */
    _initFields : function(options) {
        this._mapZoomLevel = this.getInitialMapZoom();
        this._layerVisibility = {
            heatmap : false,
            data : true
        };
    },

    /** Pre-loads map-related information. */
    start : function() {
        var that = this;
        return Mosaic.P.then(function() {
        });
    },

    stop : function() {
    },
    // ------------------------------------------------------------------

    /** This intent handlers increases/decreases the current map zoom level. */
    changeMapZoom : Api.intent(function(intent) {
        var that = this;
        intent.resolve(Mosaic.P.then(function() {
            var zoom = intent.params.zoom;
            if (!zoom) {
                var delta = intent.params.zoomDelta;
                zoom = that.getMapZoomLevel() + delta;
            }
            return that._setMapZoomLevel(zoom);
        })).then(function() {
            // Check that there is no performance issues
            that._notifyMapChanges();
        });
    }),

    // ------------------------------------------------------------------

    /** Returns an object of map-specific options of this application. */
    getMapOptions : function() {
        var app = this.options.app;
        var mapOptions = app.options.map || {};
        return mapOptions;
    },

    // ------------------------------------------------------------------

    /** Returns minimal zoom level */
    getMinZoomLevel : function() {
        var mapOptions = this.getMapOptions();
        return mapOptions.minZoom || 0;
    },

    /** Returns maximal zoom level */
    getMaxZoomLevel : function() {
        var mapOptions = this.getMapOptions();
        return mapOptions.maxZoom || 22;
    },

    // ------------------------------------------------------------------

    /** Returns <code>true</code> if the heatmap is visible. */
    isHeatmapLayerVisible : function() {
        return this._layerVisibility.heatmap;
    },

    /** Returns <code>true</code> if the heatmap is visible. */
    toggleHeatmapLayer : function() {
        return this.setLayersVisibility({
            heatmap : !this._layerVisibility.heatmap,
            data : !!this._layerVisibility.heatmap
        });
    },

    // --------

    /** Returns <code>true</code> if the datalayer is visible. */
    isDataLayerVisible : function() {
        return this._layerVisibility.data;
    },

    /** Returns <code>true</code> if the heatmap is visible. */
    toggleDataLayer : function() {
        return this.setLayersVisibility({
            heatmap : !!this._layerVisibility.data,
            data : !this._layerVisibility.data
        });
    },

    // --------

    /** Returns <code>true</code> if a layer with the specified key is visible. */
    isLayerVisible : function(key) {
        var value = this._layerVisibility[key];
        return value === undefined || !!value;
    },

    /** Updates visibility of the specified map layers. */
    setLayersVisibility : Api.intent(function(intent) {
        var that = this;
        var changed = false;
        return intent.resolve(
                Mosaic.P.then(function() {
                    var visibility = intent.params;
                    var values = _
                            .extend({}, that._layerVisibility, visibility);
                    if (JSON.stringify(values) != JSON
                            .stringify(that._layerVisibility)) {
                        changed = true;
                        that._layerVisibility = values;
                    }
                }))//
        .then(function() {
            if (changed) {
                that._notifyMapChanges();
            }
        });
    }),

    // ------------------------------------------------------------------

    /** Returns the initial zoom level for the map. */
    getInitialMapZoom : function() {
        var mapOptions = this.getMapOptions();
        return mapOptions.zoom || 8;
    },

    /** Returns the current zoom level of the map. */
    getMapZoomLevel : function() {
        return this._mapZoomLevel;
    },

    /** Add a new listener for map changes. */
    addMapChangeListener : function(listener, context) {
        this.on('map:change', listener, context);
    },

    /** Removes the specified listener of map changes. */
    removeMapChangeListener : function(listener, context) {
        this.off('map:change', listener, context);
    },

    /**
     * Notifies about changes on the map. Used internally by the Module class.
     */
    _notifyMapChanges : function() {
        this.fire('map:change');
    },

    /** Updates the zoom level. Used internally by the Module class. */
    _setMapZoomLevel : function(zoom) {
        var prevZoom = this._mapZoomLevel;
        var minZoom = this.getMinZoomLevel();
        var maxZoom = this.getMaxZoomLevel();
        this._mapZoomLevel = Math.max(minZoom, Math.min(zoom, maxZoom));
        return prevZoom != this._mapZoomLevel;
    },

});
