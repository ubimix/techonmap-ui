var _ = require('underscore');
var L = require('leaflet');

module.exports = function(options) {
    var app = options.app;
    var mapOptions = app.options.map;
    var resource = options.resource;
    var icon = app.res.getCategoryIcon(options.type);
    function getIcon(selected) {
        var iconType = icon;
        if (selected) {
            iconType += '-on';
        }
        return L.icon({
            iconUrl : './images/markers/' + iconType + '.svg',
            iconSize : [ 33, 40 ],
            iconAnchor : [ 16, 20 ],
            popupAnchor : [ 0, -30 ]
        });
    }

    var latlng = options.latlng || L.latLng(0, 0);
    var marker = new L.Marker(latlng, _.extend({}, options.params, {
        icon : getIcon(false)
    }));
    marker.updateZoom = function(zoom) {
    }
    marker.setSelection = function(selected) {
        var icon = getIcon(selected);
        marker.setIcon(icon);
    }
    return marker;
};
