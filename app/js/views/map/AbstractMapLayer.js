var _ = require('underscore');
var L = require('leaflet');

/**
 * An utility class managing map layers visibility depending on the zoom level.
 */
module.exports = L.Class.extend({

    /**
     * Initializes the range of zoom levels where this layer is visible.
     */
    initialize : function(options) {
        L.setOptions(this, options);
        this.app = this.options.app;
    },

    /**
     * Creates and returns a new tiles-based layer with the specified URL and
     * attribution text.
     */
    _newTilesLayer : function(tilesUrl, attribution) {
        var app = this.options.app;
        var mapOptions = app.map.getMapOptions();
        var maxZoom = mapOptions.maxZoom;
        var minZoom = mapOptions.minZoom;
        var tilesLayer = L.tileLayer(tilesUrl, {
            attribution : attribution,
            maxZoom : maxZoom,
            minZoom : minZoom,
            zIndex : this.options.zIndex || 0
        });
        return tilesLayer;
    },

});
