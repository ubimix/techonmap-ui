var _ = require('underscore');
var Mosaic = require('mosaic-commons');

/** Returns a function normalizing strings */
function getNormalizationFunction(toLowerCase) {
    var repl = [];
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < args.length; i++) {
        var mapping = args[i];
        for ( var key in mapping) {
            repl.push({
                regexp : new RegExp(key, 'gim'),
                value : mapping[key]
            });
        }
    }
    return function(str) {
        if (!str || str == '')
            return '';
        str = str + '';
        for (var i = 0; i < repl.length; i++) {
            var slot = repl[i];
            str = str.replace(slot.regexp, slot.value);
        }
        if (toLowerCase)
        	return str.toLowerCase();
        return str;
    }
}

module.exports = {

    /** Returns a list of normalized tags for the specified resource. */
    getResourceTags : function(resource) {
        var values = this._getPropertyArray(resource, 'tags');
        return this._filterToLowerCase(values);
    },

    /** Returns a list of normalized categories for the specified resource. */
    getResourceCategories : function(resource) {
        var values = this._getPropertyArray(resource, 'category');
        return this._filterToLowerCase(values);
    },

    /** Returns a geographic zone for this resource. */
    getResourceZone : function(resource) {
        var code = this._getFirstProperty(resource, 'postcode');
        if (code && code.length > 2) {
            code = code.substring(0, 2);
        }
        return code;
    },

    /** Returns the name of this resource. */
    getResourceName : function(resource) {
        if (!resource)
            return null;
        var type = this._getFirstProperty(resource, 'name');
        return type;
    },

    getResourceCreationYear : function(resource) {
        if (!resource)
            return null;
        var creationYear = this._getFirstProperty(resource, 'creationyear');
        return creationYear;
    },

    /** Returns type for the specified resource. */
    getResourceType : function(resource) {
        if (!resource)
            return null;
        var categories = this.getResourceCategories(resource);
        return categories.length ? categories[0] : 'default';
        // var type = this._getFirstProperty(resource, 'type');
        // return type;
    },

    getResourceTypeLabel : function(type) {
        if (!type || type.length == 0)
            return 'default';
        var label = type.substring(0, 1).toUpperCase() + type.substring(1);
        return label;
    },

    /** Returns first value of a property with the specified key. */
    _getFirstProperty : function(resource, key, defaultValue) {
        var values = this._getPropertyArray(resource, key);
        var value = defaultValue;
        if (values.length) {
            value = values[0];
        }
        return value;
    },

    /**
     * Returns a resource property with the specified key as an array. The
     * returned values is always an array (which can be empty).
     */
    _getPropertyArray : function(resource, key) {
        var props = (resource ? resource.properties : null) || {};
        var array = props[key] || [];
        return _.isArray(array) ? _.toArray(array) : [ array ];
    },

    /**
     * This utility method transforms all values of the specified array to lower
     * case.
     */
    _filterToLowerCase : function(array) {
        if (!array)
            return [];
        return _.map(array, function(value) {
            return (value + '').toLowerCase();
        });
    },

    /** Returns a unique identifier of this resource. */
    getResourceId : function(resource) {
        if (!resource)
            return null;
        var props = resource.properties || {};
        var id = props.id;
        if (!id) {
            id = resource.id;
            if (!id) {
                id = props.id = _.uniqueId('id-');
            }
        }
        return id;
    },

    /**
     * Returns a bounding box for a CCI corresponding to the specified alias.
     */
    getBoundingBox : function(resources) {
        var bounds = [];
        var initialized = false;
        resources = _.isArray(resources) ? resources : [ resources ];
        _.each(resources, function(resource) {
            if (!resource || !resource.geometry
                    || !resource.geometry.coordinates)
                return;
            this._visitGeometry(resource.geometry, function(point) {
                if (!initialized) {
                    bounds[0] = [ point[0], point[1] ];
                    bounds[1] = [ point[0], point[1] ];
                    initialized = true;
                } else {
                    bounds[0][0] = Math.min(point[0], bounds[0][0]);
                    bounds[0][1] = Math.min(point[1], bounds[0][1]);
                    bounds[1][0] = Math.max(point[0], bounds[1][0]);
                    bounds[1][1] = Math.max(point[1], bounds[1][1]);
                }
            });
        }, this);
        if (!initialized) {
            bounds = [ [ -90, -180 ], [ 90, 180 ] ];
        }
        return bounds;
    },

    /** Returns center of the specified bounding box */
    getBoundingBoxCenter : function(bbox) {
        return [ (bbox[0][0] + bbox[1][0]) / 2, (bbox[0][1] + bbox[1][1]) / 2 ];
    },
    /** Returns center of the specified bounding box */
    isBoundingBoxEmpty : function(bbox) {
        return (bbox[0][0] == bbox[1][0]) && (bbox[0][1] == bbox[1][1]);
    },

    /**
     * Normalizes names - remove all accented characters, spaces and special
     * symbols
     */
    normalizeName : getNormalizationFunction(true, {
        '[\\s.|!?,;<>&\'"()\\\/%]+' : '-',
        '-+' : '-',
        // '[/^-+|-+$' : '',
        '^-+' : '',
        '[ùûü]' : 'u',
        '[ÿ]' : 'y',
        '[àâ]' : 'a',
        '[æ]' : 'ae',
        '[ç]' : 'c',
        '[éèêë]' : 'e',
        '[ïî]' : 'i',
        '[ô]' : 'o',
        '[œ]' : 'oe',
    }),

    /** Normalizes texts - remove all accented characters */
    normalizeText : getNormalizationFunction(false, {
        '[ùûü]' : 'u',
        '[ÿ]' : 'y',
        '[àâ]' : 'a',
        '[æ]' : 'ae',
        '[ç]' : 'c',
        '[éèêë]' : 'e',
        '[ïî]' : 'i',
        '[ô]' : 'o',
        '[œ]' : 'oe',
    }),

    /**
     * An internal method visiting all coordinates of GeoJSON geometry objects.
     */
    _visitGeometry : (function() {
        function visitSequence(coords, listener) {
            for (var i = 0; i < coords.length; i++) {
                listener(coords[i]);
            }
        }
        function visitSequences(coords, listener) {
            for (var i = 0; i < coords.length; i++) {
                visitSequence(coords[i], listener);
            }
        }
        return function visit(geometry, listener) {
            var result;
            var coords = geometry.coordinates;
            switch (geometry.type) {
            case 'Point':
                listener(coords);
                break;
            case 'MultiPoint':
            case 'LineString':
                visitSequence(coords, listener);
                break;
            case 'MultiLineString':
            case 'Polygon':
                visitSequences(coords, listener);
                break;
            case 'MultiPolygon':
                for (var i = 0; i < coords.length; i++) {
                    visitSequences(coords[i], listener);
                }
                break;
            case 'GeometryCollection':
                (function() {
                    var geoms = geometry.geometries;
                    for (var i = 0, len = geoms.length; i < len; i++) {
                        visit(geoms[i], listener);
                    }
                })();
                break;
            }
            return result;
        }
    })(),
};
