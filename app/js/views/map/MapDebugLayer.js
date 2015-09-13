var _ = require('underscore');
var L = require('leaflet');
var AbstractMapLayer = require('./AbstractMapLayer');

/** */
module.exports = AbstractMapLayer.extend({

    /** This method is called when this layer is added to the map. */
    onAdd : function(map) {
        this._map = map;
        this._map.on('click', this._onClick, this);
    },

    /**
     * Removes all registered layers from the map. Cleans up all map listeners.
     */
    onRemove : function(map) {
        this._map.off('click', this._onClick, this);
        delete this._map;
    },

    _onClick : function(e) {
        console.log(this._map.getZoom() + ':[' + e.latlng.lng + ',' + e.latlng.lat +
                ']');
    }

});
