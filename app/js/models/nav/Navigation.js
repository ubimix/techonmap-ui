var _ = require('underscore');
var Mosaic = require('mosaic-commons');
var URL = require('url');

/**
 * This class is used to manage internal states of applications. It allows to
 * set/retrieve values corresponding to specified paths. Each value change emits
 * events corresponding to the value path. Example:
 * 
 * <pre>
 * var nav = new Navigation({
 *     category : 'marketing',
 *     language : 'en',
 *     companyId : '234345',
 *     search : {
 *         tags : [ 'web', 'sites' ],
 *         q : 'Hello'
 *     }
 * });
 * var url = nav.toUrl({
 *     pathname : '/{language}/category/{category}',
 *     query : {
 *         q : '{search.q}',
 *         tags : '{search.tags}'
 *     },
 *     hash : '{companyId}'
 * });
 * console.log(url);
 * //The result is: 
 * // '/en/category/marketing?q=Hello&amp;tags=web&amp;tags=sites#123'
 * </pre>
 *  
 * <pre>
 * // Parsing from URL:
 * var nav = new Navigation();
 * var url = '/en/category/marketing?q=Hello&amp;tags=web&amp;tags=sites#123';
 * nav.fromUrl(url, {
 *   'pathname' : function(options) {
 *      var path = options.value;
 *      var array = _.filter(path.split('/'), function(s) {
 *         return !!s;
 *      });
 *      this.addValues('language', this.extractSegments(array[0]));
 *      this.addValues('category', this.extractSegments(array[2]));
 *   },
 *   'query.q' : 'search.q',
 *   'query.tags' : 'search.tags',
 *   'hash' : 'companyId'
 * });
 * 
 *  // The resulting internal fields are:
 *  {
 *      language: 'en',
 *      category : 'marketing',
 *      search : {
 *          q : 'Hello',
 *          tags : ['web', 'sites']
 *      },
 *      companyId : '123'
 *  }
 * </pre>
 */
