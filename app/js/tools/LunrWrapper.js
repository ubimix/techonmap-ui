var _ = require('underscore');
var Mosaic = require('mosaic-commons');
var Lunr = require('lunr');
var ResourceFieldsAccessor = require('./ResourceFieldsAccessor');
Lunr.utils.warn = function(msg) {
    // Silently ignore messages
};
// Change the default tokenizer
Lunr.tokenizer = function(obj) {
    var result = [];
    if (!arguments.length || obj == null || obj == undefined)
        return result;
    if (Array.isArray(obj))
        return result = obj.map(function(t) {
            return t.toLowerCase();
        });
    return result = obj.toString().trim().toLowerCase().split(
            /[\(\)\s\-\.\/\/\'\’\"]+/);
}

// Filtering of empty words
function emptyStopWordFilter(token) {
    if (emptyStopWordFilter.stopWords.indexOf(token) === -1)
        return token;
}
emptyStopWordFilter.stopWords = new Lunr.SortedSet();
emptyStopWordFilter.stopWords.length = 1;
emptyStopWordFilter.stopWords.elements = [ "" ];

// Filter numbers
function numberFilters(token) {
    if (!token.match(/^\d+$/gim))
        return token;
}
// Filter/transform french words
function frenchWordsFilter(token) {
    token = token.toLowerCase();
    if (token === 'd' || token === 'de' || token === 'des' || token === 'la'
            || token === 'le' || token === 'à' || token === 'au'
            || token === 'aux')
        return;
    return token;
}

var LunrWrapper = Mosaic.Class.extend(Mosaic.Events.prototype, {

    /** Normalizes texts - remove all accented characters */
    normalizeText : getNormalizationFunction({
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
     */
    initialize : function(options) {
        this.setOptions(options);
        this.index(this.options.resources);
    },

    index : function(resources, reset) {
        var that = this;
        if (reset) {
            delete that._indexPromise;
        }
        return that._getLunrIndex().then(function(index) {
            return that._reindexResources(index, resources).then(function() {
                return that._runSearch();
            });
        });
    },

    getQuery : function() {
        return this._query || {};
    },

    search : function(query) {
        var that = this;
        return Mosaic.P.then(function() {
            that._query = query || '';
            return that._runSearch();
        }).then(function(results) {
            return results;
        });
    },

    _runSearch : function() {
        var that = this;
        var event = {
            query : that._query,
        };
        var promise;
        if (that._searchPromise) {
            promise = that._searchPromise.then(function(result) {
            }, function(err) {
            });
        } else {
            promise = Mosaic.P();
        }
        return that._searchPromise = promise.then(function() {
            that.emit('search:begin', event);
            return that._getLunrIndex();
        }).then(function(index) {
            var q = that._query;
            var result = {
                resources : [],
                scores : []
            };
            if (q) {
                var entries = result.scores = index.lunr.search(q);
                _.each(entries, function(entry) {
                    var r = index.refs[entry.ref];
                    if (r) {
                        result.resources.push(r);
                    }
                });
            } else {
                result.resources = _.values(index.refs);
            }
            result = that._filterSearchResult(result);
            event.result = result;
            that.emit('search:end', event);
            return result;
        }, function(err) {
            event.error = err;
            that.emit('search:end', event);
        });
    },

    _getLunrIndex : function() {
        if (!this._indexPromise) {
            var that = this;
            this._indexPromise = this._buildLunrIndex();
        }
        return this._indexPromise;
    },

    /** Builds and returns a full-text search index. */
    _buildLunrIndex : function() {
        var that = this;
        var start = Date.now();
        return Mosaic.P.then(function() {
            that.emit('configuration:begin');
            var index = {};
            index.refs = {};
            index.lunr = Lunr(function(lunr) {
                var fields = that._getIndexFields();
                _.each(fields, function(info, field) {
                    info = info || {};
                    var boost = info.boost || 1;
                    var type = info.type || 'field';
                    lunr[type](field, {
                        boost : boost
                    });
                });
            });
            that.emit('configuration:end');
            return index;
        });
    },

    _setIndexingPipeline : function(index) {
        index.lunr.pipeline.reset();
        index.lunr.pipeline.add(this._filterToken.bind(this, [ //
        // numberFilters, //
        this.normalizeText, //
        Lunr.stemmer, //
        // frenchWordsFilter, //
        // Lunr.trimmer, //
        // Lunr.stopWordFilter, //
        emptyStopWordFilter, //
        function(entry) {
            // console.log(' o ', arguments);
            return entry;
        } ]));
    },
    _setSearchPipeline : function(index) {
        // Disable token registration
        index.lunr.pipeline.reset();
        index.lunr.pipeline.add(this._filterToken.bind(this, [ //
        this.normalizeText, //
        Lunr.stemmer, //
        // frenchWordsFilter, //
        emptyStopWordFilter ]));
    },
    _filterToken : function(filters, token) {
        for (var i = 0; i < filters.length; i++) {
            token = filters[i](token);
            if (!token)
                return;
        }
        return token;
    },

    _reindexResources : function(index, resources) {
        var that = this;
        return Mosaic.P.then(function() {
            that._setIndexingPipeline(index);
            var indexingInfo = {
                resources : resources,
                position : 0
            };
            that.emit('indexing:begin', indexingInfo);
            var fields = that._getIndexFields();
            _.each(resources, function(resource, key) {
                var indexEntry = {};
                _.each(fields, function(fieldInfo, field) {
                    var value = that._getResourceFieldValue(resource, field);
                    indexEntry[field] = that._mergeValues(value, ' ');
                    if (fieldInfo.type === 'ref') {
                        index.refs[value] = resource;
                    }
                });
                index.lunr.add(indexEntry);
                indexingInfo.position++;
                that.emit('indexing:progress', indexingInfo);
            });
            that._setSearchPipeline(index);
            that.emit('indexing:end', indexingInfo);
        });
    },

    setResourceFilter : function(filter) {
        this._resourceFilter = filter;
    },

    getResourceFilter : function() {
        return this._resourceFilter;
    },

    _filterSearchResult : function(result) {
        var filter = this.getResourceFilter();
        if (filter) {
            result.resources = _.filter(result.resources, filter);
        }
        return result;
    },

    _mergeValues : function(val, separator) {
        var s;
        if (_.isArray(val)) {
            s = _.map(val, this._filterText, this).join(separator);
        } else {
            s = this._filterText(val);
        }
        return s;
    },
    _filterText : function(val) {
        return val ? '' + val : '';
    },

    _getResourceFieldValue : ResourceFieldsAccessor.getValue,

    /**
     * Returns all fields to index with their respective type and boost factors.
     */
    _getIndexFields : function() {
        this._fields = this._fields || this.options.fields;
        if (!this._fields) {
            this._fields = {
                "id" : {
                    "type" : "ref",
                    "boost" : 1
                },
                "properties.name" : {
                    "type" : "field",
                    "boost" : 10
                },
                "properties.description" : {
                    "type" : "field",
                    "boost" : 5
                },
                "properties.tags" : {
                    "type" : "field",
                    "boost" : 15,
                    "filter" : true
                },
                "properties.address" : {
                    "type" : "field",
                    "boost" : 1
                },
                "properties.postcode" : {
                    "type" : "field",
                    "boost" : 1,
                    "filter" : "prefix"
                },
                "properties.city" : {
                    "type" : "field",
                    "boost" : 2
                },
                "properties.url" : {
                    "type" : "field",
                    "boost" : 0.5
                }
            }
        }
        return this._fields;
    },

});
LunrWrapper.getNormalizationFunction = getNormalizationFunction;
module.exports = LunrWrapper;

/** Returns a function normalizing strings */
function getNormalizationFunction() {
    var repl = [];
    for (var i = 0; i < arguments.length; i++) {
        var mapping = arguments[i];
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
        return str;
    }
}
