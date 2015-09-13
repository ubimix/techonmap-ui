var _ = require('underscore');
var Mosaic = require('mosaic-commons');

var Formatter = Mosaic.Class.extend({
    initialize : function(options) {
        this.setOptions(options);
        this._fields = [];
    },
    _getAccessor : function(key) {
        if (!key) {
            return function() {
            };
        }
        if (key.match(/\d+/)) {
            var id = parseInt(key);
            return function(obj) {
                return obj[id];
            };
        }
        return function(obj) {
            return obj[key];
        };
    },
    _getAccessors : function(keys) {
        if (!keys || !keys.length) {
            return function() {
            };
        }
        if (keys.length == 1) {
            return this._getAccessor(keys[0]);
        }
        var accessors = [];
        for (var i = 0; i < keys.length; i++) {
            var accessor = this._getAccessor(keys[i]);
            accessors.push(accessor);
        }
        return function(obj) {
            var o = obj;
            for (var i = 0; !!o && i < accessors.length; i++) {
                var accessor = accessors[i];
                o = accessor(o);
            }
            return o;
        };
    },
    addField : function(label, path) {
        var access;
        if (typeof path === 'function') {
            access = path;
        } else if (typeof path === 'string') {
            var array = path.split('.');
            access = this._getAccessors(array);
        } else {
            access = this._getAccessors(path);
        }
        this._fields.push({
            label : label,
            access : access,
            path : path
        });
    },
    getFieldLabels : function() {
        var result = [];
        for (var i = 0; i < this._fields.length; i++) {
            var value = this._fields[i].label;
            result.push(value);
        }
        return result;
    },
    getFields : function(obj) {
        var result = [];
        for (var i = 0; i < this._fields.length; i++) {
            var accessor = this._fields[i].access;
            var value = accessor(obj);
            result.push(value);
        }
        return result;
    },
    _visit : function(options) {
        if (options.begin) {
            options.begin();
        }
        var objects = options.objects;
        var len = objects ? objects.length : 0;
        var begin = options.beginObject || function() {
        };
        var end = options.endObject || function() {
        };
        for (var i = 0; i < len; i++) {
            var obj = objects[i];
            begin(obj);
            for (var j = 0; j < this._fields.length; j++) {
                var field = this._fields[j];
                var accessor = field.access;
                var value = accessor(obj);
                options.onField({
                    value : value,
                    row : i,
                    col : j,
                    obj : obj,
                    label : field.label
                });
            }
            end(obj);
        }
        if (options.end) {
            options.end();
        }
    },
    toArray : function(options) {
        options = options || {};
        var result = [];
        if (!options.skipLabels) {
            result.push(this.getFieldLabels());
        }
        var format = options.format || function(value) {
            return value;
        };
        var array = [];
        this._visit({
            objects : options.objects || [],
            endObject : function() {
                result.push(array);
                array = [];
            },
            onField : function(opts) {
                array.push(opts.value);
            }
        })
        return result;
    },
    toCsv : function(options) {
        var that = this;
        var result = '';
        var delimiter = ',';
        var eol = '\n';
        if (!options.skipLabels) {
            var labels = that.getFieldLabels();
            for (var i = 0; i < labels.length; i++) {
                if (i > 0) {
                    result += delimiter;
                }
                result += that._format(labels[i]);
                console
            }
        }
        result += eol;
        that._visit({
            objects : options.objects,
            onField : function(opt) {
                if (opt.col) {
                    result += ',';
                }
                result += that._format(opt.value);
            },
            endObject : function() {
                result += eol;
            }
        })
        return result;
    },
    _format : function(val) {
        if (val === undefined || val === null)
            return '';
        var str = JSON.stringify(val);
        if (typeof val === 'object') {
            str = JSON.stringify(str);
        }
        return str;
        var str = val ? '' + val : '';
        if (str && (str.indexOf(',') >= 0 || str.indexOf('"') >= 0)) {
            str = str.replace('"', '\\"');
            str = '"' + str + '"';
        }
        return str;
    }
});

module.exports = Formatter;
