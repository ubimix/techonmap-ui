var _ = require('underscore');
var L = require('leaflet');
var AbstractMapLayer = require('./AbstractMapLayer');

/** */
module.exports = AbstractMapLayer.extend({

    /** This method is called when this layer is added to the map. */
    onAdd : function(map) {
        this._map = map;
        var app = this.options.app;
        var mapOptions = app.map.getMapOptions();
        var tilesUrl = mapOptions.tilesUrl;
        var attribution = mapOptions.attribution;
        this._tiles = this._newTilesLayer(tilesUrl, attribution);
        this._map.addLayer(this._tiles);
    },

    /**
     * Removes all registered layers from the map. Cleans up all map listeners.
     */
    onRemove : function(map) {
        this._map.removeLayer(this._tiles);
        delete this._tiles;
        delete this._map;
    },

});