var Navigation = Mosaic.Class.extend(Mosaic.Events.prototype, {

    /** Sets the initial values of this object. */
    initialize : function(options) {
        this.setOptions(options);
        this._fireEvents = _.debounce(this._fireEvents, 50);
    },

    /**
     * Creates and returns a new clone of this object.
     */
    clone : function() {
        var options = JSON.parse(JSON.stringify(this.options));
        var Type = this.getClass();
        return new Type(options);
    },

    /**
     * Sets a new value and remove the old value corresponding to the specified
     * path.
     */
    setValue : function(path, value) {
        return this._setValue(path, value, true);
    },

    /**
     * Sets new value and removes old ones corresponding to the specified path.
     */
    setValues : function(path, values) {
        return this._setValue(path, values, true);
    },

    /**
     * Adds a new value corresponding to the specified path. If there are
     * already values for the specified path then all values are stored in a
     * list.
     */
    addValue : function(path, value) {
        return this._setValue(path, value, false);
    },

    /**
     * Adds multiple values for the specified path.
     */
    addValues : function(path, values) {
        var changed = false;
        _.each(values, function(value) {
            changed |= this._setValue(path, value, false);
        }, this);
        return changed;
    },

    /**
     * Transforms all internal state of this object into a string-serialized
     * URL. The specified template should contain path placeholders
     * "{path.to.value}" in each field to transform to URL.
     * 
     * <pre>
     * var nav = new Navigation({
     *    category : 'marketing',
     *    language : 'en',
     *    companyId : '234345',
     *    search : {
     *      tags : ['web', 'sites'],
     *      q : 'Hello'
     *    }
     * });
     * var url = nav.toUrl({
     *    pathname: '/{language}/category/{category}',
     *    query : {
     *      q : '{search.q}',
     *      tags : '{search.tags}'
     *    },
     *    hash : '{companyId}'
     * });
     * console.log(url);
     * The result is: 
     *  '/en/category/marketing?q=Hello&amp;tags=web&amp;tags=sites#123'
     * </pre>
     */
    toUrl : function(templateUri) {
        var obj = this.toUrlObj(templateUri);
        return URL.format(obj);
    },

    /**
     * Transforms all internal state of this object into an URL object. The
     * specified template should contain path placeholders "{path.to.value}" in
     * each field to transform to URL.
     * 
     * <pre>
     * var nav = new Navigation({
     *    category : 'marketing',
     *    language : 'en',
     *    companyId : '234345',
     *    search : {
     *      tags : ['web', 'sites'],
     *      q : 'Hello'
     *    }
     * });
     * var url = nav.toUrl({
     *    pathname: '/{language}/category/{category}',
     *    query : {
     *      q : '{search.q}',
     *      tags : '{search.tags}'
     *    },
     *    hash : '{companyId}'
     * });
     * console.log(url);
     * The result is:
     *   {
     *      pathname: '/en/category/marketing',
     *      query : {
     *          q : 'Hello',
     *          tags : ['web', 'site']            
     *      },
     *      hash : '123'
     *   } 
     * </pre>
     */
    toUrlObj : function(templateUri) {
        var that = this;
        var query = false;
        function visit(obj) {
            var result = {};
            _.each(obj, function(val, path) {
                var prevQuery = query;
                query |= path == 'query';
                var r = undefined;
                if (_.isString(val)) {
                    var values;
                    r = val.replace(/\{(.*?)\}/gim, function(match, path) {
                        var vals = that.getValue(path);
                        if (_.isArray(vals)) {
                            if (vals.length) {
                                values = vals;
                            }
                        } else if (vals !== undefined && vals !== null) {
                            values = [ vals ];
                        }
                        return vals || '';
                    });
                    if (query) {
                        r = values;
                    }
                } else if (_.isObject(val)) {
                    r = visit(val);
                }
                if (r !== undefined) {
                    result[path] = r;
                }
                query = prevQuery;
            });
            return result;
        }
        var obj = visit(templateUri);
        return obj;
    },

    /**
     * Extracts values from the specified URL and sets them as the internal
     * fields of this object. To extract values from the URL this method uses
     * the given mapping object. The mapping object contains references to the
     * URL in keys and the corresponding paths where the value should be stored.
     * If the value is a function then it is called to transform values from
     * URLs to internal fields.
     * 
     * <pre>
     * var nav = new Navigation();
     * var url = '/en/category/marketing?q=Hello&amp;tags=web&amp;tags=sites#123';
     * nav.fromUrl(url, {
     *   'pathname' : function(options) {
     *      var path = options.value;
     *      var array = _.filter(path.split('/'), function(s) {
     *         return !!s;
     *      });
     *      this.addValues('language', this.extractSegments(array[0]));
     *      this.addValues('category', this.extractSegments(array[2]));
     *   },
     *   'query.q' : 'search.q',
     *   'query.tags' : 'search.tags',
     *   'hash' : 'companyId'
     * });
     * The resulting internal fields are:
     *  {
     *      language: 'en',
     *      category : 'marketing',
     *      search : {
     *          q : 'Hello',
     *          tags : ['web', 'sites']
     *      },
     *      companyId : '123'
     *  }
     * </pre>
     */
    fromUrl : function(url, mapping) {
        if (_.isString(url)) {
            url = URL.parse(url, true);
        }
        var set = {};
        _.each(mapping, function(to, from) {
            var val = this._getValue(from, url);
            if (from === 'hash' && val) {
                val = val.substring(1);
            }
            if (_.isFunction(to)) {
                to.call(this, {
                    url : url,
                    value : val
                });
            } else if (_.isArray(val)) {
                if (!_.has(set, to)) {
                    this.setValues(to, val);
                } else {
                    this.addValues(to, val);
                }
            } else {
                if (!_.has(set, to)) {
                    this.setValue(to, val);
                } else {
                    this.addValue(to, val);
                }
            }
            set[to] = true;
        }, this);
    },

    /**
     * An utility method splitting the given value by ',' and decoding
     * individual array segments. This method is used to extract values from
     * path segments.
     */
    extractSegments : function(val) {
        var array = val.split(',');
        return _.map(array, function(val) {
            val = decodeURIComponent(val);
            return val;
        });
    },

    /**
     * Checks that the specified object has the same values as this one.
     */
    isEqual : function(nav) {
        if (!nav || !nav.options)
            return false;
        return _.isEqual(this.options, nav.options);
    },

    /**
     * Returns values corresponding to the specified path.
     */
    getValue : function(path) {
        return this._getValue(path, this.options);
    },

    /**
     * Extracts values from the given object corresponding to the specified
     * path.
     */
    _getValue : function(path, obj) {
        var array = this._splitPath(path);
        var len = array ? array.length : 0;
        var i;
        for (i = 0; _.isObject(obj) && i < len; i++) {
            var segment = array[i];
            obj = obj[segment];
        }
        return (i === len) ? obj : undefined;
    },

    /**
     * Sets a new new value for the specified path.
     */
    _setValue : function(path, value, replace) {
        var changed = false;
        var array = this._splitPath(path);
        var len = array ? array.length : 0;
        var obj = this.options;
        var segment;
        var i;
        for (i = 0; i < len - 1; i++) {
            segment = array[i];
            obj = obj[segment] = obj[segment] || {};
        }
        segment = array[i];
        if (replace) {
            if (value !== undefined) {
                changed = !_.isEqual(obj[segment], value);
                obj[segment] = value;
            } else {
                changed = _.has(obj, segment);
                delete obj[segment];
            }
        } else if (value !== undefined) {
            changed = true;
            var oldValue = obj[segment];
            if (oldValue === undefined) {
                obj[segment] = value;
            } else {
                if (_.isArray(oldValue)) {
                    oldValue.push(value);
                } else {
                    obj[segment] = [ oldValue, value ];
                }
            }
        }
        if (changed) {
            var event = {
                path : array.join('.')
            };
            if (!this._events) {
                this._events = {};
            }
            for (var i = array.length - 1; i >= 0; i--) {
                var k = array.slice(0, i).join('.');
                this._events['changed:' + k] = event;
            }
            this._events['changed'] = event;
            this._fireEvents();
        }
        return changed;
    },

    _fireEvents : function() {
        if (!this._skipEvents) {
            _.each(this._events, function(event, key) {
                this.emit(key, event);
            }, this);
            this._events = {};
        }
    },

    /** Returns <code>true</code> if the specified values are not the same. */
    _isDifferent : function(a, b) {
        return a != b;
    },

    /**
     * Splits the specified path to individual segments and returns the
     * resulting array.
     */
    _splitPath : function(path) {
        path = path || '';
        var array = path.split('.');
        return _.filter(array, function(segment) {
            return !!segment;
        });
    },

    /**
     * Transforms the specified path to an event suffix.
     */
    _getEventSuffix : function(path) {
        var array = this._splitPath(path);
        path = array.join('.');
        if (path.length) {
            path = ':' + path;
        }
        return path;
    },

    /**
     * Adds a change listener for the values correspoding to the specified path.
     * If the first parameter is ommitted then all changes are notified to this
     * listener.
     */
    addChangeListener : function(path, listener, context) {
        if (_.isFunction(path)) {
            context = listener
            listener = path;
            path = '';
        }
        var suffix = this._getEventSuffix(path);
        this.on('changed' + suffix, listener, context);
    },

    /**
     * Removes a change listener for the values correspoding to the specified
     * path. If the first parameter is ommitted then all changes are notified to
     * this listener.
     */
    removeChangeListener : function(path, listener, context) {
        if (_.isFunction(path)) {
            context = listener
            listener = path;
            path = '';
        }
        var suffix = this._getEventSuffix(path);
        this.off('changed' + suffix, listener, context);
    },

});

module.exports = Navigation;
