var _ = require('underscore');
var Mosaic = require('mosaic-commons');

var BASE_URL = "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find";
var EsriGeoLocation = Mosaic.Class.extend({

    /** Base search URL */
    _baseUrl : BASE_URL,

    initialize : function(options) {
        _.extend(this, options);
    },

    /**
     * @param params.addr
     *            address to geolocalize
     */
    geolocalize : function(params) {
        var that = this;
        var url = this._getServiceUrl(params);
        return this._remoteCall(url).then(function(data) {
            var suggestions = that._extractSuggestions(data);
            return suggestions;
        });
    },

    _remoteCall : function(url) {
        var jsonp = require('jsonp');
        return Mosaic.P.ninvoke(jsonp, jsonp, url, {});
    },

    /**
     * This utility method transforms the address name in a 'standardized' point
     * representation ("address" + "city" + "lng" + "lat" + "postcode").
     */
    _parseStreetAddress : function(name) {
        var result = null;
        try {
            if (name && "" != name) {
                result = {};
                var array = name.split(",");
                result.address = trim(array[0]);
                if (array.length > 1) {
                    result.postcode = parseInt(trim(array[1]));
                    result.city = trim(array[array.length - 1]);
                }
            }
        } catch (e) {
        }
        return result;
    },

    /**
     * Checks if the specified location could be used as an address.
     */
    _isAcceptedType : function(location) {
        var result = false;
        if (location && location.feature && location.feature.attributes) {
            var type = location.feature.attributes.Addr_Type;
            result = ("PointAddress" == type || "StreetAddress" == type || //
            "StreetName" == type);
        }
        return result;
    },

    /**
     * Returns the full service url corresponding to the requested address
     */
    _getServiceUrl : function(params) {
        var url = this._baseUrl + this._getParamString({
            text : params.address + "",
            f : 'pjson'
        });
        return url;
    },

    _getParamString : function(obj, existingUrl, uppercase) {
        var params = [];
        for ( var i in obj) {
            params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i)
                    + '=' + encodeURIComponent(obj[i]));
        }
        return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&')
                + params.join('&');
    },

    /**
     * Transforms data returned by the server into a list of standardized points
     */
    _extractSuggestions : function(data) {
        var result = [];
        var locations = data.locations;
        var len = locations ? locations.length : 0;
        for (var i = 0; i < len; i++) {
            var location = locations[i];
            if (!location)
                continue;
            var type = null;
            if (!this._isAcceptedType(location)) {
                continue;
            }

            var point = this._parseStreetAddress(location.name);
            if (!point)
                continue;
            point.lat = null;
            point.lng = null;
            if (location.feature && location.feature.geometry) {
                point.lat = location.feature.geometry.y;
                point.lng = location.feature.geometry.x;
            }
            result.push(point);
        }
        return result;
    }
});

module.exports = EsriGeoLocation;
